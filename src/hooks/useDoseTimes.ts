import { useEffect, useState } from 'react';
import { fetchDoseTimes } from '@/apis/schedule';
import type { DoseTimes } from '@/types/schedule';

// 시니어별 회차 시각 (불러오기 전·실패 시 null)
export default function useDoseTimes(seniorId: number | null) {
  const [loaded, setLoaded] = useState<{
    seniorId: number;
    doseTimes: DoseTimes;
  } | null>(null);

  useEffect(() => {
    if (seniorId === null) return;
    let ignore = false;
    fetchDoseTimes(seniorId)
      .then((doseTimes) => {
        if (!ignore) setLoaded({ seniorId, doseTimes });
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [seniorId]);

  // 다른 시니어의 시각은 쓰지 않음
  return loaded?.seniorId === seniorId ? loaded.doseTimes : null;
}
