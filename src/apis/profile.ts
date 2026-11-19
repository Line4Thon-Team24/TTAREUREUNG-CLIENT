import { apiClient } from '@/apis/client';
import type { BaseResponse } from '@/types/api';
import type { ProfileResponse } from '@/types/senior';

// 프로필 목록 조회 (로그인한 계정의 프로필, 생성 순서)
export const fetchProfiles = async () => {
  const { data } =
    await apiClient.get<BaseResponse<ProfileResponse[]>>('/profiles');
  return data.data;
};
