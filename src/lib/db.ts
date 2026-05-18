import Dexie, { type Table } from 'dexie';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  time: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export class VedaDatabase extends Dexie {
  tasks!: Table<Task>;

  constructor() {
    super('VedaDatabase');
    this.version(1).stores({
      tasks: 'id, title, completed, time, *tags, createdAt, updatedAt'
    });
  }
}

export const db = new VedaDatabase();
