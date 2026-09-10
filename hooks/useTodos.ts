import { useState, useCallback } from 'react';
import { Todo, Filter } from '../types';

const generateId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

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

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, done: !todo.done, updatedAt: Date.now() }
          : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.done;
    if (filter === 'done') return todo.done;
    return true;
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
