import { useEffect, useState } from 'react';
import { fetchGuardians } from '@/apis/guardian';
import type { Guardian } from '@/types/guardian';

// 보호자 목록 (guardians가 null이면 불러오는 중)
export default function useGuardians() {
  const [guardians, setGuardians] = useState<Guardian[] | null>(null);
  const [isError, setIsError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    fetchGuardians()
      .then(({ guardians: data }) => {
        if (!ignore) setGuardians(data);
      })
      .catch(() => {
        if (!ignore) setIsError(true);
      });
    return () => {
      ignore = true;
    };
  }, [attempt]);

  const retry = () => {
    setIsError(false);
    setAttempt((prev) => prev + 1);
  };

  return { guardians, isError, retry };
}
