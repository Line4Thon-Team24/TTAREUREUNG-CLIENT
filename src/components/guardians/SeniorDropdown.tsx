import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import type { Senior } from '@/types/senior';

type SeniorDropdownProps = {
  seniors: Senior[];
  selectedId: number;
  onSelect: (id: number) => void;
};

// 담당 시니어 변경 드롭다운 (보호자 목록 편집)
export default function SeniorDropdown({
  seniors,
  selectedId,
  onSelect,
}: SeniorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = seniors.find(({ id }) => id === selectedId);

  // 바깥 클릭·Esc로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`담당 시니어 변경, 현재 ${selected?.name ?? '없음'}`}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 rounded-md border border-[#01A16A] px-2.25 py-1.25 text-[12px] font-semibold text-[#01A16A]"
      >
        {selected?.name ?? '-'}
        <ChevronDown size={12} strokeWidth={2.5} aria-hidden />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label="담당 시니어"
          className="absolute top-full right-0 z-20 mt-1 flex w-47.5 flex-col gap-1 rounded-2xl border border-[#E5E8EB] bg-[#FAFAFA] p-2.25 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.08)] backdrop-blur-md"
        >
          {seniors.map(({ id, name }, index) => {
            const isSelected = id === selectedId;

            return (
              <li key={id} className="flex flex-col gap-1">
                {index > 0 && <hr className="mx-2 border-[#E5E8EB]" />}
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelect(id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[14px] text-[#333D4B] active:bg-[#F2F4F6] ${
                    isSelected ? 'font-bold' : 'pl-9'
                  }`}
                >
                  {isSelected && (
                    <Check size={16} strokeWidth={2.5} aria-hidden />
                  )}
                  {name}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
