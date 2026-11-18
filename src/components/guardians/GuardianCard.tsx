import { Flag } from 'lucide-react';
import InfoRow, { InfoValue } from '@/components/common/InfoRow';
import SeniorMultiDropdown from '@/components/common/SeniorMultiDropdown';
import { GENDER_SHORT_LABELS } from '@/constants/senior';
import type { Guardian, GuardianAssignment } from '@/types/guardian';
import type { Senior } from '@/types/senior';
import { getAge } from '@/utils/birthDate';
import { formatDotDate } from '@/utils/date';

type SeniorOption = Pick<Senior, 'id' | 'name'> & { disabled?: boolean };

// 편집 화면: 보호자 선택(삭제) + 담당 시니어 여러 명 선택
type EditOptions = {
  selected: boolean;
  onToggleSelect: () => void;
  seniorOptions: SeniorOption[];
  selectedSeniorIds: number[];
  onToggleSenior: (seniorId: number) => void;
};

type GuardianCardProps = {
  guardian: Guardian; // 보호자 정보 (이름·생년월일 등)
  assignments: GuardianAssignment[];
  // 목록 화면: 대표 지정 깃발 (누른 시니어의 대표로 지정)
  onSetRepresentative?: (seniorId: number) => void;
  edit?: EditOptions;
};

// 보호자 카드 (보호자 1명 = 카드 1장, 보호자 목록 / 보호자 목록 편집)
export default function GuardianCard({
  guardian,
  assignments,
  onSetRepresentative,
  edit,
}: GuardianCardProps) {
  // 한 명이라도 대표면 대표 보호자로 표시
  const isRepresentative = assignments.some((item) => item.isRepresentative);

  // 선택해도 테두리는 그대로 (체크박스로만 표시)
  const borderClass =
    isRepresentative && !edit ? 'border-[#CDEBD8]' : 'border-[#E5E8EB]';
  const checkboxId = `guardian-select-${guardian.profileId}`;

  return (
    // 드롭다운이 열리면 아래 카드보다 위에 보이도록
    <article
      className={`relative flex w-full flex-col gap-3 rounded-2xl border bg-white p-4.25 drop-shadow-[0_2px_5px_rgba(0,0,0,0.04)] has-[[aria-expanded=true]]:z-10 ${borderClass}`}
    >
      <header className="flex items-center justify-between gap-3">
        {/* 체크박스 ↔ 이름 8px, 대표 깃발 ↔ 이름 4px */}
        <div
          className={`flex min-w-0 items-center ${edit ? 'gap-2' : 'gap-1'}`}
        >
          {edit && (
            <input
              id={checkboxId}
              type="checkbox"
              checked={edit.selected}
              onChange={edit.onToggleSelect}
              className="size-4 shrink-0 accent-[#01A16A]"
            />
          )}
          {isRepresentative && !edit && (
            <Flag
              size={20}
              aria-label="대표 보호자"
              className="shrink-0 fill-current text-[#01A16A]"
            />
          )}
          <label
            htmlFor={edit ? checkboxId : undefined}
            className="text-[16px] font-bold break-keep text-[#111827]"
          >
            {guardian.name}
          </label>
        </div>

        {edit ? (
          <SeniorMultiDropdown
            seniors={edit.seniorOptions}
            selectedIds={edit.selectedSeniorIds}
            onToggle={edit.onToggleSenior}
          />
        ) : (
          // 담당 시니어마다 칩 (대표면 초록, 아니면 회색 + 대표 지정 깃발)
          <ul className="flex flex-wrap items-center justify-end gap-1">
            {assignments.map(
              ({ seniorId, seniorName, isRepresentative: isPrimary }) =>
                isPrimary ? (
                  <li
                    key={seniorId}
                    className="rounded-md bg-[#E7F6EC] px-2 py-1 text-[12px] font-semibold text-[#01A16A]"
                  >
                    {seniorName}
                  </li>
                ) : (
                  <li key={seniorId} className="flex items-center gap-1">
                    <span className="rounded-md border border-[#E5E8EB] bg-[#FAFAFA] px-2.25 py-1.25 text-[12px] font-semibold text-[#6B7684]">
                      {seniorName}
                    </span>
                    {onSetRepresentative && (
                      <button
                        type="button"
                        aria-label={`${guardian.name}을(를) ${seniorName} 대표 보호자로 지정`}
                        onClick={() => onSetRepresentative(seniorId)}
                        className="flex size-6 items-center justify-center text-[#8B95A1]"
                      >
                        <Flag size={20} strokeWidth={1.75} aria-hidden />
                      </button>
                    )}
                  </li>
                )
            )}
          </ul>
        )}
      </header>

      <div className="flex flex-col gap-3">
        {/* 좁은 화면에서는 줄바꿈 */}
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          <InfoRow label="생년월일">
            <InfoValue>
              {guardian.birthDate
                ? `${formatDotDate(guardian.birthDate)}(만 ${getAge(guardian.birthDate)}세)`
                : '-'}
            </InfoValue>
          </InfoRow>
          <InfoRow label="성별">
            <InfoValue>
              {guardian.gender ? GENDER_SHORT_LABELS[guardian.gender] : '-'}
            </InfoValue>
          </InfoRow>
        </div>
        <InfoRow label="전화번호">
          <InfoValue>{guardian.phoneNumber || '-'}</InfoValue>
        </InfoRow>
      </div>
    </article>
  );
}
