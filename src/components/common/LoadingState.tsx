import { LoaderCircle } from 'lucide-react';

type LoadingStateProps = {
  className?: string; // 영역 크기·여백 (기본: 남은 공간 가운데)
};

// 데이터를 불러오는 중 (스피너)
export default function LoadingState({
  className = 'flex-1',
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-label="불러오는 중"
      className={`flex items-center justify-center ${className}`}
    >
      <LoaderCircle
        size={28}
        aria-hidden
        className="animate-spin text-[#01A16A] motion-reduce:animate-none"
      />
    </div>
  );
}
