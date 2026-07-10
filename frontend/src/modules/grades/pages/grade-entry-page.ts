import { SubjectsAPI, LearnersAPI, AssessmentSubtypesAPI, GradeAssessmentsAPI, type Learner, type Subject } from '../../../services/api';
import { LearnerStore } from '../../../stores/learner-store';

export function renderGradeEntryPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'p-4 h-full flex flex-col gap-4';

  const store = new LearnerStore();
  const schoolYear = '2026-2027';

  let currentAssessmentId: number | null = null; // tracks which assessment is being edited, for list highlighting

  // ================= Step 1: Context =================
  const step1 = document.createElement('div');
  step1.className = 'border rounded-lg p-3 bg-white';
  step1.innerHTML = '<div class="text-xs font-semibold text-gray-500 mb-2">STEP 1 · CONTEXT</div>';

  const step1Row = document.createElement('div');
  step1Row.className = 'flex gap-2 items-center flex-wrap';

  const subjectSel = document.createElement('select');
  subjectSel.className = 'border p-2 rounded text-black bg-white';
  subjectSel.innerHTML = '<option value="">-- Select Subject --</option>';
  SubjectsAPI.getAll().then(subjects => {
    subjectSel.innerHTML = '<option value="">-- Select Subject --</option>';
    subjects.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id.toString();
      opt.textContent = s.name;
      subjectSel.appendChild(opt);
    });
  });
  step1Row.appendChild(subjectSel);

  const termSel = document.createElement('select');
  termSel.className = 'border p-2 rounded text-black bg-white';
  termSel.innerHTML = '<option value="">-- Term --</option><option value="1">1st Term</option><option value="2">2nd Term</option><option value="3">3rd Term</option>';
  step1Row.appendChild(termSel);

  const syDisplay = document.createElement('span');
  syDisplay.className = 'text-sm ml-2 text-gray-800';
  syDisplay.textContent = `SY: ${schoolYear}`;
  step1Row.appendChild(syDisplay);

  step1.appendChild(step1Row);
  container.appendChild(step1);

  // ================= Step 2: Assessment setup =================
  const step2 = document.createElement('div');
  step2.className = 'border rounded-lg p-3 bg-white opacity-50 pointer-events-none transition-opacity';
  step2.innerHTML = '<div class="text-xs font-semibold text-gray-500 mb-2">STEP 2 · ASSESSMENT SETUP</div>';

  const objectiveSel = document.createElement('select');
  objectiveSel.className = 'border p-2 rounded w-full mb-2 text-black bg-white';
  objectiveSel.style.display = 'none';
  objectiveSel.innerHTML = '<option value="">-- Learning Objective (optional) --</option>';
  step2.appendChild(objectiveSel);

  const step2Row = document.createElement('div');
  step2Row.className = 'flex gap-2 items-center flex-wrap';

  const typeSel = document.createElement('select');
  typeSel.className = 'border p-2 rounded text-black bg-white';
  typeSel.innerHTML = '<option value="">-- Assessment Type --</option><option value="Written Works">Written Works</option><option value="Performance Task">Performance Task</option><option value="Term Examination">Term Examination</option>';
  typeSel.addEventListener('change', () => {
    if (typeSel.value === 'Written Works') {
      subtypeSel.style.display = '';
      loadSubtypes();
    } else {
      subtypeSel.style.display = 'none';
      subtypeSel.innerHTML = '';
    }
  });
  step2Row.appendChild(typeSel);

  const subtypeSel = document.createElement('select');
  subtypeSel.className = 'border p-2 rounded text-black bg-white';
  subtypeSel.style.display = 'none';
  step2Row.appendChild(subtypeSel);

  const maxScoreInput = document.createElement('input');
  maxScoreInput.type = 'number';
  maxScoreInput.placeholder = 'Max Score';
  maxScoreInput.className = 'border p-2 rounded w-24 text-black bg-white placeholder-gray-500';
  step2Row.appendChild(maxScoreInput);

  const createBtn = document.createElement('button');
  createBtn.className = 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700';
  createBtn.textContent = 'Create Assessment';
  step2Row.appendChild(createBtn);

  step2.appendChild(step2Row);
  container.appendChild(step2);

  // ================= Step 3: Scores =================
  const step3 = document.createElement('div');
  step3.className = 'border rounded-lg p-3 bg-white flex flex-col gap-2';
  step3.innerHTML = '<div class="text-xs font-semibold text-gray-500">STEP 3 · SCORES</div>';

  const gridWrap = document.createElement('div');
  gridWrap.className = 'relative border rounded overflow-auto max-h-96';

  const gridContainer = document.createElement('div');
  gridContainer.className = 'min-w-full';
  gridWrap.appendChild(gridContainer);
  step3.appendChild(gridWrap);

  // Sticky save bar stays visible while scrolling the grid above it
  const saveBar = document.createElement('div');
  saveBar.className = 'sticky bottom-0 bg-white border-t pt-2 flex justify-end hidden';
  const saveBtn = document.createElement('button');
  saveBtn.className = 'bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700';
  saveBtn.textContent = 'Save Assessment';
  saveBar.appendChild(saveBtn);
  step3.appendChild(saveBar);

  container.appendChild(step3);

  // ================= Existing assessments =================
  const existingDiv = document.createElement('div');
  existingDiv.className = 'mt-2';
  existingDiv.innerHTML = '<h3 class="font-bold mb-1">Existing Assessments</h3><div id="existing-list" class="flex flex-col gap-1"></div>';
  container.appendChild(existingDiv);

  // ---------- Step gating ----------
  function refreshStepGating() {
    const contextReady = !!subjectSel.value && !!termSel.value;
    step2.classList.toggle('opacity-50', !contextReady);
    step2.classList.toggle('pointer-events-none', !contextReady);
  }
  subjectSel.addEventListener('change', refreshStepGating);
  termSel.addEventListener('change', refreshStepGating);

  // ---------- Helper functions ----------
  async function loadSubtypes() {
    const subtypes = await AssessmentSubtypesAPI.getAll();
    const ww = subtypes['Written Works'] || [];
    subtypeSel.innerHTML = '<option value="">-- Sub-type --</option>';
    ww.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      subtypeSel.appendChild(opt);
    });
  }

  async function loadObjectives() {
    const subjectId = parseInt(subjectSel.value);
    const term = parseInt(termSel.value);
    if (!subjectId || !term) {
      objectiveSel.style.display = 'none';
      objectiveSel.innerHTML = '<option value="">-- Learning Objective (optional) --</option>';
      return;
    }
    try {
      const res = await fetch(`/api/v1/learning-objectives/?subject_id=${subjectId}&term=${term}&school_year=${schoolYear}`);
      const objectives = await res.json();
      objectiveSel.innerHTML = '<option value="">-- Learning Objective (optional) --</option>';
      objectives.forEach((obj: any) => {
        const opt = document.createElement('option');
        opt.value = obj.id;
        opt.textContent = `${obj.code}: ${obj.description}`;
        objectiveSel.appendChild(opt);
      });
      objectiveSel.style.display = '';
    } catch (err) {
      console.error(err);
      objectiveSel.style.display = 'none';
    }
  }

  // Builds the "Name | Score / Max" table. Shared by create + edit flows.
  function renderScoreTable(rows: { id: number; name: string; value: number }[], maxScore: number) {
    gridContainer.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'w-full text-sm border-collapse';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr class="sticky top-0 bg-gray-50 border-b text-left">
        <th class="p-2 font-medium text-gray-900">Name</th>
        <th class="p-2 font-medium text-gray-900 text-right">Score / ${maxScore}</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.className = 'border-b hover:bg-gray-50';
      tr.innerHTML = `
        <td class="p-2 truncate max-w-[200px] text-black">${r.name}</td>
        <td class="p-2 text-right">
          <input type="number" class="border w-20 text-center rounded text-black bg-white" data-student="${r.id}" min="0" max="${maxScore}" value="${r.value}" />
        </td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    gridContainer.appendChild(table);
  }

  function collectScores(): { student_id: number; score: number }[] {
    const scores: { student_id: number; score: number }[] = [];
    const inputs = gridContainer.querySelectorAll<HTMLInputElement>('input[data-student]');
    inputs.forEach(inp => {
      scores.push({
        student_id: parseInt(inp.dataset.student!),
        score: parseFloat(inp.value) || 0
      });
    });
    return scores;
  }

  function resetAfterSave() {
    gridContainer.innerHTML = '';
    saveBar.classList.add('hidden');
    saveBtn.textContent = 'Save Assessment';
    maxScoreInput.value = '';
    objectiveSel.value = '';
    currentAssessmentId = null;
    loadExistingAssessments();
  }

  async function createScoreGrid() {
    const subjectId = parseInt(subjectSel.value);
    const term = parseInt(termSel.value);
    if (!subjectId || !term) {
      alert('Please select subject and term');
      return;
    }
    const type = typeSel.value;
    if (!type) {
      alert('Please select assessment type');
      return;
    }
    const subType = subtypeSel.style.display === 'none' ? type : (subtypeSel.value || type);
    const maxScore = parseFloat(maxScoreInput.value) || 0;
    if (!maxScore) {
      alert('Enter max score');
      return;
    }

    store.setActiveOnly(true);
    await store.load();
    const learners = store.getAll();
    if (learners.length === 0) {
      alert('No learners found');
      return;
    }

    currentAssessmentId = null;
    renderScoreTable(
      learners.map(l => ({ id: l.id, name: `${l.last_name}, ${l.first_name}`, value: 0 })),
      maxScore
    );
    saveBar.classList.remove('hidden');
    saveBtn.textContent = 'Save Assessment';

    saveBtn.onclick = async () => {
      const scores = collectScores();
      const objectiveId = objectiveSel.value ? parseInt(objectiveSel.value) : null;

      try {
        await GradeAssessmentsAPI.create({
          subject_id: subjectId,
          date: new Date().toISOString().split('T')[0],
          type: subType,
          title: subType,
          total_score: maxScore,
          scores,
          source: 'grades',
          school_year: schoolYear,
          term: term,
          learning_objective_id: objectiveId,
        });
        alert('Assessment saved');
        resetAfterSave();
      } catch (err) {
        alert('Error saving assessment: ' + err);
      }
    };
  }

  async function loadExistingAssessments() {
    const subjectId = parseInt(subjectSel.value);
    const term = parseInt(termSel.value);
    if (!subjectId || !term) return;

    store.setActiveOnly(true);
    await store.load();
    const totalLearners = store.getAll().length;

    const list = await GradeAssessmentsAPI.getForGradeEntry({
      subject_id: subjectId,
      school_year: schoolYear,
      term
    });
    const listDiv = existingDiv.querySelector('#existing-list')!;
    listDiv.innerHTML = '';
    if (list.length === 0) {
      listDiv.innerHTML = '<p class="text-sm text-gray-500">No assessments yet.</p>';
      return;
    }
    list.forEach((a: any) => {
      const item = document.createElement('div');
      const isActive = a.id === currentAssessmentId;
      item.className = `border p-2 rounded cursor-pointer flex justify-between items-center gap-2 ${
        isActive ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-100'
      }`;
      const scored = a.scores.length;
      const complete = scored >= totalLearners && totalLearners > 0;
      item.innerHTML = `
        <span class="truncate">${a.type} — ${a.title} (Max: ${a.total_score})</span>
        <span class="text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
          complete ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
        }">${scored}/${totalLearners} scored</span>
      `;
      item.addEventListener('click', () => editAssessment(a));
      listDiv.appendChild(item);
    });
  }

  async function editAssessment(assessment: any) {
    store.setActiveOnly(true);
    await store.load();
    const learners = store.getAll();

    currentAssessmentId = assessment.id;

    if (assessment.learning_objective_id) {
      objectiveSel.value = assessment.learning_objective_id.toString();
    } else {
      objectiveSel.value = '';
    }

    const scoreMap = new Map(assessment.scores.map((s: any) => [s.student_id, s.score]));
    renderScoreTable(
      learners.map(l => ({
        id: l.id,
        name: `${l.last_name}, ${l.first_name}`,
        value: (scoreMap.get(l.id) as number) || 0
      })),
      assessment.total_score
    );
    saveBar.classList.remove('hidden');
    saveBtn.textContent = 'Update Assessment';

    saveBtn.onclick = async () => {
      const scores = collectScores();
      const objectiveId = objectiveSel.value ? parseInt(objectiveSel.value) : null;
      try {
        await GradeAssessmentsAPI.update(assessment.id, {
          scores,
          learning_objective_id: objectiveId,
        });
        alert('Assessment updated');
        resetAfterSave();
      } catch (err) {
        alert('Error updating assessment: ' + err);
      }
    };

    // Re-render the list so the active item gets highlighted
    loadExistingAssessments();
  }

  // ---------- Event listeners ----------
  createBtn.addEventListener('click', createScoreGrid);
  subjectSel.addEventListener('change', () => {
    loadObjectives();
    loadExistingAssessments();
  });
  termSel.addEventListener('change', () => {
    loadObjectives();
    loadExistingAssessments();
  });

  refreshStepGating();
  loadExistingAssessments();
  loadObjectives();

  // ---------- Deep-link preload (?id=...) ----------
  // Runs last, after all elements/handlers above exist, to avoid referencing
  // subjectSel/termSel/objectiveSel/loadObjectives/editAssessment before init.
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const preloadId = urlParams.get('id');
  if (preloadId) {
    (async () => {
      const assessment = await GradeAssessmentsAPI.getOne(parseInt(preloadId));
      subjectSel.value = assessment.subject_id.toString();
      termSel.value = assessment.term.toString();
      refreshStepGating();
      await loadObjectives();
      if (assessment.learning_objective_id) {
        objectiveSel.value = assessment.learning_objective_id.toString();
      }
      await editAssessment(assessment);
    })().catch(console.error);
  }

  return container;
}