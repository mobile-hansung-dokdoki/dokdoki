import { useState, useCallback } from 'react';
import { Todo, Filter } from '../types';

// 시간 기반 고유 ID 생성 (nanoid 대신 외부 의존성 없이 사용)
const generateId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

  // 새 항목을 목록 맨 앞에 추가 (최신순 정렬)
  const addTodo = useCallback((text: string) => {
    const now = Date.now();
    const newTodo: Todo = {
      id: generateId(),
      text: text.trim(),
      done: false,
      createdAt: now,
      updatedAt: now,
    };
    setTodos(prev => [newTodo, ...prev]);
  }, []);

  // 완료 상태 토글 — 원본 배열을 직접 수정하지 않고 새 배열 반환 (불변성 유지)
  const toggleTodo = useCallback((id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, done: !todo.done, updatedAt: Date.now() }
          : todo
      )
    );
  }, []);

  // 해당 id 항목 제거
  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  // 선택된 필터에 따라 목록 필터링
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.done;  // 진행중
    if (filter === 'done') return todo.done;      // 완료
    return true;                                  // 전체
  });

  return {
    todos,
    filteredTodos,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
}
