import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import SeniorDropdown from '@/components/common/SeniorDropdown';
import MedicineDetailModal from '@/components/schedule/MedicineDetailModal';
import ScheduleTimeline from '@/components/schedule/ScheduleTimeline';
import WeekStrip from '@/components/schedule/WeekStrip';
import useDailySchedule from '@/hooks/useDailySchedule';
import useDateParam from '@/hooks/useDateParam';
import useGoBack from '@/hooks/useGoBack';
import useSeniorMedicines from '@/hooks/useSeniorMedicines';
import useSeniors from '@/hooks/useSeniors';
import useSelectedSeniorParam from '@/hooks/useSelectedSeniorParam';
import { SCHEDULE_SENIOR_KEY } from '@/constants/schedule';
import type { Medicine } from '@/types/medicine';

const ScheduleWeekPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const goBackOr = useGoBack();
  const { seniors } = useSeniors();
  // 월 달력과 시니어·날짜 공유 (주소에 저장)
  const [selectedSeniorId, selectSenior] = useSelectedSeniorParam(
    seniors ?? [],
    SCHEDULE_SENIOR_KEY
  );
  const [date, setDate] = useDateParam();
  // 약 상세 팝업용
  const { medicines } = useSeniorMedicines(selectedSeniorId);
  const { slots, isError } = useDailySchedule(selectedSeniorId, date);
  const [detailMedicine, setDetailMedicine] = useState<Medicine | null>(null);

  // 월 달력에서 들어왔으면 뒤로, 바로 들어왔으면 월 달력으로
  const goBack = () => goBackOr(`/schedule/month${location.search}`);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-5 pt-10 pb-4">
        <div className="flex items-center gap-2 text-[#191F28]">
          <button type="button" aria-label="뒤로 가기" onClick={goBack}>
            <ChevronLeft size={24} strokeWidth={2.5} aria-hidden />
          </button>
          <h1 className="text-[24px] font-bold">{date.getMonth() + 1}월</h1>
        </div>

        {seniors === null ? null : seniors.length > 0 ? (
          <SeniorDropdown
            seniors={seniors}
            selectedId={selectedSeniorId}
            onSelect={selectSenior}
            label="시니어 선택"
            variant="pill"
          />
        ) : (
          <button
            type="button"
            onClick={() =>
              navigate('/seniors/register', {
                state: { returnTo: `${location.pathname}${location.search}` },
              })
            }
            className="rounded-full bg-[#F2F4F6] px-3 py-1 text-[12px] font-semibold whitespace-nowrap text-[#6B7684]"
          >
            시니어 등록하기
          </button>
        )}
      </header>

      <WeekStrip date={date} onSelect={setDate} />

      {isError ? (
        <p className="flex flex-1 items-center justify-center text-[14px] text-[#6B7684]">
          복용 일정을 불러오지 못했어요.
        </p>
      ) : seniors === null || (selectedSeniorId !== null && slots === null) ? (
        <div className="flex-1" />
      ) : slots && slots.length > 0 ? (
        <ScheduleTimeline
          slots={slots}
          // 삭제된 약이면 열지 않음
          onMedicineClick={({ medicineId }) =>
            setDetailMedicine(
              medicines?.find(({ id }) => id === medicineId) ?? null
            )
          }
        />
      ) : (
        <p className="flex flex-1 items-center justify-center text-[12px] text-black">
          이 날은 복용할 약이 없어요.
        </p>
      )}

      <MedicineDetailModal
        medicine={detailMedicine}
        onClose={() => setDetailMedicine(null)}
      />
    </div>
  );
};

export default ScheduleWeekPage;
