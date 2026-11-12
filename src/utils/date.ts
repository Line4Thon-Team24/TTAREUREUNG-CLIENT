const pad = (value: number) => String(value).padStart(2, '0');

// Date → 'YYYY-MM-DD'
export const toDateString = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// 'YYYY-MM-DD' 기준으로 며칠 뒤 날짜
export const addDaysToDateString = (value: string, days: number) => {
  const [year, month, day] = value.split('-').map(Number);
  return toDateString(new Date(year, month - 1, day + days));
};

// 'YYYY-MM-DD' → '2026년 8월 12일'
export const formatKoreanDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return `${year}년 ${month}월 ${day}일`;
};

// Date → '2026.11.05 19:23'
export const formatDateTime = (date: Date) =>
  `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
