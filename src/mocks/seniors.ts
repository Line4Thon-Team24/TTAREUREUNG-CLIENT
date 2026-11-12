import type { Senior, SeniorForm } from '@/types/senior';

// API 연동 전 임시 저장소 (메모리에만 저장되어 새로고침 시 초기화)
const seniors: Senior[] = [];

export const getSeniors = () => [...seniors];

export const addSenior = (form: SeniorForm) => {
  const senior: Senior = { id: Date.now(), ...form };
  seniors.push(senior);
  return senior;
};
