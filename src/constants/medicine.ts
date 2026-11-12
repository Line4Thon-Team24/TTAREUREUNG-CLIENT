import type { DoseInterval, DoseTiming } from '@/types/medicine';

export const INTERVAL_OPTIONS: { label: string; value: DoseInterval }[] = [
  { label: '매일', value: 'daily' },
  { label: '이틀에 한 번', value: 'everyOtherDay' },
  { label: '일주일에 한 번', value: 'weekly' },
];

export const TIMES_PER_DAY_OPTIONS = [1, 2, 3].map((count) => ({
  label: `하루 ${count}회`,
  value: String(count),
}));

export const TIMING_OPTIONS: { label: string; value: DoseTiming }[] = [
  { label: '식전 30분', value: 'beforeMeal' },
  { label: '식후 30분', value: 'afterMeal' },
  { label: '식사 직후', value: 'withMeal' },
  { label: '취침 전', value: 'bedtime' },
];

// 하루 복용 횟수별 자동 알림 시간
const MORNING = { label: '아침', time: '09:00', color: '#FBBF24' };
const LUNCH = { label: '점심', time: '13:00', color: '#FB923C' };
const DINNER = { label: '저녁', time: '19:00', color: '#6366F1' };

export const NOTIFICATION_TIMES: Record<number, (typeof MORNING)[]> = {
  1: [MORNING],
  2: [MORNING, DINNER],
  3: [MORNING, LUNCH, DINNER],
};
