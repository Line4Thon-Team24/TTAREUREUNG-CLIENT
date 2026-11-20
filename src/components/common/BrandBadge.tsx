import badgeIcon from '@/assets/icons/brand-badge.svg';

type BrandBadgeProps = {
  label: string;
};

// 따르릉 아이콘이 들어간 초록 배지 (예: '따르릉 약 챙김 대상자', '따르릉 AI 자동 인식')
export default function BrandBadge({ label }: BrandBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F6EC] px-2.5 py-1 text-[12px] font-semibold text-[#01A16A]">
      <img src={badgeIcon} alt="" width={12.9414} height={11.1914} />
      {label}
    </span>
  );
}
