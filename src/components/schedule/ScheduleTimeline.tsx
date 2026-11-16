import DoseCardList from '@/components/schedule/DoseCardList';
import StatusBadge from '@/components/schedule/StatusBadge';
import { MEAL_TIME_LABELS, SLOT_STATUS_STYLES } from '@/constants/schedule';
import type { ScheduleMedicine, ScheduleSlot } from '@/types/schedule';
import { formatKoreanTime, getSlotStatus } from '@/utils/schedule';

type ScheduleTimelineProps = {
  slots: ScheduleSlot[];
  onMedicineClick: (medicine: ScheduleMedicine) => void;
};

// 시간대별 복용 일정 타임라인 (왼쪽 세로선 + 상태 점 + 약 카드 목록)
export default function ScheduleTimeline({
  slots,
  onMedicineClick,
}: ScheduleTimelineProps) {
  return (
    <ol className="relative flex flex-col gap-5.25 pt-8 pb-6">
      {/* 세로선: 점(20px)의 가운데를 지나도록 위치 */}
      <span
        aria-hidden
        className="absolute top-7.75 bottom-0 left-7.5 w-0.5 bg-[#E5E7EB]"
      />
      {slots.map((slot) => {
        const status = getSlotStatus(
          slot.medicines.map((medicine) => medicine.status)
        );
        const { textColor, markerClassName } = SLOT_STATUS_STYLES[status];

        return (
          <li key={slot.id} className="relative flex items-start pl-5.25">
            <span
              aria-hidden
              className={`size-5 shrink-0 rounded-full border-2 border-white ring-4 ${markerClassName}`}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-3.75">
              <div className="flex items-center justify-between px-5">
                <div className="flex flex-col gap-1">
                  <span className={`text-[12px] font-semibold ${textColor}`}>
                    {MEAL_TIME_LABELS[slot.mealTime]}
                  </span>
                  <h2 className="text-[16px] font-bold text-[#191F28]">
                    {formatKoreanTime(slot.time)} {slot.timingLabel}
                  </h2>
                </div>
                <StatusBadge status={status} />
              </div>
              <DoseCardList
                medicines={slot.medicines}
                onMedicineClick={onMedicineClick}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
