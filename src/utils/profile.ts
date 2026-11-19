import type { Guardian } from '@/types/guardian';
import type { ProfileResponse, Senior } from '@/types/senior';
import type { CoGuardianSummary } from '@/types/profile';

// 담당 시니어 이름 (예: '김순자 시니어 담당')
export const getCareLabel = (profile: ProfileResponse | undefined) => {
  const senior = profile?.linkedProfiles[0];
  return senior ? `${senior.name} 시니어 담당` : '담당 시니어 없음';
};

// 공동 보호자 + 담당 시니어 이름
export const getCoGuardianSummaries = (
  guardians: Guardian[],
  seniors: Senior[]
): CoGuardianSummary[] =>
  guardians
    .filter((guardian) => !guardian.isMe)
    .map(({ id, name, seniorId, phoneNumber }) => ({
      id,
      name,
      phoneNumber,
      seniorName: seniors.find((senior) => senior.id === seniorId)?.name ?? '-',
    }));
