import { SubjectsAPI, GradesAPI, LearnersAPI, type Subject, type GradeRow } from '../../../services/api';
import { LearnerStore } from '../../../stores/learner-store';

export function renderGradeSheetPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'p-4 space-y-4';

  // ---------- Header ----------
  const heading = document.createElement('h2');
  heading.className = 'text-xl font-bold';
  heading.textContent = 'Grade Sheet';
  container.appendChild(heading);

  // ---------- Filters Bar ----------
  const filterBar = document.createElement('div');
  filterBar.className = 'flex gap-2 items-center flex-wrap';

  // Subject
  const subjectSel = document.createElement('select');
  subjectSel.className = 'border p-2 rounded text-black';
  subjectSel.innerHTML = '<option value="">-- Subject --</option>';
  SubjectsAPI.getAll().then(subs => {
    subjectSel.innerHTML = '<option value="">-- Subject --</option>';
    subs.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id.toString();
      opt.textContent = s.name;
      subjectSel.appendChild(opt);
    });
  });

  // Term
  const termSel = document.createElement('select');
  termSel.className = 'border p-2 rounded text-black';
  termSel.innerHTML = `
    <option value="">-- Term --</option>
    <option value="1">1st Term</option>
    <option value="2">2nd Term</option>
    <option value="3">3rd Term</option>
  `;

  // School Year (hard-coded for now)
  const schoolYear = '2026-2027';
  const sySpan = document.createElement('span');
  sySpan.className = 'text-sm';
  sySpan.textContent = `SY: ${schoolYear}`;

  // Generate button
  const generateBtn = document.createElement('button');
  generateBtn.className = 'bg-blue-600 text-white px-4 py-2 rounded';
  generateBtn.textContent = 'Generate';

  filterBar.appendChild(subjectSel);
  filterBar.appendChild(termSel);
  filterBar.appendChild(sySpan);
  filterBar.appendChild(generateBtn);
  container.appendChild(filterBar);

  // ---------- Table Container ----------
  const tableContainer = document.createElement('div');
  tableContainer.className = 'overflow-x-auto mt-4';
  container.appendChild(tableContainer);

  // ---------- Print Button (initially hidden) ----------
  const printBtn = document.createElement('button');
  printBtn.className = 'bg-gray-600 text-white px-4 py-2 rounded hidden';
  printBtn.textContent = 'Print';
  container.appendChild(printBtn);

  // ---------- Store for learner names ----------
  const store = new LearnerStore();

  // ---------- Generate Logic ----------
  generateBtn.addEventListener('click', async () => {
    const subjectId = parseInt(subjectSel.value);
    const term = parseInt(termSel.value);
    if (!subjectId || !term) {
      alert('Please select a subject and term.');
      return;
    }

    // Ensure learners are loaded (for name mapping)
    store.setActiveOnly(true);
    await store.load();
    const learners = store.getAll();
    const nameMap = new Map(learners.map(l => [l.id, `${l.last_name}, ${l.first_name}`]));

    try {
      const grades = await GradesAPI.getTermSummary(subjectId, schoolYear, term);
      renderTable(grades, nameMap);
      printBtn.classList.remove('hidden');
    } catch (err) {
      tableContainer.innerHTML = '<p class="text-red-500">Failed to load grades.</p>';
    }
  });

  // ---------- Render Table ----------
  function renderTable(grades: GradeRow[], nameMap: Map<number, string>) {
    if (!grades.length) {
      tableContainer.innerHTML = '<p class="text-gray-500">No grade records found for this selection.</p>';
      return;
    }

    let html = `
      <table class="table-auto w-full border-collapse border text-sm">
        <thead>
          <tr class="bg-gray-100">
            <th class="border px-2 py-1">Learner</th>
            <th class="border px-2 py-1">Written Works</th>
            <th class="border px-2 py-1">Performance Tasks</th>
            <th class="border px-2 py-1">Term Exam</th>
            <th class="border px-2 py-1">Final Grade</th>
          </tr>
        </thead>
        <tbody>
    `;

    grades.forEach(g => {
      const name = nameMap.get(g.student_id) || `ID ${g.student_id}`;
      html += `
        <tr>
          <td class="border px-2 py-1">${name}</td>
          <td class="border px-2 py-1 text-center">${g.ww_average}</td>
          <td class="border px-2 py-1 text-center">${g.pt_average}</td>
          <td class="border px-2 py-1 text-center">${g.te_score}</td>
          <td class="border px-2 py-1 text-center font-bold">${g.final_grade}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    tableContainer.innerHTML = html;
  }

  // ---------- Print ----------
  printBtn.addEventListener('click', () => {
    const originalTitle = document.title;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const tableHTML = tableContainer.innerHTML;
    const subjectName = subjectSel.options[subjectSel.selectedIndex]?.text || 'All';
    const termName = termSel.options[termSel.selectedIndex]?.text || '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Grade Sheet - ${subjectName} ${termName} ${schoolYear}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 6px; text-align: left; }
            th { background-color: #eee; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h2>Grade Sheet – ${subjectName} – ${termName} – SY ${schoolYear}</h2>
          ${tableHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  });

  return container;
}