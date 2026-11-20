import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentSession } from '@/apis/dose';

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
        // 뒤로 가기로 일정 화면에 돌아와도 수신 화면에 갇히지 않도록 기록을 교체
        if (!cancelled && current) {
          navigate(`/senior/call?sessionId=${current.sessionId}`, {
            replace: true,
          });
        }
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
