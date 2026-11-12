import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

const VARIANT_CLASS = {
  primary:
    'bg-[#01A16A] text-white active:bg-[#138A4B] disabled:bg-[#E5E8EB] disabled:text-[#B0B8C1]',
  secondary: 'bg-[#F2F4F6] text-[#333D4B] active:bg-[#E5E8EB]',
};

// 화면 하단 큰 버튼 (primary: 초록 / secondary: 회색 보조 버튼)
export default function Button({
  type = 'button',
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`flex h-13 w-full items-center justify-center gap-1.5 rounded-2xl text-[16px] font-bold whitespace-nowrap transition-colors ${VARIANT_CLASS[variant]} ${className}`}
      {...props}
    />
  );
}
