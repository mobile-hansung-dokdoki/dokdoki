export type Category = '과제' | '업무' | '개인 루틴' | '학습' | '기타';
export type TodoStatus = '완료' | '진행' | '대기';

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
}
