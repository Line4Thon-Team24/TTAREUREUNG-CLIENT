import { Flag } from 'lucide-react';
import InfoRow, { InfoValue } from '@/components/common/InfoRow';
import SeniorDropdown from '@/components/guardians/SeniorDropdown';
import { GENDER_SHORT_LABELS } from '@/constants/senior';
import type { Guardian } from '@/types/guardian';
import type { Senior } from '@/types/senior';
import { getAge } from '@/utils/birthDate';
import { formatDotDate } from '@/utils/date';

type GuardianCardProps = {
  guardian: Guardian;
  seniors: Senior[];
  // 목록 화면: 대표 지정 깃발
  onSetRepresentative?: () => void;
  // 편집 화면: 체크박스 선택 + 담당 시니어 변경
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onChangeSenior?: (seniorId: number) => void;
};

// 보호자 카드 (보호자 목록 / 보호자 목록 편집)
export default function GuardianCard({
  guardian,
  seniors,
  onSetRepresentative,
  selectable = false,
  selected = false,
  onToggleSelect,
  onChangeSenior,
}: GuardianCardProps) {
  const seniorName =
    seniors.find(({ id }) => id === guardian.seniorId)?.name ?? '-';
  const isRepresentative = guardian.isRepresentative && !selectable;
  const checkboxId = `guardian-select-${guardian.id}`;

  const borderClass = selected
    ? 'border-[#01A16A]'
    : isRepresentative
      ? 'border-[#CDEBD8]'
      : 'border-[#E5E8EB]';

  return (
    // 드롭다운이 열리면 아래 카드보다 위에 보이도록
    <article
      className={`relative flex w-full flex-col gap-3 rounded-2xl border bg-white p-4.25 drop-shadow-[0_2px_5px_rgba(0,0,0,0.04)] transition-colors has-[[aria-expanded=true]]:z-10 ${borderClass}`}
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {selectable && (
            <input
              id={checkboxId}
              type="checkbox"
              checked={selected}
              onChange={onToggleSelect}
              className="size-4 shrink-0 accent-[#01A16A]"
            />
          )}
          {isRepresentative && (
            <Flag
              size={20}
              aria-label="대표 보호자"
              className="shrink-0 fill-current text-[#01A16A]"
            />
          )}
          <label
            htmlFor={selectable ? checkboxId : undefined}
            className="text-[16px] font-bold break-keep text-[#111827]"
          >
            {guardian.name}
          </label>
        </div>

        {selectable && onChangeSenior ? (
          <SeniorDropdown
            seniors={seniors}
            selectedId={guardian.seniorId}
            onSelect={onChangeSenior}
          />
        ) : isRepresentative ? (
          <span className="shrink-0 rounded-md bg-[#E7F6EC] px-2 py-1 text-[12px] font-semibold text-[#01A16A]">
            {seniorName}
          </span>
        ) : (
          <div className="flex shrink-0 items-center gap-1">
            <span className="rounded-md border border-[#E5E8EB] bg-[#FAFAFA] px-2.25 py-1.25 text-[12px] font-semibold text-[#6B7684]">
              {seniorName}
            </span>
            {onSetRepresentative && (
              <button
                type="button"
                aria-label={`${guardian.name}을(를) ${seniorName} 대표 보호자로 지정`}
                onClick={onSetRepresentative}
                className="flex size-6 items-center justify-center text-[#8B95A1]"
              >
                <Flag size={20} strokeWidth={1.75} aria-hidden />
              </button>
            )}
          </div>
        )}
      </header>

      <div className="flex flex-col gap-3">
        {/* 좁은 화면에서는 줄바꿈 */}
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          <InfoRow label="생년월일">
            <InfoValue>
              {formatDotDate(guardian.birthDate)}(만{' '}
              {getAge(guardian.birthDate)}세)
            </InfoValue>
          </InfoRow>
          <InfoRow label="성별">
            <InfoValue>{GENDER_SHORT_LABELS[guardian.gender]}</InfoValue>
          </InfoRow>
        </div>
        <InfoRow label="전화번호">
          <InfoValue>{guardian.phoneNumber}</InfoValue>
        </InfoRow>
      </div>
    </article>
  );
}
