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

// Date → '2026.11.05' (기기 시간대 기준)
export const formatDate = (date: Date) =>
  `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;

// Date → '2026.11.05 19:23'
export const formatDateTime = (date: Date) =>
  `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;

// 'YYYY-MM-DD' → '2026.08.12'
export const formatDotDate = (value: string) => value.replaceAll('-', '.');

// 'YYYY-MM-DD' → Date (기기 시간대 기준)
export const parseDateString = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// 'YYYY-MM-DD' 형식이 맞는지 확인
export const isDateString = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  toDateString(parseDateString(value)) === value;

// 두 날짜 사이 일수 (to - from)
export const diffDays = (from: string, to: string) =>
  Math.round(
    (parseDateString(to).getTime() - parseDateString(from).getTime()) /
      86_400_000
  );

// 날짜가 포함된 주의 7일 (일요일 시작)
export const getWeekDates = (date: Date) =>
  Array.from(
    { length: 7 },
    (_, day) =>
      new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - date.getDay() + day
      )
  );

// 달력에 그릴 주 목록 (일요일 시작, 앞뒤 달 날짜 포함)
export const getMonthWeeks = (year: number, month: number) => {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  const lastDay = new Date(year, month + 1, 0).getDate();
  const weekCount = Math.ceil((first.getDay() + lastDay) / 7);

  return Array.from({ length: weekCount }, (_, week) =>
    Array.from(
      { length: 7 },
      (_, day) =>
        new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate() + week * 7 + day
        )
    )
  );
};
