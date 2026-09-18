import { useState, useCallback } from 'react';
import { Todo, Filter, SortOrder, TagId } from '../types';
import { formatDateKorean, fromDateString } from '../utils/date';

const generateId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('createdDesc');
  const [activeTag, setActiveTag] = useState<TagId | null>(null);

  const addTodo = useCallback((text: string, dueDate?: string, tags?: TagId[]) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = Date.now();
    setTodos(prev => [
      { id: generateId(), text: trimmed, done: false, dueDate, tags, createdAt: now, updatedAt: now },
      ...prev,
    ]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, done: !todo.done, updatedAt: Date.now() }
          : todo
      )
    );
  }, []);

  const editTodo = useCallback((id: string, text: string, dueDate?: string, tags?: TagId[]) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, text: trimmed, dueDate, tags, updatedAt: Date.now() } : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  const filteredTodos = todos
    .filter(todo => {
      if (filter === 'active' && todo.done) return false;
      if (filter === 'done' && !todo.done) return false;
      if (activeTag && !todo.tags?.includes(activeTag)) return false;

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
    activeTag,
    setActiveTag,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
  };
}
