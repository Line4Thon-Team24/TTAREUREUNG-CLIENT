import DoseCard from '@/components/schedule/DoseCard';
import useDragScroll from '@/hooks/useDragScroll';
import type { ScheduleMedicine } from '@/types/schedule';
import { sortMissedFirst } from '@/utils/schedule';

type DoseCardListProps = {
  medicines: ScheduleMedicine[];
  onMedicineClick: (medicine: ScheduleMedicine) => void;
};

// 복약 카드 가로 목록 (PC 드래그 / 모바일 스와이프)
export default function DoseCardList({
  medicines,
  onMedicineClick,
}: DoseCardListProps) {
  const { ref, isDragging, handlers } = useDragScroll<HTMLUListElement>();

  return (
    <ul
      ref={ref}
      {...handlers}
      // 드래그 중엔 스냅 해제
      // py-0.5: 미복용 테두리 잘림 방지
      className={`scrollbar-hide flex scroll-px-5 gap-2 overflow-x-auto overscroll-x-contain px-5 py-0.5 select-none [&_button]:cursor-[inherit] ${
        isDragging
          ? 'cursor-grabbing snap-none'
          : 'cursor-grab snap-x snap-mandatory'
      }`}
    >
      {sortMissedFirst(medicines).map((medicine) => (
        <li key={medicine.id} className="shrink-0 snap-start">
          <DoseCard
            medicine={medicine}
            onClick={() => onMedicineClick(medicine)}
          />
        </li>
      ))}
    </ul>
  );
}
