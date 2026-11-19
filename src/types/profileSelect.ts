// 프로필 선택 화면의 돌봄 대상 시니어
export type CareSenior = {
  id: number;
  name: string;
  age: number | null; // 만 나이 (생년월일 미입력 시 null)
  relation: string; // 보호자 기준 관계 (예: '어머니')
};

// 프로필 선택 화면의 가족 및 공동 보호자
export type FamilyMember = {
  id: number;
  name: string;
  relation: string; // 예: '첫째 아들'
  isMe: boolean;
};

// 가족 및 공동 보호자 프로필
export type AvatarTone = { bg: string; border: string; text: string };
