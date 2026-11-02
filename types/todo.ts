export type Category = string;
export type TodoStatus = '완료' | '진행' | '대기';

export interface ScheduleSlot { date: string; time?: string }
export type TodoSchedule =
  | { mode: 'dates'; slots: ScheduleSlot[] }
  | { mode: 'weekly'; start: string; end: string; weekdays: number[]; times: string[] };
export interface TodoInput {
  title: string;
  category: Category;
  date?: string;
  time?: string;
  memo?: string;
  schedule?: TodoSchedule;
}

export interface Todo {
  id: string;
  title: string;
  memo?: string;
  date?: string;      // 'YYYY-MM-DD'
  time?: string;      // '오전 10:00'
  category: Category;
  done: boolean;
  createdAt: string;
  updatedAt: string;
  schedule?: TodoSchedule;
  scheduleId?: string;
}
