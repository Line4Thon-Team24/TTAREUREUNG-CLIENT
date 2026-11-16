import type { ReactNode } from 'react';

type InfoRowProps = {
  label: string;
  tone?: 'default' | 'green' | 'orange';
  children: ReactNode;
};

const TONE_CLASS = {
  default: 'bg-[#FAFAFA] text-[#6B7684]',
  green: 'bg-[#E7F6EC] text-[#01A16A]',
  orange: 'bg-[#FFF4E0] text-[#D97706]',
};

// 회색/색깔 라벨 + 값 한 줄 (약 카드, 시니어 카드)
export default function InfoRow({
  label,
  tone = 'default',
  children,
}: InfoRowProps) {
  return (
    <div className="flex items-start gap-2">
      <span
        className={`shrink-0 rounded-sm px-4 py-0.5 text-[12px] font-semibold ${TONE_CLASS[tone]}`}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

export const InfoValue = ({ children }: { children: ReactNode }) => (
  <span className="py-px text-[12px] leading-4 font-medium text-[#191F28]">
    {children}
  </span>
);
