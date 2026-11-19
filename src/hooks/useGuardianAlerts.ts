import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchGuardianAlerts, markAlertRead } from '@/apis/alert';
import { fetchMyGuardianProfileIds } from '@/apis/guardian';
import type { GuardianAlert } from '@/types/alert';

const POLL_INTERVAL_MS = 60_000;
// 이보다 오래된 안 읽은 알림은 배너로 띄우지 않음
const RECENT_LIMIT_MS = 60 * 60_000;

// 1분마다 새 알림을 받아 한 개씩 보여줌 (보여준 알림은 읽음 처리)
export default function useGuardianAlerts() {
  const [queue, setQueue] = useState<GuardianAlert[]>([]);
  // 이미 보여준 알림 (예정 알림은 읽음 처리가 없어 여기서만 걸러냄)
  const shownKeys = useRef(new Set<string>());
  const profileId = useRef<number | null>(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      // 화면이 안 보일 때 띄우면 못 본 채 읽음 처리되므로 건너뜀
      if (document.hidden) return;
      try {
        // TODO: 프로필 선택 연동 후 선택된 보호자 프로필로 교체
        if (profileId.current === null) {
          const [firstId] = await fetchMyGuardianProfileIds();
          if (firstId === undefined) return;
          profileId.current = firstId;
        }
        const alerts = await fetchGuardianAlerts(profileId.current);
        if (ignore) return;
        const now = Date.now();
        const fresh = alerts.filter(
          ({ key, occurredAt }) =>
            !shownKeys.current.has(key) &&
            now - new Date(occurredAt).getTime() < RECENT_LIMIT_MS
        );
        if (fresh.length === 0) return;
        fresh.forEach(({ key }) => shownKeys.current.add(key));
        // 오래된 알림부터 보여줌
        setQueue((prev) => [...prev, ...fresh.reverse()]);
      } catch {
        // 조회 실패는 다음 주기에 다시 시도
      }
    };
    load();
    const timer = window.setInterval(load, POLL_INTERVAL_MS);
    // 앱으로 돌아오면 바로 다시 조회
    document.addEventListener('visibilitychange', load);
    return () => {
      ignore = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', load);
    };
  }, []);

  // 개발용: 테스트 버튼에서 보낸 가짜 알림 받기
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const handleTest = (event: Event) => {
      const { detail } = event as CustomEvent<GuardianAlert[]>;
      setQueue((prev) => [...prev, ...detail]);
    };
    window.addEventListener('guardian-alert-test', handleTest);
    return () => window.removeEventListener('guardian-alert-test', handleTest);
  }, []);

  const current = queue[0] ?? null;

  // 화면에 띄운 알림은 읽음 처리 (실패해도 다시 띄우지 않음)
  useEffect(() => {
    if (current?.alertId == null) return;
    markAlertRead(current.alertId).catch(() => {});
  }, [current?.alertId]);

  const dismiss = useCallback(() => setQueue((prev) => prev.slice(1)), []);

  return { current, dismiss };
}
