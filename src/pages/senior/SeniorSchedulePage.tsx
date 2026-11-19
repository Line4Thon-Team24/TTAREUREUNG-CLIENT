import { useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import DailySummaryCard from '@/components/senior/DailySummaryCard';
import SeniorTimelineItem from '@/components/senior/SeniorTimelineItem';
import useDailySchedule from '@/hooks/useDailySchedule';
import useSeniors from '@/hooks/useSeniors';
import useToday from '@/hooks/useToday';
import { getScheduleSummary } from '@/utils/schedule';

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

  // TODO: 시니어 로그인·프로필 선택 연동 후 선택한 시니어로 교체 (지금은 첫 번째 시니어)
  const { seniors, isError: isSeniorsError } = useSeniors();
  const seniorId = seniors?.[0]?.id ?? null;
  const { slots, isError: isScheduleError } = useDailySchedule(seniorId, date);
  const summary = getScheduleSummary(slots ?? []);
  const isError = isSeniorsError || isScheduleError;

  return (
    <div className="flex min-h-dvh flex-col gap-8 bg-[#FAFAFA] px-5 pt-10 pb-10">
      <h1 className="text-[24px] font-bold text-black">약 복용 일정</h1>

      <DailySummaryCard date={date} isToday={isToday} {...summary} />

      {isError ? (
        <p className="py-10 text-center text-[16px] text-[#6B7684]">
          일정을 불러오지 못했어요.
        </p>
      ) : seniors?.length === 0 ? (
        <p className="py-10 text-center text-[16px] text-[#6B7684]">
          등록된 시니어가 없어요.
        </p>
      ) : slots === null ? (
        <div className="py-10" />
      ) : slots.length === 0 ? (
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
