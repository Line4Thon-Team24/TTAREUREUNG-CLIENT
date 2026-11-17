import type {
  DoseResult,
  DoseResultStatus,
  RecognitionStatus,
} from '@/types/recognition';

const RECOGNITION_STATUSES: RecognitionStatus[] = [
  'scanning',
  'success',
  'error',
  'delayed',
  'wrong',
];

const DOSE_RESULT_STATUSES: DoseResultStatus[] = [
  'complete',
  'partial',
  'missed',
];

// 쿼리스트링 값 → 인식 상태 (잘못된 값이면 인식 중)
export const parseRecognitionStatus = (
  value: string | null
): RecognitionStatus =>
  RECOGNITION_STATUSES.find((status) => status === value) ?? 'scanning';

// 쿼리스트링 값 → 복용 결과 상태 (잘못된 값이면 복용 완료)
export const parseDoseResultStatus = (value: string | null): DoseResultStatus =>
  DOSE_RESULT_STATUSES.find((status) => status === value) ?? 'complete';

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
    message: () => '3시간 뒤에 띠링이가 다시 전화드릴게요!',
    nextCallTime: (result) => formatClockTime(new Date(result.nextCallAt)),
    color: '#138A4B',
    background: '#EFF9F3',
    border: '#C3E3D1',
  },
  partial: {
    title: '약 중 일부만 드셨어요!',
    message: (result) =>
      `못 드신 약 ${result.totalCount - result.takenCount}개로 약 복용 일정이 하루 늘어났어요!`,
    nextCallTime: (result) => formatClockTime(new Date(result.nextCallAt)),
    color: '#D97706',
    background: '#FFF4E0',
    border: '#D97706',
  },
  missed: {
    title: '약을 아직 드시지 못했어요',
    message: () => '보호자 분께 미복용 확인 요청을 보냈어요',
    nextCallTime: (result) => `${result.minutesUntilNextCall}분 뒤`,
    color: '#E5484D',
    background: '#FFEEEE',
    border: '#E5484D',
  },
};
