import { Todo, TodoInput } from '../types';
import { buildTodos, replaceSchedule, removeOccurrence, normalizeTime } from '../utils/schedule';
import { toDateString } from '../utils/date';
import { DEFAULT_CATEGORIES, appendCategory, removeCategory } from '../utils/category';
import { usePersistentState } from './usePersistentState';
import { useLocalClock } from './useLocalClock';
import { decodeTodoState, TodoState } from '../utils/storageSchema';

const INITIAL: TodoState = { version: 1, todos: [], categories: DEFAULT_CATEGORIES };
export function useTodos() {
  const saved = usePersistentState('dokdoki.todos.v1', INITIAL, decodeTodoState);
  const { todos, categories } = saved.data;
  const now = useLocalClock();
  const addCategory = (name: string) => {
    saved.update(prev => ({ ...prev, categories: appendCategory(prev.categories, name) }));
    return name.trim();
  };
  const deleteCategory = (name: string) => saved.update(prev => ({ ...prev, ...removeCategory(prev.categories, prev.todos, name) }));
  const addTodo = (params: TodoInput) => {
    if (!params.title.trim()) return;
    saved.update(prev => ({ ...prev, todos: [...buildTodos({ ...params, category: prev.categories.includes(params.category) ? params.category : '기타' }), ...prev.todos] }));
  };
  const editTodo = (id: string, params: TodoInput) => {
    if (!params.title.trim()) return;
    saved.update(prev => ({ ...prev, todos: replaceSchedule(prev.todos, id, params) }));
  };
  const deleteSchedule = (id: string) => saved.update(prev => {
    const target = prev.todos.find(t => t.id === id);
    return { ...prev, todos: prev.todos.filter(t => target?.scheduleId ? t.scheduleId !== target.scheduleId : t.id !== id) };
  });
  const toggleTodo = (id: string) => saved.update(prev => ({ ...prev, todos: prev.todos.map(t => t.id === id
    ? { ...t, done: !t.done, completedAt: t.done ? undefined : new Date().toISOString(), updatedAt: new Date().toISOString() } : t) }));
  const deleteTodo = (id: string) => saved.update(prev => ({ ...prev, todos: removeOccurrence(prev.todos, id) }));
  const getTodoStatus = (todo: Todo): '완료' | '진행' | '대기' => {
    if (todo.done) return '완료';
    if (!todo.date || !todo.time) return '대기';
    return new Date(`${todo.date}T${normalizeTime(todo.time)}:00`).getTime() <= now.getTime() ? '진행' : '대기';
  };
  return {
    todos, categories, now, addCategory, deleteCategory, addTodo, editTodo, toggleTodo, deleteTodo, deleteSchedule, getTodoStatus,
    todayTodos: todos.filter(t => !t.date || t.date === toDateString(now)),
    doneCount: todos.filter(t => t.done).length,
    storage: { loaded: saved.loaded, saving: saved.saving, error: saved.error, retry: saved.retry },
  };
}
