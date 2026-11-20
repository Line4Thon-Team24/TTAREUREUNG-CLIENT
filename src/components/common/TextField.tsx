import type { InputHTMLAttributes, Ref } from 'react';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  ref?: Ref<HTMLInputElement>;
};

// 텍스트 입력창 (이름, 전화번호 등)
export default function TextField({
  className = '',
  ...props
}: TextFieldProps) {
  return (
    <input
      type="text"
      className={`w-full rounded-2xl border border-[#E5E8EB] bg-[#FAFAFA] px-4.25 py-3.25 text-[14px] font-medium text-[#333D4B] transition-colors outline-none placeholder:text-[#B0B8C1] focus:border-[#01A16A] ${className}`}
      {...props}
    />
  );
}
