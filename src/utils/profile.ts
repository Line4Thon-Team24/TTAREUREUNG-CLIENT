import type { Guardian } from '@/types/guardian';
import type { ProfileResponse } from '@/types/senior';
import type { CoGuardianSummary } from '@/types/profile';
import {
  getSelectedProfileId,
  getSelectedSeniorId,
} from '@/utils/selectedProfile';

// 선택된 보호자 프로필 id (저장된 선택이 없거나 목록에 없으면 첫 번째 보호자)
export const pickSelectedGuardianId = (guardianIds: number[]) => {
  const selectedId = getSelectedProfileId();
  return selectedId !== null && guardianIds.includes(selectedId)
    ? selectedId
    : guardianIds[0];
};

// 선택된 시니어 프로필 id (저장된 선택이 없거나 목록에 없으면 첫 번째 시니어)
export const pickSelectedSeniorId = (seniorIds: number[]) => {
  const selectedId = getSelectedSeniorId();
  return selectedId !== null && seniorIds.includes(selectedId)
    ? selectedId
    : seniorIds[0];
};

// 선택된 보호자 프로필
export const getSelectedGuardian = (profiles: ProfileResponse[]) => {
  const guardians = profiles.filter(({ role }) => role === 'GUARDIAN');
  const selectedId = pickSelectedGuardianId(
    guardians.map(({ profileId }) => profileId)
  );
  return guardians.find(({ profileId }) => profileId === selectedId);
};

// 담당 시니어 이름 (예: '김순자 시니어 담당')
export const getCareLabel = (profile: ProfileResponse | undefined) => {
  const senior = profile?.linkedProfiles[0];
  return senior ? `${senior.name} 시니어 담당` : '담당 시니어 없음';
};

// 공동 보호자 + 담당 시니어 이름
export const getCoGuardianSummaries = (
  guardians: Guardian[]
): CoGuardianSummary[] =>
  guardians
    .filter((guardian) => !guardian.isMe)
    .map(({ id, name, seniorName, phoneNumber }) => ({
      id,
      name,
      phoneNumber,
      seniorName,
    }));
