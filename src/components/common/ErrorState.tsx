import { RotateCw } from 'lucide-react';

type ErrorStateProps = {
  message: string;
  onRetry: () => void;
  className?: string; // 영역 크기·여백 (기본: 남은 공간 가운데)
};

// 불러오기 실패 안내 + 다시 시도 버튼
export default function ErrorState({
  message,
  onRetry,
  className = 'flex-1',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <p className="text-[14px] text-[#6B7684]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-1.5 rounded-full border border-[#E5E8EB] bg-white px-4 py-2 text-[14px] font-semibold text-[#333D4B] transition-transform active:scale-95 motion-reduce:transition-none"
      >
        <RotateCw size={14} aria-hidden />
        다시 시도
      </button>
    </div>
  );
}
