import type { Guardian } from '@/types/guardian';

// 샘플 보호자 (등록순, 첫 번째가 본인)
const sampleGuardians: Guardian[] = [
  {
    id: 1,
    name: '나',
    birthDate: '2000-01-10',
    gender: 'female',
    phoneNumber: '010-1234-5678',
    seniorId: 1,
    isRepresentative: true,
    isMe: true,
  },
  {
    id: 2,
    name: '박민수',
    birthDate: '1998-01-10',
    gender: 'male',
    phoneNumber: '010-2222-3333',
    seniorId: 2,
    isRepresentative: true,
    isMe: false,
  },
  {
    id: 3,
    name: '이지훈',
    birthDate: '1995-05-21',
    gender: 'male',
    phoneNumber: '010-4444-5555',
    seniorId: 2,
    isRepresentative: false,
    isMe: false,
  },
  {
    id: 4,
    name: '최유진',
    birthDate: '1992-09-03',
    gender: 'female',
    phoneNumber: '010-6666-7777',
    seniorId: 1,
    isRepresentative: false,
    isMe: false,
  },
];

// API 연동 전 임시 저장소 (메모리에만 저장되어 새로고침 시 초기화)
const guardians: Guardian[] = [...sampleGuardians];

// 가입 완료 전 초대한 전화번호 (목록에는 안 보임)
const invitedPhoneNumbers: string[] = [];

export const getGuardians = () =>
  guardians.map((guardian) => ({ ...guardian }));

// 담당 시니어의 대표로 지정 (같은 시니어의 기존 대표는 해제)
export const setRepresentative = (id: number) => {
  const target = guardians.find((guardian) => guardian.id === id);
  if (!target) return;
  for (const guardian of guardians) {
    if (guardian.seniorId === target.seniorId) {
      guardian.isRepresentative = guardian.id === id;
    }
  }
};

// 담당 시니어 변경 (대표는 해제)
export const changeGuardianSenior = (id: number, seniorId: number) => {
  const target = guardians.find((guardian) => guardian.id === id);
  if (!target || target.seniorId === seniorId) return;
  target.seniorId = seniorId;
  target.isRepresentative = false;
};

export const deleteGuardians = (ids: number[]) => {
  for (const id of ids) {
    const index = guardians.findIndex((guardian) => guardian.id === id);
    if (index !== -1) guardians.splice(index, 1);
  }
};

export const inviteGuardians = (phoneNumbers: string[]) => {
  invitedPhoneNumbers.push(...phoneNumbers);
};
