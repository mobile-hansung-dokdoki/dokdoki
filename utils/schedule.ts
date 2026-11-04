import { ScheduleSlot, Todo, TodoInput, TodoSchedule } from '../types';
import { addDays, fromDateString } from './date';

export function normalizeTime(value: string): string {
  const match = value.match(/(\d+):(\d+)/);
  if (!match) return value;
  let hour = Number(match[1]);
  if (value.includes('오전') && hour === 12) hour = 0;
  if (value.includes('오후') && hour < 12) hour += 12;
  return `${String(hour).padStart(2, '0')}:${match[2]}`;
}

function validDate(value: string): boolean {
  const date = fromDateString(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(date.getTime())
    && date.getFullYear() === Number(value.slice(0, 4))
    && date.getMonth() + 1 === Number(value.slice(5, 7))
    && date.getDate() === Number(value.slice(8, 10));
}

export function expandSchedule(schedule: TodoSchedule): ScheduleSlot[] {
  let slots: ScheduleSlot[] = [];
  if (schedule.mode === 'dates') {
    slots = schedule.slots;
  } else {
    if (!validDate(schedule.start) || !validDate(schedule.end)) throw new Error('올바른 시작일과 종료일을 선택해 주세요.');
    if (!schedule.weekdays.length) throw new Error('반복할 요일을 선택해 주세요.');
    if (!schedule.times.length) throw new Error('반복할 시간을 추가해 주세요.');
    if (schedule.end < schedule.start) throw new Error('종료일은 시작일 이후로 선택해 주세요.');
    const days = Math.round((fromDateString(schedule.end).getTime() - fromDateString(schedule.start).getTime()) / 86400000);
    if (!Number.isFinite(days) || days > 366) throw new Error('반복 기간은 최대 1년으로 설정해 주세요.');
    for (let date = schedule.start; date <= schedule.end; date = addDays(date, 1)) {
      if (schedule.weekdays.includes(fromDateString(date).getDay())) {
        slots.push(...schedule.times.map(time => ({ date, time })));
      }
    }
  }
  if (schedule.mode === 'weekly' && schedule.excluded) {
    slots = slots.filter(slot => !schedule.excluded!.some(ex => ex.date === slot.date && ex.time === slot.time));
  }
  if (slots.some(slot => !validDate(slot.date) || (slot.time !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.time)))) {
    throw new Error('날짜와 시간을 올바르게 선택해 주세요.');
  }
  const unique = [...new Map(slots.map(slot => [`${slot.date}/${slot.time ?? ''}`, slot])).values()];
  if (!unique.length) throw new Error('선택한 기간에 일정이 없어요. 날짜와 요일을 확인해 주세요.');
  return unique.sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''));
}

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;

// Reuse matching occurrences so editing a series preserves completed work.
export function buildTodos(input: TodoInput, previous: Todo[] = []): Todo[] {
  const slots = input.schedule ? expandSchedule(input.schedule) : [{ date: input.date, time: input.time }];
  const scheduleId = input.schedule ? previous[0]?.scheduleId ?? newId() : undefined;
  const now = new Date().toISOString();
  return slots.map(slot => {
    const existing = previous.find(todo => todo.date === slot.date && (todo.time ? normalizeTime(todo.time) : undefined) === slot.time);
    return {
      ...input, ...slot, id: existing?.id ?? newId(), title: input.title.trim(),
      scheduleId, done: existing?.done ?? false, completedAt: existing?.completedAt,
      createdAt: existing?.createdAt ?? now, updatedAt: now,
    };
  });
}

export function replaceSchedule(todos: Todo[], id: string, input: TodoInput): Todo[] {
  const target = todos.find(todo => todo.id === id);
  if (!target) return todos;
  const belongs = (todo: Todo) => target.scheduleId ? todo.scheduleId === target.scheduleId : todo.id === id;
  return [...buildTodos(input, todos.filter(belongs)), ...todos.filter(todo => !belongs(todo))];
}


export function removeOccurrence(todos: Todo[], id: string): Todo[] {
  const target = todos.find(t => t.id === id);
  if (!target?.scheduleId || !target.schedule || !target.date) return todos.filter(t => t.id !== id);
  const slot = { date: target.date, time: target.time };
  const schedule: TodoSchedule = target.schedule.mode === 'dates'
    ? { mode: 'dates', slots: target.schedule.slots.filter(s => s.date !== slot.date || s.time !== slot.time) }
    : { ...target.schedule, excluded: [...(target.schedule.excluded ?? []), slot] };
  return todos.filter(t => t.id !== id).map(t => t.scheduleId === target.scheduleId
    ? { ...t, schedule, updatedAt: new Date().toISOString() } : t);
}
