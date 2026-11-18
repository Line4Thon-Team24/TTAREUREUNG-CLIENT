import { apiClient } from '@/apis/client';
import type { BaseResponse } from '@/types/api';
import type { ProfileResponse, Senior, SeniorForm } from '@/types/senior';

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

// 화면용 시니어 입력값 → 프로필 요청
const toProfileRequest = (form: SeniorForm) => ({
  name: form.name,
  birthDate: form.birthDate,
  gender: form.gender === 'male' ? 'MALE' : 'FEMALE',
  phoneNumber: form.phoneNumber,
});

const fetchProfiles = async () => {
  const { data } =
    await apiClient.get<BaseResponse<ProfileResponse[]>>('/profiles');
  return data.data;
};

// 시니어 목록 조회 (최근 추가순)
export const fetchSeniors = async () => {
  const profiles = await fetchProfiles();
  // 생성 순서대로 오므로 뒤집어서 최근 추가순
  return profiles
    .filter((profile) => profile.role === 'SENIOR')
    .map(toSenior)
    .reverse();
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

// 시니어 여러 명 삭제 (삭제에 실패한 id 반환)
export const deleteSeniors = async (seniorIds: number[]) => {
  const results = await Promise.allSettled(
    seniorIds.map((id) => apiClient.delete(`/profiles/${id}`))
  );
  return seniorIds.filter((_, index) => results[index].status === 'rejected');
};

// TODO: 프로필 선택 연동 후 선택된 보호자 프로필로 교체
const fetchGuardianProfileId = async () => {
  const profiles = await fetchProfiles();
  const guardian = profiles.find((profile) => profile.role === 'GUARDIAN');
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
