import { Tag } from '../types';

export const DEFAULT_TAGS: Tag[] = [
  { id: 'work',     label: '업무', color: '#1D4ED8', bgColor: '#DBEAFE' },
  { id: 'personal', label: '개인', color: '#7C3AED', bgColor: '#EDE9FE' },
  { id: 'urgent',   label: '긴급', color: '#DC2626', bgColor: '#FEE2E2' },
];

export const COLOR_PALETTE = [
  { color: '#1D4ED8', bgColor: '#DBEAFE' },
  { color: '#7C3AED', bgColor: '#EDE9FE' },
  { color: '#DC2626', bgColor: '#FEE2E2' },
  { color: '#059669', bgColor: '#D1FAE5' },
  { color: '#D97706', bgColor: '#FEF3C7' },
  { color: '#DB2777', bgColor: '#FCE7F3' },
  { color: '#0891B2', bgColor: '#CFFAFE' },
  { color: '#4B5563', bgColor: '#F3F4F6' },
] as const;
