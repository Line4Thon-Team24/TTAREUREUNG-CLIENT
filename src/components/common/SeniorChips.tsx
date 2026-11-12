import type { Senior } from '@/types/senior';

type SeniorChipsProps = {
  seniors: Senior[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

// 화면에서 볼 시니어 선택 칩 목록 (복용 일정, 약 목록)
export default function SeniorChips({
  seniors,
  selectedId,
  onSelect,
}: SeniorChipsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto px-5 py-3">
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
    </div>
  );
}
