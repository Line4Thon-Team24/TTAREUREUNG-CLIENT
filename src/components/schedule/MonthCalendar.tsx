import { Plus } from 'lucide-react';
import { WEEKDAYS } from '@/constants/schedule';
import type { Medicine } from '@/types/medicine';
import { getMonthWeeks, toDateString } from '@/utils/date';
import { isMedicineOnDate } from '@/utils/schedule';

type MonthCalendarProps = {
  year: number;
  month: number; // 0~11
  medicines: Medicine[];
  onDateClick: (date: Date) => void;
  onRegisterMedicine?: () => void; // 있으면 오늘 주에 '약 정보 등록하기' 노출
};

// 날짜 글자색 (오늘 > 다른 달 > 주말 > 평일)
const getDateClassName = (isToday: boolean, inMonth: boolean, day: number) => {
  if (isToday) return 'bg-[#0E6E3B] font-bold text-white';
  if (!inMonth) return 'text-[#B0B8C1]';
  if (day === 0 || day === 6) return 'text-[#6B7684]';
  return 'text-[#191F28]';
};

// 월 달력 (매일 복용 바 + 날짜별 약 태그)
export default function MonthCalendar({
  year,
  month,
  medicines,
  onDateClick,
  onRegisterMedicine,
}: MonthCalendarProps) {
  const today = toDateString(new Date());
  const weeks = getMonthWeeks(year, month);
  const dailyMedicines = medicines.filter((m) => m.interval === 'daily');
  const otherMedicines = medicines.filter((m) => m.interval !== 'daily');

  // 오늘이 이번 달이 아니면 첫 주에 등록 버튼
  const todayWeek = weeks.findIndex((week) =>
    week.some((date) => toDateString(date) === today)
  );
  const registerWeek = todayWeek === -1 ? 0 : todayWeek;

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-[#E5E8EB] py-2">
        {WEEKDAYS.map((label, index) => (
          <span
            key={label}
            className={`text-center text-[12px] leading-4 font-semibold ${
              index === 0 || index === 6 ? 'text-[#6B7684]' : 'text-[#191F28]'
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-7 pb-6">
        {weeks.map((week, weekIndex) => {
          const days = week.map((date) => ({
            date,
            key: toDateString(date),
            inMonth: date.getMonth() === month,
          }));
          // 이번 달 중 매일 먹는 약이 있는 칸
          const dailyColumns = days.flatMap(({ key, inMonth }, index) =>
            inMonth && dailyMedicines.some((m) => isMedicineOnDate(m, key))
              ? [index]
              : []
          );
          const tagsByDay = days.map(({ key, inMonth }) =>
            inMonth
              ? otherMedicines.filter((m) => isMedicineOnDate(m, key))
              : []
          );
          const hasTags = tagsByDay.some((tags) => tags.length > 0);
          const showRegister = onRegisterMedicine && weekIndex === registerWeek;

          return (
            <div key={days[0].key} className="flex min-h-23 flex-col gap-1.5">
              <div className="grid grid-cols-7 py-2">
                {days.map(({ date, key, inMonth }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onDateClick(date)}
                    aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일`}
                    aria-current={key === today ? 'date' : undefined}
                    className={`mx-auto flex size-7 items-center justify-center rounded-full text-[14px] leading-4 font-semibold ${getDateClassName(
                      key === today,
                      inMonth,
                      date.getDay()
                    )}`}
                  >
                    {date.getDate()}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1 px-0.75">
                {dailyColumns.length > 0 && (
                  <div className="grid grid-cols-7">
                    <span
                      className="flex items-center gap-1 overflow-hidden rounded-xs border-l-2 border-[#0E6E3B] bg-[#E7F6EC] py-0.5 pr-1.5 pl-2 text-[11px] leading-[16.5px] font-semibold whitespace-nowrap text-[#0E6E3B]"
                      style={{
                        gridColumn: `${dailyColumns[0] + 1} / ${dailyColumns[dailyColumns.length - 1] + 2}`,
                      }}
                    >
                      <span className="size-1.5 shrink-0 rounded-full bg-[#0E6E3B]" />
                      매일 복용
                    </span>
                  </div>
                )}

                {showRegister && (
                  <button
                    type="button"
                    onClick={onRegisterMedicine}
                    className="flex w-fit items-center gap-1 rounded-xs border-l-2 border-[#333D4B] bg-[#F2F4F6] py-0.5 pr-1.5 pl-2 text-[11px] leading-[16.5px] font-semibold text-[#333D4B]"
                  >
                    <Plus size={8} strokeWidth={3} aria-hidden />약 정보
                    등록하기
                  </button>
                )}

                {hasTags && (
                  <div className="grid grid-cols-7 gap-1">
                    {tagsByDay.map((tags, index) => (
                      <div
                        key={days[index].key}
                        className="flex min-w-0 flex-col items-center gap-1"
                      >
                        {tags.map((medicine) => (
                          <span
                            key={medicine.id}
                            className="max-w-full truncate rounded-sm bg-[#E7F6EC] px-1 py-0.5 text-[10px] leading-3.75 font-medium text-[#0E6E3B]"
                          >
                            {medicine.displayName}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
