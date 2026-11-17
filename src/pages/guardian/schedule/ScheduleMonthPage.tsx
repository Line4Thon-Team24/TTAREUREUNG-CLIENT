import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SeniorSelect from '@/components/common/SeniorSelect';
import AdherenceSummary from '@/components/schedule/AdherenceSummary';
import MonthCalendar from '@/components/schedule/MonthCalendar';
import useDateParam from '@/hooks/useDateParam';
import useSelectedSeniorParam from '@/hooks/useSelectedSeniorParam';
import { getMedicines } from '@/mocks/medicines';
import { getMonthlyAdherence } from '@/mocks/schedule';
import { getSeniors } from '@/mocks/seniors';
import { toDateString } from '@/utils/date';

const ScheduleMonthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [seniors] = useState(getSeniors);
  const [selectedSeniorId, selectSenior] = useSelectedSeniorParam(seniors);
  const [date, setDate] = useDateParam();

  const year = date.getFullYear();
  const month = date.getMonth();
  const medicines =
    selectedSeniorId === null ? [] : getMedicines(selectedSeniorId);
  const hasSenior = seniors.length > 0;
  const hasMedicine = medicines.length > 0;

  const moveMonth = (offset: number) =>
    setDate(new Date(year, month + offset, 1));

  // 당일 화면에서 들어왔으면 뒤로, 바로 들어왔으면 당일 화면으로
  const goBack = () => {
    if (location.key !== 'default') navigate(-1);
    else navigate(`/schedule${location.search}`, { replace: true });
  };

  const goToDate = (next: Date) => {
    const params = new URLSearchParams({ date: toDateString(next) });
    if (selectedSeniorId !== null) {
      params.set('seniorId', String(selectedSeniorId));
    }
    navigate(`/schedule/week?${params}`);
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="grid grid-cols-[1fr_auto_1fr] items-center px-5 pt-10 pb-4">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={goBack}
          className="justify-self-start text-[#191F28]"
        >
          <ChevronLeft size={24} strokeWidth={2.5} aria-hidden />
        </button>

        <div className="flex items-center gap-1 text-[#191F28]">
          <button
            type="button"
            aria-label="이전 달"
            onClick={() => moveMonth(-1)}
          >
            <ChevronLeft size={20} strokeWidth={2.5} aria-hidden />
          </button>
          <h1 className="text-[20px] font-bold whitespace-nowrap">
            {year}년 {month + 1}월
          </h1>
          <button
            type="button"
            aria-label="다음 달"
            onClick={() => moveMonth(1)}
          >
            <ChevronRight size={20} strokeWidth={2.5} aria-hidden />
          </button>
        </div>

        <div className="justify-self-end">
          {hasSenior ? (
            <SeniorSelect
              seniors={seniors}
              selectedId={selectedSeniorId}
              onSelect={selectSenior}
            />
          ) : (
            <button
              type="button"
              onClick={() => navigate('/seniors/register')}
              className="rounded-full bg-[#F2F4F6] px-3 py-1 text-[12px] font-semibold whitespace-nowrap text-[#6B7684]"
            >
              시니어 등록하기
            </button>
          )}
        </div>
      </header>

      {hasMedicine && <AdherenceSummary {...getMonthlyAdherence()} />}

      <MonthCalendar
        year={year}
        month={month}
        medicines={medicines}
        onDateClick={goToDate}
        // 시니어는 있는데 약이 없을 때만
        onRegisterMedicine={
          hasSenior && !hasMedicine
            ? () =>
                navigate('/medicines/register', {
                  state: { seniorId: selectedSeniorId },
                })
            : undefined
        }
      />
    </div>
  );
};

export default ScheduleMonthPage;
