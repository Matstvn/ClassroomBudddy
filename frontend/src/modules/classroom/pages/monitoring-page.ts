import { SubjectsAPI } from '../../../services/api';

interface ObjectiveNode {
  id: number; description: string; class_average: number | null;
}

interface CompetencyNode {
  id: number; description: string;
  progress: number | null;
  objectives: ObjectiveNode[];
}

interface ProgressData {
  performance_standards: {
    description: string;
    competencies: CompetencyNode[];
  }[];
}

async function getCurrentTerm(): Promise<{ term: number | null; schoolYear: string }> {
  try {
    const res = await fetch('/api/v1/settings/');
    if (!res.ok) throw new Error('Settings not available');
    const settings = await res.json();
    const schoolYear = settings.school_year || '2026-2027';
    const today = new Date().toISOString().split('T')[0];
    const { term1_start, term1_end, term2_start, term2_end, term3_start, term3_end } = settings;
    if (today >= term1_start && today <= term1_end) return { term: 1, schoolYear };
    if (today >= term2_start && today <= term2_end) return { term: 2, schoolYear };
    if (today >= term3_start && today <= term3_end) return { term: 3, schoolYear };
    return { term: 1, schoolYear };
  } catch {
    return { term: 1, schoolYear: '2026-2027' };
  }
}

export function renderMonitoringPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'h-full flex gap-0 bg-slate-50/50 overflow-hidden';

  // ---- Left Sidebar (Subjects) ----
  const sidebar = document.createElement('aside');
  sidebar.className = 'w-56 bg-white border-r border-slate-200 flex flex-col shrink-0 h-full';
  sidebar.innerHTML = `
    <div class="p-4 border-b border-slate-200 font-semibold text-sm text-slate-700">Subjects</div>
    <nav id="subject-nav" class="flex-1 overflow-y-auto p-2 space-y-1"></nav>
  `;
  container.appendChild(sidebar);

  // ---- Right Content Area ----
  const mainArea = document.createElement('div');
  mainArea.className = 'flex-1 flex flex-col overflow-hidden';
  
  // Header (term badge, refresh)
  const headerRow = document.createElement('div');
  headerRow.className = 'flex items-center justify-between gap-4 bg-white p-4 border-b border-slate-200';
  headerRow.innerHTML = `
    <div>
      <h1 class="text-lg font-bold text-slate-800">Curriculum Progress Monitoring</h1>
      <p class="text-xs text-slate-500">Click a competency card to manage objectives and assessments</p>
    </div>
    <div class="flex items-center gap-3">
      <div id="term-badge" class="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 rounded-lg text-xs font-semibold text-indigo-700 border border-indigo-100">
        <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        <span id="term-label">Loading term...</span>
      </div>
      <button id="refresh-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5"/></svg>
        Refresh
      </button>
    </div>
  `;
  mainArea.appendChild(headerRow);

  // Content area for cards
  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1 overflow-y-auto p-6';
  mainArea.appendChild(contentDiv);
  container.appendChild(mainArea);

  // State
  let currentTerm: number | null = null;
  let currentSchoolYear = '2026-2027';
  let selectedSubjectId: number | null = null;
  let subjectList: { id: number; name: string }[] = [];

  const subjectNav = sidebar.querySelector('#subject-nav')!;
  const termLabel = sidebar.querySelector('#term-label') as HTMLElement;
  const refreshBtn = mainArea.querySelector('#refresh-btn')!;

  // Load subjects into sidebar
  SubjectsAPI.getAll().then(subjects => {
    subjectList = subjects;
    subjectNav.innerHTML = '';
    subjects.forEach(s => {
      const item = document.createElement('a');
      item.href = '#';
      item.className = 'block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer transition-colors';
      item.textContent = s.name;
      item.dataset.subjectId = s.id.toString();
      item.addEventListener('click', (e) => {
        e.preventDefault();
        selectedSubjectId = s.id;
        // Highlight active
        subjectNav.querySelectorAll('a').forEach(el => el.classList.remove('bg-indigo-100', 'text-indigo-700', 'font-semibold'));
        item.classList.add('bg-indigo-100', 'text-indigo-700', 'font-semibold');
        loadProgress();
      });
      subjectNav.appendChild(item);
    });
    // Select first subject by default if none selected
    if (subjects.length > 0 && !selectedSubjectId) {
      const firstItem = subjectNav.querySelector('a') as HTMLElement;
      firstItem.click();
    }
  });

  // Load term settings
  (async () => {
    const { term, schoolYear } = await getCurrentTerm();
    currentTerm = term;
    currentSchoolYear = schoolYear;
    if (termLabel) termLabel.textContent = term ? `Term ${term}` : 'Term –';
  })();

  async function loadProgress() {
    if (currentTerm === null || !selectedSubjectId) {
      contentDiv.innerHTML = `
        <div class="flex flex-col items-center justify-center p-12 text-center">
          <p class="text-sm text-slate-500">Select a subject from the left to view progress.</p>
        </div>`;
      return;
    }

    contentDiv.innerHTML = `
      <div class="flex items-center justify-center p-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>`;

    try {
      const res = await fetch(`/api/v1/curriculum/progress?subject_id=${selectedSubjectId}&term=${currentTerm}&school_year=${currentSchoolYear}`);
      const data: ProgressData = await res.json();
      renderTree(data, contentDiv);
    } catch (err) {
      contentDiv.innerHTML = `
        <div class="flex flex-col items-center justify-center p-12 text-center">
          <p class="text-sm font-semibold text-rose-600">Error loading progress.</p>
        </div>`;
    }
  }

  // ... all imports and helper functions unchanged ...

function renderTree(data: ProgressData, parent: HTMLElement) {
  parent.innerHTML = '';

  // Collect all competencies from all performance standards
  const allCompetencies: CompetencyNode[] = [];
  for (const ps of data.performance_standards) {
    allCompetencies.push(...ps.competencies);
  }

  if (allCompetencies.length === 0) {
    parent.innerHTML = '<p class="text-center text-slate-500 py-12">No competencies found for this term.</p>';
    return;
  }

  const cardsGrid = document.createElement('div');
  cardsGrid.className = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4';

  allCompetencies.forEach(comp => {
    cardsGrid.appendChild(createCompetencyCard(comp));
  });

  parent.appendChild(cardsGrid);
}

// ... rest of the file (createCompetencyCard, event listeners, etc.) unchanged ...
  function createCompetencyCard(comp: CompetencyNode): HTMLElement {
    const card = document.createElement('div');
    card.className = 'bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer';

    let progressColor = 'bg-rose-500';
    let progressBg = 'bg-rose-50 text-rose-700 border-rose-100';
    if (comp.progress !== null) {
      if (comp.progress >= 75) {
        progressColor = 'bg-emerald-500';
        progressBg = 'bg-emerald-50 text-emerald-700 border-emerald-100';
      } else if (comp.progress >= 40) {
        progressColor = 'bg-blue-500';
        progressBg = 'bg-blue-50 text-blue-700 border-blue-100';
      }
    }

    const progressText = comp.progress !== null ? `${comp.progress}%` : '–';
    const objCount = comp.objectives.length;

    card.innerHTML = `
      <div class="flex flex-col gap-3">
        <h4 class="font-semibold text-sm text-slate-800 leading-snug">${comp.description}</h4>
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold px-2 py-0.5 rounded-full border ${progressBg}">${progressText}</span>
          <span class="text-xs text-slate-500">${objCount} objective${objCount !== 1 ? 's' : ''}</span>
        </div>
        <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div class="${progressColor} h-full transition-all duration-300" style="width: ${comp.progress || 0}%"></div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      if (selectedSubjectId && currentTerm) {
        window.location.hash = `#/competency/${comp.id}?subject_id=${selectedSubjectId}&term=${currentTerm}&school_year=${currentSchoolYear}`;
      }
    });
    return card;
  }

  refreshBtn.addEventListener('click', loadProgress);

  return container;
}