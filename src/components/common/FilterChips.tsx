type FilterChipsProps<T extends string> = {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
};

// 목록 정렬·필터 칩 (시니어 목록, 보호자 목록)
export default function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: FilterChipsProps<T>) {
  return (
    <div className="flex gap-3 px-5 py-3">
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
            className={`flex shrink-0 items-center rounded-full py-2 text-[14px] transition-colors ${
              isSelected
                ? 'bg-[#191F28] px-4 font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]'
                : 'bg-[#F2F4F6] px-3.5 font-medium text-[#4E5968]'
            }`}
          >
            {isSelected && (
              <span className="mr-1.5 size-2 rounded-full bg-[#34D399]" />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
