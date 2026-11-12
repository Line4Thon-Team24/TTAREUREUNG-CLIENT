import { useRef, type ReactNode } from 'react';
import { Bell, Info, Pencil } from 'lucide-react';
import DateField from '@/components/common/DateField';
import SelectField from '@/components/common/SelectField';
import TextField from '@/components/common/TextField';
import {
  INTERVAL_OPTIONS,
  NOTIFICATION_TIMES,
  TIMES_PER_DAY_OPTIONS,
  TIMING_OPTIONS,
} from '@/constants/medicine';
import type { DoseInterval, DoseTiming, MedicineForm } from '@/types/medicine';

type MedicineInfoCardProps = {
  index: number;
  value: MedicineForm;
  onChange: (value: MedicineForm) => void;
  registeredAt: string;
  isManual: boolean; // 직접 입력이면 약 이름을 직접 작성
};

const AiVoiceTag = () => (
  <span className="rounded-sm bg-[#E7F6EC] px-1.5 py-0.5 text-[11px] font-semibold text-[#138A4B]">
    AI 음성안내
  </span>
);

const DoctorHint = () => (
  <span className="flex items-center gap-1 text-[11px] text-[#8B95A1]">
    <Info size={14} aria-hidden className="fill-[#8B95A1] text-white" />
    수정 시 의사의 확인을 받아야 하는 내용입니다.
  </span>
);

type FieldLabelProps = {
  htmlFor?: string;
  children: ReactNode;
  extra?: ReactNode;
};

const FieldLabel = ({ htmlFor, children, extra }: FieldLabelProps) => (
  <div className="flex items-center gap-1">
    <label htmlFor={htmlFor} className="text-[14px] font-bold text-[#191F28]">
      {children}
    </label>
    {extra}
  </div>
);

const SubLabel = ({ children }: { children: ReactNode }) => (
  <span className="text-[11px] text-[#6B7684]">{children}</span>
);

type EditableFieldProps = {
  id: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

// 연필 버튼을 누르면 바로 수정할 수 있는 입력창
const EditableField = ({
  id,
  value,
  placeholder,
  onChange,
}: EditableFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <TextField
        id={id}
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        // TextField 기본 글자색(#333D4B)보다 우선 적용되도록 important(!) 사용
        className="pr-10 text-[#191F28]!"
      />
      <button
        type="button"
        aria-label="수정하기"
        onClick={() => inputRef.current?.focus()}
        className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center text-[#374151]"
      >
        <Pencil size={16} strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
};

// 약 하나의 정보 입력 카드
export default function MedicineInfoCard({
  index,
  value,
  onChange,
  registeredAt,
  isManual,
}: MedicineInfoCardProps) {
  const id = `medicine-${index}`;
  const update = (next: Partial<MedicineForm>) =>
    onChange({ ...value, ...next });

  return (
    <article className="flex w-full flex-col gap-6">
      <header className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#191F28]">
          {index + 1}. {value.name || '새로운 약'}
        </h2>
        <p className="text-[11px] text-[#6B7684]">등록 일시: {registeredAt}</p>
      </header>

      {isManual ? (
        <div className="flex flex-col gap-3">
          <FieldLabel htmlFor={`${id}-name`} extra={<RequiredDot />}>
            약 이름
          </FieldLabel>
          <TextField
            id={`${id}-name`}
            value={value.name}
            placeholder="처방받은 약 이름을 입력해주세요."
            onChange={(e) => update({ name: e.target.value })}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <span className="text-[14px] font-bold text-[#6B7684]">약 종류</span>
          {/* AI가 인식한 값이라 수정 불가 */}
          <p className="rounded-2xl border border-[#E5E8EB] bg-[#FAFAFA] p-3.75 text-[14px] font-medium text-[#B0B8C1]">
            {value.category}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <FieldLabel htmlFor={`${id}-display-name`} extra={<AiVoiceTag />}>
          시니어가 보는 약 이름
        </FieldLabel>
        <EditableField
          id={`${id}-display-name`}
          value={value.displayName}
          placeholder="시니어가 알아보기 쉬운 이름을 작성해주세요."
          onChange={(displayName) => update({ displayName })}
        />
      </div>

      <div className="flex flex-col gap-3">
        <FieldLabel
          htmlFor={`${id}-storage`}
          extra={
            <>
              <AiVoiceTag />
              <RequiredDot />
            </>
          }
        >
          약 보관 위치
        </FieldLabel>
        <EditableField
          id={`${id}-storage`}
          value={value.storageLocation}
          placeholder="약 보관 위치를 작성해주세요."
          onChange={(storageLocation) => update({ storageLocation })}
        />
      </div>

      <div className="flex flex-col gap-3 pt-1">
        <FieldLabel extra={<DoctorHint />}>복용 일정</FieldLabel>
        <div className="flex items-end gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <SubLabel>복용 시작일</SubLabel>
            <DateField
              value={value.startDate}
              disabled
              aria-label="복용 시작일"
            />
          </div>
          <span className="pb-2.5 text-[24px] text-[#94A3B8]" aria-hidden>
            ~
          </span>
          <div className="flex flex-1 flex-col gap-1">
            <SubLabel>복용 종료일</SubLabel>
            <DateField
              value={value.endDate}
              min={value.startDate}
              onChange={(endDate) => update({ endDate })}
              aria-label="복용 종료일"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <FieldLabel extra={<DoctorHint />}>복용 주기</FieldLabel>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <SubLabel>복용 간격</SubLabel>
            <SelectField
              aria-label="복용 간격"
              placeholder="복용 간격"
              options={INTERVAL_OPTIONS}
              value={value.interval}
              onChange={(e) =>
                update({ interval: e.target.value as DoseInterval })
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <SubLabel>복용 빈도</SubLabel>
            <div className="flex items-center gap-4">
              <SelectField
                aria-label="하루 복용 횟수"
                placeholder="복용 횟수"
                options={TIMES_PER_DAY_OPTIONS}
                value={String(value.timesPerDay)}
                onChange={(e) =>
                  update({ timesPerDay: Number(e.target.value) })
                }
              />
              <span
                className="text-[16px] font-bold text-[#94A3B8]"
                aria-hidden
              >
                /
              </span>
              <SelectField
                aria-label="복용 시점"
                placeholder="복용 시점"
                options={TIMING_OPTIONS}
                value={value.timing}
                onChange={(e) =>
                  update({ timing: e.target.value as DoseTiming })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-2 rounded-xl border border-[#E5E8EB] bg-[#FAFAFA] px-3.25 pt-3.5 pb-3.25">
        <h3 className="flex items-center gap-1.5 text-[11px] font-medium text-[#6B7684]">
          <Bell size={14} aria-hidden className="text-[#01A16A]" />
          설정된 자동 알림 시간
        </h3>
        <ul className="flex flex-wrap gap-1.5">
          {NOTIFICATION_TIMES[value.timesPerDay].map(
            ({ label, time, color }) => (
              <li
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-[#E5E8EB] bg-white px-2.25 py-1.5 text-[12px] font-medium text-[#333D4B]"
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
                {label} {time}
              </li>
            )
          )}
        </ul>
      </section>
    </article>
  );
}

// 필수 입력 표시 (빨간 점)
function RequiredDot() {
  return (
    <span className="size-1.5 rounded-full bg-[#E5484D]" aria-label="필수" />
  );
}
