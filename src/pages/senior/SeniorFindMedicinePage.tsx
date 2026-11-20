import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { requestHelp } from '@/apis/dose';
import ConfirmModal from '@/components/common/ConfirmModal';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import MaskIcon from '@/components/common/MaskIcon';
import MicPrompt from '@/components/recognition/MicPrompt';
import StorageGuideCard from '@/components/recognition/StorageGuideCard';
import useCountdown from '@/hooks/useCountdown';
import useSessionCall from '@/hooks/useSessionCall';
import useVoice from '@/hooks/useVoice';
import type { MedicationGuide } from '@/types/dose';
import { speak } from '@/utils/speech';
import { parsePositiveInt } from '@/utils/recognition';
import { formatMedicineOrder, toStorageGuide } from '@/utils/call';
import pillIcon from '@/assets/icons/pill.svg';

// 카메라로 전환되기까지 시간(초)
const SWITCH_SECONDS = 5;

type FindScreenProps = {
  sessionId: number;
  medicine: MedicationGuide;
  remainingCount: number;
  isCountdown: boolean;
  isRetry: boolean;
  onFound: () => void;
};

const FindScreen = ({
  sessionId,
  medicine,
  remainingCount,
  isCountdown,
  isRetry,
  onFound,
}: FindScreenProps) => {
  const [isHelpAsking, setIsHelpAsking] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  // 도움 요청을 보내고 응답을 읽는 중 (이 동안은 듣지 않음)
  const [isHelpSending, setIsHelpSending] = useState(false);
  const isHelpSendingRef = useRef(false);

  // 도움 요청 후 보호자에게 알렸다고 읽어 줌 (실패해도 화면은 그대로)
  // 응답을 읽는 동안 마이크가 켜져 있으면 응답 속 "도움"이 다시 명령으로 인식될 수 있으므로
  // 요청 전에 음성을 끄고(읽기가 끊기지 않도록), 읽기가 끝난 뒤에 다시 켬
  const sendHelp = async () => {
    if (isHelpSendingRef.current) return;
    isHelpSendingRef.current = true;
    setIsHelpSending(true);
    try {
      const { voiceText } = await requestHelp(sessionId);
      await speak(voiceText);
    } catch {
      // 직접 찾기 버튼이 그대로 있으므로 조용히 넘어감
    }
    isHelpSendingRef.current = false;
    setIsHelpSending(false);
    setIsHelpAsking(false);
    setRestartKey((prev) => prev + 1);
  };

  // 안내를 읽어 준 뒤 "찾았어"를 들음 (자동 전환 중에는 듣지 않음)
  // 도움 요청 팝업이 열려 있는 동안에는 팝업을 읽어 주고 "도와줘"/"더 찾아볼게"를 들음
  const handleKeepSearching = () => {
    setIsHelpAsking(false);
    setRestartKey((prev) => prev + 1);
  };
  useVoice({
    text: isHelpAsking
      ? '약을 못 찾으셨나요? 보호자에게 도움을 요청할까요? 도와줘, 또는 더 찾아볼게, 라고 말씀해주세요.'
      : medicine.voiceText,
    restartKey,
    enabled: !isHelpSending,
    commands: isHelpAsking
      ? { HELP: () => void sendHelp(), MORE: handleKeepSearching }
      : isCountdown
        ? undefined
        : {
            FOUND: onFound,
            NOT_FOUND: () => setIsHelpAsking(true),
            HELP: () => void sendHelp(),
          },
  });

  return (
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

      <ConfirmModal
        open={isHelpAsking && !isHelpSending}
        message={'약을 못 찾으셨나요?\n보호자에게 도움을 요청할게요.'}
        cancelLabel="더 찾아볼게요"
        confirmLabel="도움 요청"
        onCancel={handleKeepSearching}
        onConfirm={() => void sendHelp()}
      />
    </div>
  );
};

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
      sessionId={sessionId}
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
