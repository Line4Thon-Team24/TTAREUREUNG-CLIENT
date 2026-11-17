import { toDateString } from '@/utils/date';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

type WeekStripProps = {
  date: Date;
  onSelect: (date: Date) => void;
};

// 요일 글자색 (일요일 빨강, 토요일 파랑)
const getLabelClassName = (day: number) => {
  if (day === 0) return 'text-[#E5484D]';
  if (day === 6) return 'text-[#3182F6]';
  return 'text-[#6B7684]';
};

// 날짜 글자색
const getDateClassName = (day: number) => {
  if (day === 0) return 'text-[#E5484D]';
  if (day === 6) return 'text-[#3182F6]';
  return 'text-[#333D4B]';
};

// 선택한 날짜가 포함된 주 (일~토) 날짜 줄
export default function WeekStrip({ date, onSelect }: WeekStripProps) {
  const selected = toDateString(date);
  const week = Array.from(
    { length: 7 },
    (_, day) =>
      new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - date.getDay() + day
      )
  );

  return (
    <div className="flex border-b border-[#E5E8EB] px-3 pt-1 pb-5.25">
      {week.map((day, index) => {
        const isSelected = toDateString(day) === selected;

        return (
          <button
            key={toDateString(day)}
            type="button"
            aria-label={`${day.getMonth() + 1}월 ${day.getDate()}일`}
            aria-pressed={isSelected}
            onClick={() => onSelect(day)}
            className="flex flex-1 flex-col items-center"
          >
            <span
              className={`pb-1.5 text-[12px] leading-4.5 ${
                isSelected
                  ? 'font-bold text-[#191F28]'
                  : `font-medium ${getLabelClassName(index)}`
              }`}
            >
              {WEEKDAYS[index]}
            </span>
            <span
              className={`flex size-9 items-center justify-center rounded-full text-[15px] leading-[22.5px] ${
                isSelected
                  ? 'bg-[#191F28] font-bold text-white shadow-[0_0_0_2px_rgba(22,29,58,0.2),0_1px_2px_0_rgba(0,0,0,0.05)]'
                  : `font-medium ${getDateClassName(index)}`
              }`}
            >
              {day.getDate()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
