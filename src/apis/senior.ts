import { apiClient } from '@/apis/client';
import { fetchProfiles } from '@/apis/profile';
import type { BaseResponse } from '@/types/api';
import type { ProfileResponse, Senior, SeniorForm } from '@/types/senior';
import { getSelectedGuardian } from '@/utils/profile';

const GENDER_FROM_API = { MALE: 'male', FEMALE: 'female' } as const;
const GENDER_TO_API = { male: 'MALE', female: 'FEMALE' } as const;

// 프로필 응답 → 화면용 시니어
const toSenior = (profile: ProfileResponse): Senior => ({
  id: profile.profileId,
  name: profile.name,
  birthDate: profile.birthDate ?? '',
  gender: profile.gender ? GENDER_FROM_API[profile.gender] : null,
  phoneNumber: profile.phoneNumber ?? '',
  registeredAt: profile.createdAt,
  isFavorite: profile.isFavorite,
});

// 화면용 시니어 입력값 → 프로필 요청
export const toProfileRequest = (form: SeniorForm) => ({
  name: form.name,
  birthDate: form.birthDate,
  gender: form.gender ? GENDER_TO_API[form.gender] : undefined,
  phoneNumber: form.phoneNumber,
});

// 시니어 목록 조회 (최근 추가순)
export const fetchSeniors = async () => {
  const profiles = await fetchProfiles();
  // 등록일 기준 최근 추가순
  return profiles
    .filter((profile) => profile.role === 'SENIOR')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toSenior);
};

// 시니어 상세 조회
export const fetchSenior = async (seniorId: number) => {
  const { data } = await apiClient.get<BaseResponse<ProfileResponse>>(
    `/profiles/${seniorId}`
  );
  return toSenior(data.data);
};

// 시니어 정보 수정
export const updateSenior = async (seniorId: number, form: SeniorForm) => {
  await apiClient.patch(`/profiles/${seniorId}`, toProfileRequest(form));
};

// 즐겨찾기 설정·해제 (가족 계정 공통 값)
export const updateSeniorFavorite = async (
  seniorId: number,
  isFavorite: boolean
) => {
  await apiClient.patch(`/profiles/${seniorId}`, { isFavorite });
};

// 시니어 여러 명 삭제 (삭제에 실패한 id 반환)
export const deleteSeniors = async (seniorIds: number[]) => {
  const results = await Promise.allSettled(
    seniorIds.map((id) => apiClient.delete(`/profiles/${id}`))
  );
  return seniorIds.filter((_, index) => results[index].status === 'rejected');
};

// 프로필 선택에서 고른 보호자 (선택이 없으면 첫 번째 보호자)
const fetchGuardianProfileId = async () => {
  const guardian = getSelectedGuardian(await fetchProfiles());
  if (!guardian) throw new Error('보호자 프로필이 없습니다.');
  return guardian.profileId;
};

// 시니어 등록 (보호자와 바로 연결)
export const createSenior = async (form: SeniorForm) => {
  const guardianProfileId = await fetchGuardianProfileId();
  const { data } = await apiClient.post<BaseResponse<ProfileResponse>>(
    '/profiles',
    { ...toProfileRequest(form), role: 'SENIOR', guardianProfileId }
  );
  return toSenior(data.data);
};
