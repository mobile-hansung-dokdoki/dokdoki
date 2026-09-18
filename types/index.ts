export type TagId = 'work' | 'personal' | 'urgent';

export interface Tag {
  id: TagId;
  label: string;
  color: string;
  bgColor: string;
}

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  dueDate?: string;  // 'YYYY-MM-DD' 형식
  tags?: TagId[];
  createdAt: number;
  updatedAt: number;
}

export type Filter = 'all' | 'active' | 'done';

export type SortOrder = 'createdDesc' | 'createdAsc' | 'dueDate';
