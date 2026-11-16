import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '@/components/common/EmptyState';
import DateNavigator from '@/components/schedule/DateNavigator';
import ScheduleTimeline from '@/components/schedule/ScheduleTimeline';
import SeniorChips from '@/components/common/SeniorChips';
import { getSeniors } from '@/mocks/seniors';
import { getMedicines } from '@/mocks/medicines';
import { getDailySchedule } from '@/mocks/schedule';

const SchedulePage = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(() => new Date());
  const [seniors] = useState(getSeniors);
  const [selectedSeniorId, setSelectedSeniorId] = useState(
    seniors[0]?.id ?? null
  );

  const hasSenior = seniors.length > 0;
  const hasMedicine =
    selectedSeniorId !== null && getMedicines(selectedSeniorId).length > 0;

  // 시니어 없음 → 약 없음 → 복용 일정 순서로 확인
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
        // 약 상세 팝업은 다음 단계에서 연결
        onMedicineClick={() => {}}
      />
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <DateNavigator date={date} onChange={setDate} />

      {hasSenior && (
        // 복용 일정이 있을 때만 칩 아래 구분선 (빈 화면은 기존 디자인 유지)
        <div
          className={hasMedicine ? 'border-b border-[#E5E8EB] pb-2' : undefined}
        >
          <SeniorChips
            seniors={seniors}
            selectedId={selectedSeniorId}
            onSelect={setSelectedSeniorId}
            onAdd={() => navigate('/seniors/register')}
          />
        </div>
      )}

      {renderContent()}
    </div>
  );
};

export default SchedulePage;
