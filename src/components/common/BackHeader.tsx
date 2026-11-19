import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

type BackHeaderProps = {
  onBack?: () => void;
  compact?: boolean; // 위 여백을 줄임 (상태 표시줄 공간 없이)
};

// 뒤로가기 버튼만 있는 상단 헤더
export default function BackHeader({ onBack, compact }: BackHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className={`flex items-center px-3 ${compact ? 'pt-4' : 'pt-10'}`}>
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={onBack ?? (() => navigate(-1))}
        className="flex size-10 items-center justify-center text-[#191F28]"
      >
        <ChevronLeft size={28} strokeWidth={2.5} aria-hidden />
      </button>
    </header>
  );
}
