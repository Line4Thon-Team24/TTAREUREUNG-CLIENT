import type { Guardian, GuardianGroup } from '@/types/guardian';

// 같은 보호자의 연결을 카드 1장으로 묶음 (연결 순서 유지)
export const groupByGuardian = (links: Guardian[]) => {
  const groups = new Map<number, GuardianGroup>();
  for (const link of links) {
    const assignment = {
      linkId: link.id,
      seniorId: link.seniorId,
      seniorName: link.seniorName,
      isRepresentative: link.isRepresentative,
    };
    const group = groups.get(link.profileId);
    if (group) group.assignments.push(assignment);
    else groups.set(link.profileId, { ...link, assignments: [assignment] });
  }
  return [...groups.values()];
};
