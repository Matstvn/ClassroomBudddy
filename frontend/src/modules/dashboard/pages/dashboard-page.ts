import { LearnerStore } from '../../../stores/learner-store';

export function renderDashboardPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'space-y-6';

  // ---------- Greeting ----------
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const greeting = document.createElement('div');
  greeting.innerHTML = `
    <h1 class="text-2xl font-bold text-gray-800">Good morning, Teacher!</h1>
    <p class="text-gray-500 text-sm">${dateStr}</p>
  `;
  container.appendChild(greeting);

  // ---------- Stats Cards ----------
  const statsGrid = document.createElement('div');
  statsGrid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';
  container.appendChild(statsGrid);

  // Card builder helper
  function createStatCard(emoji: string, title: string, value: string, color: string) {
    const card = document.createElement('div');
    card.className = `bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4`;
    card.innerHTML = `
      <div class="w-12 h-12 rounded-full ${color} flex items-center justify-center text-2xl">${emoji}</div>
      <div>
        <p class="text-sm text-gray-500">${title}</p>
        <p class="text-xl font-bold text-gray-800">${value}</p>
      </div>
    `;
    return card;
  }

  const presentCard = createStatCard('✅', 'Present Today', '...', 'bg-green-100');
  const absentCard = createStatCard('❌', 'Absent Today', '...', 'bg-red-100');
  const assessCard = createStatCard('📝', 'Assessments Today', '...', 'bg-blue-100');
  const readingCard = createStatCard('📖', 'Reading Activities', '...', 'bg-purple-100');

  statsGrid.appendChild(presentCard);
  statsGrid.appendChild(absentCard);
  statsGrid.appendChild(assessCard);
  statsGrid.appendChild(readingCard);

  // ---------- Quick Actions ----------
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'bg-white rounded-xl shadow-sm border p-6';
  actionsDiv.innerHTML = `<h3 class="text-lg font-semibold mb-4">Quick Actions</h3>`;
  const actionsGrid = document.createElement('div');
  actionsGrid.className = 'flex flex-wrap gap-3';

  function createActionButton(text: string, hash: string, color: string) {
    const btn = document.createElement('a');
    btn.href = hash;
    btn.className = `${color} text-white px-5 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow`;
    btn.textContent = text;
    return btn;
  }

  actionsGrid.appendChild(createActionButton('Take Attendance', '#/daily-log', 'bg-green-600'));
  actionsGrid.appendChild(createActionButton('Create Assessment', '#/grades', 'bg-blue-600'));
  actionsGrid.appendChild(createActionButton('Reading Activity', '#/reading', 'bg-purple-600'));
  actionsGrid.appendChild(createActionButton('View Reports', '#/reports/grade-sheet', 'bg-gray-700'));

  actionsDiv.appendChild(actionsGrid);
  container.appendChild(actionsDiv);

  // ---------- Load real data ----------
  async function loadStats() {
    const todayStr = today.toISOString().split('T')[0];

    // 1. Attendance – fetch AM and PM
    try {
      const [amRes, pmRes] = await Promise.all([
        fetch(`/api/v1/attendance/?date=${todayStr}&session=AM`),
        fetch(`/api/v1/attendance/?date=${todayStr}&session=PM`)
      ]);
      let present = 0, absent = 0;
      const process = (data: any[]) => {
        data.forEach((r: any) => {
          if (r.status === 'present') present++;
          else absent++;
        });
      };
      if (amRes.ok) process(await amRes.json());
      if (pmRes.ok) process(await pmRes.json());

      // Update cards
      presentCard.querySelector('p:last-child')!.textContent = String(present);
      absentCard.querySelector('p:last-child')!.textContent = String(absent);
    } catch (e) { /* ignore */ }

    // 2. Assessments today (from Grade Entry)
    try {
      // We need a subject_id for grade-entry? We'll cheat by fetching all assessments for today directly.
      // We can call the assessments endpoint with date parameter.
      // Actually, GET /api/v1/assessments/grade-entry requires subject_id, term, school_year.
      // Simpler: we can call a new endpoint? Not yet. We'll skip for now and show "--".
      // Alternative: we could make a quick backend endpoint later. For now, just show placeholder.
      assessCard.querySelector('p:last-child')!.textContent = '--';
    } catch (e) { /* ignore */ }

    // 3. Reading assessments today
    try {
      // We need a student_id to fetch reading assessments. Not aggregated.
      // So we'll skip for now and show placeholder.
      readingCard.querySelector('p:last-child')!.textContent = '--';
    } catch (e) { /* ignore */ }
  }

  loadStats();
  return container;
}