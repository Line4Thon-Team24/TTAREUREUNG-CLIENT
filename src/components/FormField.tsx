import type { ReactNode } from 'react';

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  children: ReactNode;
};

// 라벨 + 입력 영역 묶음
export default function FormField({
  label,
  htmlFor,
  children,
}: FormFieldProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <label htmlFor={htmlFor} className="text-[16px] font-bold text-[#191F28]">
        {label}
      </label>
      {children}
    </div>
  );
}
