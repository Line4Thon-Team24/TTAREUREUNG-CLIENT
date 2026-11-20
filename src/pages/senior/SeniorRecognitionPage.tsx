import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { recognizeMedication, requestHelp } from '@/apis/dose';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import GuideFrame from '@/components/recognition/GuideFrame';
import RecognitionResultCard from '@/components/recognition/RecognitionResultCard';
import TargetMedicineCard from '@/components/recognition/TargetMedicineCard';
import MaskIcon from '@/components/common/MaskIcon';
import useCameraStream from '@/hooks/useCameraStream';
import useLatestRequest from '@/hooks/useLatestRequest';
import useSessionCall from '@/hooks/useSessionCall';
import type { MedicationGuide } from '@/types/dose';
import type { RecognitionStatus } from '@/types/recognition';
import { captureVideoFrame } from '@/utils/camera';
import { parsePositiveInt } from '@/utils/recognition';
import microphoneIcon from '@/assets/icons/microphone.svg';
import callStrokeIcon from '@/assets/icons/call-stroke.svg';
import retryIcon from '@/assets/icons/retry.svg';
import successIcon from '@/assets/icons/recognition-success.svg';
import errorIcon from '@/assets/icons/recognition-error.svg';
import failureIcon from '@/assets/icons/recognition-failure.svg';
import delayIcon from '@/assets/icons/recognition-delay.svg';

// 상태별 상단 문구 (맞는 약 문구는 약마다 달라 화면에서 채움)
const HEADINGS: Record<
  Exclude<RecognitionStatus, 'success'>,
  { title: string; sub: string }
> = {
  scanning: {
    title: '약을\n보여주세요!',
    sub: '카메라를 약병 가까이 대주세요',
  },
  delayed: { title: '약을\n보여주세요!', sub: '카메라를 약병 가까이 대주세요' },
  error: { title: '오류가\n발생했어요!', sub: '약 사진 화면으로 전환돼요' },
  wrong: { title: '다른 약이에요!', sub: '우측 사진 속 약을 찾아주세요' },
};

// 성공·오류 후 다음 화면으로 넘어가기까지 시간(ms)
const AUTO_NEXT_DELAY = 3000;

// 카메라가 켜지기를 기다린 뒤 사진을 판독 요청하는 간격(ms)
const SCAN_INTERVAL = 2000;

// 이 시간 동안 맞는 약을 못 찾으면 '약 찾기 어려우신가요?' 안내(ms)
const DELAYED_AFTER = 20000;

type RecognitionScreenProps = {
  sessionId: number;
  medicine: MedicationGuide;
};

// 시니어 약 인식 화면 (카메라로 찍은 사진을 서버에 판독 요청)
const RecognitionScreen = ({ sessionId, medicine }: RecognitionScreenProps) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<RecognitionStatus>('scanning');
  const [isHelping, setIsHelping] = useState(false);
  const [isHelpError, setIsHelpError] = useState(false);
  const startRequest = useLatestRequest();
  const videoRef = useCameraStream();
  const dimmed = status !== 'scanning' && status !== 'success';
  const { medicationId, order } = medicine;
  const doseLabel = `${medicine.name} ${medicine.doseAmount}`;
  const heading =
    status === 'success'
      ? { title: '맞는 약이에요!', sub: doseLabel }
      : HEADINGS[status];

  // 인식 중에는 일정 간격으로 한 장씩 찍어 판독 (오래 못 찾으면 지연 안내)
  useEffect(() => {
    if (status !== 'scanning') return;
    let cancelled = false;
    let timer = 0;
    const startedAt = Date.now();

    const scan = async () => {
      if (Date.now() - startedAt >= DELAYED_AFTER) {
        setStatus('delayed');
        return;
      }
      try {
        const frame = videoRef.current
          ? await captureVideoFrame(videoRef.current)
          : null;
        if (cancelled) return;
        if (frame) {
          const { result, attemptsLeft } = await recognizeMedication(
            sessionId,
            medicationId,
            frame
          );
          if (cancelled) return;
          if (result === 'MATCH') {
            setStatus('success');
            return;
          }
          if (result === 'MISMATCH') {
            setStatus('wrong');
            return;
          }
          // 확실하지 않으면(UNCERTAIN) 계속 찍되 횟수를 다 쓰면 사진 보고 직접 찾기
          if (attemptsLeft <= 0) {
            setStatus('error');
            return;
          }
        }
      } catch {
        if (!cancelled) setStatus('error');
        return;
      }
      timer = window.setTimeout(scan, SCAN_INTERVAL);
    };
    timer = window.setTimeout(scan, SCAN_INTERVAL);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [status, sessionId, medicationId, videoRef]);

  useEffect(() => {
    if (status === 'success') {
      const timer = window.setTimeout(
        () =>
          navigate(`/senior/dose?sessionId=${sessionId}&order=${order}`, {
            replace: true,
          }),
        AUTO_NEXT_DELAY
      );
      return () => window.clearTimeout(timer);
    }
    if (status === 'error') {
      const timer = window.setTimeout(
        () =>
          navigate(
            `/senior/find?sessionId=${sessionId}&order=${order}&mode=voice`,
            { replace: true }
          ),
        AUTO_NEXT_DELAY
      );
      return () => window.clearTimeout(timer);
    }
    if (status === 'wrong') {
      // 다른 약이면 잠시 안내한 뒤 다시 인식
      const timer = window.setTimeout(
        () => setStatus('scanning'),
        AUTO_NEXT_DELAY
      );
      return () => window.clearTimeout(timer);
    }
  }, [status, sessionId, order, navigate]);

  // 보호자에게 도움 요청 후 사진을 보고 직접 찾는 화면으로
  const handleHelp = async () => {
    if (isHelping) return;
    const isLatest = startRequest();
    setIsHelping(true);
    setIsHelpError(false);
    try {
      await requestHelp(sessionId);
      if (!isLatest()) return;
      navigate(
        `/senior/find?sessionId=${sessionId}&order=${order}&mode=voice`,
        { replace: true }
      );
    } catch {
      if (!isLatest()) return;
      setIsHelpError(true);
      setIsHelping(false);
    }
  };

  const handleSearchMore = () => {
    navigate(
      `/senior/find?sessionId=${sessionId}&order=${order}&mode=countdown&retry=1`
    );
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-bg-call px-5 pt-10 pb-5">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 size-full object-cover"
      />
      {dimmed && <div className="absolute inset-0 bg-black/50" />}

      <GuideFrame className="bottom-5 left-1/2 h-[70%] max-h-[550px] w-auto -translate-x-1/2" />

      <header className="relative z-10 flex items-start justify-between gap-2">
        <div className="flex flex-col gap-3 text-white">
          <h1 className="text-[32px] leading-tight font-bold whitespace-pre-line">
            {heading.title}
          </h1>
          <p className="text-[16px] font-semibold text-bg-secondary">
            {heading.sub}
          </p>
        </div>
        <TargetMedicineCard
          label={status === 'success' ? '다음 복용 약' : '찾아야 할 약'}
          medicine={{
            imageUrl: medicine.imageUrl,
            displayName: medicine.name,
            appearance: medicine.appearance,
          }}
          showAppearance={status === 'success'}
        />
      </header>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center px-10">
        {/* 인식 성공 */}
        {status === 'success' && (
          <RecognitionResultCard
            icon={<img src={successIcon} alt="" width={144} height={144} />}
            title="맞는 약이에요!"
          >
            <p className="rounded-full bg-bg-secondary px-4 py-1.5 text-[16px] font-bold text-text-main">
              {medicine.doseAmount} 복용해 주세요
            </p>
          </RecognitionResultCard>
        )}

        {/* 인식 오류 */}
        {status === 'error' && (
          <RecognitionResultCard
            icon={<img src={errorIcon} alt="" width={120} height={109} />}
            title="오류가 발생했어요!"
          >
            <p className="text-[20px] leading-snug text-text-body">
              사진을 보고 적절한
              <br />
              약을 골라주세요.
            </p>
          </RecognitionResultCard>
        )}

        {/* 다른 약 인식 */}
        {status === 'wrong' && (
          <RecognitionResultCard
            icon={<img src={failureIcon} alt="" width={112} height={112} />}
            title="다른 약이에요!"
          >
            <p className="text-[20px] leading-snug text-text-body">
              상단의 안내 사진과 같은 약을
              <br />
              찾아주세요.
            </p>
          </RecognitionResultCard>
        )}

        {/* 인식 지연 */}
        {status === 'delayed' && (
          <RecognitionResultCard
            icon={<img src={delayIcon} alt="" width={132} height={132} />}
            title="약 찾기 어려우신가요?"
          >
            <p className="flex items-center gap-3 rounded-2xl border border-border-divider bg-bg-section px-4 py-3 text-left text-[16px] font-bold text-text-title">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white">
                <MaskIcon src={microphoneIcon} color="#2196F3" width={24} />
              </span>
              "못 찾겠어" 혹은 "더 찾아볼게"라고 말씀해주세요.
            </p>
          </RecognitionResultCard>
        )}
      </div>

      {status === 'delayed' && (
        <div className="relative z-10 mt-auto flex flex-col gap-3">
          {isHelpError && (
            <p
              role="alert"
              className="text-center text-[16px] font-bold text-white"
            >
              도움 요청을 보내지 못했어요. 다시 눌러주세요.
            </p>
          )}
          <button
            type="button"
            onClick={handleHelp}
            disabled={isHelping}
            className="flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-bg-primary text-[18px] font-bold text-white active:bg-bg-primary-pressed disabled:opacity-60"
          >
            <img src={callStrokeIcon} alt="" width={24} height={24} />
            도움 요청하기 (누르기)
          </button>
          <button
            type="button"
            onClick={handleSearchMore}
            className="flex h-14 items-center justify-center gap-2.5 rounded-2xl border border-white/20 bg-white/15 text-[18px] font-bold text-white active:bg-black/20"
          >
            <img src={retryIcon} alt="" width={20} height={20} />
            조금 더 찾아볼게요 (누르기)
          </button>
        </div>
      )}
    </div>
  );
};

// 시니어 약 인식 화면 (회차의 약 목록을 불러온 뒤 카메라 화면 표시)
// ?sessionId=복용 회차, ?order=약 순서
const SeniorRecognitionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = parsePositiveInt(searchParams.get('sessionId'), 0);
  const order = parsePositiveInt(searchParams.get('order'));
  const { call, isError, retry } = useSessionCall(sessionId || null);

  const medicine =
    call?.medications.find((item) => item.order === order) ??
    call?.medications[0];
  // 회차 정보가 없거나 먹을 약이 남아 있지 않으면 일정 화면으로
  const hasNothingToFind = sessionId === 0 || (call !== null && !medicine);

  useEffect(() => {
    if (hasNothingToFind) navigate('/senior', { replace: true });
  }, [hasNothingToFind, navigate]);

  if (!medicine) {
    return (
      <div className="flex min-h-dvh flex-col bg-bg-call">
        {isError ? (
          <ErrorState message="약 정보를 불러오지 못했어요." onRetry={retry} />
        ) : (
          <LoadingState />
        )}
      </div>
    );
  }

  return <RecognitionScreen sessionId={sessionId} medicine={medicine} />;
};

export default SeniorRecognitionPage;
