import { SLOT_STATUS_STYLES } from '@/constants/schedule';
import type { SlotStatus } from '@/types/schedule';

type StatusBadgeProps = {
  status: SlotStatus;
};

// 시간대 오른쪽 복용 상태 배지 (예: ✓ 복용 완료)
export default function StatusBadge({ status }: StatusBadgeProps) {
  const { label, Icon, textColor, badgeClassName } = SLOT_STATUS_STYLES[status];

  return (
    <span
      className={`flex shrink-0 items-center gap-1 rounded-full border px-2.75 py-1.25 text-[12px] leading-4 font-semibold ${badgeClassName} ${textColor}`}
    >
      <Icon size={14} strokeWidth={2.5} aria-hidden />
      {label}
    </span>
  );
}
