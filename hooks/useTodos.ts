import { useState, useCallback } from 'react';
import { Todo, TodoInput } from '../types';
import { buildTodos, replaceSchedule } from '../utils/schedule';
import { todayString } from '../utils/date';
import { DEFAULT_CATEGORIES, appendCategory, removeCategory } from '../utils/category';

const getTodoStatus = (todo: Todo): '완료' | '진행' | '대기' => {
  if (todo.done) return '완료';
  if (todo.time) return '진행';
  return '대기';
};

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  const addCategory = useCallback((name: string) => {
    const next = appendCategory(categories, name);
    setCategories(next);
    return name.trim();
  }, [categories]);

  const deleteCategory = useCallback((name: string) => {
    const next = removeCategory(categories, todos, name);
    setCategories(next.categories);
    setTodos(next.todos);
  }, [categories, todos]);

  const addTodo = useCallback((params: TodoInput) => {
    if (!params.title.trim()) return;
    const entries = buildTodos(params);
    setTodos(prev => [...entries, ...prev]);
  }, []);

  const editTodo = useCallback((id: string, params: TodoInput) => {
    if (!params.title.trim()) return;
    setTodos(prev => replaceSchedule(prev, id, params));
  }, []);

  const deleteSchedule = useCallback((id: string) => {
    setTodos(prev => {
      const target = prev.find(t => t.id === id);
      return prev.filter(t => target?.scheduleId ? t.scheduleId !== target.scheduleId : t.id !== id);
    });
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(t =>
      t.id === id
        ? { ...t, done: !t.done, updatedAt: new Date().toISOString() }
        : t
    ));
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  const todayTodos = todos.filter(t => {
    const today = todayString();
    return !t.date || t.date === today;
  });

  const doneCount = todos.filter(t => t.done).length;

  return {
    categories,
    addCategory,
    deleteCategory,
    todos,
    todayTodos,
    doneCount,
    addTodo,
    editTodo,
    toggleTodo,
    deleteTodo,
    deleteSchedule,
    getTodoStatus,
  };
}
