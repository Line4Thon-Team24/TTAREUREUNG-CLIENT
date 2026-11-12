import type { Medicine, MedicineForm } from '@/types/medicine';

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
});

// 입력값이 처음과 달라졌는지 비교
export const isMedicineFormChanged = (
  before: MedicineForm,
  after: MedicineForm
) =>
  (Object.keys(before) as (keyof MedicineForm)[]).some(
    (key) => before[key] !== after[key]
  );
