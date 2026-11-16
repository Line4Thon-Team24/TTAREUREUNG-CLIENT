import type { Gender } from '@/types/senior';

export const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: '여성', value: 'female' },
  { label: '남성', value: 'male' },
];

// 카드 표시용 (예: 'female' → '여')
export const GENDER_SHORT_LABELS: Record<Gender, string> = {
  female: '여',
  male: '남',
};
