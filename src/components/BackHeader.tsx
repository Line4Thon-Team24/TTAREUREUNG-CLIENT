import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

type BackHeaderProps = {
  onBack?: () => void;
};

// 뒤로가기 버튼만 있는 상단 헤더
export default function BackHeader({ onBack }: BackHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex h-12 items-center px-3">
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
