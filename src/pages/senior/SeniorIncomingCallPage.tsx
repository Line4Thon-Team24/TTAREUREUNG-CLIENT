import { useEffect, useRef, useState } from 'react';
import {
  MedicineOrderCard,
  StorageLocationCard,
} from '@/components/senior/IncomingCallInfo';
import { useNavigate } from 'react-router-dom';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import { answerSession, reportNoAnswer } from '@/apis/dose';
import useCurrentSession from '@/hooks/useCurrentSession';
import useLatestRequest from '@/hooks/useLatestRequest';
import useSeniors from '@/hooks/useSeniors';
import callIcon from '@/assets/icons/call.svg';
import {
  formatCallTime,
  formatMedicineOrder,
  toStorageGuide,
} from '@/utils/call';

const PAGE_BACKGROUND =
  'bg-linear-to-b from-[#0F2419] from-0% to-[#2A563F] to-100%';

// 시니어 복약 알림 수신 화면
const SeniorIncomingCallPage = () => {
  const navigate = useNavigate();

  // TODO: 시니어 로그인·프로필 선택 연동 후 선택한 시니어로 교체
  const {
    seniors,
    isError: isSeniorsError,
    retry: retrySeniors,
  } = useSeniors();
  const seniorId = seniors?.[0]?.id ?? null;
  const {
    session,
    isError: isSessionError,
    retry: retrySession,
  } = useCurrentSession(seniorId);

  const [isAnswering, setIsAnswering] = useState(false);
  const [isAnswerError, setIsAnswerError] = useState(false);
  const startRequest = useLatestRequest();
  // 전화 응답 or 미응답 시 true
  const isHandledRef = useRef(false);

  const call = session?.current ?? null;
  const medicine = call?.medications[0];
  // 울려야 할 회차(또는 찾을 약)가 없으면 일정 화면으로
  const hasNoCall =
    (seniors !== null && seniorId === null) || (session !== null && !medicine);

  useEffect(() => {
    if (hasNoCall) navigate('/senior', { replace: true });
  }, [hasNoCall, navigate]);

  const sessionId = call?.sessionId;

  // 전화를 받지 않고 화면을 닫으면(탭 닫기·앱 종료) 미응답으로 알림
  useEffect(() => {
    if (sessionId === undefined) return;
    const handlePageHide = () => {
      if (isHandledRef.current) return;
      isHandledRef.current = true;
      reportNoAnswer(sessionId);
    };
    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, [sessionId]);

  const handleAccept = async () => {
    if (!call || isAnswering) return;
    isHandledRef.current = true;
    // 요청이 끝났을 때 아직 이 화면에 있는지 확인
    const isLatest = startRequest();
    setIsAnswering(true);
    setIsAnswerError(false);
    try {
      const answered = await answerSession(call.sessionId);
      if (!isLatest()) return;
      // 먹을 약이 남아 있지 않으면 일정 화면으로
      const first = answered.medications[0];
      navigate(
        first
          ? `/senior/recognition?sessionId=${answered.sessionId}&order=${first.order}`
          : '/senior',
        { replace: true }
      );
    } catch {
      if (!isLatest()) return;
      // 미응답으로 처리
      isHandledRef.current = false;
      setIsAnswerError(true);
      setIsAnswering(false);
    }
  };

  if (!call || !medicine) {
    return (
      <div className={`flex min-h-dvh flex-col ${PAGE_BACKGROUND}`}>
        {isSeniorsError ? (
          <ErrorState
            message="시니어 정보를 불러오지 못했어요."
            onRetry={retrySeniors}
          />
        ) : isSessionError ? (
          <ErrorState
            message="복약 알림을 불러오지 못했어요."
            onRetry={retrySession}
          />
        ) : (
          <LoadingState />
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-dvh flex-col ${PAGE_BACKGROUND} px-5 pt-10 pb-10`}
    >
      <header className="flex flex-col items-center gap-2 text-center leading-none">
        <h1 className="text-[28px] font-bold text-white">
          {formatCallTime(new Date(call.scheduledAt))}
        </h1>
        <p className="text-[14px] text-text-on-dark-green">
          정기 복용 시간입니다
        </p>
      </header>

      <div className="flex flex-1 flex-col justify-center gap-6 py-8">
        <MedicineOrderCard
          title={formatMedicineOrder(medicine.order)}
          remainingCount={call.medications.length}
        />
        {medicine.imageUrl && (
          <img
            src={medicine.imageUrl}
            alt={medicine.name}
            className="h-68 w-full rounded-2xl object-cover"
          />
        )}
        <StorageLocationCard guide={toStorageGuide(medicine.storageLocation)} />
      </div>

      <div className="mt-auto flex flex-col items-center gap-2.5">
        {isAnswerError && (
          <p role="alert" className="text-[16px] font-bold text-white">
            전화를 받지 못했어요. 다시 눌러주세요.
          </p>
        )}
        <button
          type="button"
          onClick={handleAccept}
          disabled={isAnswering}
          aria-label="전화 받기"
          className="flex size-24 items-center justify-center rounded-full border-6 border-bg-secondary-pressed/80 bg-bg-primary active:bg-bg-primary-pressed disabled:opacity-60"
        >
          <img src={callIcon} alt="" width={30} height={30} />
        </button>
        <span className="text-[22px] font-bold text-white">전화 받기</span>
      </div>
    </div>
  );
};

export default SeniorIncomingCallPage;
