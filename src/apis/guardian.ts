import { apiClient } from '@/apis/client';
import { toProfileRequest } from '@/apis/senior';
import type { BaseResponse } from '@/types/api';
import type { SeniorForm } from '@/types/senior';
import type { ProfileResponse } from '@/types/senior';

// 보호자 프로필 생성
export const createGuardian = async (form: SeniorForm) => {
  const { data } = await apiClient.post<BaseResponse<ProfileResponse>>(
    '/profiles',
    { ...toProfileRequest(form), role: 'GUARDIAN' }
  );
  return data.data;
};
