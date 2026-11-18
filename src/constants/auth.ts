export const LOGIN_ERROR_MESSAGE = {
  email: '올바르지 않은 이메일입니다.',
  password: '올바르지 않은 비밀번호입니다.',
} as const;

export const SIGNUP_MESSAGE = {
  email: '올바른 이메일 형식이 아닙니다.',
  passwordMatch: '입력한 비밀번호와 일치합니다.',
  passwordMismatch: '입력한 비밀번호와 일치하지 않습니다.',
  emailDuplicate: '이미 가입된 이메일입니다.',
  failed: '회원가입에 실패했어요. 잠시 후 다시 시도해주세요.',
} as const;

// 서버 에러 코드
export const AUTH_ERROR_CODE = {
  emailDuplicate: 'AUTH_002',
} as const;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 20;

// 비밀번호 규칙 안내 문구
export const PASSWORD_RULE_LABEL = {
  length: `${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH}자 이내`,
  charset: '영문 대소문자, 숫자, 특수문자 포함',
} as const;

// 성별 옵션
export const GENDER_OPTIONS = [
  { label: '남성', value: 'male' },
  { label: '여성', value: 'female' },
];
