import type { Gender } from '@/types/senior';
import type { BirthDate } from '@/utils/birthDate';

export type LoginForm = {
  email: string;
  password: string;
};

export type LoginErrors = {
  email?: string;
  password?: string;
};

// 회원가입 1~2단계 (계정 정보)
export type SignupAccount = {
  email: string;
  password: string;
};

// 회원가입 3단계 (보호자 정보)
export type GuardianInfo = {
  name: string;
  birthDate: BirthDate;
  gender: Gender | '';
  phoneNumber: string;
};

export type PasswordRules = {
  length: boolean;
  charset: boolean;
};

// 회원가입 단계별 입력값
export type SignupContextValue = {
  account: SignupAccount;
  setAccount: (account: SignupAccount) => void;
  guardian: GuardianInfo;
  setGuardian: (guardian: GuardianInfo) => void;
};
