import { getWeekDates, toDateString } from '@/utils/date';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 주말 글자색 (일요일 빨강, 토요일 파랑)
const WEEKEND_COLORS: Record<number, string> = {
  0: 'text-[#E5484D]',
  6: 'text-[#3182F6]',
};

type WeekStripProps = {
  date: Date;
  onSelect: (date: Date) => void;
};

// 선택한 날짜가 포함된 주 (일~토) 날짜 줄
export default function WeekStrip({ date, onSelect }: WeekStripProps) {
  const selected = toDateString(date);

  return (
    <div className="flex border-b border-[#E5E8EB] px-3 pt-1 pb-5.25">
      {getWeekDates(date).map((day, index) => {
        const key = toDateString(day);
        const isSelected = key === selected;
        const weekendColor = WEEKEND_COLORS[index];

        return (
          <button
            key={key}
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
                  : `font-medium ${weekendColor ?? 'text-[#6B7684]'}`
              }`}
            >
              {WEEKDAYS[index]}
            </span>
            <span
              className={`flex size-9 items-center justify-center rounded-full text-[15px] leading-[22.5px] ${
                isSelected
                  ? 'bg-[#191F28] font-bold text-white shadow-[0_0_0_2px_rgba(22,29,58,0.2),0_1px_2px_0_rgba(0,0,0,0.05)]'
                  : `font-medium ${weekendColor ?? 'text-[#333D4B]'}`
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
