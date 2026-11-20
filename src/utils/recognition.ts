import type { FinishResponse } from '@/types/dose';
import type { DoseResult, DoseResultStatus } from '@/types/recognition';

// 쿼리스트링 값 → 양의 정수 (아니면 fallback)
export const parsePositiveInt = (value: string | null, fallback = 1) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

// Date → '오후 6시' (정각이 아니면 '오후 6시 30분')
export const formatClockTime = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours < 12 ? '오전' : '오후';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return minutes === 0
    ? `${period} ${hour12}시`
    : `${period} ${hour12}시 ${minutes}분`;
};

// Date → '11월 8일 오후 3시'
export const formatMonthDayTime = (date: Date) =>
  `${date.getMonth() + 1}월 ${date.getDate()}일 ${formatClockTime(date)}`;

// 다음 알림 전화 시각 ('오후 6시', 없으면 빈 문자열)
const formatNextCallTime = (result: DoseResult) =>
  result.nextCallAt ? formatClockTime(new Date(result.nextCallAt)) : '';

// 복용 결과 화면 문구 / 색상
type DoseResultView = {
  title: string;
  message: (result: DoseResult) => string;
  nextCallTime: (result: DoseResult) => string;
  color: string; // 아이콘·강조 색
  background: string; // 다음 알림 카드 배경
  border: string; // 다음 알림 카드 테두리
};

export const DOSE_RESULT_VIEW: Record<DoseResultStatus, DoseResultView> = {
  complete: {
    title: '모든 약을 다 먹었어요!',
    message: (result) =>
      result.nextCallAt
        ? `${formatClockTime(new Date(result.nextCallAt))}에 띠링이가 다시 전화드릴게요!`
        : '오늘 드실 약을 모두 드셨어요!',
    nextCallTime: formatNextCallTime,
    color: '#138A4B',
    background: '#EFF9F3',
    border: '#C3E3D1',
  },
  partial: {
    title: '약 중 일부만 드셨어요!',
    message: (result) =>
      `못 드신 약 ${result.extendedCount}개로 약 복용 일정이 하루 늘어났어요!`,
    nextCallTime: formatNextCallTime,
    color: '#D97706',
    background: '#FFF4E0',
    border: '#D97706',
  },
  missed: {
    title: '약을 아직 드시지 못했어요',
    message: () => '보호자 분께 미복용 확인 요청을 보냈어요',
    // 곧 다시 걸려 오면 'N분 뒤', 다음 회차까지 길면 시각
    nextCallTime: (result) =>
      result.minutesUntilNextCall < 60
        ? `${result.minutesUntilNextCall}분 뒤`
        : formatNextCallTime(result),
    color: '#E5484D',
    background: '#FFEEEE',
    border: '#E5484D',
  },
};

// 회차 종료 상태 → 복용 결과 상태 (재전화 대기는 아직 못 먹은 것이라 미복용)
const DOSE_RESULT_STATUS: Record<FinishResponse['status'], DoseResultStatus> = {
  COMPLETED: 'complete',
  PARTIAL: 'partial',
  MISSED: 'missed',
  SCHEDULED: 'missed',
  IN_PROGRESS: 'missed',
};

// 회차 종료 응답 → 복용 결과 화면 데이터 (scheduledAt: 복용 시각)
export const toDoseResult = (
  finish: FinishResponse,
  scheduledAt: string
): DoseResult => {
  const { nextCall } = finish;
  return {
    status: DOSE_RESULT_STATUS[finish.status],
    scheduledAt,
    takenCount: finish.takenCount,
    totalCount: finish.totalCount,
    extendedCount: finish.extendedMedicationCount,
    nextCallAt: nextCall?.scheduledAt ?? null,
    nextCallLabel: nextCall
      ? `${nextCall.slotName} 약${nextCall.medicationNames.length ? ` (${nextCall.medicationNames.join(' · ')})` : ''}`
      : '',
    minutesUntilNextCall: nextCall
      ? Math.max(
          1,
          Math.round((Date.parse(nextCall.scheduledAt) - Date.now()) / 60000)
        )
      : 0,
  };
};
