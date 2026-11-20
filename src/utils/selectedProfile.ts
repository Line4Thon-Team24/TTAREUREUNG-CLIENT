// 프로필 선택 화면에서 선택한 보호자·시니어 프로필 id
// 새로고침해도 유지되도록 sessionStorage에 보관
const KEY = 'selectedGuardianProfileId';
const SENIOR_KEY = 'selectedSeniorProfileId';

const readId = (key: string): number | null => {
  try {
    const stored = sessionStorage.getItem(key);
    return stored === null ? null : Number(stored);
  } catch {
    return null;
  }
};

const writeId = (key: string, profileId: number) => {
  try {
    sessionStorage.setItem(key, String(profileId));
  } catch {
    // 저장 못 하면 첫 번째 프로필로 동작
  }
};

export const getSelectedProfileId = () => readId(KEY);

export const setSelectedProfileId = (profileId: number) =>
  writeId(KEY, profileId);

export const getSelectedSeniorId = () => readId(SENIOR_KEY);

export const setSelectedSeniorId = (profileId: number) =>
  writeId(SENIOR_KEY, profileId);

// 로그아웃 등에서 보호자·시니어 선택을 함께 지움
export const clearSelectedProfileId = () => {
  try {
    sessionStorage.removeItem(KEY);
    sessionStorage.removeItem(SENIOR_KEY);
  } catch {
    // 저장소를 쓸 수 없으면 삭제할 값 없음
  }
};
