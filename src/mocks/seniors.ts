import type { Senior, SeniorForm } from '@/types/senior';

// 샘플 시니어
const sampleSeniors: Senior[] = [
  {
    id: 1,
    name: '김순자',
    birthDate: '1948-03-15',
    gender: 'female',
    phoneNumber: '010-1234-5678',
  },
  {
    id: 2,
    name: '박종옥',
    birthDate: '1951-07-22',
    gender: 'female',
    phoneNumber: '010-2345-6789',
  },
  {
    id: 3,
    name: '박태규',
    birthDate: '1946-11-02',
    gender: 'male',
    phoneNumber: '010-3456-7890',
  },
];

// API 연동 전 임시 저장소 (메모리에만 저장되어 새로고침 시 초기화)
const seniors: Senior[] = [...sampleSeniors];

export const getSeniors = () => [...seniors];

export const addSenior = (form: SeniorForm) => {
  const senior: Senior = { id: Date.now(), ...form };
  seniors.push(senior);
  return senior;
};
