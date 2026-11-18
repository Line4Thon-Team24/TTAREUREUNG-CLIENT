// Access Token은 메모리에만 보관 (새로고침 시 Refresh 쿠키로 재발급)
let accessToken: string | null = null;

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const clearAccessToken = () => {
  accessToken = null;
};
