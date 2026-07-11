import { SubjectsAPI, type Subject } from '../../../services/api';

export function renderSettingsPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'space-y-6';

  // Tabs
  const tabBar = document.createElement('div');
  tabBar.className = 'flex gap-2 border-b pb-2';
  const tabs = ['School Year & Terms', 'Subjects', 'Backup'];
  const tabButtons: HTMLButtonElement[] = [];
  tabs.forEach(name => {
    const btn = document.createElement('button');
    btn.className = 'px-4 py-1 rounded-t text-sm border';
    btn.textContent = name;
    btn.addEventListener('click', () => switchTab(name));
    tabBar.appendChild(btn);
    tabButtons.push(btn);
  });
  container.appendChild(tabBar);

  const tabContent = document.createElement('div');
  tabContent.className = 'mt-4';
  container.appendChild(tabContent);

  function switchTab(name: string) {
    tabButtons.forEach(b => b.classList.remove('bg-blue-200', 'font-bold'));
    const active = tabButtons.find(b => b.textContent === name);
    if (active) active.classList.add('bg-blue-200', 'font-bold');
    tabContent.innerHTML = '';
    if (name === 'School Year & Terms') renderSchoolYearTab(tabContent);
    else if (name === 'Subjects') renderSubjectsTab(tabContent);
    else if (name === 'Backup') renderBackupTab(tabContent);
  }

  // ========== School Year Tab ==========
  async function renderSchoolYearTab(parent: HTMLElement) {
    parent.innerHTML = '<p class="text-gray-500">Loading...</p>';
    let settings: any;
    try {
      const res = await fetch('/api/v1/settings/');
      settings = await res.json();
    } catch (e) {
      parent.innerHTML = '<p class="text-red-500">Failed to load settings.</p>';
      return;
    }

    parent.innerHTML = `
      <h3 class="text-lg font-bold mb-4">School Year & Term Dates</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <div>
          <label class="text-sm">School Year</label>
          <input id="set-school-year" value="${settings.school_year}" class="border p-2 rounded w-full text-black" />
        </div>
        <div></div>
        <div>
          <label class="text-sm">Term 1 Start</label>
          <input id="set-t1-start" type="date" value="${settings.term1_start}" class="border p-2 rounded w-full text-black" />
        </div>
        <div>
          <label class="text-sm">Term 1 End</label>
          <input id="set-t1-end" type="date" value="${settings.term1_end}" class="border p-2 rounded w-full text-black" />
        </div>
        <div>
          <label class="text-sm">Term 2 Start</label>
          <input id="set-t2-start" type="date" value="${settings.term2_start}" class="border p-2 rounded w-full text-black" />
        </div>
        <div>
          <label class="text-sm">Term 2 End</label>
          <input id="set-t2-end" type="date" value="${settings.term2_end}" class="border p-2 rounded w-full text-black" />
        </div>
        <div>
          <label class="text-sm">Term 3 Start</label>
          <input id="set-t3-start" type="date" value="${settings.term3_start}" class="border p-2 rounded w-full text-black" />
        </div>
        <div>
          <label class="text-sm">Term 3 End</label>
          <input id="set-t3-end" type="date" value="${settings.term3_end}" class="border p-2 rounded w-full text-black" />
        </div>
      </div>
      <button id="save-settings" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Save Settings</button>
    `;

    parent.querySelector('#save-settings')!.addEventListener('click', async () => {
      const body = {
        school_year: (parent.querySelector('#set-school-year') as HTMLInputElement).value,
        term1_start: (parent.querySelector('#set-t1-start') as HTMLInputElement).value,
        term1_end: (parent.querySelector('#set-t1-end') as HTMLInputElement).value,
        term2_start: (parent.querySelector('#set-t2-start') as HTMLInputElement).value,
        term2_end: (parent.querySelector('#set-t2-end') as HTMLInputElement).value,
        term3_start: (parent.querySelector('#set-t3-start') as HTMLInputElement).value,
        term3_end: (parent.querySelector('#set-t3-end') as HTMLInputElement).value,
      };
      await fetch('/api/v1/settings/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      alert('Settings saved.');
    });
  }

  // ========== Subjects Tab ==========
  async function renderSubjectsTab(parent: HTMLElement) {
    parent.innerHTML = '<p class="text-gray-500">Loading subjects...</p>';
    const subjects = await SubjectsAPI.getAll();

    parent.innerHTML = `
      <h3 class="text-lg font-bold mb-4">Manage Subjects</h3>
      <div id="subjects-list" class="mb-4 space-y-1"></div>
      <div class="flex gap-2">
        <input id="new-subject-name" placeholder="Subject Name" class="border p-2 rounded text-black" />
        <input id="new-subject-code" placeholder="Code (optional)" class="border p-2 rounded text-black" />
        <button id="add-subject" class="bg-green-600 text-white px-4 py-2 rounded">Add</button>
      </div>
    `;

    const listDiv = parent.querySelector('#subjects-list')!;
    function renderList(subs: Subject[]) {
      listDiv.innerHTML = '';
      subs.forEach(s => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between border p-2 rounded';
        div.innerHTML = `<span>${s.name} (${s.code || '—'})</span>`;
        const delBtn = document.createElement('button');
        delBtn.className = 'bg-red-500 text-white px-2 py-1 rounded text-xs';
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', async () => {
          if (confirm(`Delete ${s.name}?`)) {
            await SubjectsAPI.delete(s.id);
            const updated = await SubjectsAPI.getAll();
            renderList(updated);
          }
        });
        div.appendChild(delBtn);
        listDiv.appendChild(div);
      });
    }
    renderList(subjects);

    parent.querySelector('#add-subject')!.addEventListener('click', async () => {
      const name = (parent.querySelector('#new-subject-name') as HTMLInputElement).value.trim();
      const code = (parent.querySelector('#new-subject-code') as HTMLInputElement).value.trim();
      if (!name) { alert('Enter a subject name.'); return; }
      await SubjectsAPI.create({ name, code: code || undefined });
      const updated = await SubjectsAPI.getAll();
      renderList(updated);
      (parent.querySelector('#new-subject-name') as HTMLInputElement).value = '';
      (parent.querySelector('#new-subject-code') as HTMLInputElement).value = '';
    });
  }

  // ========== Backup Tab ==========
  function renderBackupTab(parent: HTMLElement) {
    parent.innerHTML = `
      <h3 class="text-lg font-bold mb-4">Database Backup</h3>
      <p class="text-sm text-gray-600 mb-4">Download a copy of all your data.</p>
      <button id="backup-btn" class="bg-gray-700 text-white px-4 py-2 rounded">Download Backup (SQL)</button>
      <p class="text-xs text-gray-500 mt-2">Feature coming soon.</p>
    `;
    parent.querySelector('#backup-btn')!.addEventListener('click', () => {
      alert('Backup feature will be available in a future update.');
    });
  }

  // Initial tab
  switchTab('School Year & Terms');
  return container;
}