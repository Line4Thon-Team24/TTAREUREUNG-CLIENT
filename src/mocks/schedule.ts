import type {
  DoseStatus,
  ScheduleMedicine,
  ScheduleSlot,
} from '@/types/schedule';
import { toDateString } from '@/utils/date';
import pillBlisterImage from '@/assets/images/pill-blister.jpg';
import pillAssortedImage from '@/assets/images/pill-assorted.jpg';

// API 연동 전 디자인 확인용 고정 샘플 (Figma 복용 일정 화면과 같은 내용)
// → 약 ID는 시니어에게 미리 등록된 약(mocks/medicines.ts)과 같음
// → 김순자: 복용 완료·일부 복용(미복용 포함)·복용 중 / 박종옥: 복용 완료·복용 중·복용 예정

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

// 박종옥의 약(6~8)은 김순자의 약(1·4·5)과 같은 카드 정보 사용
const SAME_CARD: Record<number, number> = { 6: 1, 7: 4, 8: 5 };

const createMedicine = (
  slotId: string,
  medicineId: number,
  status: DoseStatus
): ScheduleMedicine => ({
  id: `${slotId}-${medicineId}`,
  medicineId,
  ...cardInfo[SAME_CARD[medicineId] ?? medicineId],
  // 디자인처럼 미복용 약은 다른 사진으로 구분
  imageUrl: status === 'missed' ? pillAssortedImage : pillBlisterImage,
  status,
});

// 김순자: 아침·점심·저녁 3개 시간대 (점심은 카드가 3개를 넘어 가로로 넘겨 보는 경우)
const kimSlots: ScheduleSlot[] = [
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

// 박종옥: 아침 복용 완료 → 점심 복용 중 → 저녁 복용 예정
const parkSlots: ScheduleSlot[] = [
  {
    id: 'morning',
    mealTime: 'morning',
    time: '08:00',
    timingLabel: '아침 식후',
    medicines: [
      createMedicine('morning', 6, 'taken'),
      createMedicine('morning', 7, 'taken'),
    ],
  },
  {
    id: 'lunch',
    mealTime: 'lunch',
    time: '13:00',
    timingLabel: '점심 식후',
    medicines: [
      createMedicine('lunch', 6, 'taking'),
      createMedicine('lunch', 7, 'taking'),
    ],
  },
  {
    id: 'dinner',
    mealTime: 'dinner',
    time: '19:00',
    timingLabel: '식전 30분',
    medicines: [
      createMedicine('dinner', 7, 'scheduled'),
      createMedicine('dinner', 8, 'scheduled'),
    ],
  },
];

const sampleSchedules: Record<number, ScheduleSlot[]> = {
  1: kimSlots,
  2: parkSlots,
};

// 시니어·날짜별 복용 일정 (오늘 이후 날짜는 모두 복용 예정으로 표시)
export const getDailySchedule = (
  seniorId: number,
  date: Date
): ScheduleSlot[] => {
  const slots = sampleSchedules[seniorId] ?? [];
  const isFuture = toDateString(date) > toDateString(new Date());
  if (!isFuture) return slots;
  return slots.map((slot) => ({
    ...slot,
    medicines: slot.medicines.map((medicine) => ({
      ...medicine,
      imageUrl: pillBlisterImage,
      status: 'scheduled',
    })),
  }));
};
