import locationIcon from '@/assets/icons/location.svg';
import MaskIcon from '@/components/common/MaskIcon';
import type { StorageGuide } from '@/types/call';

// 약 보관 위치 안내 카드
const StorageGuideCard = ({ guide }: { guide: StorageGuide }) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-border-divider px-4 py-4">
    <div className="flex items-center gap-2">
      <MaskIcon src={locationIcon} color="#0e6e3b" width={14} height={20} />
      <h2 className="text-[16px] font-bold text-text-main">보관 위치</h2>
    </div>
    <p className="text-[20px] leading-tight font-bold text-text-title">
      {guide.prefix}
      <span className="ml-1.5 text-text-main underline underline-offset-3">
        {guide.highlight}
      </span>
      {guide.suffix}
    </p>
  </div>
);

export default StorageGuideCard;
