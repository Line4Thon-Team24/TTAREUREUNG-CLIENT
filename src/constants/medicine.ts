import type { DoseInterval, DoseTiming } from '@/types/medicine';
import type { DoseTimes, TimeSlot } from '@/types/schedule';

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

// 1회 복용량 (개수 + 단위, 저장 값 예: '1정')
export const DOSE_COUNT_OPTIONS = [1, 2, 3, 4, 5].map((count) => ({
  label: `${count}개`,
  value: String(count),
}));

export const DOSE_UNITS = ['정', '캡슐', '포'] as const;

export const DOSE_UNIT_OPTIONS = DOSE_UNITS.map((unit) => ({
  label: unit,
  value: unit,
}));

// 서버 기본 회차 시각 (불러오기 전·실패 시 표시)
export const DEFAULT_DOSE_TIMES: DoseTimes = {
  MORNING: '08:00',
  LUNCH: '12:30',
  DINNER: '18:30',
  BEFORE_SLEEP: '22:00',
};

// 회차별 자동 알림 표시
export const NOTIFICATION_SLOT_STYLES: Record<
  TimeSlot,
  { label: string; color: string }
> = {
  MORNING: { label: '아침', color: '#FBBF24' },
  LUNCH: { label: '점심', color: '#FB923C' },
  DINNER: { label: '저녁', color: '#6366F1' },
  BEFORE_SLEEP: { label: '자기 전', color: '#8B5CF6' },
};

// 하루 복용 횟수별 알림 회차 (약 등록 시 보내는 회차와 같은 규칙)
export const NOTIFICATION_SLOTS: Record<number, TimeSlot[]> = {
  1: ['MORNING'],
  2: ['MORNING', 'DINNER'],
  3: ['MORNING', 'LUNCH', 'DINNER'],
};

// 복용 시점이 취침 전이면 자기 전 1회
export const BEDTIME_NOTIFICATION_SLOTS: TimeSlot[] = ['BEFORE_SLEEP'];

// 저장된 값 → 화면 표시 문구 (예: 'daily' → '매일')
export const getIntervalLabel = (value: DoseInterval) =>
  INTERVAL_OPTIONS.find((option) => option.value === value)?.label ?? '';

export const getTimingLabel = (value: DoseTiming) =>
  TIMING_OPTIONS.find((option) => option.value === value)?.label ?? '';
