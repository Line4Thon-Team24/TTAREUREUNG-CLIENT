// 서버 공통 응답 형식
export type BaseResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};

// 공통 에러 형식
export type ApiError = {
  status: number | null;
  code: string;
  message: string;
};
