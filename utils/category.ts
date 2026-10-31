import { Category, Todo } from '../types';

export const DEFAULT_CATEGORIES: Category[] = ['과제', '업무', '개인 루틴', '학습', '기타'];

export function appendCategory(categories: Category[], name: string): Category[] {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('카테고리 이름을 입력해 주세요.');
  if (categories.includes(trimmed)) throw new Error('이미 있는 카테고리예요.');
  return [...categories, trimmed];
}

export function removeCategory(categories: Category[], todos: Todo[], name: Category) {
  if (name === '기타' || !categories.includes(name)) return { categories, todos };
  const updatedAt = new Date().toISOString();
  return {
    categories: categories.filter(category => category !== name),
    todos: todos.map(todo => todo.category === name
      ? { ...todo, category: '기타', updatedAt }
      : todo),
  };
}
