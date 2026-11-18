import type { Gender, Senior, SeniorForm } from '@/types/senior';
import { isValidBirthDate, type BirthDate } from '@/utils/birthDate';
import { isValidPhoneNumber } from '@/utils/formatPhoneNumber';

// 입력 화면에서 다루는 값 (생년월일은 년/월/일 선택창, 성별은 미선택 가능)
export type SeniorFormValue = {
  name: string;
  birthDate: BirthDate;
  gender: Gender | '';
  phoneNumber: string;
};

const EMPTY_BIRTH_DATE: BirthDate = { year: '', month: '', day: '' };

export const EMPTY_SENIOR_FORM: SeniorFormValue = {
  name: '',
  birthDate: EMPTY_BIRTH_DATE,
  gender: '',
  phoneNumber: '',
};

const pad = (value: string) => value.padStart(2, '0');

// 저장된 시니어 → 입력값
export const toSeniorFormValue = (senior: Senior): SeniorFormValue => {
  const [year, month, day] = senior.birthDate.split('-');
  return {
    name: senior.name,
    // 생년월일이 없으면 빈 선택값
    birthDate: senior.birthDate
      ? { year, month: String(Number(month)), day: String(Number(day)) }
      : EMPTY_BIRTH_DATE,
    gender: senior.gender,
    phoneNumber: senior.phoneNumber,
  };
};

export const isSeniorFormValid = (value: SeniorFormValue) =>
  value.name.trim() !== '' &&
  isValidBirthDate(value.birthDate) &&
  value.gender !== '' &&
  isValidPhoneNumber(value.phoneNumber);

// 입력값 → 저장할 값 (유효한 값만 넘김)
export const toSeniorForm = (value: SeniorFormValue): SeniorForm => {
  const { year, month, day } = value.birthDate;
  return {
    name: value.name.trim(),
    birthDate: `${year}-${pad(month)}-${pad(day)}`,
    gender: value.gender as Gender,
    phoneNumber: value.phoneNumber,
  };
};

// 처음 값과 달라졌는지 비교
export const isSeniorFormChanged = (
  before: SeniorFormValue,
  after: SeniorFormValue
) => JSON.stringify(before) !== JSON.stringify(after);
