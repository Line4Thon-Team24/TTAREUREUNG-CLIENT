import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Senior } from '@/types/senior';

// 브라우저 저장소는 막혀 있을 수 있어 실패해도 무시
const readStored = (key: string) => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStored = (key: string, value: string) => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // 저장 못 해도 주소 값으로 동작
  }
};

// 주소의 seniorId만 바꾸고 다른 값(?date= 등)은 유지
const withSeniorId = (id: number) => (prev: URLSearchParams) => {
  prev.set('seniorId', String(id));
  return prev;
};

// 선택한 시니어를 주소(?seniorId=)에 저장
// → 다른 화면에 갔다가 뒤로 돌아와도 선택이 유지됨
// storageKey: 같은 키를 쓰는 화면끼리 마지막 선택을 공유 (하위 화면에서 바꾸고 뒤로 와도 유지)
export default function useSelectedSeniorParam(
  seniors: Senior[],
  storageKey?: string
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramId = Number(searchParams.get('seniorId'));

  // 주소의 시니어가 없으면 첫 번째 시니어 선택
  const selectedId = seniors.some(({ id }) => id === paramId)
    ? paramId
    : (seniors[0]?.id ?? null);

  // 마지막으로 고른 시니어와 다르면 맞춤
  useEffect(() => {
    if (!storageKey) return;
    const storedId = Number(readStored(storageKey));
    if (storedId === selectedId) return;
    if (!seniors.some(({ id }) => id === storedId)) return;
    setSearchParams(withSeniorId(storedId), { replace: true });
  }, [storageKey, selectedId, seniors, setSearchParams]);

  const selectSenior = (id: number) => {
    if (storageKey) writeStored(storageKey, String(id));
    setSearchParams(withSeniorId(id), { replace: true });
  };

  return [selectedId, selectSenior] as const;
}
