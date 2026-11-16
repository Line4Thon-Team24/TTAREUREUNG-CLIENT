import type {
  DoseStatus,
  ScheduleMedicine,
  ScheduleSlot,
} from '@/types/schedule';
import { toDateString } from '@/utils/date';
import pillBlisterImage from '@/assets/images/pill-blister.jpg';
import pillAssortedImage from '@/assets/images/pill-assorted.jpg';

// API 연동 전 디자인 확인용 고정 샘플 (Figma 복용 일정 화면과 같은 내용)
// → 약 ID는 김순자 시니어에게 미리 등록된 약(mocks/medicines.ts)과 같음

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

// 아침·점심·저녁 3개 시간대 (점심은 카드가 3개를 넘어 가로로 넘겨 보는 경우)
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
    id: 'lunch',
    mealTime: 'lunch',
    time: '14:00',
    timingLabel: '점심 식후',
    medicines: [
      createMedicine('lunch', 2, 'missed'),
      createMedicine('lunch', 3, 'taken'),
      createMedicine('lunch', 1, 'taken'),
      createMedicine('lunch', 5, 'missed'),
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
