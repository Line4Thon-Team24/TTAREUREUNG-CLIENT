import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ZoomIn } from 'lucide-react';
import { finishSession, takeMedication } from '@/apis/dose';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import MicPrompt from '@/components/recognition/MicPrompt';
import MaskIcon from '@/components/common/MaskIcon';
import useLatestRequest from '@/hooks/useLatestRequest';
import useSessionCall from '@/hooks/useSessionCall';
import type { MedicationGuide } from '@/types/dose';
import { parsePositiveInt, toDoseResult } from '@/utils/recognition';
import pillIcon from '@/assets/icons/pill.svg';

type DoseScreenProps = {
  sessionId: number;
  scheduledAt: string; // 복용 시각
  medicines: MedicationGuide[];
  initialOrder: number;
};

// 시니어 약 복용 안내 화면 (복용 수량 + 약 사진 슬라이드)
const DoseScreen = ({
  sessionId,
  scheduledAt,
  medicines,
  initialOrder,
}: DoseScreenProps) => {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      medicines.findIndex((medicine) => medicine.order === initialOrder)
    )
  );
  const [zoomed, setZoomed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitError, setIsSubmitError] = useState(false);
  const startRequest = useLatestRequest();
  const current = medicines[index];

  // 초기 선택된 약의 슬라이드 위치로 이동
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = index * track.clientWidth;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.round(track.scrollLeft / track.clientWidth);
    setIndex(Math.min(Math.max(next, 0), medicines.length - 1));
  };

  // "다 먹었어" → 복용 처리 후 다음 약 찾기 (다 먹었으면 회차 종료 후 복용 결과)
  const handleDone = async () => {
    if (isSubmitting) return;
    // 요청이 끝났을 때 아직 이 화면에 있는지 확인
    const isLatest = startRequest();
    setIsSubmitting(true);
    setIsSubmitError(false);
    try {
      const { nextMedication } = await takeMedication(
        sessionId,
        current.medicationId
      );
      if (!isLatest()) return;
      if (nextMedication) {
        navigate(
          `/senior/find?sessionId=${sessionId}&order=${nextMedication.order}&mode=voice`,
          { replace: true }
        );
        return;
      }
      const finish = await finishSession(sessionId);
      if (!isLatest()) return;
      navigate('/senior/result', {
        replace: true,
        state: toDoseResult(finish, scheduledAt),
      });
    } catch {
      if (!isLatest()) return;
      setIsSubmitError(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col gap-6 bg-white px-5 pt-14 pb-12">
      <h1 className="text-center text-[32px] font-bold text-black">
        이 약을 복용해주세요!
      </h1>

      <div className="flex items-center justify-between rounded-2xl border border-border-divider px-4 py-3">
        <div className="flex items-center gap-2">
          <MaskIcon src={pillIcon} color="#0E6E3B" width={18} />
          <h2 className="text-[16px] font-bold text-text-main">복용 수량</h2>
        </div>
        <span className="text-[22px] font-bold text-text-title">
          {current.doseAmount}
        </span>
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto rounded-2xl"
        >
          {medicines.map((medicine) => (
            <button
              key={medicine.medicationId}
              type="button"
              onClick={() => setZoomed(true)}
              aria-label={`${medicine.name} 사진 크게 보기`}
              className="h-62 w-full shrink-0 snap-center bg-bg-section"
            >
              {medicine.imageUrl && (
                <img
                  src={medicine.imageUrl}
                  alt={medicine.name}
                  className="size-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
        <span className="pointer-events-none absolute right-2 bottom-3 flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[12px] font-semibold text-white">
          <ZoomIn size={14} aria-hidden="true" />
          터치하여 크게 보기
        </span>
      </div>

      <div className="flex justify-center gap-1.5" aria-hidden="true">
        {medicines.map((medicine, i) => (
          <span
            key={medicine.medicationId}
            className={`size-2 rounded-full ${i === index ? 'bg-bg-primary-pressed' : 'bg-text-on-dark-green'}`}
          />
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center gap-3">
        {isSubmitError && (
          <p role="alert" className="text-[16px] font-bold text-text-title">
            복용 처리를 하지 못했어요. 다시 눌러주세요.
          </p>
        )}
        <button
          type="button"
          onClick={handleDone}
          disabled={isSubmitting}
          className="text-center disabled:opacity-60"
        >
          <MicPrompt lead="약을 모두 복용하셨다면" keyword="다 먹었어" />
        </button>
      </div>

      {zoomed && current.imageUrl && (
        <button
          type="button"
          onClick={() => setZoomed(false)}
          aria-label="닫기"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <img
            src={current.imageUrl}
            alt={current.name}
            className="max-h-full max-w-full object-contain"
          />
        </button>
      )}
    </div>
  );
};

// 시니어 약 복용 안내 화면 (회차의 약 목록을 불러온 뒤 복용 안내 표시)
// ?sessionId=복용 회차, ?order=약 순서
const SeniorDosePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = parsePositiveInt(searchParams.get('sessionId'), 0);
  const order = parsePositiveInt(searchParams.get('order'));
  const { call, isError, retry } = useSessionCall(sessionId || null);

  // 회차 정보가 없거나 먹을 약이 남아 있지 않으면 일정 화면으로
  const hasNothingToTake =
    sessionId === 0 || (call !== null && call.medications.length === 0);

  useEffect(() => {
    if (hasNothingToTake) navigate('/senior', { replace: true });
  }, [hasNothingToTake, navigate]);

  if (!call || call.medications.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col bg-white">
        {isError ? (
          <ErrorState message="약 정보를 불러오지 못했어요." onRetry={retry} />
        ) : (
          <LoadingState />
        )}
      </div>
    );
  }

  return (
    <DoseScreen
      sessionId={sessionId}
      scheduledAt={call.scheduledAt}
      medicines={call.medications}
      initialOrder={order}
    />
  );
};

export default SeniorDosePage;
