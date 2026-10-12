import { useState, useCallback } from 'react';
import { Todo, Category } from '../types';

const generateId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;

const getTodoStatus = (todo: Todo): '완료' | '진행' | '대기' => {
  if (todo.done) return '완료';
  if (todo.time) return '진행';
  return '대기';
};

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = useCallback((params: {
    title: string;
    category: Category;
    date?: string;
    time?: string;
    memo?: string;
  }) => {
    const trimmed = params.title.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    const newTodo: Todo = {
      id: generateId(),
      title: trimmed,
      category: params.category,
      date: params.date,
      time: params.time,
      memo: params.memo,
      done: false,
      createdAt: now,
      updatedAt: now,
    };
    setTodos(prev => [newTodo, ...prev]);
  }, []);

  const editTodo = useCallback((id: string, params: {
    title: string;
    category: Category;
    date?: string;
    time?: string;
    memo?: string;
  }) => {
    const trimmed = params.title.trim();
    if (!trimmed) return;
    setTodos(prev => prev.map(t =>
      t.id === id
        ? { ...t, ...params, title: trimmed, updatedAt: new Date().toISOString() }
        : t
    ));
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
    const today = new Date().toISOString().split('T')[0];
    return !t.date || t.date === today;
  });

  const doneCount = todos.filter(t => t.done).length;

  return {
    todos,
    todayTodos,
    doneCount,
    addTodo,
    editTodo,
    toggleTodo,
    deleteTodo,
    getTodoStatus,
  };
}
