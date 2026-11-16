import { ChevronDown } from 'lucide-react';
import type { Senior } from '@/types/senior';

type SeniorSelectProps = {
  seniors: Senior[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

// 작은 시니어 선택 드롭다운 (월 달력 상단)
export default function SeniorSelect({
  seniors,
  selectedId,
  onSelect,
}: SeniorSelectProps) {
  return (
    <div className="relative flex items-center">
      <select
        aria-label="시니어 선택"
        value={selectedId ?? ''}
        onChange={(e) => onSelect(Number(e.target.value))}
        className="appearance-none rounded-full bg-[#F2F4F6] py-1 pr-6.5 pl-3 text-[12px] font-semibold text-[#6B7684]"
      >
        {seniors.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        strokeWidth={2.5}
        aria-hidden
        className="pointer-events-none absolute right-2.5 text-[#6B7684]"
      />
    </div>
  );
}
