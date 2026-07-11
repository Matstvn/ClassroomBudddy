import { LearnerStore } from '../../../stores/learner-store';
import { LearnersAPI, type Learner } from '../../../services/api';

// ========== Helper – Fetch Active Learners ==========
async function fetchActiveLearners(): Promise<Learner[]> {
  const store = new LearnerStore();
  store.setActiveOnly(true);
  await store.load();
  return store.getAll();
}

// ========== Countdown Timer ==========
function renderTimerTab(container: HTMLElement) {
  container.innerHTML = `
    <div class="space-y-4">
      <h3 class="text-xl font-bold">Countdown Timer</h3>
      <div class="flex gap-2 items-center">
        <input id="timer-minutes" type="number" value="0" min="0" class="border p-2 rounded w-20 text-black" />
        <span>min</span>
        <input id="timer-seconds" type="number" value="10" min="0" max="59" class="border p-2 rounded w-20 text-black" />
        <span>sec</span>
      </div>
      <div id="timer-display" class="text-6xl font-mono">00:00</div>
      <div class="flex gap-2">
        <button id="timer-start" class="bg-green-600 text-white px-4 py-2 rounded">Start</button>
        <button id="timer-pause" class="bg-yellow-500 text-white px-4 py-2 rounded">Pause</button>
        <button id="timer-reset" class="bg-gray-400 text-white px-4 py-2 rounded">Reset</button>
      </div>
    </div>
  `;

  let totalSeconds = 0;
  let interval: number | null = null;
  const display = container.querySelector('#timer-display')!;
  const minutesInput = container.querySelector('#timer-minutes') as HTMLInputElement;
  const secondsInput = container.querySelector('#timer-seconds') as HTMLInputElement;

  function updateDisplay() {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    display.textContent = `${m}:${s}`;
  }

  function setTimeFromInputs() {
    const mins = parseInt(minutesInput.value) || 0;
    const secs = parseInt(secondsInput.value) || 0;
    totalSeconds = mins * 60 + secs;
    updateDisplay();
  }

  minutesInput.addEventListener('change', setTimeFromInputs);
  secondsInput.addEventListener('change', setTimeFromInputs);
  setTimeFromInputs();

  container.querySelector('#timer-start')!.addEventListener('click', () => {
    if (interval) return;
    if (totalSeconds <= 0) {
      // grab fresh from inputs
      setTimeFromInputs();
    }
    interval = window.setInterval(() => {
      totalSeconds--;
      updateDisplay();
      if (totalSeconds <= 0) {
        clearInterval(interval!);
        interval = null;
        // Flash background
        display.classList.add('bg-red-200');
        setTimeout(() => display.classList.remove('bg-red-200'), 2000);
        // Optional beep
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          osc.type = 'square';
          osc.frequency.value = 800;
          const gain = ctx.createGain();
          gain.gain.value = 0.1;
          osc.connect(gain).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        } catch (e) { /* ignore */ }
      }
    }, 1000);
  });

  container.querySelector('#timer-pause')!.addEventListener('click', () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  });

  container.querySelector('#timer-reset')!.addEventListener('click', () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    setTimeFromInputs();
    display.classList.remove('bg-red-200');
  });
}

// ========== Stopwatch ==========
function renderStopwatchTab(container: HTMLElement) {
  container.innerHTML = `
    <div class="space-y-4">
      <h3 class="text-xl font-bold">Stopwatch</h3>
      <div id="stopwatch-display" class="text-6xl font-mono">00:00.00</div>
      <div class="flex gap-2">
        <button id="sw-start" class="bg-green-600 text-white px-4 py-2 rounded">Start</button>
        <button id="sw-stop" class="bg-red-500 text-white px-4 py-2 rounded">Stop</button>
        <button id="sw-reset" class="bg-gray-400 text-white px-4 py-2 rounded">Reset</button>
        <button id="sw-lap" class="bg-blue-500 text-white px-4 py-2 rounded">Lap</button>
      </div>
      <div id="lap-times" class="max-h-40 overflow-y-auto text-sm space-y-1"></div>
    </div>
  `;

  const display = container.querySelector('#stopwatch-display')!;
  const lapList = container.querySelector('#lap-times')!;
  let startTime = 0;
  let elapsedBeforePause = 0;
  let interval: number | null = null;
  let running = false;

  function updateDisplay(ms: number) {
    const totalSec = ms / 1000;
    const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const secs = Math.floor(totalSec % 60).toString().padStart(2, '0');
    const hundredths = Math.floor((totalSec % 1) * 100).toString().padStart(2, '0');
    display.textContent = `${mins}:${secs}.${hundredths}`;
  }

  function getCurrentMs() {
    return running ? (Date.now() - startTime + elapsedBeforePause) : elapsedBeforePause;
  }

  function tick() {
    updateDisplay(getCurrentMs());
  }

  function stopTimer() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  container.querySelector('#sw-start')!.addEventListener('click', () => {
    if (running) return;
    running = true;
    startTime = Date.now();
    interval = window.setInterval(tick, 10);
  });

  container.querySelector('#sw-stop')!.addEventListener('click', () => {
    if (!running) return;
    stopTimer();
    elapsedBeforePause = getCurrentMs();
    running = false;
    updateDisplay(elapsedBeforePause);
  });

  container.querySelector('#sw-reset')!.addEventListener('click', () => {
    stopTimer();
    running = false;
    elapsedBeforePause = 0;
    updateDisplay(0);
    lapList.innerHTML = '';
  });

  container.querySelector('#sw-lap')!.addEventListener('click', () => {
    const ms = getCurrentMs();
    const totalSec = ms / 1000;
    const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const secs = Math.floor(totalSec % 60).toString().padStart(2, '0');
    const hundredths = Math.floor((totalSec % 1) * 100).toString().padStart(2, '0');
    const li = document.createElement('div');
    li.textContent = `Lap ${lapList.children.length + 1}: ${mins}:${secs}.${hundredths}`;
    lapList.appendChild(li);
  });
}

// ========== Random Name Picker ==========
async function renderNamePickerTab(container: HTMLElement) {
  container.innerHTML = '<p class="text-gray-500">Loading learners...</p>';
  const learners = await fetchActiveLearners();
  if (learners.length === 0) {
    container.innerHTML = '<p class="text-red-500">No active learners found.</p>';
    return;
  }

  container.innerHTML = `
    <div class="space-y-4">
      <h3 class="text-xl font-bold">Random Name Picker</h3>
      <div id="name-display" class="text-3xl font-bold p-6 bg-gray-100 rounded text-center min-h-[100px] flex items-center justify-center">
        Click the button!
      </div>
      <button id="pick-btn" class="bg-purple-600 text-white px-6 py-3 rounded text-lg">Pick a Name</button>
    </div>
  `;

  const display = container.querySelector('#name-display')!;
  const pickBtn = container.querySelector('#pick-btn')!;
  let spinning = false;
  let spinInterval: number | null = null;

  pickBtn.addEventListener('click', () => {
    if (spinning) return;
    spinning = true;
    pickBtn.classList.add('opacity-50');
    let counter = 0;
    spinInterval = window.setInterval(() => {
      const randomIdx = Math.floor(Math.random() * learners.length);
      const learner = learners[randomIdx];
      display.textContent = `${learner.first_name} ${learner.last_name}`;
      counter++;
      if (counter > 20) {
        clearInterval(spinInterval!);
        spinInterval = null;
        spinning = false;
        pickBtn.classList.remove('opacity-50');
        // Final pick stays
      }
    }, 80);
  });
}

// ========== Seating Plan ==========
async function renderSeatingTab(container: HTMLElement) {
  container.innerHTML = '<p class="text-gray-500">Loading learners...</p>';
  const learners = await fetchActiveLearners();
  if (learners.length === 0) {
    container.innerHTML = '<p class="text-red-500">No active learners found.</p>';
    return;
  }

  container.innerHTML = `
    <div class="space-y-4">
      <h3 class="text-xl font-bold">Seating Plan</h3>
      <div class="flex gap-2 items-center">
        <label class="text-sm">Rows:</label>
        <input id="seat-rows" type="number" value="5" min="1" max="10" class="border p-1 w-16 text-black" />
        <label class="text-sm">Columns:</label>
        <input id="seat-cols" type="number" value="4" min="1" max="10" class="border p-1 w-16 text-black" />
        <button id="generate-seats" class="bg-blue-600 text-white px-4 py-2 rounded">Generate Random Seating</button>
      </div>
      <div id="seating-grid" class="grid gap-2"></div>
    </div>
  `;

  const rowsInput = container.querySelector('#seat-rows') as HTMLInputElement;
  const colsInput = container.querySelector('#seat-cols') as HTMLInputElement;
  const gridDiv = container.querySelector('#seating-grid')!;

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  container.querySelector('#generate-seats')!.addEventListener('click', () => {
    const rows = parseInt(rowsInput.value) || 5;
    const cols = parseInt(colsInput.value) || 4;
    const shuffled = shuffle(learners);
    gridDiv.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridDiv.innerHTML = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const cell = document.createElement('div');
        cell.className = 'border p-2 rounded bg-white text-center text-sm';
        cell.textContent = idx < shuffled.length ? `${shuffled[idx].last_name}, ${shuffled[idx].first_name}` : '—';
        gridDiv.appendChild(cell);
      }
    }
  });
}

// ========== Group Generator ==========
async function renderGroupsTab(container: HTMLElement) {
  container.innerHTML = '<p class="text-gray-500">Loading learners...</p>';
  const learners = await fetchActiveLearners();
  if (learners.length === 0) {
    container.innerHTML = '<p class="text-red-500">No active learners found.</p>';
    return;
  }

  container.innerHTML = `
    <div class="space-y-4">
      <h3 class="text-xl font-bold">Group Generator</h3>
      <div class="flex gap-2 items-center">
        <label class="text-sm">Groups of</label>
        <input id="group-size" type="number" value="4" min="2" class="border p-1 w-16 text-black" />
        <span>members (or)</span>
        <label class="text-sm">Number of groups:</label>
        <input id="group-count" type="number" value="5" min="2" class="border p-1 w-16 text-black" />
        <button id="gen-groups" class="bg-blue-600 text-white px-4 py-2 rounded">Generate Groups</button>
      </div>
      <div id="groups-container" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
    </div>
  `;

  const sizeInput = container.querySelector('#group-size') as HTMLInputElement;
  const countInput = container.querySelector('#group-count') as HTMLInputElement;
  const groupsDiv = container.querySelector('#groups-container')!;

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  container.querySelector('#gen-groups')!.addEventListener('click', () => {
    const groupSize = parseInt(sizeInput.value) || 4;
    const groupCount = parseInt(countInput.value) || 5;
    const shuffled = shuffle(learners);
    let groups: Learner[][];

    if (groupSize > 0 && sizeInput === document.activeElement) {
      // prefer group size
      groups = [];
      for (let i = 0; i < shuffled.length; i += groupSize) {
        groups.push(shuffled.slice(i, i + groupSize));
      }
    } else {
      // prefer group count
      const size = Math.ceil(shuffled.length / groupCount);
      groups = [];
      for (let i = 0; i < groupCount; i++) {
        groups.push(shuffled.slice(i * size, (i + 1) * size));
      }
    }

    groupsDiv.innerHTML = '';
    groups.forEach((group, idx) => {
      const card = document.createElement('div');
      card.className = 'border p-2 rounded bg-white';
      card.innerHTML = `<h4 class="font-bold text-sm mb-1">Group ${idx + 1}</h4>`;
      group.forEach(l => {
        const p = document.createElement('p');
        p.textContent = `${l.last_name}, ${l.first_name}`;
        p.className = 'text-xs';
        card.appendChild(p);
      });
      groupsDiv.appendChild(card);
    });
  });
}

// ========== Main Page ==========
export function renderToolsPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'p-4 space-y-4';

  // Tab bar
  const tabBar = document.createElement('div');
  tabBar.className = 'flex gap-2 border-b pb-2';
  const tabs = ['Timer', 'Stopwatch', 'Name Picker', 'Seating', 'Groups'];
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

  const tabContent = document.createElement('div');
  tabContent.className = 'flex-1';
  container.appendChild(tabContent);

  function switchTab(name: string) {
    tabButtons.forEach(b => b.classList.remove('bg-blue-200', 'font-bold'));
    const activeBtn = tabButtons.find(b => b.textContent === name);
    if (activeBtn) activeBtn.classList.add('bg-blue-200', 'font-bold');

    tabContent.innerHTML = '';
    if (name === 'Timer') renderTimerTab(tabContent);
    else if (name === 'Stopwatch') renderStopwatchTab(tabContent);
    else if (name === 'Name Picker') renderNamePickerTab(tabContent);
    else if (name === 'Seating') renderSeatingTab(tabContent);
    else if (name === 'Groups') renderGroupsTab(tabContent);
  }

  // Default tab
  switchTab('Timer');
  return container;
}