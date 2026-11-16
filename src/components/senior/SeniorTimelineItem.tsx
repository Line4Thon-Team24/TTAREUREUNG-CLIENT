import { Check } from 'lucide-react';
import { SENIOR_SLOT_STYLES } from '@/constants/seniorSchedule';
import type { ScheduleSlot } from '@/types/schedule';
import { formatKoreanTime, getSlotStatus } from '@/utils/schedule';

type SeniorTimelineItemProps = {
  slot: ScheduleSlot;
};

// 시니어 약 섭취 일정 - 시간대 하나 (상태 원 + 카드)
export default function SeniorTimelineItem({ slot }: SeniorTimelineItemProps) {
  const { medicines } = slot;
  const status = getSlotStatus(medicines.map((medicine) => medicine.status));
  const style = SENIOR_SLOT_STYLES[status];
  const { NodeIcon, PillIcon, alert } = style;

  const total = medicines.length;
  const takenCount = medicines.filter((m) => m.status === 'taken').length;
  const missedCount = medicines.filter((m) => m.status === 'missed').length;
  const isEmphasized = status === 'taken' || status === 'missed';

  const label =
    status === 'partial'
      ? `${style.label} (${takenCount}/${total}개 복용)`
      : style.label;
  const subText =
    status === 'taken' && slot.callConfirmedAt
      ? `${slot.callConfirmedAt} 통화 확인`
      : status === 'missed'
        ? `복용 시간 경과 (${slot.time})`
        : null;
  const countText =
    status === 'missed'
      ? `${total}개 누락`
      : status === 'partial'
        ? `남은 약 ${missedCount}개`
        : `${total}개`;

  return (
    <li className="relative flex items-start gap-4">
      <span
        aria-hidden
        className={`flex size-10 shrink-0 items-center justify-center rounded-full text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] ring-4 ${style.nodeClassName}`}
      >
        <NodeIcon size={isEmphasized ? 24 : 20} strokeWidth={2.5} />
      </span>

      <article
        className={`flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white ${style.cardClassName}`}
      >
        <header className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] leading-4 font-bold tracking-[-0.32px] ${style.pillClassName}`}
              >
                {PillIcon ? (
                  <PillIcon size={14} strokeWidth={2.5} aria-hidden />
                ) : (
                  <span
                    aria-hidden
                    className={`rounded-full ${style.dotClassName}`}
                  />
                )}
                {label}
              </span>
              {subText && (
                <span className="text-[12px] font-medium text-[#6B7684]">
                  {subText}
                </span>
              )}
            </div>
            <h3 className="flex flex-wrap items-center gap-1">
              <span
                className={`text-[22px] font-bold ${
                  status === 'taken' ? 'text-[#333D4B]' : 'text-[#191F28]'
                }`}
              >
                {formatKoreanTime(slot.time)}
              </span>
              <span
                className={`text-[16px] leading-6 font-semibold tracking-[-0.32px] ${style.timingClassName}`}
              >
                {slot.timingLabel}
              </span>
            </h3>
          </div>
          <span
            className={`shrink-0 rounded-md px-2.5 py-1 text-[12px] leading-4 font-bold tracking-[-0.32px] whitespace-nowrap ${style.countClassName}`}
          >
            {countText}
          </span>
        </header>

        {alert && (
          <p
            role="note"
            className={`flex items-start gap-2 rounded-xl border p-2.75 text-[12px] leading-4 tracking-[-0.32px] ${alert.className}`}
          >
            <alert.Icon
              size={16}
              strokeWidth={2.25}
              aria-hidden
              className="mt-px shrink-0"
            />
            <span>
              <strong className="block font-bold">{alert.title}</strong>
              {alert.description}
            </span>
          </p>
        )}

        <div
          className={`flex flex-col gap-2 border-t pt-3.25 ${style.dividerClassName}`}
        >
          <p className="text-[12px] font-bold text-[#333D4B]">
            {style.listTitle} ({total}종)
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {medicines.map((medicine) => {
              // 일부 복용: 먹은 약은 체크, 못 먹은 약은 주황 테두리
              const isPartialMissed =
                status === 'partial' && medicine.status === 'missed';
              const isPartialTaken =
                status === 'partial' && medicine.status === 'taken';

              return (
                <li
                  key={medicine.id}
                  className={`flex items-center text-[12px] ${
                    isPartialMissed
                      ? 'gap-1.5 rounded-md border border-[#D97706] bg-[#FFF4E0] px-2.5 py-1 font-medium text-[#191F28]'
                      : style.chipClassName
                  }`}
                >
                  {isPartialTaken ? (
                    <Check
                      size={13}
                      strokeWidth={3}
                      aria-label="복용함"
                      className="text-[#01A16A]"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className={`shrink-0 rounded-full ${style.dotClassName}`}
                    />
                  )}
                  {medicine.displayName}
                </li>
              );
            })}
          </ul>
        </div>
      </article>
    </li>
  );
}
