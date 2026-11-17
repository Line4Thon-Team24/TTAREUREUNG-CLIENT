import { GUARDIAN_RELATIONS, SENIOR_RELATIONS } from '@/mocks/profileSelect';
import type { Guardian } from '@/types/guardian';
import type { CareSenior, FamilyMember } from '@/types/profileSelect';
import type { Senior } from '@/types/senior';

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

export const toCareSeniors = (seniors: Senior[]): CareSenior[] =>
  seniors.map(({ id, name, birthDate }) => ({
    id,
    name,
    age: getAge(birthDate),
    relation: SENIOR_RELATIONS[id] ?? '',
  }));

export const toFamilyMembers = (guardians: Guardian[]): FamilyMember[] =>
  guardians.map(({ id, name, isMe }) => ({
    id,
    name,
    relation: GUARDIAN_RELATIONS[id] ?? '',
    isMe,
  }));
