export const Colors = {
  primary:        '#1C2A3A',
  background:     '#F4F6F9',
  surface:        '#FFFFFF',
  textPrimary:    '#1F2937',
  textSecondary:  '#6B7280',
  textTertiary:   '#9CA3AF',
  border:         '#E5E7EB',
  blue:           '#3B82F6',
  green:          '#22C55E',
  amber:          '#F59E0B',
  red:            '#EF4444',
  overlay:        'rgba(0,0,0,0.45)',
} as const;

export const CategoryColors: Record<string, { color: string; bg: string }> = {
  '과제':     { color: '#1C2A3A', bg: '#E8EBF0' },
  '업무':     { color: '#3B82F6', bg: '#DBEAFE' },
  '개인 루틴': { color: '#F59E0B', bg: '#FEF3C7' },
  '학습':     { color: '#22C55E', bg: '#DCFCE7' },
  '기타':     { color: '#6B7280', bg: '#F3F4F6' },
};

export const StatusColors = {
  완료: { bg: '#DCFCE7', text: '#16A34A' },
  진행: { bg: '#DBEAFE', text: '#2563EB' },
  대기: { bg: '#F3F4F6', text: '#6B7280' },
} as const;
