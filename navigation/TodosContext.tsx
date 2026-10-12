import React, { createContext, useContext } from 'react';
import { useTodos } from '../hooks/useTodos';

type TodosContextType = ReturnType<typeof useTodos>;
const TodosContext = createContext<TodosContextType | null>(null);

export function TodosProvider({ children }: { children: React.ReactNode }) {
  const todos = useTodos();
  return <TodosContext.Provider value={todos}>{children}</TodosContext.Provider>;
}

export function useTodosContext() {
  const ctx = useContext(TodosContext);
  if (!ctx) throw new Error('useTodosContext must be used within TodosProvider');
  return ctx;
}
