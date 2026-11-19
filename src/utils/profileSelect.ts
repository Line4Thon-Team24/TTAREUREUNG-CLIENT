import type { CareSenior, FamilyMember } from '@/types/profileSelect';
import type { ProfileResponse } from '@/types/senior';

// 'YYYY-MM-DD' → 만 나이
export const getAge = (birthDate: string, today = new Date()) => {
  const [year, month, day] = birthDate.split('-').map(Number);
  const hadBirthday =
    today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);
  return today.getFullYear() - year - (hadBirthday ? 0 : 1);
};

// 성을 뺀 이름 (예: '홍길동' → '길동'), 두 글자 이하는 그대로
export const getShortName = (name: string) =>
  name.length >= 3 ? name.slice(1) : name;

// 시니어 프로필 → 돌봄 대상 시니어 (최근 추가순)
export const toCareSeniors = (profiles: ProfileResponse[]): CareSenior[] =>
  profiles
    .filter(({ role }) => role === 'SENIOR')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ profileId, name, birthDate, relationship }) => ({
      id: profileId,
      name,
      age: birthDate ? getAge(birthDate) : null,
      relation: relationship ?? '',
    }));

// 보호자 프로필 → 가족 및 공동 보호자
// TODO: 프로필 선택 연동 후 선택된 보호자 프로필로 교체
export const toFamilyMembers = (
  profiles: ProfileResponse[]
): FamilyMember[] => {
  const guardians = profiles.filter(({ role }) => role === 'GUARDIAN');
  return guardians.map(({ profileId, name, relationship }, index) => ({
    id: profileId,
    name,
    relation: relationship ?? '',
    isMe: index === 0,
  }));
};
