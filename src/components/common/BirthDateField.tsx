import type { Ref } from 'react';
import SelectField from '@/components/common/SelectField';

export type BirthDate = { year: string; month: string; day: string };

type BirthDateFieldProps = {
  value: BirthDate;
  onChange: (value: BirthDate) => void;
  id?: string;
  ref?: Ref<HTMLSelectElement>;
};

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1920;

const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - MIN_YEAR + 1 },
  (_, i) => {
    const year = String(CURRENT_YEAR - i);
    return { label: `${year}년`, value: year };
  }
);

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}월`,
  value: String(i + 1),
}));

// 선택한 년/월의 마지막 날짜 (년/월 미선택 시 31일)
const getDaysInMonth = (year: string, month: string) =>
  year && month ? new Date(Number(year), Number(month), 0).getDate() : 31;

// 생년월일 년/월/일 선택창
export default function BirthDateField({
  value,
  onChange,
  id,
  ref,
}: BirthDateFieldProps) {
  const dayOptions = Array.from(
    { length: getDaysInMonth(value.year, value.month) },
    (_, i) => ({ label: `${i + 1}일`, value: String(i + 1) })
  );

  // 년/월이 바뀌어 기존 일이 범위를 벗어나면 일 선택을 초기화
  const update = (next: Partial<BirthDate>) => {
    const merged = { ...value, ...next };
    if (Number(merged.day) > getDaysInMonth(merged.year, merged.month)) {
      merged.day = '';
    }
    onChange(merged);
  };

  return (
    <div className="flex w-full gap-4">
      <SelectField
        id={id}
        ref={ref}
        aria-label="출생 연도"
        placeholder="년"
        options={YEAR_OPTIONS}
        value={value.year}
        onChange={(e) => update({ year: e.target.value })}
      />
      <SelectField
        aria-label="출생 월"
        placeholder="월"
        options={MONTH_OPTIONS}
        value={value.month}
        onChange={(e) => update({ month: e.target.value })}
      />
      <SelectField
        aria-label="출생 일"
        placeholder="일"
        options={dayOptions}
        value={value.day}
        onChange={(e) => update({ day: e.target.value })}
      />
    </div>
  );
}
