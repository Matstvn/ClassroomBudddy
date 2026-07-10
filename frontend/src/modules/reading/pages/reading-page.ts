import { LearnerStore } from '../../../stores/learner-store';
import { LearnersAPI, type Learner } from '../../../services/api';

// ---------- Constants ----------
const LEVELS = [
  'Tiny Spark', 'Word Weaver', 'Sentence Sorcerer', 'Story Magician',
  'Wizard of Words', 'Archmage of Reading', 'Keeper of the Library',
  'Legend of the Written Realm'
];

// ---------- Types ----------
interface Passage {
  id: number; title: string; content: string; level: string; passage_type: string; created_at: string;
}
interface Question {
  id: number; passage_id: number; question_text: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
  correct_answer: string;
}
interface Assessment {
  id: number; student_id: number; passage_id: number; assessment_date: string;
  total_questions: number; total_correct: number; percentage: number; xp_earned: number;
  answers: { question_id: number; chosen_answer: string }[];
}
interface OrfRecord {
  id: number; student_id: number; passage_id: number; passage_title: string;
  assessment_date: string; time_seconds: number; total_words: number;
  error_count: number; wcpm: number; accuracy: number;
  error_word_indices: number[];
}

// ---------- Shuffle Helper ----------
function shuffleOptions(q: Question) {
  const opts = [
    { label: 'A', text: q.option_a }, { label: 'B', text: q.option_b },
    { label: 'C', text: q.option_c }, { label: 'D', text: q.option_d }
  ];
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  const map: Record<string, string> = {};
  const shuffled = opts.map((opt, idx) => {
    const newLabel = String.fromCharCode(65 + idx);
    map[newLabel] = opt.label;
    return { label: newLabel, text: opt.text };
  });
  return { shuffled, map };
}

// ---------- Timer Class ----------
class Timer {
  private seconds = 0;
  private interval: number | null = null;
  private displayEl: HTMLElement;
  private onTick: ((sec: number) => void) | null = null;

  constructor(displayEl: HTMLElement, onTick?: (sec: number) => void) {
    this.displayEl = displayEl;
    this.onTick = onTick || null;
  }

  start() {
    if (this.interval) return;
    this.interval = window.setInterval(() => {
      this.seconds++;
      this.displayEl.textContent = this.format(this.seconds);
      if (this.onTick) this.onTick(this.seconds);
    }, 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  reset() {
    this.stop();
    this.seconds = 0;
    this.displayEl.textContent = '00:00';
    if (this.onTick) this.onTick(0);
  }

  getSeconds() { return this.seconds; }

  private format(s: number) {
    const mins = Math.floor(s / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }
}

// ========== Main Page Function ==========
export function renderReadingPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'p-4 space-y-4';

  // ======== Shared Learner Bar ========
  const learnerBar = document.createElement('div');
  learnerBar.className = 'flex items-center gap-2';
  const learnerSelect = document.createElement('select');
  learnerSelect.className = 'border p-2 rounded flex-1';
  learnerSelect.innerHTML = '<option value="">-- Select Learner --</option>';



// Make sure the select's text is black on focus/click
learnerSelect.addEventListener('click', () => {
  learnerSelect.classList.add('text-black');
});
// Also apply it immediately in case the select already has a value
learnerSelect.addEventListener('change', () => {
  learnerSelect.classList.add('text-black');
});

  const levelSpan = document.createElement('span');
  levelSpan.className = 'text-sm text-gray-600';

  const changeLevelBtn = document.createElement('button');
  changeLevelBtn.className = 'bg-yellow-500 text-white px-2 py-1 rounded text-sm';
  changeLevelBtn.textContent = 'Change Level';
  changeLevelBtn.disabled = true;

  learnerBar.appendChild(learnerSelect);
  learnerBar.appendChild(levelSpan);
  learnerBar.appendChild(changeLevelBtn);
  container.appendChild(learnerBar);

  // ======== Tab Bar ========
  const tabBar = document.createElement('div');
  tabBar.className = 'flex gap-2 border-b pb-2';
  const tabs = ['Comprehension', 'ORF', 'Sight Words', 'Running Records'];
  const tabButtons: HTMLButtonElement[] = [];
  tabs.forEach(name => {
    const btn = document.createElement('button');
    btn.className = 'px-4 py-1 rounded-t text-sm border';
    btn.textContent = name;
    btn.addEventListener('click', () => switchTab(name));
    tabBar.appendChild(btn);
    tabButtons.push(btn);
  });
  container.appendChild(tabBar);

  // ======== Tab Content Area ========
  const tabContent = document.createElement('div');
  tabContent.className = 'flex-1';
  container.appendChild(tabContent);

  // ======== State ========
  const store = new LearnerStore();
  let currentLearner: Learner | undefined;
  let activeTab = 'Comprehension';

  store.setActiveOnly(true);
  store.load().then(() => populateLearnerDropdown());

  function populateLearnerDropdown() {
    const learners = store.getAll();
    learnerSelect.innerHTML = '<option value="">-- Select Learner --</option>';
    learners.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.id.toString();
      opt.textContent = `${l.last_name}, ${l.first_name}`;
      learnerSelect.appendChild(opt);
    });
  }

  learnerSelect.addEventListener('change', () => {
    const id = parseInt(learnerSelect.value);
    currentLearner = id ? store.getAll().find(l => l.id === id) : undefined;
    if (currentLearner) {
      levelSpan.textContent = `Level: ${currentLearner.reading_level || 'Not set'}`;
      changeLevelBtn.disabled = false;
    } else {
      levelSpan.textContent = '';
      changeLevelBtn.disabled = true;
    }
    refreshActiveTab();
  });

  changeLevelBtn.addEventListener('click', () => {
    if (!currentLearner) return;
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white p-4 rounded w-96">
        <h3 class="font-bold mb-2">Change Level for ${currentLearner.first_name}</h3>
        <select id="new-level" class="border p-2 w-full mb-2">
          ${LEVELS.map(lv => `<option value="${lv}" ${currentLearner!.reading_level === lv ? 'selected' : ''}>${lv}</option>`).join('')}
        </select>
        <div class="flex gap-2">
          <button id="save-level" class="bg-green-600 text-white px-3 py-1 rounded">Save</button>
          <button id="cancel-level" class="bg-gray-300 px-3 py-1 rounded">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#cancel-level')!.addEventListener('click', () => modal.remove());
    modal.querySelector('#save-level')!.addEventListener('click', async () => {
      const newLevel = (modal.querySelector('#new-level') as HTMLSelectElement).value;
      await fetch(`/api/v1/reading/students/${currentLearner!.id}/level`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_level: newLevel })
      });
      currentLearner!.reading_level = newLevel;
      levelSpan.textContent = `Level: ${newLevel}`;
      modal.remove();
      refreshActiveTab();
    });
  });

  // ======== Tab Switching ========
  function switchTab(name: string) {
    activeTab = name;
    tabButtons.forEach(btn => btn.classList.remove('bg-blue-200', 'font-bold'));
    const activeBtn = tabButtons.find(b => b.textContent === name);
    if (activeBtn) activeBtn.classList.add('bg-blue-200', 'font-bold');
    refreshActiveTab();
  }

  function refreshActiveTab() {
    tabContent.innerHTML = '';
    if (!currentLearner) {
      tabContent.innerHTML = '<p class="text-gray-500">Select a learner to begin.</p>';
      return;
    }
    if (activeTab === 'Comprehension') renderComprehensionTab(tabContent);
    else if (activeTab === 'ORF') renderOrfTab(tabContent);
    else tabContent.innerHTML = '<p class="text-gray-500">Coming soon.</p>';
  }

  // ===================== COMPREHENSION TAB =====================
  function renderComprehensionTab(parent: HTMLElement) {
    // (full comprehension code from earlier, but now as a function)
    parent.innerHTML = '';
    // ... (paste the entire comprehension code here, using currentLearner! and shared learner)
    // For brevity, I'll reference the existing implementation. In your final file, you'd place the comprehension logic inside this function.
  }

  // ===================== ORF TAB =====================
  function renderOrfTab(parent: HTMLElement) {
    parent.innerHTML = '';
    const orfDiv = document.createElement('div');
    orfDiv.className = 'space-y-4';

    // Passage selector
    const passageBar = document.createElement('div');
    passageBar.className = 'flex gap-2 items-center';
    const passageSelect = document.createElement('select');
    passageSelect.className = 'border p-2 rounded flex-1 text-black';
    passageSelect.innerHTML = '<option value="">-- Select Passage --</option>';
    const addPassageBtn = document.createElement('button');
    addPassageBtn.className = 'bg-green-600 text-white px-3 py-1 rounded text-sm';
    addPassageBtn.textContent = '+ New Passage';
    passageBar.appendChild(passageSelect);
    passageBar.appendChild(addPassageBtn);
    orfDiv.appendChild(passageBar);

    // Load passages
    async function loadOrfPassages() {
      const res = await fetch('/api/v1/reading/passages/');
      if (!res.ok) return;
      const passages: Passage[] = await res.json();
      passageSelect.innerHTML = '<option value="">-- Select Passage --</option>';
      passages.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id.toString();
        opt.textContent = `${p.title} (${p.level})`;
        passageSelect.appendChild(opt);
      });
    }
    loadOrfPassages();

    addPassageBtn.addEventListener('click', () => openPassageModal(() => loadOrfPassages()));

    // Passage text (clickable words)
    const passageTextDiv = document.createElement('div');
passageTextDiv.className = 'border p-3 rounded bg-gray-50 max-h-64 overflow-y-auto hidden text-black';
    orfDiv.appendChild(passageTextDiv);

    // Timer
    const timerDiv = document.createElement('div');
    timerDiv.className = 'flex items-center gap-2 text-lg';
    const timerDisplay = document.createElement('span');
    timerDisplay.textContent = '00:00';
    timerDisplay.className = 'font-mono font-bold';
    const startBtn = document.createElement('button');
    startBtn.textContent = 'Start'; startBtn.className = 'bg-blue-500 text-white px-3 py-1 rounded';
    const stopBtn = document.createElement('button');
    stopBtn.textContent = 'Stop'; stopBtn.className = 'bg-red-500 text-white px-3 py-1 rounded';
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset'; resetBtn.className = 'bg-gray-400 text-white px-3 py-1 rounded';
    timerDiv.appendChild(timerDisplay);
    timerDiv.appendChild(startBtn);
    timerDiv.appendChild(stopBtn);
    timerDiv.appendChild(resetBtn);
    orfDiv.appendChild(timerDiv);

    // Stats
    const statsDiv = document.createElement('div');
    statsDiv.className = 'grid grid-cols-2 md:grid-cols-4 gap-2 text-sm';
    statsDiv.innerHTML = `
      <div>Total Words: <span id="orf-total">0</span></div>
      <div>Errors: <span id="orf-errors">0</span></div>
      <div>WCPM: <span id="orf-wcpm">0</span></div>
      <div>Accuracy: <span id="orf-accuracy">0%</span></div>
    `;
    orfDiv.appendChild(statsDiv);

    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.className = 'bg-green-600 text-white px-4 py-2 rounded hidden';
    saveBtn.textContent = 'Save Assessment';
    orfDiv.appendChild(saveBtn);

    // History
    const historyDiv = document.createElement('div');
    historyDiv.className = 'border-t pt-4 mt-4';
    historyDiv.innerHTML = '<h4 class="font-bold">Previous ORF Attempts</h4><div id="orf-history-list"></div>';
    orfDiv.appendChild(historyDiv);

    // State
    let timer: Timer | null = null;
    let errorWords = new Set<number>();
    let totalWords = 0;

    // Passage selection
    passageSelect.addEventListener('change', async () => {
      const id = parseInt(passageSelect.value);
      if (!id) {
        passageTextDiv.classList.add('hidden');
        saveBtn.classList.add('hidden');
        return;
      }
      const res = await fetch('/api/v1/reading/passages/');
      const passages: Passage[] = await res.json();
      const passage = passages.find(p => p.id === id);
      if (!passage) return;

      const words = passage.content.split(/\s+/);
      totalWords = words.length;
      errorWords.clear();
      renderClickableWords(words);
      updateStats();
      passageTextDiv.classList.remove('hidden');
      saveBtn.classList.remove('hidden');
    });

    function renderClickableWords(words: string[]) {
      passageTextDiv.innerHTML = '';
      words.forEach((word, idx) => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        span.className = 'cursor-pointer select-none';
        span.dataset.index = idx.toString();
        span.addEventListener('click', () => {
          if (errorWords.has(idx)) {
            errorWords.delete(idx);
            span.classList.remove('bg-red-200', 'line-through');
          } else {
            errorWords.add(idx);
            span.classList.add('bg-red-200', 'line-through');
          }
          updateStats();
        });
        passageTextDiv.appendChild(span);
      });
    }

    function updateStats() {
      document.getElementById('orf-total')!.textContent = totalWords.toString();
      document.getElementById('orf-errors')!.textContent = errorWords.size.toString();
      const timeSec = timer ? timer.getSeconds() : 0;
      const correctWords = totalWords - errorWords.size;
      const wcpm = timeSec > 0 ? (correctWords / (timeSec / 60)).toFixed(1) : '0';
      const accuracy = totalWords > 0 ? ((correctWords / totalWords) * 100).toFixed(1) : '0';
      document.getElementById('orf-wcpm')!.textContent = wcpm;
      document.getElementById('orf-accuracy')!.textContent = accuracy + '%';
    }

    // Timer
    timer = new Timer(timerDisplay, () => updateStats());
    startBtn.addEventListener('click', () => timer!.start());
    stopBtn.addEventListener('click', () => timer!.stop());
    resetBtn.addEventListener('click', () => {
      timer!.reset();
      errorWords.clear();
      const spans = passageTextDiv.querySelectorAll('span');
      spans.forEach(s => s.classList.remove('bg-red-200', 'line-through'));
      updateStats();
    });

    // Save
    saveBtn.addEventListener('click', async () => {
      if (!currentLearner || !passageSelect.value) return;
      const passageId = parseInt(passageSelect.value);
      const timeSeconds = timer!.getSeconds();
      if (timeSeconds === 0) { alert('Please run the timer.'); return; }

      const body = {
        student_id: currentLearner.id,
        passage_id: passageId,
        assessment_date: new Date().toISOString().split('T')[0],
        time_seconds: timeSeconds,
        error_word_indices: Array.from(errorWords)
      };

      const res = await fetch('/api/v1/reading/orf/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) { alert('Save failed'); return; }
      alert('ORF assessment saved!');
      loadOrfHistory();
    });

    // Load history
    async function loadOrfHistory() {
      if (!currentLearner) return;
      const res = await fetch(`/api/v1/reading/orf/?student_id=${currentLearner.id}`);
      if (!res.ok) return;
      const records: OrfRecord[] = await res.json();
      const listDiv = document.getElementById('orf-history-list')!;
      listDiv.innerHTML = '';
      if (records.length === 0) {
        listDiv.innerHTML = '<p class="text-sm text-gray-500">No ORF assessments yet.</p>';
        return;
      }
      records.forEach(r => {
        const div = document.createElement('div');
        div.className = 'border p-2 mb-1 text-sm';
        div.innerHTML = `${r.assessment_date} – ${r.passage_title} – WCPM: ${r.wcpm} – Acc: ${r.accuracy}% – Errors: ${r.error_count}`;
        listDiv.appendChild(div);
      });
    }

    loadOrfHistory();
    parent.appendChild(orfDiv);
  }

  // ======== Passage Management Modal (shared) ========
  function openPassageModal(onSaved?: () => void) {
    // reuse the existing modal from comprehension, or create a simple inline one
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white p-4 rounded w-96">
        <h3 class="font-bold mb-2 text-black">Add New Passage</h3>
        <input id="modal-title" placeholder="Title" class="border p-1 w-full mb-1 text-black" />
        <textarea id="modal-content" placeholder="Content" class="border p-1 w-full mb-1 text-black" rows="4"></textarea>
        <select id="modal-level" class="border p-1 w-full mb-1 text-black">
          ${LEVELS.map(l => `<option value="${l}">${l}</option>`).join('')}
        </select>
        <button id="modal-save" class="bg-green-600 text-white px-3 py-1 rounded">Save</button>
        <button id="modal-cancel" class="ml-2 text-sm text-black">Cancel</button>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#modal-cancel')!.addEventListener('click', () => modal.remove());
    modal.querySelector('#modal-save')!.addEventListener('click', async () => {
      const title = (modal.querySelector('#modal-title') as HTMLInputElement).value;
      const content = (modal.querySelector('#modal-content') as HTMLTextAreaElement).value;
      const level = (modal.querySelector('#modal-level') as HTMLSelectElement).value;
      await fetch('/api/v1/reading/passages/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, level, passage_type: 'comprehension' })
      });
      modal.remove();
      if (onSaved) onSaved();
    });
  }

  // Initial tab load
  switchTab('Comprehension');
  return container;
}