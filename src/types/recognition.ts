// 약 인식(카메라) 화면 상태
export type RecognitionStatus =
  | 'scanning' // 인식 중
  | 'success' // 맞는 약
  | 'error' // 인식 오류
  | 'delayed' // 인식 지연 (도움 요청 / 다시 찾기)
  | 'wrong'; // 다른 약

// 복용 결과 화면 상태
export type DoseResultStatus = 'complete' | 'partial' | 'missed';

// 복용 결과 화면 데이터
export type DoseResult = {
  status: DoseResultStatus;
  scheduledAt: string; // 복용 시각 (ISO)
  takenCount: number;
  totalCount: number;
  extendedCount: number; // 일정이 하루 늘어난 약 수
  nextCallAt: string | null; // 다음 알림 전화 시각 (ISO, 없으면 null)
  nextCallLabel: string; // 예: 저녁 식후 약 (혈압약 · 소화제), 다음 알림이 없으면 빈 문자열
  minutesUntilNextCall: number; // 미복용 시 '10분 뒤' 표시 (다음 알림이 없으면 0)
};
