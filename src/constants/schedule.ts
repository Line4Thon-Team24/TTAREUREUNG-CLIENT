import {
  Check,
  Clock,
  Ellipsis,
  TriangleAlert,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { DoseStatus, SlotStatus } from '@/types/schedule';

// 시간대 상태별 스타일
type SlotStatusStyle = {
  label: string;
  Icon: LucideIcon;
  textColor: string; // 배지·시간대 이름 글씨
  badgeClassName: string; // 배지 배경·테두리
  markerClassName: string; // 타임라인 점
};

export const SLOT_STATUS_STYLES: Record<SlotStatus, SlotStatusStyle> = {
  taken: {
    label: '복용 완료',
    Icon: Check,
    textColor: 'text-[#01A16A]',
    badgeClassName: 'bg-[#E7F6EC] border-[#CDEBD8]',
    markerClassName: 'bg-[#01A16A] ring-[#E7F6EC]',
  },
  partial: {
    label: '일부 복용',
    Icon: TriangleAlert,
    textColor: 'text-[#D97706]',
    badgeClassName: 'bg-[#FFF4E0] border-[#FCD34D]',
    markerClassName: 'bg-[#F59E0C] ring-[#FEF3C7]',
  },
  missed: {
    label: '미복용',
    Icon: X,
    textColor: 'text-[#E5484D]',
    badgeClassName: 'bg-[#FFEEEE] border-[#E5484D]/50',
    markerClassName: 'bg-[#F43F5E] ring-[#FB7185]/30',
  },
  taking: {
    label: '복용 중',
    Icon: Ellipsis,
    textColor: 'text-[#3182F6]',
    badgeClassName: 'bg-[#E8F3FF] border-[#3182F6]/50',
    markerClassName: 'bg-[#2563EB] ring-[#DBEAFE]',
  },
  scheduled: {
    label: '복용 예정',
    Icon: Clock,
    textColor: 'text-[#8B95A1]',
    badgeClassName: 'bg-[#F2F4F6] border-[#8B95A1]/50',
    markerClassName: 'bg-[#9CA3AF] ring-[#E5E7EB]',
  },
};

// 약 카드 상태별 스타일
type DoseStatusStyle = {
  label: string;
  Icon: LucideIcon;
  textColor: string; // 하단 상태 문구
  amountClassName: string | null; // 미복용은 null (표시 안 함)
};

export const DOSE_STATUS_STYLES: Record<DoseStatus, DoseStatusStyle> = {
  taken: {
    label: '복용함',
    Icon: Check,
    textColor: 'text-[#34D399]',
    amountClassName: 'bg-[#10B981]/30 border-[#34D399]/40 text-[#6EE7B7]',
  },
  missed: {
    label: '미복용',
    Icon: X,
    textColor: 'text-[#FB7185]',
    amountClassName: null,
  },
  taking: {
    label: '복용 중',
    Icon: Ellipsis,
    textColor: 'text-[#93C5FD]',
    amountClassName: 'bg-[#3B82F6]/30 border-[#60A5FA]/40 text-[#93C5FD]',
  },
  scheduled: {
    label: '복용 예정',
    Icon: Clock,
    textColor: 'text-[#D1D6DB]',
    amountClassName: 'bg-[#F2F4F6]/20 border-[#8B95A1]/60 text-[#D1D6DB]',
  },
};

// 복용 시간대 이름
export const MEAL_TIME_LABELS = {
  morning: '아침',
  lunch: '점심',
  dinner: '저녁',
} as const;

// 요일 이름 (일요일 시작)
export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
