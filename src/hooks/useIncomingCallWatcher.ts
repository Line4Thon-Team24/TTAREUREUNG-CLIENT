import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { answerSession, fetchCurrentSession, finishSession } from '@/apis/dose';

// 지금 울려야 할 회차를 확인하는 간격(ms)
const CHECK_INTERVAL = 60_000;

// 화면이 켜져 있는 동안 복약 전화가 올 시간인지 확인해 수신 화면으로 이동
// (화면을 열 때·다시 볼 때·1분마다 확인, 확인에 실패하면 다음 확인 때 다시 시도)
export default function useIncomingCallWatcher(seniorId: number | null) {
  const navigate = useNavigate();

  useEffect(() => {
    if (seniorId === null) return;
    let cancelled = false;

    const check = async () => {
      try {
        const { current } = await fetchCurrentSession(seniorId);
        if (cancelled || !current) return;
        if (current.medications.length > 0) {
          // 뒤로 가기로 일정 화면에 돌아와도 수신 화면에 갇히지 않도록 기록을 교체
          navigate(`/senior/call?sessionId=${current.sessionId}`, {
            replace: true,
          });
          return;
        }
        // 약을 다 먹었는데 회차가 안 끝났으면 끝내고 다음 회차를 다시 확인
        // (끝내기는 진행 중인 회차만 가능해 전화 전이면 받기부터)
        if (current.status === 'SCHEDULED') {
          await answerSession(current.sessionId);
        }
        await finishSession(current.sessionId);
        if (!cancelled) await check();
      } catch {
        // 다음 확인 때 다시 시도
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void check();
    };

    void check();
    const timer = window.setInterval(check, CHECK_INTERVAL);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [seniorId, navigate]);
}
