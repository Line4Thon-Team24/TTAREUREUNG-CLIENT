import { apiClient } from '@/apis/client';
import type { BaseResponse } from '@/types/api';
import type { CurrentSession } from '@/types/dose';

// 지금 울려야 할 회차 조회
export const fetchCurrentSession = async (seniorId: number) => {
  const { data } = await apiClient.get<BaseResponse<CurrentSession>>(
    `/seniors/${seniorId}/dose-sessions/current`
  );
  return data.data;
};
