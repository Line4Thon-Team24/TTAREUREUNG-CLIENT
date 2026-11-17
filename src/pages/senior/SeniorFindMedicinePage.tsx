import { useNavigate, useSearchParams } from 'react-router-dom';
import MaskIcon from '@/components/common/MaskIcon';
import MicPrompt from '@/components/recognition/MicPrompt';
import StorageGuideCard from '@/components/recognition/StorageGuideCard';
import useCountdown from '@/hooks/useCountdown';
import { mockMedicineByOrder } from '@/mocks/recognition';
import { parsePositiveInt } from '@/utils/recognition';
import { formatMedicineOrder } from '@/utils/call';
import pillIcon from '@/assets/icons/pill.svg';

// 카메라로 전환되기까지 시간(초)
const SWITCH_SECONDS = 5;

// 시니어 약 사진 안내 화면 (다음 약 찾기 / 약 다시 찾기)
// ?order=약 순서,
// ?mode=voice(음성으로 찾았다고 답) | countdown(자동 카메라 전환)
// ?retry=1(다시 찾기)
const SeniorFindMedicinePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const order = parsePositiveInt(searchParams.get('order'));
  const isCountdown = searchParams.get('mode') === 'countdown';
  const isRetry = searchParams.get('retry') === '1';
  const medicine = mockMedicineByOrder(order);

  const goCamera = () =>
    navigate(`/senior/recognition?order=${order}`, { replace: true });

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
          <b className="text-[16px] font-bold">{medicine.remainingCount}개</b>
        </span>
      </div>

      <img
        src={medicine.imageUrl}
        alt={medicine.displayName}
        className="h-68 w-full rounded-lg object-cover"
      />

      <StorageGuideCard guide={medicine.storageGuide} />

      <div className="mt-auto flex justify-center">
        {isCountdown ? (
          <Countdown onDone={goCamera} />
        ) : (
          <MicPrompt lead="약을 찾으셨다면" keyword="찾았어" />
        )}
      </div>
    </div>
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
