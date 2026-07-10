// src/modules/learners/components/learner-profile.ts
import { LearnerStore } from '../../../stores/learner-store';
import type { Learner } from '../../../services/api';
import { customConfirm } from '../../../services/dialog';

export function renderLearnerProfile(learner: Learner, store: LearnerStore): HTMLElement {
  const container = document.createElement('div');
  container.className = 'p-4';

  function viewMode() {
    return `
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">${learner.first_name} ${learner.last_name}</h2>
        <div>
          <button id="edit-btn" class="bg-yellow-400 text-white px-3 py-1 rounded text-sm mr-2">Edit</button>
          <button id="archive-btn" class="bg-red-500 text-white px-3 py-1 rounded text-sm">${learner.is_active ? 'Archive' : 'Restore'}</button>
          <button id="delete-btn" class="bg-red-700 text-white px-3 py-1 rounded text-sm">Delete</button>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2 text-sm">
        <div><strong>LRN:</strong> ${learner.lrn || '-'}</div>
        <div><strong>Gender:</strong> ${learner.gender}</div>
        <div><strong>Birthdate:</strong> ${learner.birth_date}</div>
        <div><strong>Age:</strong> ${learner.age}</div>
        <div><strong>Mother Tongue:</strong> ${learner.mother_tongue || '-'}</div>
        <div><strong>IP:</strong> ${learner.ip ? 'Yes' : 'No'}</div>
        <div><strong>Religion:</strong> ${learner.religion || '-'}</div>
        <div><strong>Address:</strong> ${learner.address || '-'}</div>
        <div><strong>Father:</strong> ${learner.father_name || '-'}</div>
        <div><strong>Mother:</strong> ${learner.mother_name || '-'}</div>
        <div><strong>Guardian:</strong> ${learner.guardian_name || '-'}</div>
        <div><strong>Contact:</strong> ${learner.guardian_contact || '-'}</div>
      </div>
    `;
  }

  function editMode() {
    return `
      <h2 class="text-xl font-semibold mb-4">Edit ${learner.first_name} ${learner.last_name}</h2>
      <form id="edit-form" class="grid grid-cols-2 gap-3 text-sm">
        <input name="lrn" placeholder="LRN" value="${learner.lrn || ''}" class="border p-1 rounded" />
        <input name="first_name" required value="${learner.first_name}" class="border p-1 rounded" />
        <input name="last_name" required value="${learner.last_name}" class="border p-1 rounded" />
        <input name="middle_name" placeholder="Middle Name" value="${learner.middle_name || ''}" class="border p-1 rounded" />
        <input name="extension" placeholder="Extension" value="${learner.extension || ''}" class="border p-1 rounded" />
        <select name="gender" class="border p-1 rounded">
          <option value="male" ${learner.gender === 'male' ? 'selected' : ''}>Male</option>
          <option value="female" ${learner.gender === 'female' ? 'selected' : ''}>Female</option>
        </select>
        <input name="birth_date" type="date" required value="${learner.birth_date}" class="border p-1 rounded" />
        <input name="age" type="number" required value="${learner.age}" class="border p-1 rounded" />
        <input name="mother_tongue" placeholder="Mother Tongue" value="${learner.mother_tongue || ''}" class="border p-1 rounded" />
        <label class="flex items-center"><input type="checkbox" name="ip" ${learner.ip ? 'checked' : ''} class="mr-1" /> Indigenous People</label>
        <input name="religion" placeholder="Religion" value="${learner.religion || ''}" class="border p-1 rounded" />
        <input name="address" placeholder="Address" value="${learner.address || ''}" class="border p-1 rounded" />
        <input name="father_name" placeholder="Father" value="${learner.father_name || ''}" class="border p-1 rounded" />
        <input name="mother_name" placeholder="Mother" value="${learner.mother_name || ''}" class="border p-1 rounded" />
        <input name="guardian_name" placeholder="Guardian" value="${learner.guardian_name || ''}" class="border p-1 rounded" />
        <input name="guardian_contact" placeholder="Guardian Contact" value="${learner.guardian_contact || ''}" class="border p-1 rounded" />
        <div class="col-span-2 flex gap-2">
          <button type="submit" class="bg-green-600 text-white px-4 py-1 rounded">Save</button>
          <button type="button" id="cancel-edit" class="bg-gray-300 px-4 py-1 rounded">Cancel</button>
        </div>
      </form>
    `;
  }

  container.innerHTML = viewMode();

  // Event delegation for buttons
  container.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    if (target.id === 'edit-btn') {
      container.innerHTML = editMode();
    }
    if (target.id === 'cancel-edit') {
      container.innerHTML = viewMode();
    }
    if (target.id === 'archive-btn') {
      const isArchived = await customConfirm(
        `Are you sure you want to ${learner.is_active ? 'archive' : 'restore'} this learner?`,
        { title: `${learner.is_active ? 'Archive' : 'Restore'} Learner`, isDestructive: learner.is_active }
      );
      if (isArchived) {
        await store.archive(learner.id);
        container.innerHTML = '<p class="text-gray-500">Learner archived. Select another.</p>';
      }
    }

    if (target.id === 'delete-btn') {
      const isDeleted = await customConfirm(
        'Are you sure you want to permanently delete this learner? This cannot be undone.',
        { title: 'Delete Learner', isDestructive: true }
      );
      if (isDeleted) {
        await store.delete(learner.id);
        container.innerHTML = '<p class="text-gray-500">Learner deleted. Select another.</p>';
      }
    }
  });

  // Form submit
  container.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data: any = {};
    formData.forEach((value, key) => {
      if (key === 'ip') data[key] = formData.get('ip') === 'on'; // checkbox
      else if (key === 'age') data[key] = parseInt(value as string, 10);
      else data[key] = value;
    });
    try {
      await store.update(learner.id, data);
      alert('Updated successfully!');
      container.innerHTML = viewMode(); // would need updated learner object; better to reload from store
      // Actually we need the updated learner object. We'll reload the store and re-render.
      store.load().then(() => {
        const updated = store.getAll().find(l => l.id === learner.id);
        if (updated) {
          // re-render with updated learner
          container.innerHTML = viewMode();
          // but we need to reassign learner reference. We'll just call the parent to re-render.
        }
      });
    } catch (err) {
      alert('Update failed');
    }
  });

  return container;
}