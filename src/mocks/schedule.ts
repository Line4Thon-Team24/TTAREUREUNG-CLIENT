import type { Medicine } from '@/types/medicine';
import type {
  DoseStatus,
  ScheduleMedicine,
  ScheduleSlot,
} from '@/types/schedule';
import { toDateString } from '@/utils/date';
import pillBlisterImage from '@/assets/images/pill-blister.jpg';
import pillAssortedImage from '@/assets/images/pill-assorted.jpg';
import prescriptionSampleImage from '@/assets/images/prescription-sample.png';

// API 연동 전 디자인 확인용 고정 샘플 (Figma 복용 일정 화면과 같은 내용)
// → 등록한 약과는 상관없이 항상 같은 일정이 보임

const samplePrescription = {
  fileName: '처방전.png',
  imageUrl: prescriptionSampleImage,
};

// 약 상세 팝업에서 보여줄 약 정보
const sampleMedicines: Medicine[] = [
  {
    id: 1,
    seniorId: 0,
    source: 'recognized',
    prescription: samplePrescription,
    registeredAt: '2026-11-05T09:00:00.000Z',
    name: '노바스크정 5mg',
    category: '혈압강하제',
    effect: '혈관 확장 / 혈압 조절',
    reason:
      '고혈압 조절을 위한 처방 약입니다. 매일 같은 시간에 복용해야 합니다.',
    displayName: '혈압약 (노바스크)',
    storageLocation: '거실 서랍',
    startDate: '2026-08-12',
    endDate: '2027-02-12',
    interval: 'daily',
    timesPerDay: 2,
    timing: 'afterMeal',
  },
  {
    id: 2,
    seniorId: 0,
    source: 'recognized',
    prescription: samplePrescription,
    registeredAt: '2026-11-05T09:00:00.000Z',
    name: '아미노브푸로펜 200mg',
    category: '진통소염제',
    effect: '관절 연골 보호 / 통증 완화',
    reason:
      '무릎 관절 연골 마모로 인한 만성 통증 완화 및 염증 억제를 위한 처방 약입니다. 속쓰림 방지를 위해 반드시 매 식사 30분 후 규칙적으로 복용해야합니다.',
    displayName: '관절염 소염진통제',
    storageLocation: '안방 협탁',
    startDate: '2026-08-12',
    endDate: '2027-02-12',
    interval: 'daily',
    timesPerDay: 2,
    timing: 'afterMeal',
  },
  {
    id: 3,
    seniorId: 0,
    source: 'recognized',
    prescription: samplePrescription,
    registeredAt: '2026-11-05T09:00:00.000Z',
    name: '베아제정',
    category: '소화효소제',
    effect: '소화 불량 개선',
    reason: '식후 더부룩함을 줄이기 위한 처방 약입니다.',
    displayName: '소화효소제',
    storageLocation: '주방 선반',
    startDate: '2026-08-12',
    endDate: '2027-02-12',
    interval: 'daily',
    timesPerDay: 1,
    timing: 'afterMeal',
  },
  {
    id: 4,
    seniorId: 0,
    source: 'recognized',
    prescription: samplePrescription,
    registeredAt: '2026-11-05T09:00:00.000Z',
    name: '메트포르민정 500mg',
    category: '당뇨병용제',
    effect: '혈당 조절',
    reason: '혈당 조절을 위한 처방 약입니다. 식사 30분 전에 복용해야 합니다.',
    displayName: '당뇨약 (메트포르민)',
    storageLocation: '주방 선반',
    startDate: '2026-08-12',
    endDate: '2027-02-12',
    interval: 'daily',
    timesPerDay: 2,
    timing: 'beforeMeal',
  },
  {
    id: 5,
    seniorId: 0,
    source: 'recognized',
    prescription: samplePrescription,
    registeredAt: '2026-11-05T09:00:00.000Z',
    name: '리피토정 20mg',
    category: '고지혈증치료제',
    effect: '콜레스테롤 수치 개선',
    reason: '콜레스테롤 수치를 낮추기 위한 처방 약입니다.',
    displayName: '콜레스테롤 저하제',
    storageLocation: '안방 협탁',
    startDate: '2026-08-12',
    endDate: '2027-02-12',
    interval: 'daily',
    timesPerDay: 1,
    timing: 'bedtime',
  },
];

// 카드에 보여줄 약 정보 (약 ID 기준)
const cardInfo: Record<
  number,
  Pick<ScheduleMedicine, 'displayName' | 'dosage' | 'amount' | 'shape'>
> = {
  1: {
    displayName: '혈압약 (노바스크)',
    dosage: '5mg',
    amount: '1정',
    shape: 'capsule',
  },
  2: {
    displayName: '관절염 소염진통제',
    dosage: '100mg',
    amount: '1정',
    shape: 'tablet',
  },
  3: {
    displayName: '소화효소제',
    dosage: '50g',
    amount: '1포',
    shape: 'powder',
  },
  4: {
    displayName: '당뇨약 (메트포르민)',
    dosage: '500mg',
    amount: '1정',
    shape: 'tablet',
  },
  5: {
    displayName: '콜레스테롤 저하제',
    dosage: '20mg',
    amount: '1정',
    shape: 'tablet',
  },
};

const createMedicine = (
  slotId: string,
  medicineId: number,
  status: DoseStatus
): ScheduleMedicine => ({
  id: `${slotId}-${medicineId}`,
  medicineId,
  ...cardInfo[medicineId],
  // 디자인처럼 미복용 약은 다른 사진으로 구분
  imageUrl: status === 'missed' ? pillAssortedImage : pillBlisterImage,
  status,
});

const sampleSlots: ScheduleSlot[] = [
  {
    id: 'morning',
    mealTime: 'morning',
    time: '11:00',
    timingLabel: '아침 식후',
    medicines: [
      createMedicine('morning', 1, 'taken'),
      createMedicine('morning', 4, 'taken'),
    ],
  },
  {
    id: 'lunch-1',
    mealTime: 'lunch',
    time: '14:00',
    timingLabel: '점심 식후',
    medicines: [
      createMedicine('lunch-1', 2, 'missed'),
      createMedicine('lunch-1', 3, 'taken'),
      createMedicine('lunch-1', 1, 'taken'),
    ],
  },
  {
    id: 'lunch-2',
    mealTime: 'lunch',
    time: '15:00',
    timingLabel: '점심 식후',
    medicines: [
      createMedicine('lunch-2', 2, 'missed'),
      createMedicine('lunch-2', 5, 'missed'),
    ],
  },
  {
    id: 'dinner',
    mealTime: 'dinner',
    time: '17:00',
    timingLabel: '식전 30분',
    medicines: [
      createMedicine('dinner', 4, 'taking'),
      createMedicine('dinner', 1, 'taking'),
    ],
  },
  {
    id: 'night',
    mealTime: 'night',
    time: '22:00',
    timingLabel: '취침 전',
    medicines: [createMedicine('night', 5, 'scheduled')],
  },
];

// 날짜별 복용 일정 (오늘 이후 날짜는 모두 복용 예정으로 표시)
export const getDailySchedule = (date: Date): ScheduleSlot[] => {
  const isFuture = toDateString(date) > toDateString(new Date());
  if (!isFuture) return sampleSlots;
  return sampleSlots.map((slot) => ({
    ...slot,
    medicines: slot.medicines.map((medicine) => ({
      ...medicine,
      imageUrl: pillBlisterImage,
      status: 'scheduled',
    })),
  }));
};

// 약 상세 팝업용 약 정보
export const getScheduleMedicineDetail = (medicineId: number) =>
  sampleMedicines.find((medicine) => medicine.id === medicineId);
