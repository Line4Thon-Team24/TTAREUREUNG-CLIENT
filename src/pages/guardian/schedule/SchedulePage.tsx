import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EmptyState from '@/components/common/EmptyState';
import DateNavigator from '@/components/schedule/DateNavigator';
import MedicineDetailModal from '@/components/schedule/MedicineDetailModal';
import ScheduleTimeline from '@/components/schedule/ScheduleTimeline';
import SeniorChips from '@/components/common/SeniorChips';
import useDateParam from '@/hooks/useDateParam';
import useSelectedSeniorParam from '@/hooks/useSelectedSeniorParam';
import { getSeniors } from '@/mocks/seniors';
import { getMedicine, getMedicines } from '@/mocks/medicines';
import { getDailySchedule } from '@/mocks/schedule';
import type { Medicine } from '@/types/medicine';

const SchedulePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [seniors] = useState(getSeniors);
  // 월 달력과 시니어·날짜 공유 (주소에 저장)
  const [selectedSeniorId, selectSenior] = useSelectedSeniorParam(seniors);
  const [date, setDate] = useDateParam();
  const [detailMedicine, setDetailMedicine] = useState<Medicine | null>(null);

  const hasSenior = seniors.length > 0;
  const hasMedicine =
    selectedSeniorId !== null && getMedicines(selectedSeniorId).length > 0;

  // 시니어 없음 → 약 없음 → 일정
  const renderContent = () => {
    if (!hasSenior) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            message="등록된 시니어가 없어요!"
            actionLabel="시니어 등록하기"
            onAction={() => navigate('/seniors/register')}
          />
        </div>
      );
    }

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

    return (
      <ScheduleTimeline
        slots={getDailySchedule(selectedSeniorId, date)}
        // 삭제된 약이면 열지 않음
        onMedicineClick={({ medicineId }) =>
          setDetailMedicine(getMedicine(medicineId) ?? null)
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
            seniors={seniors}
            selectedId={selectedSeniorId}
            onSelect={selectSenior}
            onAdd={() => navigate('/seniors/register')}
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
