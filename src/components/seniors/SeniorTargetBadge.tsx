import badgeIcon from '@/assets/icons/senior-badge.svg';

// '따르릉 약 챙김 대상자' 배지
export default function SeniorTargetBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F6EC] px-2.5 py-1 text-[12px] font-semibold text-[#01A16A]">
      <img src={badgeIcon} alt="" width={12.9414} height={11.1914} />
      따르릉 약 챙김 대상자
    </span>
  );
}
