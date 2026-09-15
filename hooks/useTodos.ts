import { useState, useCallback } from 'react';
import { Todo, Filter, SortOrder } from '../types';
import { formatDateKorean, fromDateString } from '../utils/date';

// 시간 기반 고유 ID 생성 (nanoid 대신 외부 의존성 없이 사용)
const generateId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('createdDesc');

  // 새 항목을 목록 맨 앞에 추가 (최신순 정렬)
  const addTodo = useCallback((text: string, dueDate?: string) => {
    const now = Date.now();
    const newTodo: Todo = {
      id: generateId(),
      text: text.trim(),
      done: false,
      dueDate,
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

  const editTodo = useCallback((id: string, text: string, dueDate?: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, text: text.trim(), dueDate, updatedAt: Date.now() }
          : todo
      )
    );
  }, []);

  // 해당 id 항목 제거
  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  // 상태 필터 + 검색어(텍스트·날짜) 순차 적용 후 정렬
  const filteredTodos = todos
    .filter(todo => {
      if (filter === 'active' && todo.done) return false;
      if (filter === 'done' && !todo.done) return false;

      const q = searchQuery.trim();
      if (q) {
        const lower = q.toLowerCase();
        const textMatch = todo.text.toLowerCase().includes(lower);
        const dateMatch = todo.dueDate
          ? formatDateKorean(fromDateString(todo.dueDate)).includes(q)
          : false;
        return textMatch || dateMatch;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'createdDesc') return b.createdAt - a.createdAt;
      if (sortOrder === 'createdAsc') return a.createdAt - b.createdAt;
      // dueDate 순: 마감일 없는 항목은 맨 뒤로
      if (!a.dueDate && !b.dueDate) return b.createdAt - a.createdAt;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

  const doneCount = todos.filter(todo => todo.done).length;

  return {
    todos,
    filteredTodos,
    doneCount,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
  };
}
