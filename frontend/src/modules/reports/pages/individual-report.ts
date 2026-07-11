import { LearnerStore } from '../../../stores/learner-store';
import { SubjectsAPI, GradesAPI, type Subject, type GradeRow } from '../../../services/api';

// Helper to get term date range (hardcoded school year)
function getTermDates(term: number, schoolYear: string): { start: string; end: string } {
  const startYear = parseInt(schoolYear.split('-')[0]); // e.g., 2026
  if (term === 1) return { start: `${startYear}-08-01`, end: `${startYear}-10-31` };
  if (term === 2) return { start: `${startYear}-11-01`, end: `${startYear+1}-01-31` };
  // term 3
  return { start: `${startYear+1}-02-01`, end: `${startYear+1}-05-31` };
}

export function renderIndividualReportPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'p-4 space-y-4';

  // Header
  const heading = document.createElement('h2');
  heading.className = 'text-xl font-bold';
  heading.textContent = 'Individual Learner Report';
  container.appendChild(heading);

  // Filters
  const filterBar = document.createElement('div');
  filterBar.className = 'flex gap-2 items-center flex-wrap';

  // Learner select
  const learnerSelect = document.createElement('select');
  learnerSelect.className = 'border p-2 rounded text-black flex-1 min-w-[200px]';
  learnerSelect.innerHTML = '<option value="">-- Select Learner --</option>';

  // Term select
  const termSelect = document.createElement('select');
  termSelect.className = 'border p-2 rounded text-black';
  termSelect.innerHTML = `
    <option value="">-- Term --</option>
    <option value="1">1st Term</option>
    <option value="2">2nd Term</option>
    <option value="3">3rd Term</option>
  `;

  const schoolYear = '2026-2027';
  const sySpan = document.createElement('span');
  sySpan.className = 'text-sm';
  sySpan.textContent = `SY: ${schoolYear}`;

  const generateBtn = document.createElement('button');
  generateBtn.className = 'bg-blue-600 text-white px-4 py-2 rounded';
  generateBtn.textContent = 'Generate Report';

  filterBar.appendChild(learnerSelect);
  filterBar.appendChild(termSelect);
  filterBar.appendChild(sySpan);
  filterBar.appendChild(generateBtn);
  container.appendChild(filterBar);

  // Report content area
  const reportDiv = document.createElement('div');
  reportDiv.className = 'space-y-6';
  container.appendChild(reportDiv);

  // Print button (initially hidden)
  const printBtn = document.createElement('button');
  printBtn.className = 'bg-gray-600 text-white px-4 py-2 rounded hidden';
  printBtn.textContent = 'Print Report';
  container.appendChild(printBtn);

  // Learner store
  const store = new LearnerStore();
  store.setActiveOnly(true);
  store.load().then(() => {
    const learners = store.getAll();
    learnerSelect.innerHTML = '<option value="">-- Select Learner --</option>';
    learners.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.id.toString();
      opt.textContent = `${l.last_name}, ${l.first_name}`;
      learnerSelect.appendChild(opt);
    });
  });

  // Generate handler
  generateBtn.addEventListener('click', async () => {
    const learnerId = parseInt(learnerSelect.value);
    const term = parseInt(termSelect.value);
    if (!learnerId || !term) {
      alert('Please select a learner and term.');
      return;
    }

    const learner = store.getAll().find(l => l.id === learnerId);
    if (!learner) return;

    reportDiv.innerHTML = '<p class="text-gray-500">Generating report...</p>';
    printBtn.classList.add('hidden');

    try {
      // 1. Attendance summary for term dates
      const { start, end } = getTermDates(term, schoolYear);
      const attRes = await fetch(`/api/v1/attendance/summary?start_date=${start}&end_date=${end}`);
      let attendance = { present: 0, absent: 0, late: 0, excused: 0 };
      if (attRes.ok) {
        const attData = await attRes.json();
        const row = attData.find((r: any) => r.student_id === learnerId);
        if (row) attendance = { present: row.present, absent: row.absent, late: row.late, excused: row.excused };
      }

      // 2. Grades for all subjects
      const subjects: Subject[] = await SubjectsAPI.getAll();
      const gradesPerSubject: { subject: string; ww: number; pt: number; te: number; final: number }[] = [];
      for (const subj of subjects) {
        const grades = await GradesAPI.getTermSummary(subj.id, schoolYear, term);
        const row = grades.find(g => g.student_id === learnerId);
        if (row) {
          gradesPerSubject.push({
            subject: subj.name,
            ww: row.ww_average,
            pt: row.pt_average,
            te: row.te_score,
            final: row.final_grade
          });
        }
      }

      // 3. Reading progress – recent ORF assessments
      const orfRes = await fetch(`/api/v1/reading/orf/?student_id=${learnerId}`);
      let orfList: any[] = [];
      if (orfRes.ok) {
        const orfData = await orfRes.json();
        orfList = orfData.slice(0, 5); // latest 5
      }

      // 4. Reading comprehension assessments
      const compRes = await fetch(`/api/v1/reading/assessments/?student_id=${learnerId}`);
      let compList: any[] = [];
      if (compRes.ok) {
        compList = await compRes.json();
        compList = compList.slice(0, 5);
      }

      renderReport(learner, attendance, gradesPerSubject, orfList, compList, term);
      printBtn.classList.remove('hidden');
    } catch (err) {
      reportDiv.innerHTML = '<p class="text-red-500">Error generating report.</p>';
    }
  });

  function renderReport(
    learner: any,
    attendance: { present: number; absent: number; late: number; excused: number },
    grades: { subject: string; ww: number; pt: number; te: number; final: number }[],
    orfList: any[],
    compList: any[],
    term: number
  ) {
    const totalDays = attendance.present + attendance.absent + attendance.late + attendance.excused;

    let html = `
      <div class="border p-4 rounded bg-white shadow">
        <h3 class="text-lg font-bold">${learner.last_name}, ${learner.first_name}</h3>
        <p>LRN: ${learner.lrn || 'N/A'} | Reading Level: ${learner.reading_level || 'Not set'}</p>
        <p>Term: ${term} | SY: ${schoolYear}</p>
      </div>

      <div class="border p-4 rounded bg-white">
        <h4 class="font-bold mb-2">Attendance Summary</h4>
        <table class="table-auto w-full text-sm">
          <tr><td class="pr-4">Present:</td><td>${attendance.present}</td></tr>
          <tr><td>Absent:</td><td>${attendance.absent}</td></tr>
          <tr><td>Late:</td><td>${attendance.late}</td></tr>
          <tr><td>Excused:</td><td>${attendance.excused}</td></tr>
          <tr><td>Total School Days:</td><td>${totalDays}</td></tr>
        </table>
      </div>

      <div class="border p-4 rounded bg-white">
        <h4 class="font-bold mb-2">Term Grades</h4>
        ${grades.length === 0 ? '<p class="text-gray-500">No grades recorded for this term.</p>' : `
          <table class="table-auto w-full border-collapse border text-sm">
            <thead><tr class="bg-gray-100">
              <th class="border px-2 py-1">Subject</th>
              <th class="border px-2 py-1">WW</th>
              <th class="border px-2 py-1">PT</th>
              <th class="border px-2 py-1">TE</th>
              <th class="border px-2 py-1">Final</th>
            </tr></thead>
            <tbody>
              ${grades.map(g => `
                <tr>
                  <td class="border px-2 py-1">${g.subject}</td>
                  <td class="border px-2 py-1 text-center">${g.ww}</td>
                  <td class="border px-2 py-1 text-center">${g.pt}</td>
                  <td class="border px-2 py-1 text-center">${g.te}</td>
                  <td class="border px-2 py-1 text-center font-bold">${g.final}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>

      <div class="border p-4 rounded bg-white">
        <h4 class="font-bold mb-2">Reading Progress</h4>
        <h5 class="font-semibold">Oral Reading Fluency (Recent)</h5>
        ${orfList.length === 0 ? '<p class="text-gray-500">No ORF assessments.</p>' : `
          <table class="table-auto w-full border-collapse border text-sm mb-2">
            <thead><tr class="bg-gray-100">
              <th class="border px-2 py-1">Date</th>
              <th class="border px-2 py-1">Passage</th>
              <th class="border px-2 py-1">WCPM</th>
              <th class="border px-2 py-1">Accuracy</th>
            </tr></thead>
            <tbody>
              ${orfList.map((o: any) => `
                <tr>
                  <td class="border px-2 py-1">${o.assessment_date}</td>
                  <td class="border px-2 py-1">${o.passage_title || 'N/A'}</td>
                  <td class="border px-2 py-1 text-center">${o.wcpm}</td>
                  <td class="border px-2 py-1 text-center">${o.accuracy}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}

        <h5 class="font-semibold mt-2">Comprehension (Recent)</h5>
        ${compList.length === 0 ? '<p class="text-gray-500">No comprehension assessments.</p>' : `
          <table class="table-auto w-full border-collapse border text-sm">
            <thead><tr class="bg-gray-100">
              <th class="border px-2 py-1">Date</th>
              <th class="border px-2 py-1">Passage</th>
              <th class="border px-2 py-1">Score</th>
              <th class="border px-2 py-1">Percentage</th>
            </tr></thead>
            <tbody>
              ${compList.map((c: any) => `
                <tr>
                  <td class="border px-2 py-1">${c.assessment_date}</td>
                  <td class="border px-2 py-1">${c.passage_title || 'N/A'}</td>
                  <td class="border px-2 py-1 text-center">${c.total_correct}/${c.total_questions}</td>
                  <td class="border px-2 py-1 text-center">${c.percentage}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    `;

    reportDiv.innerHTML = html;
  }

  // Print functionality
  printBtn.addEventListener('click', () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;
    const learnerName = store.getAll().find(l => l.id === parseInt(learnerSelect.value))?.last_name + ', ' + store.getAll().find(l => l.id === parseInt(learnerSelect.value))?.first_name || 'Learner';
    const termName = termSelect.options[termSelect.selectedIndex]?.text || '';
    printWindow.document.write(`
      <html>
        <head>
          <title>Learner Report - ${learnerName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 6px; text-align: left; }
            th { background-color: #eee; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h2>Individual Learner Report</h2>
          ${reportDiv.innerHTML}
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