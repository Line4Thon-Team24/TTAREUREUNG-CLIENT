import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

type DateNavigatorProps = {
  date: Date;
  onChange: (date: Date) => void;
  onCalendarClick?: () => void;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

// 복용 일정 상단 날짜 이동 헤더 (< 11월 3일 >) + 달력 보기 버튼
export default function DateNavigator({
  date,
  onChange,
  onCalendarClick,
}: DateNavigatorProps) {
  return (
    <header className="flex items-center justify-between px-5 pt-6">
      <div className="flex items-center gap-2 text-[#191F28]">
        <button
          type="button"
          aria-label="이전 날짜"
          onClick={() => onChange(addDays(date, -1))}
        >
          <ChevronLeft size={24} strokeWidth={2.5} aria-hidden />
        </button>
        <h1 className="text-[24px] font-bold">
          {date.getMonth() + 1}월 {date.getDate()}일
        </h1>
        <button
          type="button"
          aria-label="다음 날짜"
          onClick={() => onChange(addDays(date, 1))}
        >
          <ChevronRight size={24} strokeWidth={2.5} aria-hidden />
        </button>
      </div>
      <button
        type="button"
        aria-label="달력 보기"
        onClick={onCalendarClick}
        className="flex size-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[#374151]"
      >
        <CalendarDays size={20} strokeWidth={1.5} aria-hidden />
      </button>
    </header>
  );
}
