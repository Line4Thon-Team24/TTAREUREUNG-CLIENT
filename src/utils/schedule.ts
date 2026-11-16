import type {
  DoseStatus,
  ScheduleMedicine,
  SlotStatus,
} from '@/types/schedule';

// 시간대에 속한 약들의 상태로 시간대 전체 상태 계산
export const getSlotStatus = (statuses: DoseStatus[]): SlotStatus => {
  if (statuses.length === 0) return 'scheduled';
  const [first] = statuses;
  if (statuses.every((status) => status === first)) return first;
  if (statuses.includes('taking')) return 'taking';
  // 먹은 약과 안 먹은 약이 섞여 있음
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

// 미복용 약을 맨 앞으로 (눈에 잘 띄도록, 나머지는 원래 순서 유지)
export const sortMissedFirst = (medicines: ScheduleMedicine[]) => [
  ...medicines.filter((medicine) => medicine.status === 'missed'),
  ...medicines.filter((medicine) => medicine.status !== 'missed'),
];
