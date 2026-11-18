import { apiClient } from '@/apis/client';
import type { BaseResponse } from '@/types/api';
import type { ProfileResponse, Senior } from '@/types/senior';

// 프로필 응답 → 화면용 시니어
const toSenior = (profile: ProfileResponse): Senior => ({
  id: profile.profileId,
  name: profile.name,
  birthDate: profile.birthDate ?? '',
  gender: profile.gender === 'MALE' ? 'male' : 'female',
  phoneNumber: profile.phoneNumber ?? '',
  registeredAt: null, // TODO: 등록일 필드 추가 시 연동
  isFavorite: false, // TODO: 즐겨찾기 필드 추가 시 연동
});

// 시니어 목록 조회 (최근 추가순)
export const fetchSeniors = async () => {
  const { data } =
    await apiClient.get<BaseResponse<ProfileResponse[]>>('/profiles');
  // 생성 순서대로 오므로 뒤집어서 최근 추가순
  return data.data
    .filter((profile) => profile.role === 'SENIOR')
    .map(toSenior)
    .reverse();
};
