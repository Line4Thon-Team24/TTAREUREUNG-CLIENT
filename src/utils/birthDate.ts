export type BirthDate = { year: string; month: string; day: string };

// 해당 년/월의 마지막 날짜 (년/월 미선택 시 31일)
export const getDaysInMonth = (year: string, month: string) =>
  year && month ? new Date(Number(year), Number(month), 0).getDate() : 31;

// 올해는 이번 달까지만 선택 가능
export const getMaxMonth = (year: string) => {
  const today = new Date();
  return Number(year) === today.getFullYear() ? today.getMonth() + 1 : 12;
};

// 이번 달은 오늘까지만 선택 가능
export const getMaxDay = (year: string, month: string) => {
  const today = new Date();
  const isThisMonth =
    Number(year) === today.getFullYear() &&
    Number(month) === today.getMonth() + 1;
  return isThisMonth ? today.getDate() : getDaysInMonth(year, month);
};

// 년/월/일이 모두 선택되었고 오늘 이후 날짜가 아닌지 검사
export const isValidBirthDate = ({ year, month, day }: BirthDate) => {
  if (!year || !month || !day) return false;

  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today;
};
