import { CircleCheck, TriangleAlert, X } from 'lucide-react';

type AdherenceSummaryProps = {
  rate: number; // 복용률 (%)
  taken: number;
  partial: number;
  missed: number;
};

// 월 복용률 요약
export default function AdherenceSummary({
  rate,
  taken,
  partial,
  missed,
}: AdherenceSummaryProps) {
  const items = [
    {
      label: '복용 완료',
      value: taken,
      Icon: CircleCheck,
      color: 'text-[#01A16A]',
    },
    {
      label: '일부 복용',
      value: partial,
      Icon: TriangleAlert,
      color: 'text-[#D97706]',
    },
    { label: '미복용', value: missed, Icon: X, color: 'text-[#E5484D]' },
  ];

  return (
    <section className="flex items-center justify-between px-5 pt-3.5 pb-4">
      <div className="flex w-27 flex-col gap-1.5">
        <p className="flex items-baseline justify-between">
          <span className="text-[12px] leading-4 font-semibold text-[#333D4B]">
            복용률
          </span>
          <span className="text-[14px] leading-5 font-bold tracking-[-0.35px] text-[#01A16A]">
            {rate}%
          </span>
        </p>
        <div
          role="progressbar"
          aria-label="복용률"
          aria-valuenow={rate}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 overflow-hidden rounded-full bg-[#E5E8EB]"
        >
          <div
            className="h-full rounded-full bg-linear-to-r from-[#34D399] to-[#138A4B]"
            style={{ width: `${rate}%` }}
          />
        </div>
      </div>
      <ul className="flex items-center gap-3">
        {items.map(({ label, value, Icon, color }) => (
          <li key={label} className="flex items-center gap-1.5">
            <Icon
              size={14}
              strokeWidth={2}
              aria-label={label}
              className={color}
            />
            <span className="text-[12px] leading-4 font-semibold text-[#333D4B]">
              {value}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
