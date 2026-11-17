// 약 보관 위치 안내 문구
// 예: 약 상자 위에서 2번째 칸에 있는 처방전
export type StorageGuide = {
  prefix: string; // 예: '약 상자 위에서'
  highlight: string; // 예: '2번째 칸'
  suffix: string; // 예: '에 있는 처방전'
};

// 복용 시간에 걸려오는 수신 화면 데이터
export type IncomingCall = {
  scheduledAt: string; // 복용 시각
  medicineOrder: number; // 이번에 먹을 약 순서(1부터)
  remainingCount: number; // 남은 약 개수
  prescriptionImageUrl: string; // 처방전 사진 URL
  storageGuide: StorageGuide; // 약 보관 위치 안내 문구
};
