import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

type StepHeaderProps = {
  title: string;
  subtitle?: string; // 없으면 제목만 크게 표시 (예: '약 목록 편집')
  status?: string; // 오른쪽 상태 배지 (예: '인식 완료')
  onBack?: () => void;
};

// 뒤로가기 + 제목(+설명) + 상태 배지가 있는 상단 헤더
export default function StepHeader({
  title,
  subtitle,
  status,
  onBack,
}: StepHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#E5E8EB] bg-white px-3 pt-10 pb-4">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={onBack ?? (() => navigate(-1))}
        className="flex size-10 shrink-0 items-center justify-center text-[#191F28]"
      >
        <ChevronLeft size={28} strokeWidth={2.5} aria-hidden />
      </button>
      <div className="flex flex-1 items-center justify-between pr-2">
        <div className="flex flex-col gap-1">
          <h1
            className={`font-bold text-[#191F28] ${subtitle ? 'text-[16px]' : 'text-[22px]'}`}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-[12px] font-medium text-[#01A16A]">{subtitle}</p>
          )}
        </div>
        {status && (
          <span className="flex items-center gap-1 rounded-full bg-[#E7F6EC] px-2.5 py-1 text-[12px] font-semibold text-[#01A16A]">
            <span className="size-1.5 rounded-full bg-[#01A16A]" aria-hidden />
            {status}
          </span>
        )}
      </div>
    </header>
  );
}
