// 약 인식(카메라) 화면 상태
export type RecognitionStatus =
  | 'scanning' // 인식 중
  | 'success' // 맞는 약
  | 'error' // 인식 오류
  | 'delayed' // 인식 지연 (도움 요청 / 다시 찾기)
  | 'wrong'; // 다른 약

// 복용 결과 화면 상태
export type DoseResultStatus = 'complete' | 'partial' | 'missed';

// 찾아야 하는 약 (사진 + 보관 위치)
export type TargetMedicine = {
  id: number;
  order: number; // 약 순서(1부터)
  displayName: string; // 시니어에게 보여줄 이름 (예: 관절약)
  appearance: string; // 겉모습 설명 (예: 파란색 원기둥)
  imageUrl: string;
  remainingCount: number; // 남은 개수
  storageGuide: {
    prefix: string;
    highlight: string;
    suffix: string;
  };
  doseAmount: string; // 복용 수량 (예: 2정)
  doseGuide: string; // 인식 성공 시 안내 (예: 점심 약 한 봉지를 복용해 주세요)
};

// 복용 결과 화면 데이터
export type DoseResult = {
  status: DoseResultStatus;
  scheduledAt: string; // 복용 시각 (ISO)
  takenCount: number;
  totalCount: number;
  nextCallAt: string; // 다음 알림 전화 시각 (ISO)
  nextCallLabel: string; // 예: 저녁 식후 약 (혈압약 · 소화제)
  minutesUntilNextCall: number; // 미복용 시 '10분 뒤' 표시
};
