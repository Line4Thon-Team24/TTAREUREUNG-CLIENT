import { useEffect, useState } from 'react';
import { answerSession } from '@/apis/dose';
import type { SessionCall } from '@/types/dose';

// 회차의 아직 안 먹은 약 목록 (call이 null이면 불러오는 중)
// 전화 받기 API는 다시 호출해도 같은 목록을 돌려주므로 화면마다 불러와도 됨
export default function useSessionCall(sessionId: number | null) {
  const [loaded, setLoaded] = useState<{
    sessionId: number;
    call: SessionCall;
  } | null>(null);
  const [errorSessionId, setErrorSessionId] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (sessionId === null) return;
    let ignore = false;
    answerSession(sessionId)
      .then((call) => {
        if (!ignore) setLoaded({ sessionId, call });
      })
      .catch(() => {
        if (!ignore) setErrorSessionId(sessionId);
      });
    return () => {
      ignore = true;
    };
  }, [sessionId, attempt]);

  const call = loaded?.sessionId === sessionId ? loaded.call : null;
  const isError =
    sessionId !== null && call === null && errorSessionId === sessionId;
  const retry = () => {
    setErrorSessionId(null);
    setAttempt((prev) => prev + 1);
  };
  return { call, isError, retry };
}
