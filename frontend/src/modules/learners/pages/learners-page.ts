// src/modules/learners/pages/learners-page.ts
import { LearnerStore } from '../../../stores/learner-store';
import { LearnerList } from '../components/learner-list';
import { renderLearnerProfile } from '../components/learner-profile';
import { renderImportButton } from '../components/import-sf1';
import type { Learner } from '../../../services/api';

export function renderLearnersPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex flex-col h-full';
   // Top bar with Add Learner and Import
  const toolbar = document.createElement('div');
  toolbar.className = 'p-2 border-b flex gap-2';
  const addBtn = document.createElement('button');
  addBtn.className = 'bg-green-600 text-white px-4 py-1 rounded text-sm';
  addBtn.textContent = '+ Add Learner';
  addBtn.addEventListener('click', () => openAddLearnerModal(store));
  toolbar.appendChild(addBtn);

  const store = new LearnerStore();
  const importBtn = renderImportButton(store);
  toolbar.appendChild(importBtn);
  container.appendChild(toolbar);

  const mainArea = document.createElement('div');
  mainArea.className = 'flex flex-1 overflow-hidden';

  const listContainer = document.createElement('div');
  listContainer.className = 'w-1/3 border-r overflow-hidden flex flex-col h-full';
  const profileContainer = document.createElement('div');
  profileContainer.className = 'flex-1 overflow-auto';

  const list = new LearnerList(store, (learner: Learner) => {
    profileContainer.innerHTML = '';
    profileContainer.appendChild(renderLearnerProfile(learner, store));
  });

  list.render(listContainer);

  mainArea.appendChild(listContainer);
  mainArea.appendChild(profileContainer);
  container.appendChild(mainArea);

  return container;
}

function openAddLearnerModal(store: LearnerStore) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white p-6 rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
      <h2 class="text-xl font-bold mb-4">Add New Learner</h2>
      <form id="add-learner-form" class="grid grid-cols-2 gap-3 text-sm">
        <input name="lrn" placeholder="LRN" class="border p-1 rounded" />
        <input name="first_name" required placeholder="First Name *" class="border p-1 rounded" />
        <input name="last_name" required placeholder="Last Name *" class="border p-1 rounded" />
        <input name="middle_name" placeholder="Middle Name" class="border p-1 rounded" />
        <input name="extension" placeholder="Extension" class="border p-1 rounded" />
        <select name="gender" class="border p-1 rounded">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input name="birth_date" type="date" required class="border p-1 rounded" />
        <input name="age" type="number" required placeholder="Age *" class="border p-1 rounded" />
        <input name="mother_tongue" placeholder="Mother Tongue" class="border p-1 rounded" />
        <label class="flex items-center"><input type="checkbox" name="ip" class="mr-1" /> Indigenous People</label>
        <input name="religion" placeholder="Religion" class="border p-1 rounded" />
        <input name="address" placeholder="Address" class="border p-1 rounded" />
        <input name="father_name" placeholder="Father" class="border p-1 rounded" />
        <input name="mother_name" placeholder="Mother" class="border p-1 rounded" />
        <input name="guardian_name" placeholder="Guardian" class="border p-1 rounded" />
        <input name="guardian_contact" placeholder="Guardian Contact" class="border p-1 rounded" />
        <div class="col-span-2 flex gap-2 mt-2">
          <button type="submit" class="bg-green-600 text-white px-4 py-1 rounded">Add</button>
          <button type="button" id="cancel-add" class="bg-gray-300 px-4 py-1 rounded">Cancel</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Cancel button
  modal.querySelector('#cancel-add')!.addEventListener('click', () => modal.remove());

  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // Submit
  const form = modal.querySelector('#add-learner-form') as HTMLFormElement;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data: any = {};
    fd.forEach((value, key) => {
      if (key === 'ip') data[key] = fd.get('ip') === 'on'; // checkbox
      else if (key === 'age') data[key] = parseInt(value as string, 10) || 0;
      else data[key] = value;
    });
    try {
      await store.add(data);
      modal.remove();
      // Store already notifies list to refresh, but you might want to re-render the list.
      // The store's load() will fetch fresh data, but add() already updates local list.
      alert('Learner added!');
    } catch (err) {
      alert('Failed to add learner: ' + err);
    }
  });
}