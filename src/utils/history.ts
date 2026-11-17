// 앱 안에서 몇 번째 기록인지 (react-router가 기록마다 저장, 처음 연 화면이 0)
// → 주소 바꿔치기(replace)나 새로고침에도 유지되어 이전 기록 여부를 판단할 수 있음
export const getHistoryIndex = () => {
  const idx = (window.history.state as { idx?: unknown } | null)?.idx;
  return typeof idx === 'number' ? idx : 0;
};
