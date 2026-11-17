import {
  Check,
  CircleAlert,
  Clock,
  Contrast,
  Ellipsis,
  TriangleAlert,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { SlotStatus } from '@/types/schedule';

// 시니어 약 섭취 일정 - 시간대 상태별 스타일
type SeniorSlotStyle = {
  label: string;
  listTitle: string; // 약 목록 제목
  NodeIcon: LucideIcon;
  nodeClassName: string; // 타임라인 원 + 아이콘 색 + 바깥 테두리
  cardClassName: string;
  dividerClassName: string;
  pillClassName: string; // 상태 배지
  PillIcon: LucideIcon | null; // 없으면 점
  dotClassName: string; // 상태 배지 점 / 약 이름 앞 점
  timingClassName: string; // 시간 옆 안내 (예: 아침 식후, 굵기·자간 포함)
  countClassName: string; // 오른쪽 위 약 개수 (여백·굵기 포함)
  chipClassName: string; // 약 이름 칩 (간격·굵기 포함)
  alert?: {
    Icon: LucideIcon;
    title: string;
    description: string;
    className: string;
  };
};

const CALM_SHADOW = 'shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]';
const FOCUS_SHADOW =
  'shadow-[0_10px_25px_-5px_rgba(37,99,235,0.12),0_8px_10px_-6px_rgba(37,99,235,0.08)]';
const COUNT_SHADOW = 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]';

export const SENIOR_SLOT_STYLES: Record<SlotStatus, SeniorSlotStyle> = {
  taken: {
    label: '복용 완료',
    listTitle: '복용한 약 목록',
    NodeIcon: Check,
    nodeClassName: 'bg-[#01A16A] text-white ring-[#F8FAFC]',
    cardClassName: `gap-3.5 border border-[#E7F6EC] p-4.25 ${CALM_SHADOW}`,
    dividerClassName: 'border-[#FAFAFA]',
    pillClassName: 'bg-[#E7F6EC] text-[#01A16A]',
    PillIcon: Check,
    dotClassName: 'size-1.5 bg-[#01A16A]',
    timingClassName: 'font-semibold tracking-[-0.32px] text-[#333D4B]',
    countClassName: 'px-2.5 font-bold bg-[#FAFAFA] text-[#333D4B]',
    chipClassName:
      'gap-1.5 rounded-md bg-[#FAFAFA] px-2.5 py-1 font-medium text-[#191F28]',
  },
  missed: {
    label: '미복용',
    listTitle: '미복용 약 목록',
    NodeIcon: X,
    nodeClassName: 'bg-[#E5484D] text-white ring-[#F8FAFC]',
    cardClassName: `gap-2.5 border-2 border-[#FFEEEE] p-4.5 ${CALM_SHADOW}`,
    dividerClassName: 'border-[#FFEEEE]',
    pillClassName: 'bg-[#FFEEEE] text-[#E5484D]',
    PillIcon: X,
    dotClassName: 'size-1.5 bg-[#E5484D]',
    timingClassName: 'font-semibold tracking-[-0.32px] text-[#333D4B]',
    countClassName: 'px-2.5 font-bold bg-[#FFEEEE] text-[#E5484D]',
    chipClassName:
      'gap-1.5 rounded-md bg-[#FFEEEE] px-2.75 py-1.25 font-medium text-[#333D4B]',
    alert: {
      Icon: CircleAlert,
      title: '복용 전화를 받지 않으셨습니다.',
      description: '미복용에 따라 복용 일정이 연장되었습니다.',
      className: 'border-[#E5484D] bg-[#FFEEEE] text-[#E5484D]',
    },
  },
  partial: {
    label: '일부 복용',
    listTitle: '일부 복용 약 목록',
    NodeIcon: Contrast,
    nodeClassName: 'bg-[#D97706] text-white ring-[#FEF3C7]',
    cardClassName: `gap-2.5 border-2 border-[#D97706]/20 p-4.5 ${CALM_SHADOW}`,
    dividerClassName: 'border-[#FFF4E0]',
    pillClassName: 'bg-[#FFF4E0] text-[#D97706]',
    PillIcon: Contrast,
    dotClassName: 'size-1.5 bg-[#D97706]',
    timingClassName: 'font-bold text-[#333D4B]',
    countClassName: 'px-2.5 font-bold bg-[#FFF4E0] text-[#B45309]',
    // 먹은 약 (못 먹은 약은 주황 테두리로 따로 표시)
    chipClassName:
      'gap-1.5 rounded-md bg-[#FAFAFA] px-2.5 py-1 font-medium text-[#191F28]',
    alert: {
      Icon: TriangleAlert,
      title: '약 중 일부만 복용하셨습니다.',
      description: '일부 복용에 따라 복용 일정이 연장되었습니다.',
      className: 'border-[#D97706] bg-[#FFF4E0] text-[#D97706]',
    },
  },
  taking: {
    label: '복용 중',
    listTitle: '복용 중인 약 목록',
    NodeIcon: Ellipsis,
    nodeClassName: 'bg-[#3182F6] text-white ring-[#DBEAFE]',
    cardClassName: `gap-1.5 border-2 border-[#3182F6]/20 p-4.5 ${FOCUS_SHADOW}`,
    dividerClassName: 'border-[#FAFAFA]',
    pillClassName: 'bg-[#FAFAFA] text-[#3182F6]',
    PillIcon: null,
    dotClassName: 'size-2 bg-[#3182F6]',
    timingClassName: 'font-bold tracking-[-0.5px] text-[#3182F6]',
    countClassName: `px-3 font-extrabold bg-[#3182F6] text-white ${COUNT_SHADOW}`,
    chipClassName:
      'h-7.5 gap-2 rounded-lg bg-[#FAFAFA] px-2.75 font-semibold text-[#333D4B]',
  },
  scheduled: {
    label: '복용 예정',
    listTitle: '복용 중인 약 목록',
    NodeIcon: Clock,
    nodeClassName: 'bg-[#F2F4F6] text-[#8B95A1] ring-[#6B7684]/30',
    cardClassName: `gap-1.5 border-2 border-[#8B95A1]/20 p-4.5 ${FOCUS_SHADOW}`,
    dividerClassName: 'border-[#FAFAFA]',
    pillClassName: 'bg-[#FAFAFA] text-[#8B95A1]',
    PillIcon: null,
    dotClassName: 'size-2 bg-[#8B95A1]',
    timingClassName: 'font-bold tracking-[-0.5px] text-[#8B95A1]',
    countClassName: `px-3 font-extrabold bg-[#8B95A1] text-white ${COUNT_SHADOW}`,
    chipClassName:
      'h-7.5 gap-2 rounded-lg bg-[#FAFAFA] px-2.75 font-semibold text-[#333D4B]',
  },
};
