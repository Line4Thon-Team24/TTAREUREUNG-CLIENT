// 개발용 임시 토큰 (로그인 연동 후 제거)
let accessToken: string | null = import.meta.env.DEV
  ? import.meta.env.VITE_DEV_ACCESS_TOKEN || null
  : null;

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const clearAccessToken = () => {
  accessToken = null;
};
