import { Tag, TagId } from '../types';

export const TAGS: Tag[] = [
  { id: 'work',     label: '업무', color: '#1D4ED8', bgColor: '#DBEAFE' },
  { id: 'personal', label: '개인', color: '#7C3AED', bgColor: '#EDE9FE' },
  { id: 'urgent',   label: '긴급', color: '#DC2626', bgColor: '#FEE2E2' },
];

export const TAG_MAP: Record<TagId, Tag> = {
  work:     TAGS[0],
  personal: TAGS[1],
  urgent:   TAGS[2],
};
