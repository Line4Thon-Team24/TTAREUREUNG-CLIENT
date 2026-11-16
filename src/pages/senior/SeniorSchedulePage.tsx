import { useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import DailySummaryCard from '@/components/senior/DailySummaryCard';
import SeniorTimelineItem from '@/components/senior/SeniorTimelineItem';
import useToday from '@/hooks/useToday';
import { getDailySchedule } from '@/mocks/schedule';
import { getScheduleSummary } from '@/utils/schedule';

// 로그인·프로필 선택 연동 전까지 목업 시니어(김순자)로 고정
const SENIOR_ID = 1;

type SeniorSchedulePageProps = {
  day: 'today' | 'tomorrow';
};

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const formatMonthDay = (date: Date) =>
  `${date.getMonth() + 1}월 ${date.getDate()}일`;

// 시니어 약 복용 일정 (오늘 / 내일)
const SeniorSchedulePage = ({ day }: SeniorSchedulePageProps) => {
  const navigate = useNavigate();
  // 자정이 지나면 오늘·내일 기준도 함께 바뀜
  const today = useToday();
  const isToday = day === 'today';
  const date = isToday ? today : addDays(today, 1);
  const otherDate = isToday ? addDays(today, 1) : today;

  const slots = getDailySchedule(SENIOR_ID, date);
  const summary = getScheduleSummary(slots);

  return (
    <div className="flex min-h-dvh flex-col gap-8 bg-[#FAFAFA] px-5 pt-10 pb-10">
      <h1 className="text-[24px] font-bold text-black">약 복용 일정</h1>

      <DailySummaryCard
        date={date}
        dayLabel={isToday ? '오늘' : '내일'}
        {...summary}
      />

      {slots.length === 0 ? (
        <p className="py-10 text-center text-[16px] text-[#6B7684]">
          {isToday ? '오늘' : '내일'}은 복용할 약이 없어요.
        </p>
      ) : (
        <ol className="relative flex flex-col gap-6">
          {/* 세로선 */}
          <span
            aria-hidden
            className="absolute top-6 bottom-0 left-4.5 w-0.75 bg-[#E2E8F0]"
          />
          {slots.map((slot) => (
            <SeniorTimelineItem key={slot.id} slot={slot} />
          ))}
        </ol>
      )}

      <button
        type="button"
        onClick={() =>
          navigate(isToday ? '/senior/tomorrow' : '/senior', { replace: true })
        }
        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#191F28] text-[16px] font-bold text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] active:bg-[#333D4B]"
      >
        <CalendarDays size={20} aria-hidden />
        {isToday ? '내일' : '오늘'} 일정 보기 ({formatMonthDay(otherDate)})
      </button>
    </div>
  );
};

export default SeniorSchedulePage;
