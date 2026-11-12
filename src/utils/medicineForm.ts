import type { MedicineForm } from '@/types/medicine';

// 필수 입력값이 모두 채워졌는지 검사 (직접 입력은 약 이름도 필수)
export const isMedicineFormValid = (form: MedicineForm, isManual: boolean) =>
  (!isManual || form.name.trim() !== '') &&
  form.displayName.trim() !== '' &&
  form.storageLocation.trim() !== '' &&
  form.endDate >= form.startDate;
