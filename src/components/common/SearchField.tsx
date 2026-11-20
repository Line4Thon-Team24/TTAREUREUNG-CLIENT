import type { InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';

type SearchFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> & {
  value: string;
  onChange: (value: string) => void;
};

// 둥근 검색 입력창
export default function SearchField({
  value,
  onChange,
  className = '',
  ...props
}: SearchFieldProps) {
  return (
    <label
      className={`flex items-center gap-3 rounded-full bg-[#FAFAFA] px-3 py-2 transition-shadow focus-within:ring-1 focus-within:ring-[#01A16A] ${className}`}
    >
      <Search
        size={16}
        strokeWidth={1.75}
        aria-hidden
        className="shrink-0 text-[#191F28]"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-[14px] text-[#191F28] outline-none placeholder:text-[#B0B8C1]"
        {...props}
      />
    </label>
  );
}
