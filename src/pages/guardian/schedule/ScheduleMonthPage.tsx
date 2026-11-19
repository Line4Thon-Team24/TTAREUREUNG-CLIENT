import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchMonthlyAdherence } from '@/apis/schedule';
import ErrorState from '@/components/common/ErrorState';
import SeniorDropdown from '@/components/common/SeniorDropdown';
import AdherenceSummary from '@/components/schedule/AdherenceSummary';
import MonthCalendar from '@/components/schedule/MonthCalendar';
import useDateParam from '@/hooks/useDateParam';
import useGoBack from '@/hooks/useGoBack';
import useSeniorMedicines from '@/hooks/useSeniorMedicines';
import useSeniors from '@/hooks/useSeniors';
import useSelectedSeniorParam from '@/hooks/useSelectedSeniorParam';
import { SCHEDULE_SENIOR_KEY } from '@/constants/schedule';
import { toDateString } from '@/utils/date';

type Adherence = Awaited<ReturnType<typeof fetchMonthlyAdherence>>;

const ScheduleMonthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const goBackOr = useGoBack();
  const { seniors, isError: isSeniorError, retry: retrySeniors } = useSeniors();
  const [selectedSeniorId, selectSenior] = useSelectedSeniorParam(
    seniors ?? [],
    SCHEDULE_SENIOR_KEY
  );
  const [date, setDate] = useDateParam();
  const {
    medicines,
    isError: isMedicineError,
    retry: retryMedicines,
  } = useSeniorMedicines(selectedSeniorId);

  const year = date.getFullYear();
  const month = date.getMonth();
  const hasSenior = (seniors ?? []).length > 0;
  const hasMedicine = (medicines ?? []).length > 0;

  // 시니어·달별 복용률 (불러오는 중이거나 실패하면 요약 숨김)
  const monthKey = toDateString(date).slice(0, 7);
  const adherenceKey =
    selectedSeniorId === null ? null : `${selectedSeniorId}/${monthKey}`;
  const [adherence, setAdherence] = useState<{
    key: string;
    value: Adherence;
  } | null>(null);

  useEffect(() => {
    if (selectedSeniorId === null) return;
    const requestKey = `${selectedSeniorId}/${monthKey}`;
    let ignore = false;
    fetchMonthlyAdherence(selectedSeniorId, monthKey)
      .then((value) => {
        if (!ignore) setAdherence({ key: requestKey, value });
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [selectedSeniorId, monthKey]);

  const monthlyAdherence =
    adherence?.key === adherenceKey ? adherence.value : null;

  const moveMonth = (offset: number) =>
    setDate(new Date(year, month + offset, 1));

  // 당일 화면에서 들어왔으면 뒤로, 바로 들어왔으면 당일 화면으로
  const goBack = () => goBackOr(`/schedule${location.search}`);

  const goToDate = (next: Date) => {
    const params = new URLSearchParams({ date: toDateString(next) });
    if (selectedSeniorId !== null) {
      params.set('seniorId', String(selectedSeniorId));
    }
    navigate(`/schedule/week?${params}`);
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="grid grid-cols-[1fr_auto_1fr] items-center px-5 pt-4 pb-4">
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
          {seniors === null ? null : hasSenior ? (
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
        </div>
      </header>

      {hasMedicine && monthlyAdherence && (
        <AdherenceSummary {...monthlyAdherence} />
      )}

      {/* 달력은 바로 보여주고, 시니어·약을 못 불러오면 달력 대신 안내 */}
      {isSeniorError ? (
        <ErrorState
          message="시니어 목록을 불러오지 못했어요."
          onRetry={retrySeniors}
        />
      ) : isMedicineError ? (
        <ErrorState
          message="약 목록을 불러오지 못했어요."
          onRetry={retryMedicines}
        />
      ) : (
        <MonthCalendar
          year={year}
          month={month}
          medicines={medicines ?? []}
          onDateClick={goToDate}
          // 시니어는 있는데 약이 없을 때만 (약 목록을 불러온 뒤)
          onRegisterMedicine={
            hasSenior && medicines !== null && !hasMedicine
              ? () =>
                  navigate('/medicines/register', {
                    state: { seniorId: selectedSeniorId },
                  })
              : undefined
          }
        />
      )}
    </div>
  );
};

export default ScheduleMonthPage;
