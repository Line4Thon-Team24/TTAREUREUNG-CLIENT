import type { Ref, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

type Option = { label: string; value: string };

type SelectFieldProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'value'
> & {
  options: Option[];
  placeholder: string;
  value: string;
  ref?: Ref<HTMLSelectElement>;
};

// 기본 select 사용 (모바일에서는 OS 기본 선택기가 열림)
export default function SelectField({
  options,
  placeholder,
  value,
  className = '',
  ...props
}: SelectFieldProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <select
        value={value}
        className={`h-12 w-full appearance-none rounded-xl border border-[#E5E8EB] bg-[#FAFAFA] pr-8 pl-3.25 text-[14px] font-medium transition-colors outline-none focus:border-[#01A16A] ${value ? 'text-[#333D4B]' : 'text-[#B0B8C1]'}`}
        {...props}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        strokeWidth={2.5}
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3.25 -translate-y-1/2 text-[#6B7684]"
      />
    </div>
  );
}
