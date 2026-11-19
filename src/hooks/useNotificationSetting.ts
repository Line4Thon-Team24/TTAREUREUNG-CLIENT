import { useEffect, useState } from 'react';
import { fetchNotificationSetting } from '@/apis/notificationSetting';
import type { AlertSettings } from '@/types/profile';

// 알림 설정 (setting이 null이면 불러오는 중, profileId가 없으면 조회하지 않음)
export default function useNotificationSetting(profileId: number | undefined) {
  const [setting, setSetting] = useState<AlertSettings | null>(null);
  const [isError, setIsError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (profileId === undefined) return;
    let ignore = false;
    fetchNotificationSetting(profileId)
      .then((data) => {
        if (!ignore) setSetting(data);
      })
      .catch(() => {
        if (!ignore) setIsError(true);
      });
    return () => {
      ignore = true;
    };
  }, [profileId, attempt]);

  const retry = () => {
    setIsError(false);
    setAttempt((prev) => prev + 1);
  };

  return { setting, isError, retry };
}
