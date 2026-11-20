import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

type MethodOptionCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  recommended?: boolean;
  onClick: () => void;
};

// 약 등록 방법 선택 카드 (갤러리 / 파일 / 카메라)
export default function MethodOptionCard({
  icon,
  title,
  description,
  recommended = false,
  onClick,
}: MethodOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl border border-[#E5E8EB] bg-white p-4.25 text-left drop-shadow-[0_2px_6px_rgba(0,0,0,0.04)] transition-[scale] duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none"
    >
      <span className="flex items-center gap-4">
        <span
          className={`flex size-13 shrink-0 items-center justify-center rounded-xl ${recommended ? 'bg-[#E7F6EC] text-[#01A16A]' : 'bg-[#F2F4F6] text-[#374151]'}`}
          aria-hidden
        >
          {icon}
        </span>
        <span className="flex flex-col gap-px">
          <span className="flex items-center gap-2">
            <span className="text-[16px] font-bold text-[#191F28]">
              {title}
            </span>
            {recommended && (
              <span className="rounded-sm bg-[#E7F6EC] px-1.5 py-0.5 text-[11px] font-semibold text-[#0E6E3B]">
                추천
              </span>
            )}
          </span>
          <span className="text-[13px] text-[#6B7684]">{description}</span>
        </span>
      </span>
      <ChevronRight
        size={18}
        strokeWidth={2.5}
        aria-hidden
        className="shrink-0 text-[#8B95A1]"
      />
    </button>
  );
}
