// 프로필 선택 화면에서 선택한 보호자 프로필 id
// 새로고침해도 유지되도록 sessionStorage에 보관
const KEY = 'selectedGuardianProfileId';

export const getSelectedProfileId = (): number | null => {
  try {
    const stored = sessionStorage.getItem(KEY);
    return stored === null ? null : Number(stored);
  } catch {
    return null;
  }
};

export const setSelectedProfileId = (profileId: number) => {
  try {
    sessionStorage.setItem(KEY, String(profileId));
  } catch {
    // 저장 못 하면 첫 번째 보호자로 동작
  }
};

export const clearSelectedProfileId = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // 저장소를 쓸 수 없으면 삭제할 값 없음
  }
};
