import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '@/components/common/EmptyState';
import DateNavigator from '@/components/schedule/DateNavigator';
import SeniorChips from '@/components/schedule/SeniorChips';
import { getSeniors } from '@/mocks/seniors';

const SchedulePage = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(() => new Date());
  const [seniors] = useState(getSeniors);
  const [selectedSeniorId, setSelectedSeniorId] = useState(
    seniors[0]?.id ?? null
  );

  const hasSenior = seniors.length > 0;

  return (
    <div className="flex flex-1 flex-col">
      <DateNavigator date={date} onChange={setDate} />

      {hasSenior && (
        <SeniorChips
          seniors={seniors}
          selectedId={selectedSeniorId}
          onSelect={setSelectedSeniorId}
        />
      )}

      <div className="flex flex-1 items-center justify-center">
        {hasSenior ? (
          // TODO: 약 등록 화면 작업 시 이동 연결
          <EmptyState
            message="등록된 약 정보가 없어요!"
            actionLabel="약 정보 등록하기"
            onAction={() => {}}
          />
        ) : (
          <EmptyState
            message="등록된 시니어가 없어요!"
            actionLabel="시니어 등록하기"
            onAction={() => navigate('/seniors/register')}
          />
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
