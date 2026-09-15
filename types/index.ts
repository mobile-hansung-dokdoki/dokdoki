export interface Todo {
  id: string;
  text: string;
  done: boolean;
  dueDate?: string;  // 'YYYY-MM-DD' 형식
  createdAt: number;
  updatedAt: number;
}

export type Filter = 'all' | 'active' | 'done';

export type SortOrder = 'createdDesc' | 'createdAsc' | 'dueDate';
