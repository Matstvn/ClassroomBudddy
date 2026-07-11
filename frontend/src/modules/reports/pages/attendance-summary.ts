import { LearnerStore } from '../../../stores/learner-store';

export function renderAttendanceSummaryPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'p-4 space-y-4';

  // ---------- Header ----------
  const heading = document.createElement('h2');
  heading.className = 'text-xl font-bold';
  heading.textContent = 'Attendance Summary';
  container.appendChild(heading);

  // ---------- Filters Bar ----------
  const filterBar = document.createElement('div');
  filterBar.className = 'flex gap-2 items-center flex-wrap';

  // Start date
  const startLabel = document.createElement('label');
  startLabel.textContent = 'From:';
  const startDate = document.createElement('input');
  startDate.type = 'date';
  startDate.className = 'border p-2 rounded text-black';

  // End date
  const endLabel = document.createElement('label');
  endLabel.textContent = 'To:';
  const endDate = document.createElement('input');
  endDate.type = 'date';
  endDate.className = 'border p-2 rounded text-black';

  // Session filter (optional)
  const sessionSel = document.createElement('select');
  sessionSel.className = 'border p-2 rounded text-black';
  sessionSel.innerHTML = `
    <option value="">All Sessions</option>
    <option value="AM">AM Only</option>
    <option value="PM">PM Only</option>
  `;

  // Generate button
  const generateBtn = document.createElement('button');
  generateBtn.className = 'bg-blue-600 text-white px-4 py-2 rounded';
  generateBtn.textContent = 'Generate';

  filterBar.appendChild(startLabel);
  filterBar.appendChild(startDate);
  filterBar.appendChild(endLabel);
  filterBar.appendChild(endDate);
  filterBar.appendChild(sessionSel);
  filterBar.appendChild(generateBtn);
  container.appendChild(filterBar);

  // ---------- Table Container ----------
  const tableContainer = document.createElement('div');
  tableContainer.className = 'overflow-x-auto mt-4';
  container.appendChild(tableContainer);

  // ---------- Print Button ----------
  const printBtn = document.createElement('button');
  printBtn.className = 'bg-gray-600 text-white px-4 py-2 rounded hidden';
  printBtn.textContent = 'Print';
  container.appendChild(printBtn);

  // ---------- Helper – set default dates to current term ----------
  function setDefaultDates() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    let termStart = `${year}-08-01`;
    let termEnd = `${year+1}-05-31`;
    if (month >= 8 && month <= 10) { termStart = `${year}-08-01`; termEnd = `${year}-10-31`; }
    else if (month >= 11 || month <= 1) { termStart = `${year}-11-01`; termEnd = `${year+1}-01-31`; }
    else { termStart = `${year+1}-02-01`; termEnd = `${year+1}-05-31`; }
    startDate.value = termStart;
    endDate.value = termEnd;
  }
  setDefaultDates();

  // ---------- Generate Logic ----------
  generateBtn.addEventListener('click', async () => {
    const start = startDate.value;
    const end = endDate.value;
    if (!start || !end) {
      alert('Please select both start and end dates.');
      return;
    }
    const session = sessionSel.value;

    const params = new URLSearchParams({ start_date: start, end_date: end });
    if (session) params.append('session', session);

    try {
      const res = await fetch(`/api/v1/attendance/summary?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      renderTable(data);
      printBtn.classList.remove('hidden');
    } catch (err) {
      tableContainer.innerHTML = '<p class="text-red-500">Failed to load attendance data.</p>';
    }
  });

  // ---------- Render Table ----------
  function renderTable(rows: any[]) {
    if (!rows.length) {
      tableContainer.innerHTML = '<p class="text-gray-500">No attendance records found for this period.</p>';
      return;
    }

    let html = `
      <table class="table-auto w-full border-collapse border text-sm">
        <thead>
          <tr class="bg-gray-100">
            <th class="border px-2 py-1">Learner</th>
            <th class="border px-2 py-1">Present</th>
            <th class="border px-2 py-1">Absent</th>
            <th class="border px-2 py-1">Late</th>
            <th class="border px-2 py-1">Excused</th>
            <th class="border px-2 py-1">Total Days</th>
          </tr>
        </thead>
        <tbody>
    `;

    rows.forEach(r => {
      html += `
        <tr>
          <td class="border px-2 py-1">${r.student_name}</td>
          <td class="border px-2 py-1 text-center">${r.present}</td>
          <td class="border px-2 py-1 text-center">${r.absent}</td>
          <td class="border px-2 py-1 text-center">${r.late}</td>
          <td class="border px-2 py-1 text-center">${r.excused}</td>
          <td class="border px-2 py-1 text-center">${r.total_days}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    tableContainer.innerHTML = html;
  }

  // ---------- Print ----------
  printBtn.addEventListener('click', () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const start = startDate.value;
    const end = endDate.value;
    const session = sessionSel.options[sessionSel.selectedIndex]?.text || 'All';

    printWindow.document.write(`
      <html>
        <head>
          <title>Attendance Summary</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 6px; text-align: left; }
            th { background-color: #eee; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h2>Attendance Summary (${start} to ${end}) ${session}</h2>
          ${tableContainer.innerHTML}
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