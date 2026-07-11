import { SubjectsAPI } from '../../../services/api';

interface ObjectiveNode {
  id: number; code: string; description: string; class_average: number | null;
}

interface CompetencyNode {
  id: number; code: string; description: string;
  progress: number | null;
  objectives: ObjectiveNode[];
}

interface ProgressData {
  performance_standards: {
    description: string;
    competencies: CompetencyNode[];
  }[];
}

export function renderMonitoringPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'p-6 h-full flex flex-col gap-6 bg-slate-50/50 overflow-y-auto';
  const schoolYear = '2026-2027';

  // Header and Filter Row
  const headerRow = document.createElement('div');
  headerRow.className = 'flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm';

  const titleArea = document.createElement('div');
  titleArea.innerHTML = `
    <h1 class="text-xl font-bold text-slate-850 text-black">Curriculum Progress Monitoring</h1>
    <p class="text-xs text-slate-500">Track and manage learning competency coverage and student achievement averages</p>
  `;
  headerRow.appendChild(titleArea);

  const controlsArea = document.createElement('div');
  controlsArea.className = 'flex flex-wrap items-center gap-3';

  const subjectSel = document.createElement('select');
  subjectSel.className = 'border border-slate-200 p-2 rounded-lg text-sm bg-white text-slate-700 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer';
  subjectSel.innerHTML = '<option value="">-- Subject --</option>';
  
  SubjectsAPI.getAll().then(subjects => {
    subjectSel.innerHTML = '<option value="">-- Subject --</option>';
    subjects.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id.toString();
      opt.textContent = s.name;
      subjectSel.appendChild(opt);
    });
  });

  const termSel = document.createElement('select');
  termSel.className = 'border border-slate-200 p-2 rounded-lg text-sm bg-white text-slate-700 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer';
  termSel.innerHTML = '<option value="">-- Term --</option><option value="1">1st Term</option><option value="2">2nd Term</option><option value="3">3rd Term</option>';

  const syBadge = document.createElement('div');
  syBadge.className = 'flex items-center gap-1.5 px-3 py-2 bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 border border-slate-100';
  syBadge.innerHTML = `
    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
    <span>SY ${schoolYear}</span>
  `;

  const refreshBtn = document.createElement('button');
  refreshBtn.className = 'bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all shadow-sm flex items-center gap-1.5 cursor-pointer';
  refreshBtn.innerHTML = `
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5"></path></svg>
    Refresh
  `;

  controlsArea.appendChild(subjectSel);
  controlsArea.appendChild(termSel);
  controlsArea.appendChild(syBadge);
  controlsArea.appendChild(refreshBtn);
  headerRow.appendChild(controlsArea);
  
  container.appendChild(headerRow);

  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1 overflow-auto bg-white rounded-xl border border-slate-100 p-6 shadow-sm';
  container.appendChild(contentDiv);

  // Initial State
  contentDiv.innerHTML = `
    <div class="flex flex-col items-center justify-center p-12 text-center">
      <div class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
        <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
      </div>
      <p class="text-sm font-semibold text-slate-650">Select parameters to load progress tree</p>
      <p class="text-xs text-slate-400 mt-1">Please select both a subject and term from the top filters.</p>
    </div>
  `;

  async function loadProgress() {
    const subjectId = parseInt(subjectSel.value);
    const term = parseInt(termSel.value);
    if (!subjectId || !term) {
      contentDiv.innerHTML = `
        <div class="flex flex-col items-center justify-center p-12 text-center animate-fadeIn">
          <div class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
            <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          </div>
          <p class="text-sm font-semibold text-slate-650">Select parameters to load progress tree</p>
          <p class="text-xs text-slate-400 mt-1">Please select both a subject and term from the top filters.</p>
        </div>
      `;
      return;
    }
    contentDiv.innerHTML = `
      <div class="flex items-center justify-center p-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-650"></div>
      </div>
    `;
    try {
      const res = await fetch(`/api/v1/curriculum/progress?subject_id=${subjectId}&term=${term}&school_year=${schoolYear}`);
      const data: ProgressData = await res.json();
      renderTree(data, contentDiv);
    } catch (err) {
      contentDiv.innerHTML = `
        <div class="flex flex-col items-center justify-center p-6 text-center border border-dashed border-rose-250 bg-rose-50/20 rounded-xl">
          <p class="text-sm font-semibold text-rose-600">Error loading curriculum progress</p>
          <p class="text-xs text-rose-450 mt-1">Make sure you have an active network connection and try again.</p>
        </div>
      `;
    }
  }

  function renderTree(data: ProgressData, parent: HTMLElement) {
    parent.innerHTML = '';
    if (!data.performance_standards.length) {
      parent.innerHTML = `
        <div class="flex flex-col items-center justify-center p-12 text-center">
          <p class="text-sm font-medium text-slate-500">No curriculum data found</p>
          <p class="text-xs text-slate-400 mt-0.5">There is no progress or performance standard configured for this selection.</p>
        </div>
      `;
      return;
    }

    const treeContainer = document.createElement('div');
    treeContainer.className = 'flex flex-col gap-6 w-full';

    data.performance_standards.forEach(ps => {
      const psDiv = document.createElement('div');
      psDiv.className = 'border border-slate-100 bg-slate-50/30 p-5 rounded-xl flex flex-col gap-4';
      
      const psHeader = document.createElement('div');
      psHeader.className = 'border-b border-slate-100 pb-3 flex items-start gap-2.5';
      psHeader.innerHTML = `
        <div class="bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[10px] font-bold text-indigo-700 mt-0.5 uppercase tracking-wider">Standard</div>
        <div class="flex flex-col">
          <p class="text-sm text-slate-700 font-medium">${ps.description}</p>
        </div>
      `;
      psDiv.appendChild(psHeader);

      const compsContainer = document.createElement('div');
      compsContainer.className = 'flex flex-col gap-4 pl-4 border-l border-slate-200/60 ml-2';
            
      ps.competencies.forEach(comp => {
        const compDiv = document.createElement('div');
        compDiv.className = 'bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex flex-col gap-3';
        
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
        
        const compHeader = document.createElement('div');
        compHeader.className = 'flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-50 pb-2.5';
        compHeader.innerHTML = `
          <div class="flex flex-col gap-1">
            <span class="font-semibold text-slate-700 text-sm leading-relaxed">${comp.description}</span>
          </div>
          <div class="flex flex-col items-end gap-1 shrink-0">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Progress</span>
            <span class="text-xs font-bold px-2 py-0.5 rounded-full border ${progressBg}">${progressText}</span>
          </div>
        `;
        compDiv.appendChild(compHeader);

        // Competency progress bar
        if (comp.progress !== null) {
          const compBar = document.createElement('div');
          compBar.className = 'h-1.5 w-full bg-slate-100 rounded-full overflow-hidden';
          compBar.innerHTML = `<div class="${progressColor} h-full transition-all duration-300" style="width: ${comp.progress}%"></div>`;
          compDiv.appendChild(compBar);
        }

        // Objectives Title
        const objTitle = document.createElement('div');
        objTitle.className = 'text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1';
        objTitle.textContent = 'Learning Objectives';
        compDiv.appendChild(objTitle);

        const objList = document.createElement('div');
        objList.className = 'grid grid-cols-1 md:grid-cols-2 gap-3 pl-1 text-black';
        
        comp.objectives.forEach(obj => {
          const card = document.createElement('div');
          card.className = 'border border-slate-50 p-3 rounded-lg bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all flex justify-between items-start gap-2.5';
          
          let avgBg = 'bg-slate-100 text-slate-600';
          if (obj.class_average !== null) {
            if (obj.class_average >= 85) avgBg = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
            else if (obj.class_average >= 70) avgBg = 'bg-blue-50 text-blue-700 border border-blue-100';
            else if (obj.class_average >= 50) avgBg = 'bg-amber-50 text-amber-700 border border-amber-100';
            else avgBg = 'bg-rose-50 text-rose-700 border border-rose-100';
          }
          
          const avgText = obj.class_average !== null ? `${obj.class_average}%` : '–';
          
          card.innerHTML = `
            <div class="flex flex-col gap-0.5">
              <span class="text-xs font-semibold text-slate-650 leading-relaxed">${obj.description}</span>
            </div>
            <div class="text-right shrink-0">
              <span class="text-[9px] font-semibold text-slate-400 block uppercase tracking-wider">Avg</span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full ${avgBg}">${avgText}</span>
            </div>
          `;
          objList.appendChild(card);
        });

        compDiv.appendChild(objList);

        // Add objective button
        const addBtn = document.createElement('button');
        addBtn.className = 'bg-indigo-50 hover:bg-indigo-100/80 text-indigo-650 font-semibold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer self-start border border-indigo-100/50 mt-1';
        addBtn.innerHTML = `
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Add Learning Objective
        `;
        addBtn.addEventListener('click', () => addObjectiveForm(compDiv, comp.id));
        compDiv.appendChild(addBtn);
        
        compsContainer.appendChild(compDiv);
      });

      psDiv.appendChild(compsContainer);
      treeContainer.appendChild(psDiv);
    });

    parent.appendChild(treeContainer);
  }

  function addObjectiveForm(parent: HTMLElement, competencyId: number) {
    // Remove any existing inline objective form in this parent first
    const existingForm = parent.querySelector('.objective-inline-form');
    if (existingForm) existingForm.remove();

    const formDiv = document.createElement('div');
    formDiv.className = 'objective-inline-form border border-indigo-100 p-4 mt-2 bg-indigo-50/25 rounded-xl flex flex-col gap-3 animate-fadeIn';
    formDiv.innerHTML = `
      <div class="flex items-center justify-between border-b border-indigo-100/50 pb-1.5">
        <h5 class="font-bold text-slate-700 text-xs">New Objective</h5>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
      
        <div class="flex flex-col gap-1 sm:col-span-2">
          <label class="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Objective Description</label>
          <input id="obj-desc" placeholder="Enter objective details..." class="border border-slate-200 p-2 rounded-lg text-xs bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" />
        </div>
      </div>
      <div class="pt-2 border-t border-indigo-100/50 flex justify-end gap-2">
        <button id="cancel-obj" class="text-xs text-slate-400 hover:text-slate-650 cursor-pointer font-medium px-2 py-1">Cancel</button>
        <button id="save-obj" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm cursor-pointer">Save Objective</button>
      </div>
    `;
    parent.appendChild(formDiv);

    document.getElementById('save-obj')!.addEventListener('click', async () => {
      const code = (document.getElementById('obj-code') as HTMLInputElement).value;
      const desc = (document.getElementById('obj-desc') as HTMLInputElement).value;
      if (!code || !desc) { alert('Please fill both fields'); return; }
      await fetch('/api/v1/learning-objectives/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ code, description: desc, learning_competency_id: competencyId })
      });
      formDiv.remove();
      loadProgress();  // refresh tree
    });
    document.getElementById('cancel-obj')!.addEventListener('click', () => formDiv.remove());
  }

  refreshBtn.addEventListener('click', loadProgress);
  subjectSel.addEventListener('change', loadProgress);
  termSel.addEventListener('change', loadProgress);

  return container;
}