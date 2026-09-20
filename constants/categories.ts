import { TodoCategory } from '../types';

interface CategoryOption {
  id: TodoCategory;
  label: string;
  color: string;
  backgroundColor: string;
}

// 선택 화면과 목록이 같은 이름과 색상을 사용합니다.
export const TODO_CATEGORIES: readonly CategoryOption[] = [
  { id: 'none', label: '미분류', color: '#475569', backgroundColor: '#F1F5F9' },
  { id: 'school', label: '학교', color: '#1D4ED8', backgroundColor: '#EFF6FF' },
  { id: 'personal', label: '개인', color: '#166534', backgroundColor: '#F0FDF4' },
  { id: 'appointment', label: '약속', color: '#9A3412', backgroundColor: '#FFF7ED' },
];

// 이전 버전 데이터처럼 카테고리가 없으면 미분류로 처리합니다.
export function normalizeCategory(value: unknown): TodoCategory {
  return TODO_CATEGORIES.find(option => option.id === value)?.id ?? 'none';
}

export function getCategory(value: unknown): CategoryOption {
  return TODO_CATEGORIES.find(option => option.id === value) ?? TODO_CATEGORIES[0];
}
