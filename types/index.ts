export type TodoCategory = 'none' | 'school' | 'personal' | 'appointment';

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  category: TodoCategory;
  dueDate?: string;  // 'YYYY-MM-DD' 형식
  createdAt: number;
  updatedAt: number;
}

export type Filter = 'all' | 'active' | 'done';

export type SortOrder = 'createdDesc' | 'createdAsc' | 'dueDate';
