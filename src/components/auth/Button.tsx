import type { ButtonHTMLAttributes } from 'react';

// 로그인/회원가입 공용 버튼
export default function Button({
  type = 'button',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`flex w-full items-center justify-center rounded-2xl bg-border-focus p-4 text-[16px] font-bold whitespace-nowrap text-text-white transition-colors active:bg-bg-primary-pressed disabled:bg-bg-disabled disabled:text-text-placeholder ${className}`}
      {...props}
    />
  );
}
