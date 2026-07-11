import { LearnerStore } from '../../../stores/learner-store';
import { SubjectsAPI, AttendanceAPI, AssessmentAPI } from '../../../services/api';
import { customConfirm } from '../../../services/dialog';

// Hard-coded school year start

function getCurrentTerm(): number {
  const now = new Date();
  const month = now.getMonth() + 1;
  if (month >= 8 && month <= 10) return 1;
  if (month === 11 || month === 12 || month === 1) return 2;
  return 3; // Feb - May
}

function isAM(): boolean {
  const h = new Date().getHours();
  return true;//h >= 7 && h < 12;
}

function isPM(): boolean {
  const h = new Date().getHours();
  return h >= 13 && h < 16.5; // 4:30 PM
}

export function renderDailyLogPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'p-4 space-y-4';

  const store = new LearnerStore();
  const today = new Date().toISOString().split('T')[0];
  const currentTerm = getCurrentTerm();
  let selectedTerm = currentTerm;   // initial value = auto-detected term
  const schoolYear = '2026-2027';

  // ---------- Attendance Panels ----------
  const attendanceContainer = document.createElement('div');
  attendanceContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
  container.appendChild(attendanceContainer);

  function createAttendancePanel(session: 'AM' | 'PM') {
    const panel = document.createElement('div');
    panel.className = 'border p-4 rounded-xl bg-white shadow-sm flex flex-col gap-3';
    panel.innerHTML = `
      <h3 class="font-bold text-lg text-slate-800">${session} Attendance</h3>
      <div id="${session}-attendance-content" class="flex flex-col gap-3"></div>
    `;
    const content = panel.querySelector(`#${session}-attendance-content`)!;

    async function load() {
      const nowSession = session === 'AM' ? isAM() : isPM();
      const saved = await AttendanceAPI.get(today, session).catch(() => [] as any[]);

      // Render summary if already saved
      if (saved.length > 0) {
        const total = saved.length;
        const present = saved.filter((r: any) => r.status === 'present').length;
        const late = saved.filter((r: any) => r.status === 'late').length;
        const absent = saved.filter((r: any) => r.status === 'absent').length;

        await store.load();
        const learners = store.getAll();

        const malePresent = learners.filter(l => l.gender === 'male' && saved.some((r: any) => r.student_id === l.id && r.status === 'present')).length;
        const maleLate = learners.filter(l => l.gender === 'male' && saved.some((r: any) => r.student_id === l.id && r.status === 'late')).length;
        const maleAbsent = learners.filter(l => l.gender === 'male' && saved.some((r: any) => r.student_id === l.id && r.status === 'absent')).length;
        const maleTotal = learners.filter(l => l.gender === 'male').length;

        const femalePresent = learners.filter(l => l.gender === 'female' && saved.some((r: any) => r.student_id === l.id && r.status === 'present')).length;
        const femaleLate = learners.filter(l => l.gender === 'female' && saved.some((r: any) => r.student_id === l.id && r.status === 'late')).length;
        const femaleAbsent = learners.filter(l => l.gender === 'female' && saved.some((r: any) => r.student_id === l.id && r.status === 'absent')).length;
        const femaleTotal = learners.filter(l => l.gender === 'female').length;

        const presentPct = total > 0 ? Math.round((present / total) * 100) : 0;
        const latePct = total > 0 ? Math.round((late / total) * 100) : 0;
        const absentPct = total > 0 ? Math.round((absent / total) * 100) : 0;

        content.innerHTML = `
          <!-- Metrics Dashboard -->
          <div class="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col gap-3">
            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
                <span class="text-xs text-slate-500 block">Present</span>
                <span class="text-lg font-bold text-emerald-600">${present}</span>
                <span class="text-[10px] text-slate-400 block">${presentPct}%</span>
              </div>
              <div class="bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
                <span class="text-xs text-slate-500 block">Late</span>
                <span class="text-lg font-bold text-amber-600">${late}</span>
                <span class="text-[10px] text-slate-400 block">${latePct}%</span>
              </div>
              <div class="bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
                <span class="text-xs text-slate-500 block">Absent</span>
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
            <div class="text-[11px] text-slate-500 flex flex-col gap-0.5 px-1 border-t pt-2 border-slate-200/50">
              <div class="flex justify-between">
                <span>♂ Male:</span>
                <span><span class="font-semibold text-emerald-600">${malePresent}</span> P | <span class="font-semibold text-amber-600">${maleLate}</span> L | <span class="font-semibold text-rose-600">${maleAbsent}</span> A (of ${maleTotal})</span>
              </div>
              <div class="flex justify-between">
                <span>♀ Female:</span>
                <span><span class="font-semibold text-emerald-600">${femalePresent}</span> P | <span class="font-semibold text-amber-600">${femaleLate}</span> L | <span class="font-semibold text-rose-600">${femaleAbsent}</span> A (of ${femaleTotal})</span>
              </div>
            </div>
          </div>
          <button id="recheck-${session}-attendance" class="mt-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold self-end">Recheck / Edit Attendance</button>
        `;

        document.getElementById(`recheck-${session}-attendance`)!.addEventListener('click', () => {
          showAttendanceChecker(saved);
        });
        return;
      }

      // If within time window, show check button; otherwise show message
      if (!nowSession) {
        content.innerHTML = '<p class="text-sm text-gray-500 bg-slate-50 p-3 rounded-lg text-center border border-dashed">Outside attendance hours.</p>';
        return;
      }

      const btn = document.createElement('button');
      btn.className = 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm';
      btn.textContent = 'Check Attendance';
      btn.addEventListener('click', () => showAttendanceChecker([]));
      content.innerHTML = '';
      content.appendChild(btn);

      async function showAttendanceChecker(savedRecords: any[]) {
        content.innerHTML = '<p class="text-sm text-gray-500">Loading learners...</p>';
        await store.load();
        const learners = store.getAll();

        const attendanceMap: Record<number, string> = {};
        savedRecords.forEach(r => attendanceMap[r.student_id] = r.status);
        learners.forEach(l => {
          if (!attendanceMap[l.id]) {
            attendanceMap[l.id] = 'present';
          }
        });

        const updateCheckerUI = () => {
          const total = learners.length;
          const present = learners.filter(l => attendanceMap[l.id] === 'present').length;
          const late = learners.filter(l => attendanceMap[l.id] === 'late').length;
          const absent = learners.filter(l => attendanceMap[l.id] === 'absent').length;

          const malePresent = learners.filter(l => l.gender === 'male' && attendanceMap[l.id] === 'present').length;
          const maleLate = learners.filter(l => l.gender === 'male' && attendanceMap[l.id] === 'late').length;
          const maleAbsent = learners.filter(l => l.gender === 'male' && attendanceMap[l.id] === 'absent').length;
          const maleTotal = learners.filter(l => l.gender === 'male').length;

          const femalePresent = learners.filter(l => l.gender === 'female' && attendanceMap[l.id] === 'present').length;
          const femaleLate = learners.filter(l => l.gender === 'female' && attendanceMap[l.id] === 'late').length;
          const femaleAbsent = learners.filter(l => l.gender === 'female' && attendanceMap[l.id] === 'absent').length;
          const femaleTotal = learners.filter(l => l.gender === 'female').length;

          const presentPct = total > 0 ? Math.round((present / total) * 100) : 0;
          const latePct = total > 0 ? Math.round((late / total) * 100) : 0;
          const absentPct = total > 0 ? Math.round((absent / total) * 100) : 0;

          content.innerHTML = `
            <!-- Live Metrics Section -->
            <div class="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col gap-3">
              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
                  <span class="text-xs text-slate-500 block">Present</span>
                  <span class="text-lg font-bold text-emerald-600">${present}</span>
                  <span class="text-[10px] text-slate-400 block">${presentPct}%</span>
                </div>
                <div class="bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
                  <span class="text-xs text-slate-500 block">Late</span>
                  <span class="text-lg font-bold text-amber-600">${late}</span>
                  <span class="text-[10px] text-slate-400 block">${latePct}%</span>
                </div>
                <div class="bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
                  <span class="text-xs text-slate-500 block">Absent</span>
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
              <div class="text-[11px] text-slate-500 flex flex-col gap-0.5 px-1 border-t pt-2 border-slate-200/50">
                <div class="flex justify-between">
                  <span>♂ Male:</span>
                  <span><span class="font-semibold text-emerald-600">${malePresent}</span> P | <span class="font-semibold text-amber-600">${maleLate}</span> L | <span class="font-semibold text-rose-600">${maleAbsent}</span> A (of ${maleTotal})</span>
                </div>
                <div class="flex justify-between">
                  <span>♀ Female:</span>
                  <span><span class="font-semibold text-emerald-600">${femalePresent}</span> P | <span class="font-semibold text-amber-600">${femaleLate}</span> L | <span class="font-semibold text-rose-600">${femaleAbsent}</span> A (of ${femaleTotal})</span>
                </div>
              </div>
            </div>

            <!-- Student List -->
            <div id="checker-list-container" class="max-h-64 overflow-y-auto mt-2 divide-y divide-slate-100 pr-1 gap-1 flex flex-col">
            </div>

            <div class="flex gap-2 justify-end mt-2 pt-2 border-t">
              <button id="cancel-${session}-attendance" class="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-all">Cancel</button>
              <button id="save-${session}-attendance" class="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm">Save Attendance</button>
            </div>
          `;

          const listContainer = content.querySelector('#checker-list-container')!;
          learners.forEach(l => {
            const currentStatus = attendanceMap[l.id];
            const row = document.createElement('div');
            row.className = 'flex items-center justify-between py-2 gap-2';
            row.innerHTML = `
              <div class="flex flex-col">
                <span class="font-medium text-slate-800 text-sm">${l.last_name}, ${l.first_name}</span>
                <span class="text-[10px] text-slate-400 capitalize">${l.gender || 'unknown'}</span>
              </div>
              <div class="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full border border-slate-200">
                <button data-student-id="${l.id}" data-status="present" class="px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${currentStatus === 'present' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700'}">P</button>
                <button data-student-id="${l.id}" data-status="late" class="px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${currentStatus === 'late' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700'}">L</button>
                <button data-student-id="${l.id}" data-status="absent" class="px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${currentStatus === 'absent' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700'}">A</button>
              </div>
            `;

            const buttons = row.querySelectorAll('button');
            buttons.forEach(btn => {
              btn.addEventListener('click', () => {
                const status = btn.dataset.status!;
                attendanceMap[l.id] = status;
                buttons.forEach(b => {
                  const bStatus = b.dataset.status!;
                  b.className = `px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    bStatus === status
                      ? status === 'present'
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : status === 'late'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-rose-500 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`;
                });
                updateMetricsOnly();
              });
            });

            listContainer.appendChild(row);
          });

          // Helper to update metrics in real-time without re-rendering student list
          const updateMetricsOnly = () => {
            const presentVal = learners.filter(l => attendanceMap[l.id] === 'present').length;
            const lateVal = learners.filter(l => attendanceMap[l.id] === 'late').length;
            const absentVal = learners.filter(l => attendanceMap[l.id] === 'absent').length;
            const totalVal = learners.length;

            const pPct = totalVal > 0 ? Math.round((presentVal / totalVal) * 100) : 0;
            const lPct = totalVal > 0 ? Math.round((lateVal / totalVal) * 100) : 0;
            const aPct = totalVal > 0 ? Math.round((absentVal / totalVal) * 100) : 0;

            // update metric text
            const metricsCards = content.querySelectorAll('.bg-white.p-2.rounded-lg');
            if (metricsCards.length === 3) {
              metricsCards[0].querySelector('.text-emerald-600')!.textContent = presentVal.toString();
              metricsCards[0].querySelector('.text-slate-400')!.textContent = `${pPct}%`;
              metricsCards[1].querySelector('.text-amber-600')!.textContent = lateVal.toString();
              metricsCards[1].querySelector('.text-slate-400')!.textContent = `${lPct}%`;
              metricsCards[2].querySelector('.text-rose-600')!.textContent = absentVal.toString();
              metricsCards[2].querySelector('.text-slate-400')!.textContent = `${aPct}%`;
            }

            // update stacked progress bar
            const progressBarDivs = content.querySelectorAll('.h-2.5.w-full > div');
            if (progressBarDivs.length === 3) {
              (progressBarDivs[0] as HTMLElement).style.width = `${pPct}%`;
              (progressBarDivs[1] as HTMLElement).style.width = `${lPct}%`;
              (progressBarDivs[2] as HTMLElement).style.width = `${aPct}%`;
            }

            // update gender breakdown
            const mP = learners.filter(l => l.gender === 'male' && attendanceMap[l.id] === 'present').length;
            const mL = learners.filter(l => l.gender === 'male' && attendanceMap[l.id] === 'late').length;
            const mA = learners.filter(l => l.gender === 'male' && attendanceMap[l.id] === 'absent').length;
            const mTot = learners.filter(l => l.gender === 'male').length;

            const fP = learners.filter(l => l.gender === 'female' && attendanceMap[l.id] === 'present').length;
            const fL = learners.filter(l => l.gender === 'female' && attendanceMap[l.id] === 'late').length;
            const fA = learners.filter(l => l.gender === 'female' && attendanceMap[l.id] === 'absent').length;
            const fTot = learners.filter(l => l.gender === 'female').length;

            const breakdownDivs = content.querySelectorAll('.text-\\[11px\\].text-slate-500 > div > span:last-child');
            if (breakdownDivs.length === 2) {
              breakdownDivs[0].innerHTML = `<span class="font-semibold text-emerald-600">${mP}</span> P | <span class="font-semibold text-amber-600">${mL}</span> L | <span class="font-semibold text-rose-600">${mA}</span> A (of ${mTot})`;
              breakdownDivs[1].innerHTML = `<span class="font-semibold text-emerald-600">${fP}</span> P | <span class="font-semibold text-amber-600">${fL}</span> L | <span class="font-semibold text-rose-600">${fA}</span> A (of ${fTot})`;
            }
          };

          // Wire actions
          content.querySelector(`#cancel-${session}-attendance`)!.addEventListener('click', () => {
            load();
          });

          content.querySelector(`#save-${session}-attendance`)!.addEventListener('click', async () => {
            const records = learners.map(l => ({
              student_id: l.id,
              status: attendanceMap[l.id]
            }));
            await AttendanceAPI.save({ date: today, session, records });
            load();
          });
        };

        updateCheckerUI();
      }
    }

    load();
    return panel;
  }

  attendanceContainer.appendChild(createAttendancePanel('AM'));
  attendanceContainer.appendChild(createAttendancePanel('PM'));

  // ---------- Lesson Section ----------
  // ---------- Lesson Section ----------
const lessonSection = document.createElement('div');
lessonSection.className = 'border p-4 rounded bg-white space-y-4';
lessonSection.innerHTML = '<h3 class="font-bold text-lg">Lesson Plan</h3>';
container.appendChild(lessonSection);

// Term selector (added before subject)
const termLabel = document.createElement('label');
termLabel.className = 'text-sm font-medium mr-2';
termLabel.textContent = 'Term:';
lessonSection.appendChild(termLabel);

const termSel = document.createElement('select');
termSel.className = 'border p-2 rounded';
termSel.innerHTML = `
  <option value="1">1st Term</option>
  <option value="2">2nd Term</option>
  <option value="3">3rd Term</option>
`;
// Set to auto-detected term
termSel.value = String(currentTerm);
lessonSection.appendChild(termSel);

termSel.addEventListener('change', () => {
  selectedTerm = parseInt(termSel.value);
  loadCurriculum();          // re‑fetch curriculum for new term
  loadTodayAssessments();    // re‑fetch assessments for new term
});

  // Subject selector
  const subjectSel = document.createElement('select');
  subjectSel.className = 'border p-2 rounded';
  subjectSel.innerHTML = '<option value="">-- Select Subject --</option>';
  SubjectsAPI.getAll().then(subs => {
    subjectSel.innerHTML = '<option value="">-- Select Subject --</option>';
    subs.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id.toString();
      opt.textContent = s.name;
      subjectSel.appendChild(opt);
    });
  });
  lessonSection.appendChild(subjectSel);

  const curriculumDiv = document.createElement('div');
  lessonSection.appendChild(curriculumDiv);

  // Today's assessments
  const assessmentsDiv = document.createElement('div');
  assessmentsDiv.className = 'border-t pt-4 mt-4';
  assessmentsDiv.innerHTML = '<h4 class="font-bold">Today\'s Assessments</h4><div id="today-assessments-list"></div>';
  lessonSection.appendChild(assessmentsDiv);

  // --- Helper functions ---
  async function loadCurriculum() {
    const subjectId = parseInt(subjectSel.value);
    if (!subjectId) {
      curriculumDiv.innerHTML = '<p class="text-gray-500">Select a subject.</p>';
      return;
    }
    curriculumDiv.innerHTML = '<p>Loading...</p>';
    try {
      const res = await fetch(`/api/v1/curriculum/progress?subject_id=${subjectId}&term=${selectedTerm}&school_year=${schoolYear}`);
      const data = await res.json();
      renderCurriculumTree(data.performance_standards);
    } catch (err) {
      curriculumDiv.innerHTML = '<p class="text-red-500">Error loading curriculum.</p>';
    }
  }

  function renderCurriculumTree(standards: any[]) {
    curriculumDiv.innerHTML = '';
    if (!standards.length) {
      curriculumDiv.innerHTML = '<p class="text-gray-500">No standards for this term.</p>';
      return;
    }

    standards.forEach((ps: any) => {
      const psDiv = document.createElement('div');
      psDiv.className = 'mb-4';
      psDiv.innerHTML = `<div class="font-semibold"> ${ps.description}</div>`;

      ps.competencies.forEach((comp: any) => {
        const compDiv = document.createElement('div');
        compDiv.className = 'ml-4 mb-2';
        compDiv.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="font-medium"> ${comp.description}</span>
            <span class="text-xs bg-gray-200 px-2 rounded">Progress: ${comp.progress !== null ? comp.progress+'%' : '–'}</span>
          </div>
        `;
        const objList = document.createElement('ul');
        objList.className = 'ml-6 list-disc';

        comp.objectives.forEach((obj: any) => {
          const li = document.createElement('li');
          li.className = 'text-sm py-1 flex items-center gap-2';
          const avgText = obj.class_average !== null ? `${obj.class_average}%` : '–';
          li.innerHTML = `
            <span>${obj.description} (Avg: ${avgText})</span>
            <button class="create-assess-btn text-xs bg-purple-500 text-white px-2 py-0.5 rounded" data-obj-id="${obj.id}" data-obj-code="${obj.code}" data-obj-desc="${obj.description}">+ Assessment</button>
            <button class="delete-obj-btn text-xs text-red-600 hover:underline" data-obj-id="${obj.id}">×</button>
          `;
          objList.appendChild(li);
        });

        // Add objective button for this competency
        const addObjBtn = document.createElement('button');
        addObjBtn.className = 'ml-4 text-xs text-blue-600 underline mb-1';
        addObjBtn.textContent = '+ Add Learning Objective';
        addObjBtn.addEventListener('click', () => {
          const form = document.createElement('div');
          form.className = 'ml-4 p-2 border rounded bg-gray-50 inline-block';
          form.innerHTML = `
            <input placeholder="Code" id="new-obj-code" class="border px-1 py-0.5 text-xs w-20" />
            <input placeholder="Description" id="new-obj-desc" class="border px-1 py-0.5 text-xs w-40 ml-1" />
            <button class="bg-green-500 text-white text-xs px-2 py-0.5 ml-1" id="save-new-obj">Save</button>
            <button class="text-xs ml-1" id="cancel-new-obj">Cancel</button>
          `;
          objList.appendChild(form);
          document.getElementById('save-new-obj')!.addEventListener('click', async () => {
            //const code = (document.getElementById('new-obj-code') as HTMLInputElement).value;
            const desc = (document.getElementById('new-obj-desc') as HTMLInputElement).value;
            if (!desc) return;
            await fetch('/api/v1/learning-objectives/', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({description: desc, learning_competency_id: comp.id })
            });
            loadCurriculum();
          });
          document.getElementById('cancel-new-obj')!.addEventListener('click', () => form.remove());
        });
        compDiv.appendChild(objList);
        compDiv.appendChild(addObjBtn);
        psDiv.appendChild(compDiv);
      });
      curriculumDiv.appendChild(psDiv);
    });

    // Attach event listeners for create assessment buttons
    curriculumDiv.querySelectorAll('.create-assess-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const el = e.currentTarget as HTMLElement;
        const objId = parseInt(el.dataset.objId!);
        const objCode = el.dataset.objCode!;
        const objDesc = el.dataset.objDesc!;
        openAssessmentModal(objId, objCode, objDesc);
      });
    });

    // Attach delete objective handlers
    curriculumDiv.querySelectorAll('.delete-obj-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const el = e.currentTarget as HTMLElement;
        const objId = parseInt(el.dataset.objId!);
        const isConfirmed = await customConfirm(
          'Are you sure you want to delete this learning objective?',
          { title: 'Delete Objective', isDestructive: true }
        );
        if (isConfirmed) {
          await fetch(`/api/v1/learning-objectives/${objId}`, { method: 'DELETE' });
          loadCurriculum();
        }
      });
    });
  }

  // --- Assessment Creation Modal ---
  function openAssessmentModal(objId: number, objCode: string, objDesc: string) {
    // Remove any existing modal
    const existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white p-6 rounded w-full max-w-lg">
        <h4 class="font-bold mb-2">Create Assessment for ${objCode}</h4>
        <p class="text-sm text-gray-600 mb-2">${objDesc}</p>
        
        <select id="assess-type" class="border p-1 w-full mb-2">
          <option value="Written Works">Written Works</option>
          <option value="Performance Task">Performance Task</option>
          <option value="Term Examination">Term Examination</option>
        </select>
        
        <select id="assess-subtype" class="border p-1 w-full mb-2" style="display:none;">
          <option value="Quiz">Quiz</option>
          <option value="Seatwork">Seatwork</option>
          <option value="Homework">Homework</option>
        </select>
        
        <input id="assess-title" placeholder="Title" class="border p-1 w-full mb-2" value="Assessment" />
        <input id="assess-max" type="number" placeholder="Max Score" class="border p-1 w-full mb-2" value="20" />
        <textarea id="assess-lo-text" class="border p-1 w-full mb-2" rows="3" readonly>${objDesc}</textarea>
        
        <div class="flex gap-2">
          <button id="create-assess-btn" class="bg-green-600 text-white px-4 py-1 rounded">Create</button>
          <button id="close-modal" class="bg-gray-300 px-4 py-1 rounded">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const typeSel = modal.querySelector('#assess-type') as HTMLSelectElement;
    const subtypeSel = modal.querySelector('#assess-subtype') as HTMLSelectElement;
    typeSel.addEventListener('change', () => {
      subtypeSel.style.display = typeSel.value === 'Written Works' ? '' : 'none';
    });

    modal.querySelector('#close-modal')!.addEventListener('click', () => modal.remove());
    modal.querySelector('#create-assess-btn')!.addEventListener('click', async () => {
      const type = typeSel.value;
      const subtype = subtypeSel.style.display === 'none' ? type : subtypeSel.value;
      const title = (modal.querySelector('#assess-title') as HTMLInputElement).value;
      const maxScore = parseInt((modal.querySelector('#assess-max') as HTMLInputElement).value) || 0;
      const loText = (modal.querySelector('#assess-lo-text') as HTMLTextAreaElement).value;

      const subjectId = parseInt(subjectSel.value);
      if (!subjectId) { alert('Please select a subject first.'); return; }

      try {
        await AssessmentAPI.create({
          subject_id: subjectId,
          date: today,
          type: subtype,    // use subtype as the actual stored type
          title,
          total_score: maxScore,
          scores: [],
          source: 'grades',
          school_year: schoolYear,
          term: termSel,
          learning_objective_id: objId,
          learning_objectives: loText
        } as any);
        modal.remove();
        loadTodayAssessments();
      } catch (err) {
        alert('Error creating assessment: ' + err);
      }
    });
  }

  async function loadTodayAssessments() {
    const subjectId = parseInt(subjectSel.value);
    if (!subjectId) return;
    const listDiv = document.getElementById('today-assessments-list')!;
    listDiv.innerHTML = '<p class="text-sm">Loading...</p>';
    try {
      const res = await fetch(`/api/v1/assessments/grade-entry?subject_id=${subjectId}&school_year=${schoolYear}&term=${selectedTerm}&date=${today}`);
      const assessments = await res.json();
      listDiv.innerHTML = '';
      if (assessments.length === 0) {
        listDiv.innerHTML = '<p class="text-sm text-gray-500">No assessments today.</p>';
        return;
      }
      assessments.forEach((a: any) => {
        const item = document.createElement('div');
        item.className = 'border p-2 rounded mb-1 text-sm flex justify-between items-center';
        item.innerHTML = `
          <span>${a.type} – ${a.title} (Max: ${a.total_score})<br>
          <span class="text-xs text-gray-600">Obj: ${a.learning_objective_code || '–'}</span></span>
          <button class="text-blue-600 text-xs underline" data-id="${a.id}">View/Edit Scores</button>
        `;
        item.querySelector('button')!.addEventListener('click', () => {
          window.location.hash = `#/grades?id=${a.id}`;
        });
        listDiv.appendChild(item);
      });
    } catch (err) {
      listDiv.innerHTML = '<p class="text-red-500">Error loading assessments.</p>';
    }
  }

  // --- Events ---
  subjectSel.addEventListener('change', () => {
    loadCurriculum();
    loadTodayAssessments();
  });

  // Initial load
  loadCurriculum();
  loadTodayAssessments();

  return container;
}