import { apiClient } from '@/apis/client';
import type { BaseResponse } from '@/types/api';
import type { Guardian, GuardianSeniorResponse } from '@/types/guardian';
import type { ProfileResponse } from '@/types/senior';

// 연결 응답 → 화면용 보호자 (연결 1개 = 카드 1개)
const toGuardian = (
  { linkId, isPrimary, guardian, senior }: GuardianSeniorResponse,
  myProfileId: number | undefined
): Guardian => ({
  id: linkId,
  profileId: guardian.profileId,
  name: guardian.name,
  birthDate: guardian.birthDate ?? '',
  gender:
    guardian.gender === 'MALE'
      ? 'male'
      : guardian.gender === 'FEMALE'
        ? 'female'
        : null,
  phoneNumber: guardian.phoneNumber ?? '',
  seniorId: senior.profileId,
  seniorName: senior.name,
  isRepresentative: isPrimary,
  isMe: guardian.profileId === myProfileId,
});

// 보호자 목록 (계정 전체 연결, 다른 계정에서 초대로 들어온 보호자 포함)
// 내 계정 보호자 id도 함께 반환 (편집 화면에서 다른 계정 보호자 구분)
export const fetchGuardians = async () => {
  const [{ data }, myGuardianIds] = await Promise.all([
    apiClient.get<BaseResponse<GuardianSeniorResponse[]>>('/guardian-seniors'),
    fetchMyGuardianProfileIds(),
  ]);
  // TODO: 프로필 선택 연동 후 선택된 보호자 프로필로 교체 (지금은 계정의 첫 번째 보호자)
  const myProfileId = myGuardianIds[0];
  return {
    guardians: data.data.map((link) => toGuardian(link, myProfileId)),
    myGuardianIds,
  };
};

// 시니어의 대표 보호자 지정 (같은 시니어의 기존 대표는 서버가 해제)
export const setPrimaryGuardian = async (
  seniorId: number,
  guardianProfileId: number
) => {
  await apiClient.patch('/guardians/primary', {
    senior_profile_id: seniorId,
    guardian_id: guardianProfileId,
  });
};

// 보호자-시니어 연결 여러 개 해제 (프로필은 남음, 실패한 연결 id 반환)
export const deleteGuardianLinks = async (linkIds: number[]) => {
  const results = await Promise.allSettled(
    linkIds.map((id) => apiClient.delete(`/guardian-seniors/${id}`))
  );
  return linkIds.filter((_, index) => results[index].status === 'rejected');
};

// 공동 보호자 초대 (문자는 보내지 않고 번호별 초대 링크를 돌려줌)
export const inviteGuardians = async (
  seniorId: number,
  phoneNumbers: string[]
) => {
  const { data } = await apiClient.post<
    BaseResponse<{
      invitations: {
        phone_number: string;
        invite_url: string;
        newly_created: boolean; // false면 이전에 만든 초대 링크
      }[];
    }>
  >('/guardians/invitation', {
    senior_profile_id: seniorId,
    phone_numbers: phoneNumbers,
  });
  return data.data.invitations.map((item) => ({
    phoneNumber: item.phone_number,
    inviteUrl: item.invite_url,
  }));
};

// 내 계정의 보호자 프로필 id (다른 계정 보호자와 구분)
export const fetchMyGuardianProfileIds = async () => {
  const { data } =
    await apiClient.get<BaseResponse<ProfileResponse[]>>('/profiles');
  return data.data
    .filter((profile) => profile.role === 'GUARDIAN')
    .map((profile) => profile.profileId);
};

// 같은 계정의 보호자를 시니어에 연결 (시니어의 첫 연결이면 서버가 대표로 지정)
export const linkGuardianSenior = async (
  guardianProfileId: number,
  seniorId: number
) => {
  await apiClient.post('/guardian-seniors', {
    guardianProfileId,
    seniorProfileId: seniorId,
  });
};
