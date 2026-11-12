import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

// 화면 하단 큰 버튼 (활성: 초록 / 비활성: 회색)
export default function Button({
  type = 'button',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`flex h-13 w-full items-center justify-center rounded-2xl bg-[#01A16A] text-[16px] font-bold text-white transition-colors active:bg-[#138A4B] disabled:bg-[#E5E8EB] disabled:text-[#B0B8C1] ${className}`}
      {...props}
    />
  );
}
