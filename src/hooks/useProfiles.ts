import { useEffect, useState } from 'react';
import { fetchProfiles } from '@/apis/profile';
import type { ProfileResponse } from '@/types/senior';

// 프로필 목록 (profiles가 null이면 불러오는 중)
export default function useProfiles() {
  const [profiles, setProfiles] = useState<ProfileResponse[] | null>(null);
  const [isError, setIsError] = useState(false);
  // 다시 시도하면 값이 바뀌어 다시 불러옴
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    fetchProfiles()
      .then((data) => {
        if (!ignore) setProfiles(data);
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

  return { profiles, isError, retry };
}
