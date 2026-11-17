import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import type { Senior } from '@/types/senior';

type SeniorDropdownProps = {
  seniors: Senior[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  label?: string; // 스크린리더용 이름
  variant?: 'outline' | 'pill';
};

// 버튼 모양 (outline: 보호자 목록 편집 / pill: 복용 일정 월·주 화면)
const TRIGGER_CLASS = {
  outline:
    'gap-1 rounded-md border border-[#01A16A] px-2.25 py-1.25 text-[#01A16A]',
  pill: 'gap-1 rounded-full bg-[#F2F4F6] px-3 py-1 text-[#6B7684]',
};

// 시니어 선택 드롭다운 (Figma: 보호자 목록 편집_담당 시니어 변경)
export default function SeniorDropdown({
  seniors,
  selectedId,
  onSelect,
  label = '담당 시니어',
  variant = 'outline',
}: SeniorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = seniors.find(({ id }) => id === selectedId);
  const selectedIndex = Math.max(
    seniors.findIndex(({ id }) => id === selectedId),
    0
  );

  // 닫고 초점은 버튼으로 복원
  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  // 열리면 선택된 옵션으로 초점 이동
  useEffect(() => {
    if (isOpen) optionRefs.current[selectedIndex]?.focus();
  }, [isOpen, selectedIndex]);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  // 방향키·Home·End로 옵션 이동, Esc로 닫기
  const handleListKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const current = optionRefs.current.findIndex(
      (option) => option === document.activeElement
    );
    const last = seniors.length - 1;
    const next = {
      ArrowDown: current >= last ? 0 : current + 1,
      ArrowUp: current <= 0 ? last : current - 1,
      Home: 0,
      End: last,
    }[e.key];

    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (next !== undefined) {
      e.preventDefault();
      optionRefs.current[next]?.focus();
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${label} 변경, 현재 ${selected?.name ?? '없음'}`}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          // 방향키로도 열기
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        className={`flex items-center text-[12px] font-semibold whitespace-nowrap ${TRIGGER_CLASS[variant]}`}
      >
        {selected?.name ?? '-'}
        <ChevronDown size={12} strokeWidth={2.5} aria-hidden />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label={label}
          onKeyDown={handleListKeyDown}
          className="absolute top-full right-0 z-20 mt-1 flex w-47.5 flex-col gap-1 rounded-2xl border border-[#E5E8EB] bg-[#FAFAFA] p-2.25 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.08)] backdrop-blur-md"
        >
          {seniors.map(({ id, name }, index) => {
            const isSelected = id === selectedId;

            return (
              <li key={id} className="flex flex-col gap-1">
                {index > 0 && <hr className="mx-2 border-[#E5E8EB]" />}
                <button
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelect(id);
                    close();
                  }}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[14px] text-[#333D4B] outline-none focus-visible:bg-[#F2F4F6] active:bg-[#F2F4F6] ${
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
