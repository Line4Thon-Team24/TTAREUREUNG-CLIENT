import { apiClient } from '@/apis/client';
import { DEFAULT_DOSE_TIMES } from '@/constants/medicine';
import type { BaseResponse } from '@/types/api';
import type {
  DoseStatus,
  DoseTimes,
  MealTime,
  ScheduleResponse,
  ScheduleSlot,
  TimeSlot,
} from '@/types/schedule';

type Session = ScheduleResponse['sessions'][number];

const MEAL_TIME_FROM_API: Record<Session['timeSlot'], MealTime> = {
  MORNING: 'morning',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  BEFORE_SLEEP: 'night',
};

const FINISHED_SESSION: Session['status'][] = [
  'COMPLETED',
  'PARTIAL',
  'MISSED',
];

// 약 상태 (끝난 회차의 미복용 약은 미복용, 전화 받고 약 찾는 중이면 복용 중)
const toDoseStatus = (
  status: Session['medications'][number]['status'],
  sessionStatus: Session['status']
): DoseStatus => {
  if (status === 'TAKEN') return 'taken';
  if (status === 'MISSED' || FINISHED_SESSION.includes(sessionStatus)) {
    return 'missed';
  }
  return sessionStatus === 'IN_PROGRESS' ? 'taking' : 'scheduled';
};

const toSlot = (session: Session): ScheduleSlot => ({
  id: session.timeSlot,
  mealTime: MEAL_TIME_FROM_API[session.timeSlot],
  time: session.doseTime,
  // 회차 이름 (예: 아침, 점심 식후)
  timingLabel: session.slotName,
  // '2026-11-08T11:08:00' → '11:08'
  callConfirmedAt: session.answeredAt?.slice(11, 16),
  medicines: session.medications.map((medication) => ({
    id: `${session.timeSlot}-${medication.medicationId}`,
    medicineId: medication.medicationId,
    displayName: medication.name,
    dosage: medication.strength ?? '',
    amount: medication.doseAmount ?? '',
    shape: 'tablet', // 모양 정보가 없어 알약으로 통일
    imageUrl: medication.imageUrl,
    status: toDoseStatus(medication.status, session.status),
  })),
});

// 월별 복용률 (month: YYYY-MM, 모두 %)
export const fetchMonthlyAdherence = async (
  seniorId: number,
  month: string
) => {
  const { data } = await apiClient.get<
    BaseResponse<{
      rate: number;
      completed_rate: number;
      partial_rate: number;
      missed_rate: number;
    }>
  >('/medications/calendar', { params: { senior_id: seniorId, month } });
  return {
    rate: data.data.rate,
    taken: data.data.completed_rate,
    partial: data.data.partial_rate,
    missed: data.data.missed_rate,
  };
};

// 시니어별 회차 시각 (설정한 적이 없으면 서버 기본값)
export const fetchDoseTimes = async (seniorId: number) => {
  const { data } = await apiClient.get<
    BaseResponse<{
      seniorId: number;
      doseTimes: { timeSlot: TimeSlot; slotName: string; doseTime: string }[];
    }>
  >(`/seniors/${seniorId}/dose-times`);
  return data.data.doseTimes.reduce<DoseTimes>(
    (times, { timeSlot, doseTime }) => ({ ...times, [timeSlot]: doseTime }),
    { ...DEFAULT_DOSE_TIMES }
  );
};

// 날짜별 복용 일정 (date: YYYY-MM-DD, 약이 없는 회차는 제외)
export const fetchDailySchedule = async (seniorId: number, date: string) => {
  const { data } = await apiClient.get<BaseResponse<ScheduleResponse>>(
    `/seniors/${seniorId}/schedules`,
    { params: { date } }
  );
  return data.data.sessions
    .filter((session) => session.medications.length > 0)
    .map(toSlot);
};
