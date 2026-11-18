import type { Gender } from '@/types/senior';

export type Guardian = {
  id: number; // 보호자-시니어 연결 id (API의 linkId)
  profileId: number; // 보호자 프로필 id (대표 지정에 사용)
  name: string;
  birthDate: string; // YYYY-MM-DD (미입력이면 빈 값)
  gender: Gender | null; // 미입력이면 null
  phoneNumber: string;
  seniorId: number; // 담당 시니어
  seniorName: string; // 담당 시니어 이름 (다른 계정 시니어도 표시하려고 응답 값 사용)
  isRepresentative: boolean; // 담당 시니어의 대표 보호자 (시니어당 1명)
  isMe: boolean; // 로그인한 본인 (보호자 탭에서는 쓰지 않음)
};

// 담당 시니어 1명 = 보호자-시니어 연결 1개 (대표 여부는 시니어마다 따로)
export type GuardianAssignment = {
  linkId: number;
  seniorId: number;
  seniorName: string;
  isRepresentative: boolean;
};

// 보호자 1명과 담당 시니어 전체 (카드 1장)
export type GuardianGroup = Guardian & { assignments: GuardianAssignment[] };

// 보호자-시니어 연결 API 응답
type ProfileSummaryResponse = {
  profileId: number;
  name: string;
  relationship: string | null;
  birthDate: string | null;
  gender: 'MALE' | 'FEMALE' | null;
  phoneNumber: string | null;
};

export type GuardianSeniorResponse = {
  linkId: number;
  isPrimary: boolean;
  guardian: ProfileSummaryResponse;
  senior: ProfileSummaryResponse;
};
