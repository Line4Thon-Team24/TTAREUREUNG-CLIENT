import { useEffect, useState } from 'react';
import { fetchNotificationSetting } from '@/apis/notificationSetting';
import type { AlertSettings } from '@/types/profile';

// 조회 결과는 어떤 profileId의 것인지 함께 저장해, ID가 바뀐 렌더에서 이전 값이 노출되지 않게 함
type Result = {
  profileId: number;
  setting?: AlertSettings;
  isError: boolean;
};

// 알림 설정 (setting이 null이면 불러오는 중, profileId가 없으면 조회하지 않음)
export default function useNotificationSetting(profileId: number | undefined) {
  const [result, setResult] = useState<Result | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (profileId === undefined) return;
    let ignore = false;
    fetchNotificationSetting(profileId)
      .then((data) => {
        if (!ignore) setResult({ profileId, setting: data, isError: false });
      })
      .catch(() => {
        if (!ignore) setResult({ profileId, isError: true });
      });
    return () => {
      ignore = true;
    };
  }, [profileId, attempt]);

  const retry = () => {
    setResult(null);
    setAttempt((prev) => prev + 1);
  };

  // 현재 profileId의 결과만 사용
  const current = result?.profileId === profileId ? result : null;

  return {
    setting: current?.setting ?? null,
    isError: current?.isError ?? false,
    retry,
  };
}
