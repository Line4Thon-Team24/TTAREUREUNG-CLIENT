import { useSearchParams } from 'react-router-dom';
import type { Senior } from '@/types/senior';

// 선택한 시니어를 주소(?seniorId=)에 저장
// → 다른 화면에 갔다가 뒤로 돌아와도 선택이 유지됨
export default function useSelectedSeniorParam(seniors: Senior[]) {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramId = Number(searchParams.get('seniorId'));

  // 주소의 시니어가 없으면 첫 번째 시니어 선택
  const selectedId = seniors.some(({ id }) => id === paramId)
    ? paramId
    : (seniors[0]?.id ?? null);

  const selectSenior = (id: number) => {
    setSearchParams({ seniorId: String(id) }, { replace: true });
  };

  return [selectedId, selectSenior] as const;
}
