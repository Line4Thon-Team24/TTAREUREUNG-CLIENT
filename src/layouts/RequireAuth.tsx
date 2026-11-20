import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { refreshSession } from '@/apis/client';
import LoadingState from '@/components/common/LoadingState';
import { getAccessToken } from '@/utils/accessToken';

type AuthState = 'checking' | 'authenticated' | 'unauthenticated';

// 인증된 사용자만 하위 라우트에 접근할 수 있으며, 인증되지 않은 경우 로그인 페이지로 리다이렉트
export default function RequireAuth() {
  const [state, setState] = useState<AuthState>(() =>
    getAccessToken() ? 'authenticated' : 'checking'
  );

  useEffect(() => {
    if (state !== 'checking') return;
    let ignore = false;
    refreshSession()
      .then(() => {
        if (!ignore) setState('authenticated');
      })
      .catch(() => {
        if (!ignore) setState('unauthenticated');
      });
    return () => {
      ignore = true;
    };
  }, [state]);

  if (state === 'checking') {
    return <LoadingState className="min-h-dvh" />;
  }
  if (state === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
