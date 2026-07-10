import { SubjectsAPI, LearnersAPI, AssessmentSubtypesAPI, GradeAssessmentsAPI, type Learner, type Subject } from '../../../services/api';
import { LearnerStore } from '../../../stores/learner-store';


export function renderGradeEntryPage(): HTMLElement {
  const container = document.createElement('div');
  // Check for assessment id in hash query
const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
const preloadId = urlParams.get('id');

// After all UI is created, check for preload ID
if (preloadId) {
  (async () => {
    const assessment = await GradeAssessmentsAPI.getOne(parseInt(preloadId));
    // Pre-select subject and term
    subjectSel.value = assessment.subject_id.toString();
    termSel.value = assessment.term.toString();
    // Load objectives
    await loadObjectives();
    // Set the objective dropdown
    if (assessment.learning_objective_id) {
      objectiveSel.value = assessment.learning_objective_id.toString();
    }
    // Trigger editAssessment
    await store.load();
    editAssessment(assessment);
  })().catch(console.error);
}
  container.className = 'p-4 h-full flex flex-col gap-4';

  const store = new LearnerStore();
  const schoolYear = '2026-2027';

  // ---------- Top bar ----------
  const bar = document.createElement('div');
  bar.className = 'flex gap-2 items-center flex-wrap';

  // Subject
  const subjectSel = document.createElement('select');
  subjectSel.className = 'border p-2 rounded';
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
  bar.appendChild(subjectSel);

  // Term
  const termSel = document.createElement('select');
  termSel.className = 'border p-2 rounded';
  termSel.innerHTML = '<option value="">-- Term --</option><option value="1">1st Term</option><option value="2">2nd Term</option><option value="3">3rd Term</option>';
  bar.appendChild(termSel);

  // School Year display
  const syDisplay = document.createElement('span');
  syDisplay.className = 'text-sm ml-2';
  syDisplay.textContent = `SY: ${schoolYear}`;
  bar.appendChild(syDisplay);

  // Learning Objective dropdown (hidden initially)
  const objectiveSel = document.createElement('select');
  objectiveSel.className = 'border p-2 rounded';
  objectiveSel.style.display = 'none';
  objectiveSel.innerHTML = '<option value="">-- Learning Objective (optional) --</option>';
  bar.appendChild(objectiveSel);

  // Assessment Type
  const typeSel = document.createElement('select');
  typeSel.className = 'border p-2 rounded';
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
  bar.appendChild(typeSel);

  // Sub-type (hidden initially)
  const subtypeSel = document.createElement('select');
  subtypeSel.className = 'border p-2 rounded';
  subtypeSel.style.display = 'none';
  bar.appendChild(subtypeSel);

  // Max Score input
  const maxScoreInput = document.createElement('input');
  maxScoreInput.type = 'number';
  maxScoreInput.placeholder = 'Max Score';
  maxScoreInput.className = 'border p-2 rounded w-24';
  bar.appendChild(maxScoreInput);

  // Create Assessment button
  const createBtn = document.createElement('button');
  createBtn.className = 'bg-blue-600 text-white px-4 py-2 rounded';
  createBtn.textContent = 'Create Assessment';
  bar.appendChild(createBtn);

  container.appendChild(bar);

  // Learning Objectives textarea
  //const loTextarea = document.createElement('textarea');
  //loTextarea.placeholder = 'Learning Objectives (optional)';
  //loTextarea.className = 'border p-2 rounded w-full h-16';
  //container.appendChild(loTextarea);

  // Score grid
  const gridContainer = document.createElement('div');
  gridContainer.className = 'border rounded p-2 overflow-auto max-h-96';
  container.appendChild(gridContainer);

  // Save button
  const saveBtn = document.createElement('button');
  saveBtn.className = 'bg-green-600 text-white px-4 py-2 rounded self-start hidden';
  saveBtn.textContent = 'Save Assessment';
  container.appendChild(saveBtn);

  // Existing assessments
  const existingDiv = document.createElement('div');
  existingDiv.className = 'mt-4';
  existingDiv.innerHTML = '<h3 class="font-bold">Existing Assessments</h3><div id="existing-list"></div>';
  container.appendChild(existingDiv);

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

    // Build grid
    gridContainer.innerHTML = '<div class="grid grid-cols-2 gap-1 text-sm font-medium">';
    learners.forEach(l => {
      const name = `${l.last_name}, ${l.first_name}`;
      gridContainer.innerHTML += `
        <div class="flex items-center gap-1 border-b py-1">
          <span class="w-40 truncate">${name}</span>
          <input type="number" class="border w-20 text-center" data-student="${l.id}" min="0" max="${maxScore}" value="0" />
        </div>
      `;
    });
    gridContainer.innerHTML += '</div>';
    saveBtn.classList.remove('hidden');

    saveBtn.onclick = async () => {
      const scores: { student_id: number; score: number }[] = [];
      const inputs = gridContainer.querySelectorAll<HTMLInputElement>('input[data-student]');
      inputs.forEach(inp => {
        scores.push({
          student_id: parseInt(inp.dataset.student!),
          score: parseFloat(inp.value) || 0
        });
      });

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
          //learning_objectives: loTextarea.value || null
        });
        alert('Assessment saved');
        gridContainer.innerHTML = '';
        saveBtn.classList.add('hidden');
        //loTextarea.value = '';
        maxScoreInput.value = '';
        objectiveSel.value = '';  // reset objective dropdown
        loadExistingAssessments();
      } catch (err) {
        alert('Error saving assessment: ' + err);
      }
    };
  }

  async function loadExistingAssessments() {
    const subjectId = parseInt(subjectSel.value);
    const term = parseInt(termSel.value);
    if (!subjectId || !term) return;

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
      item.className = 'border p-2 rounded mb-1 cursor-pointer hover:bg-gray-100';
      item.textContent = `${a.type} — ${a.title} (Max: ${a.total_score}) — Scores: ${a.scores.length}`;
      item.addEventListener('click', () => editAssessment(a));
      listDiv.appendChild(item);
    });
  }

  async function editAssessment(assessment: any) {
    store.setActiveOnly(true);
    await store.load();
    const learners = store.getAll();

    // Pre-fill objective dropdown if there's a linked objective
    if (assessment.learning_objective_id) {
      objectiveSel.value = assessment.learning_objective_id.toString();
    } else {
      objectiveSel.value = '';
    }

    gridContainer.innerHTML = '<div class="grid grid-cols-2 gap-1 text-sm font-medium">';
    const scoreMap = new Map(assessment.scores.map((s: any) => [s.student_id, s.score]));
    learners.forEach(l => {
      const name = `${l.last_name}, ${l.first_name}`;
      const val = scoreMap.get(l.id) || 0;
      gridContainer.innerHTML += `
        <div class="flex items-center gap-1 border-b py-1">
          <span class="w-40 truncate">${name}</span>
          <input type="number" class="border w-20 text-center" data-student="${l.id}" min="0" max="${assessment.total_score}" value="${val}" />
        </div>
      `;
    });
    gridContainer.innerHTML += '</div>';
    saveBtn.classList.remove('hidden');
    saveBtn.textContent = 'Update Assessment';
    saveBtn.onclick = async () => {
      const scores: { student_id: number; score: number }[] = [];
      const inputs = gridContainer.querySelectorAll<HTMLInputElement>('input[data-student]');
      inputs.forEach(inp => {
        scores.push({
          student_id: parseInt(inp.dataset.student!),
          score: parseFloat(inp.value) || 0
        });
      });
      const objectiveId = objectiveSel.value ? parseInt(objectiveSel.value) : null;
      try {
        await GradeAssessmentsAPI.update(assessment.id, {
          scores,
          learning_objective_id: objectiveId,
          //learning_objectives: loTextarea.value || null
        });
        alert('Assessment updated');
        gridContainer.innerHTML = '';
        saveBtn.classList.add('hidden');
        saveBtn.textContent = 'Save Assessment';
        //loTextarea.value = '';
        maxScoreInput.value = '';
        objectiveSel.value = '';
        loadExistingAssessments();
      } catch (err) {
        alert('Error updating assessment: ' + err);
      }
    };
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

  loadExistingAssessments();
  loadObjectives();

  return container;
}

