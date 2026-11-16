export type Gender = 'female' | 'male';

export type Senior = {
  id: number;
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
  phoneNumber: string;
  registeredAt: string; // 등록 일시 (ISO 문자열)
  isFavorite: boolean;
};

// 입력 화면에서 다루는 값 (등록 시 시스템이 정하는 값 제외)
export type SeniorForm = Omit<Senior, 'id' | 'registeredAt' | 'isFavorite'>;
