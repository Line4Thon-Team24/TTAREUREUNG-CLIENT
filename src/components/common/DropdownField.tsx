import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Check, ChevronDown } from 'lucide-react';

type Option = { label: string; value: string };

type DropdownFieldProps = {
  options: Option[];
  placeholder: string;
  value: string; // 선택 안 했으면 빈 값
  onChange: (value: string) => void;
  'aria-label': string;
  disabled?: boolean;
};

// 펼친 목록을 디자인한 드롭다운 (닫힌 모양은 SelectField, 목록은 Figma 시니어 선택 팝오버)
export default function DropdownField({
  options,
  placeholder,
  value,
  onChange,
  'aria-label': label,
  disabled = false,
}: DropdownFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = options.find((option) => option.value === value);
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
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
    const last = options.length - 1;
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
    // 펼친 목록이 아래 입력칸보다 위에 보이도록
    <div ref={rootRef} className={`relative w-full ${isOpen ? 'z-20' : ''}`}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${label}, 현재 ${selected?.label ?? '선택 안 됨'}`}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          // 방향키로도 열기
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        className={`flex h-12 w-full items-center rounded-xl border bg-[#FAFAFA] pr-8 pl-3.25 text-left text-[14px] font-medium transition-colors outline-none disabled:bg-[#F2F4F6] disabled:text-[#8B95A1] ${
          isOpen
            ? 'border-[#01A16A]'
            : 'border-[#E5E8EB] focus:border-[#01A16A]'
        } ${selected ? 'text-[#333D4B]' : 'text-[#B0B8C1]'}`}
      >
        {selected?.label ?? placeholder}
      </button>
      <ChevronDown
        size={16}
        strokeWidth={2.5}
        aria-hidden
        className={`pointer-events-none absolute top-1/2 right-3.25 -translate-y-1/2 text-[#6B7684] transition-transform motion-reduce:transition-none ${
          isOpen ? 'rotate-180' : ''
        }`}
      />

      {isOpen && (
        <ul
          role="listbox"
          aria-label={label}
          onKeyDown={handleListKeyDown}
          className="absolute top-full left-0 mt-1 flex max-h-60 w-full flex-col gap-1 overflow-y-auto rounded-2xl border border-[#E5E8EB] bg-[#FAFAFA] p-2.25 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.08)] backdrop-blur-md"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;

            return (
              <li key={option.value} className="flex flex-col gap-1">
                {index > 0 && <hr className="mx-2 border-[#E5E8EB]" />}
                <button
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    close();
                  }}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[14px] text-[#333D4B] outline-none focus-visible:bg-[#F2F4F6] active:bg-[#F2F4F6] ${
                    isSelected ? 'font-bold' : 'pl-9'
                  }`}
                >
                  {isSelected && (
                    <Check size={16} strokeWidth={2.5} aria-hidden />
                  )}
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
