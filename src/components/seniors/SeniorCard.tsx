import { Star } from 'lucide-react';
import InfoRow, { InfoValue } from '@/components/common/InfoRow';
import { GENDER_SHORT_LABELS } from '@/constants/senior';
import type { Senior } from '@/types/senior';
import { getAge } from '@/utils/birthDate';
import { formatDate, formatDotDate } from '@/utils/date';

type SeniorCardProps = {
  senior: Senior;
  medicineCount: number;
  // 목록 편집 화면에서 체크박스 노출 (즐겨찾기·편집 버튼은 숨김)
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onMedicineDetail?: () => void;
};

// 시니어 카드 (시니어 목록)
export default function SeniorCard({
  senior,
  medicineCount,
  selectable = false,
  selected = false,
  onToggleSelect,
  onToggleFavorite,
  onEdit,
  onMedicineDetail,
}: SeniorCardProps) {
  const checkboxId = `senior-select-${senior.id}`;

  return (
    <article
      className={`flex w-full flex-col gap-3 rounded-2xl border bg-white p-4.25 drop-shadow-[0_2px_5px_rgba(0,0,0,0.04)] transition-colors ${
        selected ? 'border-[#01A16A]' : 'border-[#CDEBD8]'
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            {selectable && (
              <input
                id={checkboxId}
                type="checkbox"
                checked={selected}
                onChange={onToggleSelect}
                className="size-4 shrink-0 accent-[#01A16A]"
              />
            )}
            <h2 className="text-[16px] font-bold break-keep text-[#111827]">
              <label htmlFor={selectable ? checkboxId : undefined}>
                {senior.name}
              </label>
            </h2>
          </div>
          <p className="text-[11px] text-[#9CA3AF]">
            등록 날짜: {formatDate(new Date(senior.registeredAt))}
          </p>
        </div>
        {!selectable && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label={`${senior.name} 즐겨찾기`}
              aria-pressed={senior.isFavorite}
              onClick={onToggleFavorite}
              className="flex size-6 items-center justify-center text-[#F59E0B]"
            >
              <Star
                size={19}
                strokeWidth={1.75}
                aria-hidden
                className={senior.isFavorite ? 'fill-current' : ''}
              />
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="rounded-md border border-[#E5E8EB] bg-[#FAFAFA] px-2.25 py-1.25 text-[12px] font-semibold text-[#6B7684] active:bg-[#F2F4F6]"
            >
              세부 편집
            </button>
          </div>
        )}
      </header>

      <div className="flex flex-col gap-3">
        {/* 좁은 화면에서는 줄바꿈 */}
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          <InfoRow label="생년월일">
            <InfoValue>
              {formatDotDate(senior.birthDate)}(만 {getAge(senior.birthDate)}세)
            </InfoValue>
          </InfoRow>
          <InfoRow label="성별">
            <InfoValue>{GENDER_SHORT_LABELS[senior.gender]}</InfoValue>
          </InfoRow>
        </div>
        <InfoRow label="전화번호">
          <InfoValue>{senior.phoneNumber}</InfoValue>
        </InfoRow>
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          <InfoRow label="약 등록 여부" tone="green">
            <InfoValue>{medicineCount > 0 ? '등록됨' : '미등록'}</InfoValue>
          </InfoRow>
          <InfoRow label="약 복용 개수" tone="green">
            <InfoValue>{medicineCount}개</InfoValue>
            {!selectable && (
              <button
                type="button"
                onClick={onMedicineDetail}
                className="py-px text-[11px] text-[#6B7684] underline"
              >
                약상세정보
              </button>
            )}
          </InfoRow>
        </div>
      </div>
    </article>
  );
}
