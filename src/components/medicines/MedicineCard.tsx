import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { getIntervalLabel, getTimingLabel } from '@/constants/medicine';
import type { Medicine } from '@/types/medicine';
import { formatDate, formatDotDate } from '@/utils/date';

type MedicineCardProps = {
  medicine: Medicine;
  // 편집 화면: 체크박스로 선택, 복용 이유 항상 표시
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  // 목록 화면: '세부 편집' 버튼
  onEdit?: () => void;
};

type InfoRowProps = {
  label: string;
  tone?: 'default' | 'green' | 'orange';
  children: ReactNode;
};

const TONE_CLASS = {
  default: 'bg-[#FAFAFA] text-[#6B7684]',
  green: 'bg-[#E7F6EC] text-[#01A16A]',
  orange: 'bg-[#FFF4E0] text-[#D97706]',
};

// 회색/색깔 라벨 + 값 한 줄
const InfoRow = ({ label, tone = 'default', children }: InfoRowProps) => (
  <div className="flex items-start gap-2">
    <span
      className={`shrink-0 rounded-sm px-4 py-0.5 text-[12px] font-semibold ${TONE_CLASS[tone]}`}
    >
      {label}
    </span>
    {children}
  </div>
);

const Value = ({ children }: { children: ReactNode }) => (
  <span className="py-px text-[12px] leading-4 font-medium text-[#191F28]">
    {children}
  </span>
);

// 약 카드 (약 목록 / 약 목록 편집)
export default function MedicineCard({
  medicine,
  selectable = false,
  selected = false,
  onToggleSelect,
  onEdit,
}: MedicineCardProps) {
  const [expanded, setExpanded] = useState(false);
  const showReason = selectable || expanded;
  const checkboxId = `medicine-select-${medicine.id}`;

  return (
    <article
      className={`flex w-full flex-col gap-3 rounded-2xl border bg-white p-4.25 drop-shadow-[0_2px_5px_rgba(0,0,0,0.04)] transition-colors ${selected ? 'border-[#01A16A]' : 'border-[#CDEBD8]'}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          {selectable && (
            <input
              id={checkboxId}
              type="checkbox"
              checked={selected}
              onChange={onToggleSelect}
              className="mt-0.75 size-4 shrink-0 accent-[#01A16A]"
            />
          )}
          <div className="flex min-w-0 flex-col gap-1">
            <label
              htmlFor={selectable ? checkboxId : undefined}
              className="text-[16px] font-bold break-keep text-[#111827]"
            >
              {medicine.name}
            </label>
            <p className="text-[11px] text-[#9CA3AF]">
              등록 날짜: {formatDate(new Date(medicine.registeredAt))}
            </p>
          </div>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 rounded-md border border-[#E5E8EB] bg-[#FAFAFA] px-2.25 py-1.25 text-[12px] font-semibold text-[#6B7684] active:bg-[#F2F4F6]"
          >
            세부 편집
          </button>
        )}
      </header>

      <div className="flex justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-3">
          <InfoRow label="종류">
            <Value>{medicine.category || '-'}</Value>
          </InfoRow>
          <InfoRow label="효과">
            <Value>{medicine.effect || '-'}</Value>
          </InfoRow>
          <InfoRow label="복용 주기" tone="green">
            <Value>
              {getIntervalLabel(medicine.interval)} /{' '}
              {getTimingLabel(medicine.timing)}
            </Value>
          </InfoRow>
        </div>
        {medicine.prescription?.imageUrl && (
          <img
            src={medicine.prescription.imageUrl}
            alt={`${medicine.name} 처방전 사진`}
            className="h-19.5 w-26.5 shrink-0 rounded-xl object-cover"
          />
        )}
      </div>

      <div className="flex gap-3">
        <InfoRow label="시작">
          <Value>{formatDotDate(medicine.startDate)}</Value>
        </InfoRow>
        <InfoRow label="종료">
          <Value>{formatDotDate(medicine.endDate)}</Value>
        </InfoRow>
      </div>

      {showReason && (
        <div className="border-t border-[#E5E8EB] pt-3">
          <InfoRow label="복용 이유" tone="orange">
            <p className="flex-1 rounded-lg border border-[#E5E8EB] bg-[#FAFAFA] p-2.75 text-[12px] leading-3.75 text-[#333D4B]">
              {medicine.reason || '등록된 복용 이유가 없어요.'}
            </p>
          </InfoRow>
        </div>
      )}

      {!selectable && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? '복용 이유 접기' : '복용 이유 펼치기'}
          onClick={() => setExpanded((prev) => !prev)}
          className={`flex justify-center pt-1.75 text-[#8B95A1] ${expanded ? '' : 'border-t border-[#E5E8EB]'}`}
        >
          <ChevronDown
            size={16}
            strokeWidth={1.75}
            aria-hidden
            className={`transition-transform duration-200 motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      )}
    </article>
  );
}
