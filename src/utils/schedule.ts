import type { Medicine } from '@/types/medicine';
import type {
  DoseStatus,
  ScheduleMedicine,
  ScheduleSlot,
  SlotStatus,
} from '@/types/schedule';
import { diffDays } from '@/utils/date';

// 약 상태들로 시간대 상태 계산
export const getSlotStatus = (statuses: DoseStatus[]): SlotStatus => {
  if (statuses.length === 0) return 'scheduled';
  const [first] = statuses;
  if (statuses.every((status) => status === first)) return first;
  if (statuses.includes('taking')) return 'taking';
  // 섞여 있으면 일부 복용
  if (statuses.includes('taken')) return 'partial';
  return 'missed';
};

// 'HH:mm' → '오전 11시' / '오후 2시 30분'
export const formatKoreanTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours < 12 ? '오전' : '오후';
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  return `${period} ${hour}시${minutes > 0 ? ` ${minutes}분` : ''}`;
};

// 미복용 약을 맨 앞으로
export const sortMissedFirst = (medicines: ScheduleMedicine[]) => [
  ...medicines.filter((medicine) => medicine.status === 'missed'),
  ...medicines.filter((medicine) => medicine.status !== 'missed'),
];

// 복용 간격별 주기 (일)
const INTERVAL_DAYS = { daily: 1, everyOtherDay: 2, weekly: 7 } as const;

// 해당 날짜(YYYY-MM-DD)에 먹는 약인지
export const isMedicineOnDate = (medicine: Medicine, date: string) => {
  if (date < medicine.startDate || date > medicine.endDate) return false;
  return (
    diffDays(medicine.startDate, date) % INTERVAL_DAYS[medicine.interval] === 0
  );
};

// 하루 복약 요약 (섭취 횟수·달성률)
// 놓친 약은 시간대 전체를 놓쳤는지(missed), 일부만 놓쳤는지(partialMissed)로 구분
export const getScheduleSummary = (slots: ScheduleSlot[]) => {
  const summary = {
    slotCount: slots.length,
    total: 0,
    taken: 0,
    missed: 0,
    partialMissed: 0,
  };
  for (const slot of slots) {
    const statuses = slot.medicines.map((medicine) => medicine.status);
    const isPartial = statuses.includes('taken') && statuses.includes('missed');
    for (const { status } of slot.medicines) {
      summary.total += 1;
      if (status === 'taken') summary.taken += 1;
      if (status === 'missed') {
        if (isPartial) summary.partialMissed += 1;
        else summary.missed += 1;
      }
    }
  }
  return summary;
};
