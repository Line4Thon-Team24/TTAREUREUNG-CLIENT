import type { Ref } from 'react';
import SelectField from '@/components/common/SelectField';
import { getMaxDay, getMaxMonth, type BirthDate } from '@/utils/birthDate';

export type { BirthDate };

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

const createOptions = (count: number, unit: string) =>
  Array.from({ length: count }, (_, i) => ({
    label: `${i + 1}${unit}`,
    value: String(i + 1),
  }));

// 생년월일 년/월/일 선택창 (오늘 이후 날짜는 선택 불가)
export default function BirthDateField({
  value,
  onChange,
  id,
  ref,
}: BirthDateFieldProps) {
  const monthOptions = createOptions(getMaxMonth(value.year), '월');
  const dayOptions = createOptions(getMaxDay(value.year, value.month), '일');

  // 년/월이 바뀌어 기존 월/일이 선택 범위를 벗어나면 초기화
  const update = (next: Partial<BirthDate>) => {
    const merged = { ...value, ...next };
    if (Number(merged.month) > getMaxMonth(merged.year)) {
      merged.month = '';
      merged.day = '';
    }
    if (Number(merged.day) > getMaxDay(merged.year, merged.month)) {
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
        options={monthOptions}
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
