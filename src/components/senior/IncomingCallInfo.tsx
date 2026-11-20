import pillIcon from '@/assets/icons/pill.svg';
import locationIcon from '@/assets/icons/location.svg';
import type { StorageGuide } from '@/types/call';

type MedicineOrderCardProps = {
  title: string;
  remainingCount: number;
};

export const MedicineOrderCard = ({
  title,
  remainingCount,
}: MedicineOrderCardProps) => (
  <div className="flex items-center justify-between rounded-2xl border border-bg-secondary px-4 py-4">
    <div className="flex items-center gap-2">
      <img src={pillIcon} alt="" width={18} height={18} />
      <h2 className="text-[22px] font-bold text-white">{title}</h2>
    </div>
    <span className="flex items-center gap-4 rounded-lg border border-bg-secondary-pressed bg-bg-secondary/20 px-3 py-1.25 text-[12px] text-white">
      남은 개수
      <b className="text-[16px] font-bold text-white">{remainingCount}개</b>
    </span>
  </div>
);

// 약(처방전) 보관 위치 안내
export const StorageLocationCard = ({ guide }: { guide: StorageGuide }) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-bg-secondary px-4 py-4">
    <div className="flex items-center gap-2">
      <img src={locationIcon} alt="" width={14} height={20} />
      <h2 className="text-[16px] font-bold text-point">보관 위치</h2>
    </div>

    <p className="text-[20px] leading-tight font-bold text-white">
      {guide.prefix}
      <span className="ml-1.5 text-point underline underline-offset-3">
        {guide.highlight}
      </span>
      {guide.suffix}
    </p>
  </div>
);
