// src/modules/learners/components/learner-list.ts
import { LearnerStore } from '../../../stores/learner-store';
import type { Learner } from '../../../services/api';

export class LearnerList {
  private store: LearnerStore;
  private onSelect: (learner: Learner) => void;
  private container!: HTMLElement;
  private searchInput!: HTMLInputElement;
  private activeOnly = true;

  constructor(store: LearnerStore, onSelect: (learner: Learner) => void) {
    this.store = store;
    this.onSelect = onSelect;
  }

  render(parent: HTMLElement) {
    this.container = parent;
    this.container.innerHTML = `
      <div class="flex flex-col h-full">
        <div class="p-2 border-b">
          <input id="learner-search" type="text" placeholder="Search learners..." 
                 class="w-full border rounded px-2 py-1 text-sm" />
          <label class="flex items-center mt-2 text-sm">
            <input type="checkbox" id="show-archived" class="mr-1" ${!this.activeOnly ? 'checked' : ''} />
            Show archived
          </label>
        </div>
        <ul id="learner-list" class="flex-1 overflow-y-auto divide-y"></ul>
      </div>
    `;

    this.searchInput = this.container.querySelector('#learner-search')!;
    this.searchInput.addEventListener('input', () => this.renderList());

    const showArchived = this.container.querySelector('#show-archived') as HTMLInputElement;
    showArchived.addEventListener('change', () => {
      this.activeOnly = !showArchived.checked;
      this.store.setActiveOnly(this.activeOnly);
    });

    this.store.subscribe(() => this.renderList());
    this.store.load(); // initial load
  }

  private renderList() {
    const listElement = this.container.querySelector('#learner-list')!;
    const searchTerm = this.searchInput?.value.toLowerCase() || '';
    const learners = this.store.getAll().filter(l => {
      const full = `${l.first_name} ${l.last_name}`.toLowerCase();
      return full.includes(searchTerm) || (l.lrn && l.lrn.includes(searchTerm));
    });

    listElement.innerHTML = '';
    if (learners.length === 0) {
      listElement.innerHTML = '<li class="p-2 text-sm text-gray-500">No learners found.</li>';
      return;
    }
    learners.forEach(learner => {
      const li = document.createElement('li');
      li.className = 'p-2 hover:bg-gray-200 cursor-pointer text-sm';
      li.textContent = `${learner.last_name}, ${learner.first_name}`;
      if (!learner.is_active) li.classList.add('opacity-50', 'line-through');
      li.addEventListener('click', () => this.onSelect(learner));
      listElement.appendChild(li);
    });
  }
}