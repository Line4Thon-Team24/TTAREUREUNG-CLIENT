import { useEffect, useState } from 'react';
import { fetchDailySchedule } from '@/apis/schedule';
import type { ScheduleSlot } from '@/types/schedule';
import { toDateString } from '@/utils/date';

// 시니어·날짜별 복용 일정 (slots가 null이면 불러오는 중)
// 시니어나 날짜를 바꾸면 이전 일정은 보이지 않음
export default function useDailySchedule(seniorId: number | null, date: Date) {
  const day = toDateString(date);
  const key = seniorId === null ? null : `${seniorId}/${day}`;
  const [loaded, setLoaded] = useState<{
    key: string;
    slots: ScheduleSlot[];
  } | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  useEffect(() => {
    if (seniorId === null) return;
    const requestKey = `${seniorId}/${day}`;
    let ignore = false;
    fetchDailySchedule(seniorId, day)
      .then((slots) => {
        if (!ignore) setLoaded({ key: requestKey, slots });
      })
      .catch(() => {
        if (!ignore) setErrorKey(requestKey);
      });
    return () => {
      ignore = true;
    };
  }, [seniorId, day]);

  const slots = loaded?.key === key ? loaded.slots : null;
  // 시니어가 없으면(key가 null) 오류가 아님
  const isError = key !== null && slots === null && errorKey === key;
  return { slots, isError };
}
