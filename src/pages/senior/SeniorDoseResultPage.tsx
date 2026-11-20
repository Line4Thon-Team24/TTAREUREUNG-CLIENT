import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MaskIcon from '@/components/common/MaskIcon';
import type { DoseResult } from '@/types/recognition';
import { DOSE_RESULT_VIEW, formatMonthDayTime } from '@/utils/recognition';
import phoneIcon from '@/assets/icons/phone.svg';
import infoIcon from '@/assets/icons/info.svg';
import successIcon from '@/assets/icons/recognition-success.svg';
import failureIcon from '@/assets/icons/recognition-failure.svg';

const RING_SIZE = 120;
const RING_STROKE = 16;

// 일부 복용(status=partial) 진행률 링 (takenCount / totalCount)
const ProgressRing = ({
  taken,
  total,
  color,
}: {
  taken: number;
  total: number;
  color: string;
}) => {
  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? taken / total : 0;

  return (
    <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          fill="none"
          stroke="#E5E8EB"
          strokeWidth={RING_STROKE}
        />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-[22px] font-bold"
        style={{ color }}
      >
        {taken} / {total}개
      </span>
    </div>
  );
};

// 시니어 복약 결과 화면 (복용 완료 / 일부 복용 / 미복용)
// 회차 종료 후 넘어온 복용 결과(location state)를 보여줌
const SeniorDoseResultPage = () => {
  const navigate = useNavigate();
  const result = useLocation().state as DoseResult | null;

  // 복용 결과 없이 들어오면 일정 화면으로
  useEffect(() => {
    if (!result) navigate('/senior', { replace: true });
  }, [result, navigate]);

  if (!result) return null;

  const { status } = result;
  const view = DOSE_RESULT_VIEW[status];

  return (
    <div className="flex min-h-dvh flex-col items-center bg-white px-5 py-10">
      <p className="text-[24px] font-bold text-text-title">
        {formatMonthDayTime(new Date(result.scheduledAt))}
      </p>

      <div className="flex flex-col items-center gap-6 py-10">
        {status === 'complete' && (
          <img src={successIcon} alt="" width={144} height={144} />
        )}
        {status === 'partial' && (
          <ProgressRing
            taken={result.takenCount}
            total={result.totalCount}
            color={view.color}
          />
        )}
        {status === 'missed' && (
          <img src={failureIcon} alt="" width={120} height={120} />
        )}
        <h1 className="text-[32px] font-bold text-text-title">{view.title}</h1>
      </div>

      <section
        className="flex w-full flex-col items-center gap-2.5 rounded-3xl border-2 p-5.5 shadow-[0_4px_20px_-2px_rgba(19,138,75,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)]"
        style={{ backgroundColor: view.background, borderColor: view.border }}
      >
        {result.nextCallAt && (
          <>
            <p
              className="flex items-center gap-2.5 text-[18px] font-bold"
              style={{ color: view.color }}
            >
              <MaskIcon src={phoneIcon} color={view.color} width={15} />
              다음 알림 전화
            </p>
            <p className="text-[44px] leading-none font-black text-text-title">
              {view.nextCallTime(result)}
            </p>
            <p className="text-[16px] font-bold text-text-body">
              {result.nextCallLabel}
            </p>
            <hr className="w-full border-black/10" />
          </>
        )}
        <p className="flex items-center gap-1.5 text-[14px] font-medium text-text-sub">
          <MaskIcon src={infoIcon} color={view.color} width={16} />
          {view.message(result)}
        </p>
      </section>
    </div>
  );
};

export default SeniorDoseResultPage;
