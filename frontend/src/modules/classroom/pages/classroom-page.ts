// classroom-page.ts
import { LearnerStore } from '../../../stores/learner-store';
import {
  SubjectsAPI,
  AttendanceAPI,
  LessonAPI,
  AssessmentAPI,
  type Learner,
  type AssessmentOut
} from '../../../services/api';

function renderAssessmentList(container: HTMLElement, assessments: AssessmentOut[]) {
  const list = container.querySelector('#assessment-list')!;
  list.innerHTML = '';
  if (assessments.length === 0) {
    list.innerHTML = `
      <div class="flex flex-col items-center justify-center p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 w-full col-span-full">
        <p class="text-sm font-medium text-slate-500">No assessments yet for today</p>
        <p class="text-xs text-slate-400 mt-0.5">Click + New Assessment to record grades</p>
      </div>
    `;
    return;
  }
  
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 w-full';

  assessments.forEach(a => {
    const card = document.createElement('div');
    card.className = 'border border-slate-100 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 hover:shadow-xs transition-all flex flex-col justify-between gap-3';
    
    let typeColor = 'bg-blue-50 text-blue-700 border-blue-100';
    if (a.type === 'PT') typeColor = 'bg-purple-50 text-purple-700 border-purple-100';
    else if (a.type === 'QA') typeColor = 'bg-rose-50 text-rose-700 border-rose-100';
    else if (a.type === 'homework') typeColor = 'bg-amber-50 text-amber-700 border-amber-100';
    else if (a.type === 'seatwork') typeColor = 'bg-slate-100 text-slate-700 border-slate-200';

    card.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div class="flex flex-col gap-1">
          <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border self-start ${typeColor}">
            ${a.type}
          </span>
          <h4 class="font-bold text-slate-700 text-sm mt-1">${a.title}</h4>
        </div>
        <div class="text-right">
          <span class="text-[10px] text-slate-400 block uppercase tracking-wider">Total Score</span>
          <div class="text-base font-bold text-slate-800">${a.total_score}</div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
  list.appendChild(grid);
}

export function renderClassroomPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'p-6 h-full flex flex-col gap-6 bg-slate-50/50 overflow-y-auto';

  const store = new LearnerStore();

  // Header Row
  const headerRow = document.createElement('div');
  headerRow.className = 'flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm';

  const titleArea = document.createElement('div');
  titleArea.innerHTML = `
    <h1 class="text-xl font-bold text-slate-850">Classroom Management</h1>
    <p class="text-xs text-slate-500">Track attendance, lessons, and student assessments</p>
  `;
  headerRow.appendChild(titleArea);

  const controlsArea = document.createElement('div');
  controlsArea.className = 'flex flex-wrap items-center gap-3';

  // --- date display ---
  const today = new Date().toISOString().split('T')[0];
  const dateDisplay = document.createElement('div');
  dateDisplay.className = 'flex items-center gap-1.5 px-3 py-2 bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 border border-slate-100';
  dateDisplay.innerHTML = `
    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    <span>${today}</span>
  `;
  controlsArea.appendChild(dateDisplay);

  // --- subject selector ---
  const subjectSelect = document.createElement('select');
  subjectSelect.className = 'border border-slate-200 p-2 rounded-lg text-sm bg-white text-slate-700 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer';
  subjectSelect.innerHTML = '<option>Loading subjects...</option>';
  controlsArea.appendChild(subjectSelect);

  headerRow.appendChild(controlsArea);
  container.appendChild(headerRow);

  // Content area (attendance, lesson, assessment) – shown after subject selected
  const workspace = document.createElement('div');
  workspace.className = 'flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start';
  container.appendChild(workspace);

  // Default empty state
  workspace.innerHTML = `
    <div class="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-100 shadow-sm text-center">
      <div class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
        <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
      </div>
      <p class="text-sm font-semibold text-slate-650">No subject selected</p>
      <p class="text-xs text-slate-400 mt-1">Please select a subject from the header dropdown to load classroom tools.</p>
    </div>
  `;

  // Load subjects into dropdown
  SubjectsAPI.getAll().then(subjects => {
    subjectSelect.innerHTML = '<option value="">-- Select Subject --</option>';
    subjects.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id.toString();
      opt.textContent = s.name;
      subjectSelect.appendChild(opt);
    });
  });

  // When subject changes, load workspace
  subjectSelect.addEventListener('change', () => {
    const subjectId = parseInt(subjectSelect.value);
    if (!subjectId) {
      workspace.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-100 shadow-sm text-center">
          <div class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
            <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <p class="text-sm font-semibold text-slate-650">No subject selected</p>
          <p class="text-xs text-slate-400 mt-1">Please select a subject from the header dropdown to load classroom tools.</p>
        </div>
      `;
      return;
    }
    loadWorkspace(workspace, subjectId, today, store);
  });

  return container;
}

async function loadWorkspace(container: HTMLElement, subjectId: number, date: string, store: LearnerStore) {
  container.innerHTML = `
    <div class="col-span-full flex items-center justify-center p-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-650"></div>
    </div>
  `;

  // Fetch all active students
  store.setActiveOnly(true);
  await store.load();
  const students = store.getAll();

  // Fetch lesson
  const lesson = await LessonAPI.get(date, subjectId).catch(() => null);

  // Fetch assessments
  const assessments = await AssessmentAPI.getForDate(date, subjectId).catch(() => []);

  // Build UI
  container.innerHTML = '';

  // ---- Attendance section ----
  const attendanceDiv = document.createElement('div');
  attendanceDiv.className = 'border border-slate-100 p-6 rounded-xl bg-white shadow-sm flex flex-col gap-5';
  container.appendChild(attendanceDiv);

  let currentSession: 'AM' | 'PM' = new Date().getHours() < 12 ? 'AM' : 'PM';

  async function renderAttendance() {
    attendanceDiv.innerHTML = '<p class="text-sm text-slate-400 animate-pulse">Loading attendance...</p>';
    
    const attendanceRecords = await AttendanceAPI.get(date, currentSession).catch(() => [] as any[]);
    const attendanceMap: Record<number, string> = {};
    attendanceRecords.forEach((r: any) => attendanceMap[r.student_id] = r.status);

    // Ensure all students have a status in our map (defaulting to present if none saved)
    students.forEach(st => {
      if (!attendanceMap[st.id]) {
        attendanceMap[st.id] = 'present';
      }
    });

    const updateUI = () => {
      // Calculate metrics
      const total = students.length;
      const present = students.filter(st => attendanceMap[st.id] === 'present').length;
      const late = students.filter(st => attendanceMap[st.id] === 'late').length;
      const absent = students.filter(st => attendanceMap[st.id] === 'absent').length;

      const malePresent = students.filter(st => st.gender === 'male' && attendanceMap[st.id] === 'present').length;
      const maleLate = students.filter(st => st.gender === 'male' && attendanceMap[st.id] === 'late').length;
      const maleAbsent = students.filter(st => st.gender === 'male' && attendanceMap[st.id] === 'absent').length;
      const maleTotal = students.filter(st => st.gender === 'male').length;

      const femalePresent = students.filter(st => st.gender === 'female' && attendanceMap[st.id] === 'present').length;
      const femaleLate = students.filter(st => st.gender === 'female' && attendanceMap[st.id] === 'late').length;
      const femaleAbsent = students.filter(st => st.gender === 'female' && attendanceMap[st.id] === 'absent').length;
      const femaleTotal = students.filter(st => st.gender === 'female').length;

      const presentPct = total > 0 ? Math.round((present / total) * 100) : 0;
      const latePct = total > 0 ? Math.round((late / total) * 100) : 0;
      const absentPct = total > 0 ? Math.round((absent / total) * 100) : 0;

      // Update HTML structure
      attendanceDiv.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <h3 class="font-bold text-lg text-slate-800">Attendance</h3>
          <div class="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold self-start">
            <button id="btn-session-am" class="px-3 py-1.5 rounded-md transition-all cursor-pointer ${currentSession === 'AM' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}">AM Session</button>
            <button id="btn-session-pm" class="px-3 py-1.5 rounded-md transition-all cursor-pointer ${currentSession === 'PM' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}">PM Session</button>
          </div>
        </div>

        <!-- Metrics Section -->
        <div class="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col gap-3">
          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
              <span class="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Present</span>
              <span class="text-lg font-bold text-emerald-600">${present}</span>
              <span class="text-[10px] text-slate-400 block">${presentPct}%</span>
            </div>
            <div class="bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
              <span class="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Late</span>
              <span class="text-lg font-bold text-amber-600">${late}</span>
              <span class="text-[10px] text-slate-400 block">${latePct}%</span>
            </div>
            <div class="bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
              <span class="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Absent</span>
              <span class="text-lg font-bold text-rose-600">${absent}</span>
              <span class="text-[10px] text-slate-400 block">${absentPct}%</span>
            </div>
          </div>

          <!-- Stacked Progress Bar -->
          <div class="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden flex shadow-inner">
            <div class="bg-emerald-500 h-full transition-all duration-300" style="width: ${presentPct}%"></div>
            <div class="bg-amber-500 h-full transition-all duration-300" style="width: ${latePct}%"></div>
            <div class="bg-rose-500 h-full transition-all duration-300" style="width: ${absentPct}%"></div>
          </div>

          <!-- Gender Breakdown -->
          <div class="text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between gap-1 px-1 font-medium border-t border-slate-100 pt-2">
            <div>♂ Male: <span class="font-semibold text-emerald-600">${malePresent}</span> P | <span class="font-semibold text-amber-600">${maleLate}</span> L | <span class="font-semibold text-rose-600">${maleAbsent}</span> A (of ${maleTotal})</div>
            <div>♀ Female: <span class="font-semibold text-emerald-600">${femalePresent}</span> P | <span class="font-semibold text-amber-600">${femaleLate}</span> L | <span class="font-semibold text-rose-600">${femaleAbsent}</span> A (of ${femaleTotal})</div>
          </div>
        </div>

        <!-- Learner List -->
        <div id="attendance-list-container" class="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1 gap-1 flex flex-col">
        </div>

        <!-- Actions -->
        <div class="pt-2 border-t flex justify-end">
          <button id="save-attendance-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
            Save Attendance
          </button>
        </div>
      `;

      // Render the student list with 3-state buttons
      const listContainer = attendanceDiv.querySelector('#attendance-list-container')!;
      students.forEach(st => {
        const currentStatus = attendanceMap[st.id];
        const studentRow = document.createElement('div');
        studentRow.className = 'flex items-center justify-between py-2.5 border-b border-slate-50 last:border-b-0 gap-2';
        studentRow.innerHTML = `
          <div class="flex flex-col">
            <span class="font-semibold text-slate-700 text-sm">${st.last_name}, ${st.first_name}</span>
            <span class="text-[10px] text-slate-400 capitalize font-medium">${st.gender || 'unknown'}</span>
          </div>
          <div class="flex items-center gap-1 bg-slate-150 p-0.5 rounded-full border border-slate-200">
            <button data-student-id="${st.id}" data-status="present" class="px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${currentStatus === 'present' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700'}">P</button>
            <button data-student-id="${st.id}" data-status="late" class="px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${currentStatus === 'late' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700'}">L</button>
            <button data-student-id="${st.id}" data-status="absent" class="px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${currentStatus === 'absent' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700'}">A</button>
          </div>
        `;

        // Wire up button click handlers
        const buttons = studentRow.querySelectorAll('button');
        buttons.forEach(btn => {
          btn.addEventListener('click', () => {
            const status = btn.dataset.status!;
            attendanceMap[st.id] = status;
            // update classes locally
            buttons.forEach(b => {
              const bStatus = b.dataset.status!;
              b.className = `px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                bStatus === status
                  ? status === 'present'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : status === 'late'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`;
            });
            // Recalculate metrics in real-time
            updateMetricsOnly();
          });
        });

        listContainer.appendChild(studentRow);
      });

      // Helper to update metrics in real-time without re-rendering student list
      const updateMetricsOnly = () => {
        const presentVal = students.filter(st => attendanceMap[st.id] === 'present').length;
        const lateVal = students.filter(st => attendanceMap[st.id] === 'late').length;
        const absentVal = students.filter(st => attendanceMap[st.id] === 'absent').length;
        const totalVal = students.length;

        const pPct = totalVal > 0 ? Math.round((presentVal / totalVal) * 100) : 0;
        const lPct = totalVal > 0 ? Math.round((lateVal / totalVal) * 100) : 0;
        const aPct = totalVal > 0 ? Math.round((absentVal / totalVal) * 100) : 0;

        // update metric text
        const metricsCards = attendanceDiv.querySelectorAll('.bg-white.p-2.rounded-lg');
        if (metricsCards.length === 3) {
          metricsCards[0].querySelector('.text-emerald-600')!.textContent = presentVal.toString();
          metricsCards[0].querySelector('.text-slate-400')!.textContent = `${pPct}%`;
          metricsCards[1].querySelector('.text-amber-600')!.textContent = lateVal.toString();
          metricsCards[1].querySelector('.text-slate-400')!.textContent = `${lPct}%`;
          metricsCards[2].querySelector('.text-rose-600')!.textContent = absentVal.toString();
          metricsCards[2].querySelector('.text-slate-400')!.textContent = `${aPct}%`;
        }

        // update stacked progress bar
        const progressBarDivs = attendanceDiv.querySelectorAll('.h-2.5.w-full > div');
        if (progressBarDivs.length === 3) {
          (progressBarDivs[0] as HTMLElement).style.width = `${pPct}%`;
          (progressBarDivs[1] as HTMLElement).style.width = `${lPct}%`;
          (progressBarDivs[2] as HTMLElement).style.width = `${aPct}%`;
        }

        // update gender breakdown
        const mP = students.filter(st => st.gender === 'male' && attendanceMap[st.id] === 'present').length;
        const mL = students.filter(st => st.gender === 'male' && attendanceMap[st.id] === 'late').length;
        const mA = students.filter(st => st.gender === 'male' && attendanceMap[st.id] === 'absent').length;
        const mTot = students.filter(st => st.gender === 'male').length;

        const fP = students.filter(st => st.gender === 'female' && attendanceMap[st.id] === 'present').length;
        const fL = students.filter(st => st.gender === 'female' && attendanceMap[st.id] === 'late').length;
        const fA = students.filter(st => st.gender === 'female' && attendanceMap[st.id] === 'absent').length;
        const fTot = students.filter(st => st.gender === 'female').length;

        const breakdownDivs = attendanceDiv.querySelectorAll('.text-\\[10px\\].text-slate-500 > div');
        if (breakdownDivs.length === 2) {
          breakdownDivs[0].innerHTML = `♂ Male: <span class="font-semibold text-emerald-600">${mP}</span> P | <span class="font-semibold text-amber-600">${mL}</span> L | <span class="font-semibold text-rose-600">${mA}</span> A (of ${mTot})`;
          breakdownDivs[1].innerHTML = `♀ Female: <span class="font-semibold text-emerald-600">${fP}</span> P | <span class="font-semibold text-amber-600">${fL}</span> L | <span class="font-semibold text-rose-600">${fA}</span> A (of ${fTot})`;
        }
      };

      // Hook up session button listeners
      attendanceDiv.querySelector('#btn-session-am')!.addEventListener('click', () => {
        if (currentSession !== 'AM') {
          currentSession = 'AM';
          renderAttendance();
        }
      });
      attendanceDiv.querySelector('#btn-session-pm')!.addEventListener('click', () => {
        if (currentSession !== 'PM') {
          currentSession = 'PM';
          renderAttendance();
        }
      });

      // Hook up save listener
      attendanceDiv.querySelector('#save-attendance-btn')!.addEventListener('click', async () => {
        const records = students.map(st => ({
          student_id: st.id,
          status: attendanceMap[st.id]
        }));
        try {
          await AttendanceAPI.save({ date, session: currentSession, records });
          alert('Attendance saved successfully!');
          renderAttendance();
        } catch (err: any) {
          alert(`Failed to save attendance: ${err.message || err}`);
        }
      });
    };

    updateUI();
  }

  renderAttendance();

  // ---- Lesson section ----
  const lessonDiv = document.createElement('div');
  lessonDiv.className = 'border border-slate-100 p-6 rounded-xl bg-white shadow-sm flex flex-col gap-4';
  lessonDiv.innerHTML = `<h3 class="font-bold text-lg text-slate-800 border-b pb-3">Today's Lesson Plan</h3>`;
  
  const lessonForm = document.createElement('form');
  lessonForm.className = 'flex flex-col gap-4';
  lessonForm.innerHTML = `
    <div class="flex flex-col gap-1">
      <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lesson Title</label>
      <input name="title" placeholder="Lesson title" value="${lesson?.title || ''}" class="border border-slate-200 p-2.5 rounded-lg text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" />
    </div>
    <div class="flex flex-col gap-1">
      <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
      <textarea name="description" placeholder="Description" class="border border-slate-200 p-2.5 rounded-lg text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" rows="2">${lesson?.description || ''}</textarea>
    </div>
    <div class="flex flex-col gap-1">
      <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Competencies</label>
      <textarea name="competencies" placeholder="Competencies" class="border border-slate-200 p-2.5 rounded-lg text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" rows="2">${lesson?.competencies || ''}</textarea>
    </div>
    <div class="flex flex-col gap-1">
      <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resources</label>
      <textarea name="resources" placeholder="Resources" class="border border-slate-200 p-2.5 rounded-lg text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" rows="2">${lesson?.resources || ''}</textarea>
    </div>
    <div class="flex flex-col gap-1">
      <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes</label>
      <textarea name="notes" placeholder="Notes" class="border border-slate-200 p-2.5 rounded-lg text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" rows="2">${lesson?.notes || ''}</textarea>
    </div>
    <div class="pt-2 border-t flex justify-end">
      <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
        Save Lesson
      </button>
    </div>
  `;
  
  lessonForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(lessonForm);
    const data: any = { subject_id: subjectId, date };
    fd.forEach((val, key) => data[key] = val);
    await LessonAPI.save(data);
    alert('Lesson saved!');
  });
  lessonDiv.appendChild(lessonForm);
  container.appendChild(lessonDiv);

  // ---- Assessment section ----
  const assessDiv = document.createElement('div');
  assessDiv.className = 'border border-slate-100 p-6 rounded-xl bg-white shadow-sm col-span-1 lg:col-span-2 flex flex-col gap-4';
  assessDiv.innerHTML = `<h3 class="font-bold text-lg text-slate-800 border-b pb-3">Assessments</h3>`;
  
  const assessmentList = document.createElement('div');
  assessmentList.id = 'assessment-list';
  assessmentList.className = 'space-y-2 mb-2 w-full';
  
  assessDiv.appendChild(assessmentList);
  renderAssessmentList(assessDiv, assessments);

  // New assessment form button
  const newAssessBtn = document.createElement('button');
  newAssessBtn.className = 'bg-indigo-650 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all shadow-sm flex items-center gap-1.5 cursor-pointer self-start';
  newAssessBtn.innerHTML = `
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
    New Assessment
  `;
  newAssessBtn.addEventListener('click', () => showAssessmentForm(assessDiv, students, subjectId, date));
  
  assessDiv.appendChild(newAssessBtn);
  container.appendChild(assessDiv);
}

function showAssessmentForm(parent: HTMLElement, students: Learner[], subjectId: number, date: string) {
  // Remove any existing form
  const oldForm = parent.querySelector('.assessment-form');
  if (oldForm) oldForm.remove();

  const form = document.createElement('div');
  form.className = 'assessment-form border border-indigo-100 p-5 mt-2 bg-indigo-50/20 rounded-xl flex flex-col gap-4 animate-fadeIn';
  form.innerHTML = `
    <div class="flex items-center justify-between border-b border-indigo-100/50 pb-2">
      <h4 class="font-bold text-slate-800 text-sm">New Assessment Record</h4>
      <button id="cancel-assess" class="text-xs text-slate-400 hover:text-slate-650 cursor-pointer">Cancel</button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div class="flex flex-col gap-1 md:col-span-2">
        <label class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Assessment Title</label>
        <input id="assess-title" placeholder="e.g. Chapter 1 Quiz" class="border border-slate-200 p-2.5 rounded-lg text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Max Score</label>
        <input id="assess-total" type="number" placeholder="Total Score" class="border border-slate-200 p-2.5 rounded-lg text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-center" value="20" />
      </div>
    </div>
    <div class="flex flex-col gap-1">
      <label class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Assessment Type</label>
      <select id="assess-type" class="border border-slate-200 p-2.5 rounded-lg text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer">
        <option value="quiz">Quiz</option>
        <option value="seatwork">Seatwork</option>
        <option value="homework">Homework</option>
        <option value="PT">Performance Task</option>
        <option value="QA">Quarterly Assessment</option>
      </select>
    </div>
    <div class="mt-2">
      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Student Scores</p>
      <div id="score-list" class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
        ${students.map(s => `
          <div class="flex items-center justify-between gap-3 p-2 bg-white rounded-lg border border-slate-100 shadow-xs">
            <span class="text-xs font-semibold text-slate-700 truncate">${s.last_name}, ${s.first_name}</span>
            <input type="number" class="border border-slate-200 w-16 p-1 rounded text-center text-xs bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" data-student="${s.id}" min="0" max="999" value="0" />
          </div>
        `).join('')}
      </div>
    </div>
    <div class="pt-3 border-t border-indigo-100/50 flex justify-end gap-2">
      <button id="save-assess" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-all shadow-sm cursor-pointer">Save Assessment</button>
    </div>
  `;

  parent.insertBefore(form, parent.querySelector('button'));

  document.getElementById('cancel-assess')!.addEventListener('click', () => {
    form.remove();
  });

  document.getElementById('save-assess')!.addEventListener('click', async () => {
    const title = (document.getElementById('assess-title') as HTMLInputElement).value;
    const type = (document.getElementById('assess-type') as HTMLSelectElement).value;
    const total = parseInt((document.getElementById('assess-total') as HTMLInputElement).value) || 0;
    const scoreInputs = form.querySelectorAll<HTMLInputElement>('input[data-student]');
    const scores: { student_id: number; score: number }[] = [];
    scoreInputs.forEach(input => {
      const studentId = parseInt(input.dataset.student!);
      const score = parseFloat(input.value) || 0;
      scores.push({ student_id: studentId, score });
    });

    try {
      await AssessmentAPI.create({
        subject_id: subjectId,
        date,
        type,
        title,
        total_score: total,
        scores,
      });
      // Remove the form
      form.remove();
      // Re-fetch and re-render the assessment list
      const updatedAssessments = await AssessmentAPI.getForDate(date, subjectId);
      renderAssessmentList(parent, updatedAssessments);
    } catch (err) {
      alert('Error saving assessment');
    }
  });
}