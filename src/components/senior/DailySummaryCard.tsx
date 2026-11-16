import { Pill } from 'lucide-react';

type DailySummaryCardProps = {
  date: Date;
  dayLabel: string; // 예: 오늘 / 내일
  slotCount: number; // 섭취 횟수
  total: number;
  taken: number;
  missed: number;
  partialMissed: number;
};

const toPercent = (value: number, total: number) =>
  total === 0 ? 0 : Math.round((value / total) * 100);

// 하루 복약 요약 (날짜·섭취 횟수·복약 달성률)
export default function DailySummaryCard({
  date,
  dayLabel,
  slotCount,
  total,
  taken,
  missed,
  partialMissed,
}: DailySummaryCardProps) {
  const rate = toPercent(taken, total);

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4.25 drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between border-b border-[#FAFAFA] pb-3.25">
        <div className="flex items-center gap-2">
          <h2 className="text-[22px] font-bold text-[#191F28]">
            {date.getMonth() + 1}월 {date.getDate()}일
          </h2>
          <span className="rounded-md bg-[#CDEBD8] px-2 py-0.5 text-[14px] font-bold text-[#01A16A]">
            {dayLabel}
          </span>
        </div>
        <p className="rounded-lg bg-[#FAFAFA] px-2.5 py-1 text-[16px] font-bold text-[#333D4B]">
          섭취 횟수: <span className="text-[#01A16A]">{slotCount}회</span>
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-0.5 text-[14px] text-[#333D4B]">
          <Pill size={16} aria-hidden className="text-[#01A16A]" />
          복약 달성률
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-[#333D4B]">
            {taken} / {total} 완료 ({rate}%)
          </span>
          {/* 먹음(초록) · 시간대 전체 놓침(빨강) · 일부 놓침(주황) */}
          <div
            role="progressbar"
            aria-label="복약 달성률"
            aria-valuenow={rate}
            aria-valuemin={0}
            aria-valuemax={100}
            className="flex h-2 w-20 overflow-hidden rounded-full bg-[#E5E8EB]"
          >
            <span
              className="bg-[#01A16A]"
              style={{ width: `${toPercent(taken, total)}%` }}
            />
            <span
              className="bg-[#E5484D]"
              style={{ width: `${toPercent(missed, total)}%` }}
            />
            <span
              className="bg-[#D97706]"
              style={{ width: `${toPercent(partialMissed, total)}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
