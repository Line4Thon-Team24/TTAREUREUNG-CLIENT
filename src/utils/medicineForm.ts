import type { Medicine, MedicineForm } from '@/types/medicine';
import type { TimeSlot } from '@/types/schedule';
import { DOSE_COUNT_OPTIONS, DOSE_UNITS } from '@/constants/medicine';
import { addDaysToDateString, toDateString } from '@/utils/date';

// 빈 약 정보 (직접 입력용, 오늘부터 일주일)
export const createEmptyMedicineForm = (): MedicineForm => {
  const today = toDateString(new Date());
  return {
    name: '',
    category: '',
    effect: '',
    reason: '',
    displayName: '',
    storageLocation: '',
    startDate: today,
    endDate: addDaysToDateString(today, 6),
    interval: 'daily',
    timesPerDay: 3,
    timing: 'afterMeal',
    doseAmount: '1정',
  };
};

// 필수 입력값이 모두 채워졌는지 검사 (직접 입력은 약 이름도 필수)
export const isMedicineFormValid = (form: MedicineForm, isManual: boolean) =>
  (!isManual || form.name.trim() !== '') &&
  form.displayName.trim() !== '' &&
  form.storageLocation.trim() !== '' &&
  form.endDate >= form.startDate;

// 저장할 때 앞뒤 공백 제거
export const trimMedicineForm = (form: MedicineForm): MedicineForm => ({
  ...form,
  name: form.name.trim(),
  displayName: form.displayName.trim(),
  storageLocation: form.storageLocation.trim(),
});

// 저장된 약 → 수정 화면에서 다루는 입력값
export const toMedicineForm = (medicine: Medicine): MedicineForm => ({
  name: medicine.name,
  category: medicine.category,
  effect: medicine.effect,
  reason: medicine.reason,
  displayName: medicine.displayName,
  storageLocation: medicine.storageLocation,
  startDate: medicine.startDate,
  endDate: medicine.endDate,
  interval: medicine.interval,
  timesPerDay: medicine.timesPerDay,
  timing: medicine.timing,
  doseAmount: medicine.doseAmount,
});

// 입력값이 처음과 달라졌는지 비교
export const isMedicineFormChanged = (
  before: MedicineForm,
  after: MedicineForm
) =>
  (Object.keys(before) as (keyof MedicineForm)[]).some(
    (key) => before[key] !== after[key]
  );

// '2정' → { count: '2', unit: '정' } (선택지에 없는 형식이면 null)
export const parseDoseAmount = (value: string) => {
  const match = /^(\d+)\s*(.+)$/.exec(value.trim());
  if (!match) return null;
  const [, count, unit] = match;
  const isOption =
    DOSE_COUNT_OPTIONS.some((option) => option.value === count) &&
    DOSE_UNITS.some((option) => option === unit);
  return isOption ? { count, unit } : null;
};

// 하루 복용 횟수 → 복용 회차 (취침 전이면 자기 전 하나, 약 등록 요청·알림 시간 표시에 같이 사용)
export const getMealTimeSlots = ({
  timing,
  timesPerDay,
}: Pick<MedicineForm, 'timing' | 'timesPerDay'>): TimeSlot[] => {
  if (timing === 'bedtime') return ['BEFORE_SLEEP'];
  if (timesPerDay >= 3) return ['MORNING', 'LUNCH', 'DINNER'];
  if (timesPerDay === 2) return ['MORNING', 'DINNER'];
  return ['MORNING'];
};
