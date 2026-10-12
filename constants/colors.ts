export const Colors = {
  // 브랜드·강조
  primary:         '#445B74',
  primaryDark:     '#2E3D4F',
  primaryDarker:   '#1E2933',

  // 화면·카드 배경
  background:      '#FFFEF8',
  surface:         '#FFFFFF',
  pageBg:          '#FDFCF7',

  // 텍스트
  textPrimary:     '#23262B',
  textSecondary:   '#6B7280',
  textDisabled:    '#9AA1AC',

  // 구조
  border:          '#E7E2D6',
  overlay:         'rgba(0,0,0,0.45)',
  badgeGray:       '#9AA1AC',

  // 상태
  danger:          '#E17261',
  warning:         '#D97706',
  warningBg:       '#FEF3C7',

  // 필터 탭
  tabActiveBg:     '#445B74',
  tabActiveText:   '#FFFFFF',
  tabInactiveText: '#6B7280',
} as const;

// 카테고리 4색
export const CategoryColors = {
  design:   { color: '#E17261', bgColor: '#FDECEA', label: '디자인' },
  study:    { color: '#6466E9', bgColor: '#EDEDFC', label: '공부·학업' },
  dev:      { color: '#439288', bgColor: '#E6F3F2', label: '개발' },
  personal: { color: '#5EC269', bgColor: '#EBF7EC', label: '개인·취미' },
} as const;

export type CategoryId = keyof typeof CategoryColors;
