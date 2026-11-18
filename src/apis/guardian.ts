import { apiClient } from '@/apis/client';
import type { BaseResponse } from '@/types/api';
import type { Guardian, GuardianSeniorResponse } from '@/types/guardian';

// 연결 응답 → 화면용 보호자 (연결 1개 = 카드 1개)
const toGuardian = ({
  linkId,
  isPrimary,
  guardian,
  senior,
}: GuardianSeniorResponse): Guardian => ({
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
  isRepresentative: isPrimary,
  isMe: false,
});

// 보호자 목록 (계정 전체 연결, 다른 계정에서 초대로 들어온 보호자 포함)
export const fetchGuardians = async () => {
  const { data } =
    await apiClient.get<BaseResponse<GuardianSeniorResponse[]>>(
      '/guardian-seniors'
    );
  return data.data.map(toGuardian);
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

// 담당 시니어 변경 (연결 id는 유지, 대표 승계는 서버가 처리)
export const changeGuardianSenior = async (
  linkId: number,
  seniorId: number
) => {
  await apiClient.patch(`/guardian-seniors/${linkId}`, {
    seniorProfileId: seniorId,
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
