import { useEffect, useState } from 'react';
import { fetchSeniors } from '@/apis/senior';
import type { Senior } from '@/types/senior';

// 시니어 목록 (seniors가 null이면 불러오는 중)
export default function useSeniors() {
  const [seniors, setSeniors] = useState<Senior[] | null>(null);
  const [isError, setIsError] = useState(false);
  // 다시 시도하면 값이 바뀌어 다시 불러옴
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    fetchSeniors()
      .then((data) => {
        if (!ignore) setSeniors(data);
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

  return { seniors, isError, retry };
}
