import type {
  DoseStatus,
  ScheduleMedicine,
  SlotStatus,
} from '@/types/schedule';

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
