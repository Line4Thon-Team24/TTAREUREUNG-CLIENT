import { Plus } from 'lucide-react';
import type { Senior } from '@/types/senior';

type SeniorChipsProps = {
  seniors: Senior[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAdd?: () => void; // 있으면 + 버튼 노출
};

// 화면에서 볼 시니어 선택 칩 목록 (복용 일정, 약 목록)
export default function SeniorChips({
  seniors,
  selectedId,
  onSelect,
  onAdd,
}: SeniorChipsProps) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto px-5 py-3">
      {seniors.map(({ id, name }) => {
        const isSelected = id === selectedId;

        return (
          <button
            key={id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(id)}
            className={`flex shrink-0 items-center rounded-full py-2 text-[14px] transition-colors ${
              isSelected
                ? 'bg-[#191F28] px-4 font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]'
                : 'bg-[#F2F4F6] px-3.5 font-medium text-[#4E5968]'
            }`}
          >
            {isSelected && (
              <span className="mr-1.5 size-2 rounded-full bg-[#34D399]" />
            )}
            {name}
          </button>
        );
      })}
      {onAdd && (
        <button
          type="button"
          aria-label="시니어 추가"
          onClick={onAdd}
          className="flex size-5.25 shrink-0 items-center justify-center rounded-full border border-[#8B95A1] text-[#8B95A1]"
        >
          <Plus size={16} aria-hidden />
        </button>
      )}
    </div>
  );
}
