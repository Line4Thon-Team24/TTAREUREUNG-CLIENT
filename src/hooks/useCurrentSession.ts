import { useEffect, useState } from 'react';
import { fetchCurrentSession } from '@/apis/dose';
import type { CurrentSession } from '@/types/dose';

// 시니어의 지금 울려야 할 회차 (session이 null이면 불러오는 중)
// 시니어를 바꾸면 이전 시니어의 회차는 보이지 않음
export default function useCurrentSession(seniorId: number | null) {
  const [loaded, setLoaded] = useState<{
    seniorId: number;
    session: CurrentSession;
  } | null>(null);
  const [errorSeniorId, setErrorSeniorId] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (seniorId === null) return;
    let ignore = false;
    fetchCurrentSession(seniorId)
      .then((session) => {
        if (!ignore) setLoaded({ seniorId, session });
      })
      .catch(() => {
        if (!ignore) setErrorSeniorId(seniorId);
      });
    return () => {
      ignore = true;
    };
  }, [seniorId, attempt]);

  const session = loaded?.seniorId === seniorId ? loaded.session : null;
  // 시니어가 없으면 오류가 아님
  const isError =
    seniorId !== null && session === null && errorSeniorId === seniorId;
  const retry = () => {
    setErrorSeniorId(null);
    setAttempt((prev) => prev + 1);
  };
  return { session, isError, retry };
}
