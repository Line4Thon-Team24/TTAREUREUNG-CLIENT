import type { DoseResult, TargetMedicine } from '@/types/recognition';
import prescriptionSampleImage from '@/assets/images/prescription-sample.png';
import medicineSampleImage from '@/assets/images/medicine-sample.png';

// 찾아야 하는 약 목업 (순서대로)
export const mockTargetMedicines: TargetMedicine[] = [
  {
    id: 1,
    order: 1,
    displayName: '처방전',
    appearance: '',
    imageUrl: prescriptionSampleImage,
    remainingCount: 5,
    storageGuide: {
      prefix: '약 상자 위에서',
      highlight: '2번째 칸',
      suffix: '에 있는 처방전',
    },
    doseAmount: '점심 약 1포',
    doseGuide: '점심 약 한 봉지를 복용해 주세요',
  },
  {
    id: 2,
    order: 2,
    displayName: '관절약',
    appearance: '파란색 원기둥',
    imageUrl: medicineSampleImage,
    remainingCount: 4,
    storageGuide: {
      prefix: '약 상자 위에서',
      highlight: '2번째 칸',
      suffix: '에 있는 파란 원기둥',
    },
    doseAmount: '2정',
    doseGuide: '관절약 2정을 복용해 주세요',
  },
];

// 오늘 복용 일정 목록 (다음 약 찾기·복용 안내에서 사용)
export const mockMedicineByOrder = (order: number) =>
  mockTargetMedicines.find((medicine) => medicine.order === order) ??
  mockTargetMedicines[0];

// 인식 성공 문구에 쓰는 현재 복용 시점 안내
export const mockCurrentDoseLabel = '혈압약 (점심 식후 30분)';

// 복용 결과 목업
export const mockDoseResults: Record<DoseResult['status'], DoseResult> = {
  complete: {
    status: 'complete',
    scheduledAt: '2026-11-08T15:00:00',
    takenCount: 5,
    totalCount: 5,
    nextCallAt: '2026-11-08T18:00:00',
    nextCallLabel: '저녁 식후 약 (혈압약 · 소화제)',
    minutesUntilNextCall: 180,
  },
  partial: {
    status: 'partial',
    scheduledAt: '2026-11-08T15:00:00',
    takenCount: 3,
    totalCount: 5,
    nextCallAt: '2026-11-08T18:00:00',
    nextCallLabel: '저녁 식후 약 (혈압약 · 소화제)',
    minutesUntilNextCall: 180,
  },
  missed: {
    status: 'missed',
    scheduledAt: '2026-11-08T15:00:00',
    takenCount: 0,
    totalCount: 5,
    nextCallAt: '2026-11-08T15:10:00',
    nextCallLabel: '점심 식후 약 (혈압약 · 소화제)',
    minutesUntilNextCall: 10,
  },
};
