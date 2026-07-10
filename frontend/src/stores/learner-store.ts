// src/stores/learner-store.ts
import { LearnersAPI, type Learner, type LearnerFormData } from '../services/api';

type Listener = () => void;

export class LearnerStore {
  private learners: Learner[] = [];
  private listeners = new Set<Listener>();
  private activeOnly = true;

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  async load() {
    this.learners = await LearnersAPI.getAll(this.activeOnly);
    this.notify();
  }

  getAll() {
    return this.learners;
  }

  async add(data: LearnerFormData) {
    const created = await LearnersAPI.create(data);
    if (this.activeOnly) {
      this.learners.push(created);
      this.notify();
    } else {
      await this.load(); // reload to keep consistency
    }
  }

  async update(id: number, data: Partial<LearnerFormData>) {
    const updated = await LearnersAPI.update(id, data);
    const index = this.learners.findIndex(l => l.id === id);
    if (index >= 0) {
      this.learners[index] = updated;
      this.notify();
    }
  }

  async archive(id: number) {
    await LearnersAPI.archive(id);
    this.learners = this.learners.filter(l => l.id !== id);
    this.notify();
  }

  async importFile(file: File) {
    const result = await LearnersAPI.importSF1(file);
    await this.load(); // refresh list after import
    return result;
  }

  setActiveOnly(value: boolean) {
    this.activeOnly = value;
    this.load();
  }

  async delete(id: number) {
    await LearnersAPI.permanentlyDelete(id);
    this.learners = this.learners.filter(l => l.id !== id);
    this.notify();
}
}