import { apiClient } from '@/apis/client';
import type { BaseResponse } from '@/types/api';
import type {
  DoseStatus,
  MealTime,
  ScheduleResponse,
  ScheduleSlot,
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
  // TODO: 약별 복용 시점이 응답에 추가되면 표시
  timingLabel: '',
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
