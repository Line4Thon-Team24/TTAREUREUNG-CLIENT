import { CircleMinus, Package, Pill, type LucideIcon } from 'lucide-react';
import tabletIcon from '@/assets/icons/tablet.svg';
import pillAssortedImage from '@/assets/images/pill-assorted.jpg';
import pillBlisterImage from '@/assets/images/pill-blister.jpg';
import { DOSE_STATUS_STYLES } from '@/constants/schedule';
import type { MedicineShape, ScheduleMedicine } from '@/types/schedule';

// 알약은 피그마 아이콘 사용
const SHAPE_ICONS: Record<Exclude<MedicineShape, 'tablet'>, LucideIcon> = {
  capsule: Pill,
  powder: Package,
};

type DoseCardProps = {
  medicine: ScheduleMedicine;
  onClick: () => void;
};

// 복약 카드
export default function DoseCard({ medicine, onClick }: DoseCardProps) {
  const { displayName, dosage, amount, shape, status } = medicine;
  const { label, Icon, textColor, amountClassName } =
    DOSE_STATUS_STYLES[status];
  const isMissed = status === 'missed';
  // 배경은 약 사진과 상관없이 피그마 기본 사진 (미복용은 다른 사진)
  const backgroundUrl = isMissed ? pillAssortedImage : pillBlisterImage;
  const ShapeIcon = shape === 'tablet' ? null : SHAPE_ICONS[shape];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${displayName} ${dosage} ${label} 상세 보기`}
      className={`relative flex h-36 w-32 shrink-0 flex-col justify-between overflow-hidden rounded-2xl bg-[#334155] p-3 text-left shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05),0_1px_4px_-1px_rgba(0,0,0,0.03)] transition-transform active:scale-[0.98] motion-reduce:transition-none ${
        isMissed ? 'ring-2 ring-[#F43F5E]' : ''
      }`}
    >
      <img
        src={backgroundUrl}
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />
      {/* 사진 위 그라데이션 */}
      <span
        aria-hidden
        className={`absolute inset-0 bg-linear-to-t ${
          isMissed
            ? 'from-[#020617]/95 via-[#4C0519]/60 to-[#020617]/75'
            : 'from-[#020617]/90 via-[#0F172A]/70 to-[#0F172A]/60'
        }`}
      />

      <span className="relative flex w-full items-start justify-between">
        <span
          className={`flex size-7 items-center justify-center rounded-lg backdrop-blur-md ${
            isMissed
              ? 'border border-[#FB7185]/40 bg-[#F43F5E]/30 text-[#FB7185]'
              : 'bg-white/20 text-white'
          }`}
        >
          {/* 미복용은 경고 아이콘 */}
          {isMissed ? (
            <CircleMinus size={16} aria-hidden />
          ) : shape === 'tablet' ? (
            <img
              src={tabletIcon}
              alt=""
              width={16}
              height={16}
              className="rotate-90"
            />
          ) : (
            ShapeIcon && <ShapeIcon size={16} aria-hidden />
          )}
        </span>
        {/* 복용량이 없으면 배지 숨김 */}
        {amountClassName && amount && (
          <span
            className={`rounded-full border px-1.75 py-0.75 text-[10px] font-semibold ${amountClassName}`}
          >
            {amount}
          </span>
        )}
      </span>

      <span className="relative flex w-full flex-col">
        <span className="truncate text-[12px] font-bold text-white">
          {displayName}
        </span>
        <span
          className={`pb-1 text-[10px] leading-3.75 ${
            isMissed ? 'text-[#FECDD3]/80' : 'text-white/70'
          }`}
        >
          {dosage}
        </span>
        <span
          className={`flex items-center justify-between border-t pt-1.25 ${
            isMissed ? 'border-[#FB7185]/30' : 'border-white/20'
          } ${textColor}`}
        >
          <span className="text-[11px] font-semibold">{label}</span>
          <Icon size={14} strokeWidth={2.5} aria-hidden />
        </span>
      </span>
    </button>
  );
}
