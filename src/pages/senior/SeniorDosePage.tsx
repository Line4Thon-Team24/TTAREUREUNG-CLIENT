import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZoomIn } from 'lucide-react';
import MicPrompt from '@/components/recognition/MicPrompt';
import MaskIcon from '@/components/common/MaskIcon';
import { mockTargetMedicines } from '@/mocks/recognition';
import pillIcon from '@/assets/icons/pill.svg';

// 시니어 약 복용 안내 화면 (복용 수량 + 약 사진 슬라이드)
const SeniorDosePage = () => {
  const navigate = useNavigate();
  const medicines = mockTargetMedicines;
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const current = medicines[index];

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.round(track.scrollLeft / track.clientWidth);
    setIndex(Math.min(Math.max(next, 0), medicines.length - 1));
  };

  const handleDone = () => {
    // TODO: 음성 인식("다 먹었어") 연동 시 호출. 지금은 클릭 시 복용 결과 화면으로 이동
    navigate('/senior/result?status=complete');
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
              key={medicine.id}
              type="button"
              onClick={() => setZoomed(true)}
              aria-label={`${medicine.displayName} 사진 크게 보기`}
              className="h-62 w-full shrink-0 snap-center"
            >
              <img
                src={medicine.imageUrl}
                alt={medicine.displayName}
                className="size-full object-cover"
              />
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
            key={medicine.id}
            className={`size-2 rounded-full ${i === index ? 'bg-bg-primary-pressed' : 'bg-text-on-dark-green'}`}
          />
        ))}
      </div>

      <div className="mt-auto flex justify-center">
        <button type="button" onClick={handleDone} className="text-center">
          <MicPrompt lead="약을 모두 복용하셨다면" keyword="다 먹었어" />
        </button>
      </div>

      {zoomed && (
        <button
          type="button"
          onClick={() => setZoomed(false)}
          aria-label="닫기"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <img
            src={current.imageUrl}
            alt={current.displayName}
            className="max-h-full max-w-full object-contain"
          />
        </button>
      )}
    </div>
  );
};

export default SeniorDosePage;
