// 약 순서를 나타내는 서수 표현
const ORDINALS = [
  '첫',
  '두',
  '세',
  '네',
  '다섯',
  '여섯',
  '일곱',
  '여덟',
  '아홉',
  '열',
];

// 1 → '첫번째 약', 2 → '두번째 약', 11 → '11번째 약'
export const formatMedicineOrder = (order: number) => {
  const word = ORDINALS[order - 1];
  return word ? `${word}번째 약` : `${order}번째 약`;
};

// Date → '11월 8일 오후 3시' (정각이 아니면 '오후 3시 30분')
export const formatCallTime = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours < 12 ? '오전' : '오후';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const time = minutes === 0 ? `${hour12}시` : `${hour12}시 ${minutes}분`;
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${period} ${time}`;
};
