import type { Gender } from '@/types/senior';

export type Guardian = {
  id: number;
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
  phoneNumber: string;
  seniorId: number; // 담당 시니어
  isRepresentative: boolean; // 담당 시니어의 대표 보호자 (시니어당 1명)
  isMe: boolean; // 로그인한 본인 (로그인 연동 전 목업)
};
