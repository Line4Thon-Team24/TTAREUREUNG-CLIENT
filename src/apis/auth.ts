import { apiClient } from '@/apis/client';
import type { BaseResponse } from '@/types/api';
import type {
  SignupAccount,
  SignupResponse,
  TokenResponse,
} from '@/types/auth';
import { clearAccessToken, setAccessToken } from '@/utils/accessToken';

// 회원가입
export const signup = async ({ email, password }: SignupAccount) => {
  const { data } = await apiClient.post<BaseResponse<SignupResponse>>(
    '/auth/signup',
    { email, password }
  );
  return data.data;
};

// 로그인
export const login = async ({ email, password }: SignupAccount) => {
  const { data } = await apiClient.post<BaseResponse<TokenResponse>>(
    '/auth/login',
    { email, password }
  );
  setAccessToken(data.data.accessToken);
};

// 로그아웃 (서버 요청에 실패해도 클라이언트의 Access Token은 삭제)
export const logout = async () => {
  try {
    await apiClient.post('/auth/logout', null, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
  } finally {
    clearAccessToken();
  }
};
