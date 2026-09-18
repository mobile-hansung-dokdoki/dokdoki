import { useState, useCallback } from 'react';
import { Todo, Filter, SortOrder, TagId, Tag } from '../types';
import { formatDateKorean, fromDateString } from '../utils/date';
import { DEFAULT_TAGS } from '../constants/tags';

const generateId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('createdDesc');
  const [activeTags, setActiveTags] = useState<TagId[]>([]);
  const [userTags, setUserTags] = useState<Tag[]>(DEFAULT_TAGS);

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

  const addUserTag = useCallback((label: string, color: string, bgColor: string) => {
    const id = generateId();
    setUserTags(prev => [...prev, { id, label, color, bgColor }]);
  }, []);

  const deleteUserTag = useCallback((tagId: string) => {
    setUserTags(prev => prev.filter(t => t.id !== tagId));
    setActiveTags(prev => prev.filter(t => t !== tagId));
  }, []);

  const reorderUserTags = useCallback((from: number, to: number) => {
    setUserTags(prev => {
      const next = [...prev];
      const [removed] = next.splice(from, 1);
      next.splice(to, 0, removed);
      return next;
    });
  }, []);

  const toggleActiveTag = useCallback((tagId: TagId) => {
    setActiveTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  }, []);

  const tagMap: Record<string, Tag> = Object.fromEntries(userTags.map(t => [t.id, t]));

  const filteredTodos = todos
    .filter(todo => {
      if (filter === 'active' && todo.done) return false;
      if (filter === 'done' && !todo.done) return false;
      if (activeTags.length > 0 && !activeTags.every(t => todo.tags?.includes(t))) return false;

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
    activeTags,
    setActiveTags,
    toggleActiveTag,
    userTags,
    tagMap,
    addUserTag,
    deleteUserTag,
    reorderUserTags,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
  };
}
