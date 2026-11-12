// 숫자만 남겨 010-1234-5678 형태로 변환 (최대 11자리)
export const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

export const isValidPhoneNumber = (value: string) =>
  /^01\d-\d{4}-\d{4}$/.test(value);
