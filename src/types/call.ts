// 약 보관 위치 안내 문구
// 예: 약 상자 위에서 2번째 칸에 있는 처방전
export type StorageGuide = {
  prefix: string; // 예: '약 상자 위에서'
  highlight: string; // 예: '2번째 칸'
  suffix: string; // 예: '에 있는 처방전'
};
