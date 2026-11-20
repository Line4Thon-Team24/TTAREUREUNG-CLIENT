import type { MouseEvent } from 'react';
import { CalendarDays } from 'lucide-react';
import { formatKoreanDate } from '@/utils/date';

type DateFieldProps = {
  value: string; // YYYY-MM-DD
  onChange?: (value: string) => void;
  min?: string;
  disabled?: boolean;
  'aria-label': string;
};

// 날짜 선택창 ('2026년 8월 12일' 형식으로 보여주고, 누르면 OS 기본 달력이 열림)
export default function DateField({
  value,
  onChange,
  min,
  disabled = false,
  'aria-label': ariaLabel,
}: DateFieldProps) {
  // 데스크톱 브라우저에서도 칸 어디를 눌러도 달력이 열리도록 처리
  const openPicker = (e: MouseEvent<HTMLInputElement>) => {
    try {
      e.currentTarget.showPicker();
    } catch {
      // showPicker 미지원 브라우저는 기본 동작 사용
    }
  };

  return (
    <div
      className={`relative flex h-12 w-full items-center justify-between rounded-xl border border-[#E5E8EB] bg-[#FAFAFA] px-3.25 transition-colors has-focus-visible:border-[#01A16A] ${disabled ? 'text-[13px] font-medium text-[#B0B8C1]' : 'text-[14px] font-medium text-[#333D4B]'}`}
    >
      <span>{formatKoreanDate(value)}</span>
      {!disabled && (
        <>
          <CalendarDays
            size={16}
            strokeWidth={2}
            aria-hidden
            className="text-[#374151]"
          />
          <input
            type="date"
            aria-label={ariaLabel}
            value={value}
            min={min}
            required
            onClick={openPicker}
            onChange={(e) => e.target.value && onChange?.(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </>
      )}
    </div>
  );
}
