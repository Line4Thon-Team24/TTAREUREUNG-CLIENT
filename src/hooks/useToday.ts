import { useEffect, useState } from 'react';
import { toDateString } from '@/utils/date';

// 오늘 날짜 (자정이 지나거나 화면으로 다시 돌아오면 갱신)
export default function useToday() {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    // 날짜가 바뀌었을 때만 갱신 (같은 날이면 그대로 → 다시 그리지 않음)
    const refresh = () =>
      setToday((prev) =>
        toDateString(prev) === toDateString(new Date()) ? prev : new Date()
      );

    // 다음 자정 1초 뒤 (타이머가 조금 일찍 울려도 날짜가 바뀐 뒤 확인)
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );
    const timer = setTimeout(
      refresh,
      nextMidnight.getTime() - now.getTime() + 1000
    );

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [today]);

  return today;
}
