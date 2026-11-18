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
