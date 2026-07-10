import { SubjectsAPI, GradesAPI, LearnersAPI, type GradeRow, type Subject } from '../../../services/api';
import { LearnerStore } from '../../../stores/learner-store';

export function renderComputedGradesPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'p-4 h-full flex flex-col gap-4';
  const schoolYear = '2026-2027';

  // --- Selectors ---
  const bar = document.createElement('div');
  bar.className = 'flex gap-2 items-center';

  const subjectSel = document.createElement('select');
  subjectSel.className = 'border p-2 rounded';
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
  termSel.className = 'border p-2 rounded';
  termSel.innerHTML = '<option value="">-- Term --</option><option value="1">1st Term</option><option value="2">2nd Term</option><option value="3">3rd Term</option>';

  bar.appendChild(subjectSel);
  bar.appendChild(termSel);
  container.appendChild(bar);

  const computeBtn = document.createElement('button');
  computeBtn.className = 'bg-blue-600 text-white px-4 py-2 rounded self-start';
  computeBtn.textContent = 'Compute Grades';
  container.appendChild(computeBtn);

  const tableContainer = document.createElement('div');
  tableContainer.className = 'overflow-x-auto';
  container.appendChild(tableContainer);

  const saveBtn = document.createElement('button');
  saveBtn.className = 'bg-green-600 text-white px-4 py-2 rounded self-start hidden';
  saveBtn.textContent = 'Save Grades to Records';
  container.appendChild(saveBtn);

  const store = new LearnerStore();

  async function compute() {
    const subjectId = parseInt(subjectSel.value);
    const term = parseInt(termSel.value);
    if (!subjectId || !term) return;

    const grades = await GradesAPI.getTermSummary(subjectId, schoolYear, term);
    await store.load();
    const learners = store.getAll();
    const nameMap = new Map(learners.map(l => [l.id, `${l.last_name}, ${l.first_name}`]));

    // Build table
    let html = `<table class="table-auto w-full border-collapse text-sm"><thead><tr>
      <th class="border px-2 py-1">Learner</th>
      <th class="border px-2 py-1">WW Average</th>
      <th class="border px-2 py-1">PT Average</th>
      <th class="border px-2 py-1">TE Score</th>
      <th class="border px-2 py-1">Final Grade</th>
    </tr></thead><tbody>`;
    grades.forEach(g => {
      html += `<tr>
        <td class="border px-2 py-1">${nameMap.get(g.student_id) || g.student_id}</td>
        <td class="border px-2 py-1 text-center">${g.ww_average}</td>
        <td class="border px-2 py-1 text-center">${g.pt_average}</td>
        <td class="border px-2 py-1 text-center">${g.te_score}</td>
        <td class="border px-2 py-1 text-center font-bold">${g.final_grade}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    tableContainer.innerHTML = html;
    saveBtn.classList.remove('hidden');

    // Store grades for saving
    saveBtn.onclick = async () => {
      await GradesAPI.save({
        subject_id: subjectId,
        school_year: schoolYear,
        term,
        grades
      });
      alert('Grades saved.');
    };
  }

  computeBtn.addEventListener('click', compute);

  return container;
}