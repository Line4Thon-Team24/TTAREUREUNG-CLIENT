import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EmptyState from '@/components/common/EmptyState';
import DateNavigator from '@/components/schedule/DateNavigator';
import MedicineDetailModal from '@/components/schedule/MedicineDetailModal';
import ScheduleTimeline from '@/components/schedule/ScheduleTimeline';
import SeniorChips from '@/components/common/SeniorChips';
import useDailySchedule from '@/hooks/useDailySchedule';
import useDateParam from '@/hooks/useDateParam';
import useSeniorMedicines from '@/hooks/useSeniorMedicines';
import useSeniors from '@/hooks/useSeniors';
import useSelectedSeniorParam from '@/hooks/useSelectedSeniorParam';
import { SCHEDULE_SENIOR_KEY } from '@/constants/schedule';
import type { Medicine } from '@/types/medicine';

const LOAD_ERROR_CLASS =
  'flex flex-1 items-center justify-center text-[14px] text-[#6B7684]';

const SchedulePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { seniors, isError: isSeniorError } = useSeniors();
  // 월 달력과 시니어·날짜 공유 (주소에 저장)
  const [selectedSeniorId, selectSenior] = useSelectedSeniorParam(
    seniors ?? [],
    SCHEDULE_SENIOR_KEY
  );
  const [date, setDate] = useDateParam();
  const { medicines, isError: isMedicineError } =
    useSeniorMedicines(selectedSeniorId);
  const { slots, isError: isScheduleError } = useDailySchedule(
    selectedSeniorId,
    date
  );
  const [detailMedicine, setDetailMedicine] = useState<Medicine | null>(null);

  const hasSenior = (seniors ?? []).length > 0;
  const hasMedicine = (medicines ?? []).length > 0;

  // 시니어 없음 → 약 없음 → 일정 (각 단계는 불러오는 동안 빈 화면)
  const renderContent = () => {
    if (isSeniorError) {
      return (
        <p className={LOAD_ERROR_CLASS}>시니어 목록을 불러오지 못했어요.</p>
      );
    }
    if (seniors === null) return <div className="flex-1" />;

    if (!hasSenior) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            message="등록된 시니어가 없어요!"
            actionLabel="시니어 등록하기"
            onAction={() =>
              navigate('/seniors/register', {
                state: { returnTo: `${location.pathname}${location.search}` },
              })
            }
          />
        </div>
      );
    }

    if (isMedicineError) {
      return <p className={LOAD_ERROR_CLASS}>약 목록을 불러오지 못했어요.</p>;
    }
    if (medicines === null) return <div className="flex-1" />;

    if (!hasMedicine || selectedSeniorId === null) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            message="등록된 약 정보가 없어요!"
            actionLabel="약 정보 등록하기"
            onAction={() =>
              navigate('/medicines/register', {
                state: { seniorId: selectedSeniorId },
              })
            }
          />
        </div>
      );
    }

    if (isScheduleError) {
      return <p className={LOAD_ERROR_CLASS}>복용 일정을 불러오지 못했어요.</p>;
    }
    if (slots === null) return <div className="flex-1" />;

    if (slots.length === 0) {
      return (
        <p className="flex flex-1 items-center justify-center text-[12px] text-black">
          이 날은 복용할 약이 없어요.
        </p>
      );
    }

    return (
      <ScheduleTimeline
        slots={slots}
        // 삭제된 약이면 열지 않음
        onMedicineClick={({ medicineId }) =>
          setDetailMedicine(
            medicines.find(({ id }) => id === medicineId) ?? null
          )
        }
      />
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <DateNavigator
        date={date}
        onChange={setDate}
        onCalendarClick={() => navigate(`/schedule/month${location.search}`)}
      />

      {hasSenior && (
        // 일정 있을 때만 구분선
        <div
          className={hasMedicine ? 'border-b border-[#E5E8EB] pb-2' : undefined}
        >
          <SeniorChips
            seniors={seniors ?? []}
            selectedId={selectedSeniorId}
            onSelect={selectSenior}
            onAdd={() =>
              navigate('/seniors/add', {
                state: { returnTo: `${location.pathname}${location.search}` },
              })
            }
          />
        </div>
      )}

      {renderContent()}

      <MedicineDetailModal
        medicine={detailMedicine}
        onClose={() => setDetailMedicine(null)}
      />
    </div>
  );
};

export default SchedulePage;
