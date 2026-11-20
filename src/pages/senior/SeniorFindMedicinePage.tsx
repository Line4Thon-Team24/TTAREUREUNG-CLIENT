import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import MaskIcon from '@/components/common/MaskIcon';
import MicPrompt from '@/components/recognition/MicPrompt';
import StorageGuideCard from '@/components/recognition/StorageGuideCard';
import useCountdown from '@/hooks/useCountdown';
import useSessionCall from '@/hooks/useSessionCall';
import type { MedicationGuide } from '@/types/dose';
import { parsePositiveInt } from '@/utils/recognition';
import { formatMedicineOrder, toStorageGuide } from '@/utils/call';
import pillIcon from '@/assets/icons/pill.svg';

// 카메라로 전환되기까지 시간(초)
const SWITCH_SECONDS = 5;

type FindScreenProps = {
  medicine: MedicationGuide;
  remainingCount: number;
  isCountdown: boolean;
  isRetry: boolean;
  onFound: () => void;
};

const FindScreen = ({
  medicine,
  remainingCount,
  isCountdown,
  isRetry,
  onFound,
}: FindScreenProps) => (
  <div className="flex min-h-dvh flex-col gap-6 bg-white px-5 py-10">
    <h1 className="text-center text-[32px] font-bold text-black">
      {isRetry ? '다시 이 약을 찾아주세요!' : '이 약을 찾아주세요!'}
    </h1>

    <div className="flex items-center justify-between rounded-2xl border border-border-divider px-4 py-4">
      <div className="flex items-center gap-2">
        <MaskIcon src={pillIcon} color="#0E6E3B" width={18} />
        <h2 className="text-[22px] font-bold text-text-title">
          {formatMedicineOrder(medicine.order)}
        </h2>
      </div>
      <span className="flex items-center gap-4 rounded-lg border border-bg-secondary-pressed bg-bg-secondary/20 px-3 py-1.25 text-[12px] text-text-title">
        남은 개수
        <b className="text-[16px] font-bold">{remainingCount}개</b>
      </span>
    </div>

    {medicine.imageUrl ? (
      <img
        src={medicine.imageUrl}
        alt={medicine.name}
        className="h-68 w-full rounded-lg object-cover"
      />
    ) : (
      <div className="h-68 w-full rounded-lg bg-bg-section" />
    )}

    <StorageGuideCard guide={toStorageGuide(medicine.storageLocation)} />

    <div className="mt-auto flex justify-center">
      {isCountdown ? (
        <Countdown onDone={onFound} />
      ) : (
        <button type="button" onClick={onFound} className="text-center">
          <MicPrompt lead="약을 찾으셨다면" keyword="찾았어" />
        </button>
      )}
    </div>
  </div>
);

// 시니어 약 사진 안내 화면 (다음 약 찾기 / 약 다시 찾기)
// ?sessionId=복용 회차, ?order=약 순서,
// ?mode=voice(음성으로 찾았다고 답) | countdown(자동 카메라 전환)
// ?retry=1(다시 찾기)
const SeniorFindMedicinePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = parsePositiveInt(searchParams.get('sessionId'), 0);
  const order = parsePositiveInt(searchParams.get('order'));
  const isCountdown = searchParams.get('mode') === 'countdown';
  const isRetry = searchParams.get('retry') === '1';
  const { call, isError, retry } = useSessionCall(sessionId || null);

  const medicine =
    call?.medications.find((item) => item.order === order) ??
    call?.medications[0];
  // 회차 정보가 없거나 찾을 약이 남아 있지 않으면 일정 화면으로
  const hasNothingToFind = sessionId === 0 || (call !== null && !medicine);

  useEffect(() => {
    if (hasNothingToFind) navigate('/senior', { replace: true });
  }, [hasNothingToFind, navigate]);

  if (!call || !medicine) {
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

  // 카메라 화면에서 약 판독에 쓰는 복용 회차와 약 순서
  const goCamera = () =>
    navigate(
      `/senior/recognition?sessionId=${sessionId}&order=${medicine.order}`,
      {
        replace: true,
      }
    );

  return (
    <FindScreen
      medicine={medicine}
      remainingCount={call.medications.length}
      isCountdown={isCountdown}
      isRetry={isRetry}
      onFound={goCamera}
    />
  );
};

const Countdown = ({ onDone }: { onDone: () => void }) => {
  const remaining = useCountdown(SWITCH_SECONDS, onDone);
  return (
    <p className="text-[22px] font-bold text-text-title">
      <span className="text-text-main">{remaining}</span>초 후 카메라로
      전환됩니다
    </p>
  );
};

export default SeniorFindMedicinePage;
