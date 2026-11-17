import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GuideFrame from '@/components/recognition/GuideFrame';
import RecognitionResultCard from '@/components/recognition/RecognitionResultCard';
import TargetMedicineCard from '@/components/recognition/TargetMedicineCard';
import MaskIcon from '@/components/common/MaskIcon';
import useCameraStream from '@/hooks/useCameraStream';
import { mockCurrentDoseLabel, mockMedicineByOrder } from '@/mocks/recognition';
import { parsePositiveInt, parseRecognitionStatus } from '@/utils/recognition';
import type { RecognitionStatus } from '@/types/recognition';
import microphoneIcon from '@/assets/icons/microphone.svg';
import callStrokeIcon from '@/assets/icons/call-stroke.svg';
import retryIcon from '@/assets/icons/retry.svg';
import successIcon from '@/assets/icons/recognition-success.svg';
import errorIcon from '@/assets/icons/recognition-error.svg';
import failureIcon from '@/assets/icons/recognition-failure.svg';
import delayIcon from '@/assets/icons/recognition-delay.svg';

// 상태별 상단 문구
const HEADINGS: Record<RecognitionStatus, { title: string; sub: string }> = {
  scanning: {
    title: '약을\n보여주세요!',
    sub: '카메라를 약병 가까이 대주세요',
  },
  delayed: { title: '약을\n보여주세요!', sub: '카메라를 약병 가까이 대주세요' },
  success: { title: '맞는 약이에요!', sub: mockCurrentDoseLabel },
  error: { title: '오류가\n발생했어요!', sub: '약 사진 화면으로 전환돼요' },
  wrong: { title: '다른 약이에요!', sub: '우측 사진 속 약을 찾아주세요' },
};

// 성공·오류 후 다음 화면으로 넘어가기까지 시간(ms)
const AUTO_NEXT_DELAY = 3000;

// 시니어 약 인식 화면
// ?status=scanning|success|error|delayed|wrong, ?order=약 순서
const SeniorRecognitionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = parseRecognitionStatus(searchParams.get('status'));
  const order = parsePositiveInt(searchParams.get('order'));
  const medicine = mockMedicineByOrder(order);
  const videoRef = useCameraStream();
  const heading = HEADINGS[status];
  const dimmed = status !== 'scanning' && status !== 'success';

  useEffect(() => {
    // TODO: API 연동 시 status를 서버/모델 결과로 대체
    if (status === 'success') {
      const timer = window.setTimeout(
        () => navigate(`/senior/dose?order=${order}`, { replace: true }),
        AUTO_NEXT_DELAY
      );
      return () => window.clearTimeout(timer);
    }
    if (status === 'error') {
      const timer = window.setTimeout(
        () =>
          navigate(`/senior/find?order=${order}&mode=voice`, { replace: true }),
        AUTO_NEXT_DELAY
      );
      return () => window.clearTimeout(timer);
    }
    if (status === 'wrong') {
      const timer = window.setTimeout(
        () => navigate(`/senior/recognition?order=${order}`, { replace: true }),
        AUTO_NEXT_DELAY
      );
      return () => window.clearTimeout(timer);
    }
  }, [status, order, navigate]);

  const handleHelp = () => {
    // TODO: 보호자 도움 요청하기 연동
  };

  const handleSearchMore = () => {
    navigate(`/senior/find?order=${order}&mode=countdown&retry=1`);
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
          medicine={medicine}
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
              {medicine.doseGuide}
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
          <button
            type="button"
            onClick={handleHelp}
            className="flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-bg-primary text-[18px] font-bold text-white active:bg-bg-primary-pressed"
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

export default SeniorRecognitionPage;
