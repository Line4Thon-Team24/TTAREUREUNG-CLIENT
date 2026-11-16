import DoseCard from '@/components/schedule/DoseCard';
import useDragScroll from '@/hooks/useDragScroll';
import type { ScheduleMedicine } from '@/types/schedule';
import { sortMissedFirst } from '@/utils/schedule';

type DoseCardListProps = {
  medicines: ScheduleMedicine[];
  onMedicineClick: (medicine: ScheduleMedicine) => void;
};

// 시간대 하나의 약 카드 가로 목록 (스크롤바 없이 넘겨 보기)
// - PC: 마우스로 클릭한 채 좌우 드래그 / 모바일: 터치 스와이프
export default function DoseCardList({
  medicines,
  onMedicineClick,
}: DoseCardListProps) {
  const { ref, isDragging, handlers } = useDragScroll<HTMLUListElement>();

  return (
    <ul
      ref={ref}
      {...handlers}
      // 드래그 중에는 스냅을 꺼서 마우스를 그대로 따라가게 하고, 놓으면 카드 단위로 맞춤
      // 위아래 2px은 미복용 카드의 빨간 테두리가 잘리지 않게 하는 여백
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
