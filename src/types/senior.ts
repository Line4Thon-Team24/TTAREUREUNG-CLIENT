export type Gender = 'female' | 'male';

export type Senior = {
  id: number;
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
  phoneNumber: string;
  registeredAt: string | null; // 등록 일시 (ISO 문자열, API 미제공 시 null)
  isFavorite: boolean;
};

// 프로필 API 응답
export type ProfileResponse = {
  profileId: number;
  name: string;
  birthDate: string | null;
  gender: 'MALE' | 'FEMALE' | null;
  phoneNumber: string | null;
  relationship: string | null;
  role: 'GUARDIAN' | 'SENIOR';
  linkedProfiles: {
    profileId: number;
    name: string;
    relationship: string | null;
  }[];
};

// 입력 화면에서 다루는 값 (등록 시 시스템이 정하는 값 제외)
export type SeniorForm = Omit<Senior, 'id' | 'registeredAt' | 'isFavorite'>;
