interface ObjectiveDetail {
  id: number;
  description: string;
  class_average: number | null;
}

interface CompetencyDetail {
  id: number;
  description: string;
  performance_standard_description: string;
  progress: number | null;
  objectives: ObjectiveDetail[];
}

export function renderCompetencyDetailPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'p-6 max-w-4xl mx-auto space-y-6';

  // Extract ID and query params from URL
  const hash = window.location.hash;
  const [hashPath, queryString] = hash.split('?');
  const parts = hashPath.split('/');
  const competencyId = parseInt(parts[2]);

  const params = new URLSearchParams(queryString || '');
  const subjectId = params.get('subject_id') || '';
  const term = params.get('term') || '';
  const schoolYear = params.get('school_year') || '';

  let data: CompetencyDetail | null = null;

  // Back button
  const backLink = document.createElement('a');
  backLink.href = `#/classroom?subject_id=${subjectId}`; // back to monitoring
  backLink.className = 'text-indigo-600 text-sm hover:underline inline-flex items-center gap-1 cursor-pointer';
  backLink.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg> Back to Monitoring`;
  container.appendChild(backLink);

  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'flex items-center justify-center p-12';
  loadingDiv.innerHTML = `<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>`;
  container.appendChild(loadingDiv);

  const contentDiv = document.createElement('div');
  container.appendChild(contentDiv);

  (async () => {
    try {
      const res = await fetch(`/api/v1/curriculum/competencies/${competencyId}`);
      if (!res.ok) throw new Error('Competency not found');
      data = await res.json();
      render();
    } catch (err) {
      loadingDiv.innerHTML = '<p class="text-red-500 text-center">Failed to load competency data.</p>';
    }
  })();

  function render() {
    if (!data) return;
    contentDiv.innerHTML = '';

    // Header card
    const headerCard = document.createElement('div');
    headerCard.className = 'bg-white border rounded-xl p-6 shadow-sm';
    headerCard.innerHTML = `
      <div class="text-xs font-semibold text-indigo-700 uppercase mb-1">Performance Standard</div>
      <p class="text-sm text-slate-600 mb-3">${data.performance_standard_description}</p>
      <h2 class="text-lg font-bold text-slate-800 mb-2">${data.description}</h2>
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium">Progress:</span>
        <span class="text-lg font-bold ${data.progress !== null && data.progress >= 75 ? 'text-emerald-600' : data.progress !== null && data.progress >= 40 ? 'text-blue-600' : 'text-rose-600'}">
          ${data.progress !== null ? data.progress + '%' : '–'}
        </span>
      </div>
    `;
    contentDiv.appendChild(headerCard);

    // Objectives section
    const objSection = document.createElement('div');
    objSection.className = 'bg-white border rounded-xl p-6 shadow-sm mt-6';
    objSection.innerHTML = '<h3 class="text-md font-semibold text-slate-700 mb-4">Learning Objectives</h3>';

    const objectivesList = document.createElement('div');
    objectivesList.className = 'space-y-3';

    data.objectives.forEach(obj => {
      const avgText = obj.class_average !== null ? `${obj.class_average}%` : '–';
      let avgBg = 'bg-slate-100 text-slate-600';
      if (obj.class_average !== null) {
        if (obj.class_average >= 75) avgBg = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
        else if (obj.class_average >= 50) avgBg = 'bg-blue-50 text-blue-700 border border-blue-100';
        else avgBg = 'bg-rose-50 text-rose-700 border border-rose-100';
      }

      const row = document.createElement('div');
      row.className = 'flex items-center justify-between border border-slate-200 rounded-lg p-3';
      row.innerHTML = `
        <div class="flex-1">
          <p class="text-sm font-medium text-slate-800">${obj.description}</p>
        </div>
        <div class="flex items-center gap-3 ml-4">
          <span class="text-xs font-bold px-2 py-0.5 rounded-full ${avgBg}">${avgText}</span>
          <a href="#/grades?objective_id=${obj.id}&subject_id=${subjectId}&term=${term}&school_year=${schoolYear}" 
             class="assign-assessment-btn bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded border border-purple-200 transition cursor-pointer">
            + Assessment
          </a>
        </div>
      `;
      objectivesList.appendChild(row);
    });

    if (data.objectives.length === 0) {
      objectivesList.innerHTML = '<p class="text-sm text-slate-400 italic">No objectives yet.</p>';
    }

    objSection.appendChild(objectivesList);
    contentDiv.appendChild(objSection);

    // Add objective form
    const addBtn = document.createElement('button');
    addBtn.className = 'mt-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-4 py-2 rounded-lg text-sm transition border border-indigo-200 flex items-center gap-2 cursor-pointer';
    addBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Add Learning Objective`;
    contentDiv.appendChild(addBtn);

    const formContainer = document.createElement('div');
    formContainer.className = 'mt-3';
    contentDiv.appendChild(formContainer);

    addBtn.addEventListener('click', () => {
      formContainer.innerHTML = `
        <div class="border border-indigo-100 p-4 rounded-xl bg-indigo-50/30">
          <label class="text-xs font-semibold text-slate-600 block mb-2">Objective Description</label>
          <input id="new-obj-desc" placeholder="Enter objective description..." class="w-full border border-slate-200 p-2 rounded-lg text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          <div class="flex justify-end gap-2 mt-3">
            <button id="cancel-obj" class="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1">Cancel</button>
            <button id="save-new-obj" class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs">Save</button>
          </div>
        </div>
      `;

      formContainer.querySelector('#cancel-obj')!.addEventListener('click', () => {
        formContainer.innerHTML = '';
      });

      formContainer.querySelector('#save-new-obj')!.addEventListener('click', async () => {
        const desc = (formContainer.querySelector('#new-obj-desc') as HTMLInputElement).value.trim();
        if (!desc) return;
        await fetch('/api/v1/learning-objectives/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: desc, learning_competency_id: competencyId })
        });
        // Reload page to show updated objectives
        window.location.reload();
      });
    });
  }

  return container;
}