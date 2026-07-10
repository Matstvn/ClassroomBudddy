// src/modules/learners/components/import-sf1.ts
import { LearnerStore } from '../../../stores/learner-store';

export function renderImportButton(store: LearnerStore): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'bg-blue-500 text-white px-4 py-2 rounded text-sm';
  button.textContent = 'Import SF1';
  button.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const result = await store.importFile(file);
        alert(`Imported ${result.imported} learners.`);
        store.load();
      } catch (err) {
        alert('Import failed');
      }
    };
    input.click();
  });
  return button;
}