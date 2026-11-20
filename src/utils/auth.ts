import {
  LOGIN_ERROR_MESSAGE,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '@/constants/auth';
import type { LoginErrors, LoginForm, PasswordRules } from '@/types/auth';

// 이메일 형식 검사
export const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value) && !value.includes('..');

export const isValidPassword = (value: string) =>
  value.length >= PASSWORD_MIN_LENGTH;

// 로그인 입력값 검증 → 항목별 에러 문구 반환
export const validateLogin = ({ email, password }: LoginForm): LoginErrors => {
  const errors: LoginErrors = {};
  if (!isValidEmail(email.trim())) errors.email = LOGIN_ERROR_MESSAGE.email;
  if (!isValidPassword(password))
    errors.password = LOGIN_ERROR_MESSAGE.password;
  return errors;
};

// 회원가입 비밀번호 규칙
export const getPasswordRules = (value: string): PasswordRules => ({
  length:
    value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH,
  charset:
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9\s]/.test(value),
});

export const isValidSignupPassword = (value: string) => {
  const rules = getPasswordRules(value);
  // 서버는 공백 없는 ASCII 문자만 허용
  return rules.length && rules.charset && /^[\x21-\x7E]+$/.test(value);
};
