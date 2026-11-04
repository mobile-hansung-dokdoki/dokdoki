import { Todo } from '../types';
import { expandSchedule } from './schedule';
export interface TodoState { version: 1; todos: Todo[]; categories: string[] }
export function decodeTodoState(value: unknown): TodoState {
  const data = value as TodoState;
  if (!data || data.version !== 1 || !Array.isArray(data.todos) || !Array.isArray(data.categories)
    || data.categories.some(c => typeof c !== 'string' || !c.trim())
    || !data.categories.includes('기타') || new Set(data.categories).size !== data.categories.length) throw new Error('Invalid saved data');
  const ids = new Set<string>();
  for (const t of data.todos) {
    if (!t || typeof t.id !== 'string' || ids.has(t.id) || typeof t.title !== 'string' || !t.title.trim()
      || typeof t.done !== 'boolean' || !data.categories.includes(t.category)
      || typeof t.createdAt !== 'string' || !Number.isFinite(Date.parse(t.createdAt))
      || typeof t.updatedAt !== 'string' || !Number.isFinite(Date.parse(t.updatedAt))) throw new Error('Invalid todo');
    ids.add(t.id);
    if (t.date) expandSchedule({ mode: 'dates', slots: [{ date: t.date, time: t.time }] });
    if (t.schedule) expandSchedule(t.schedule);
  }
  return data;
}
