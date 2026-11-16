import { useSearchParams } from 'react-router-dom';
import { isDateString, parseDateString, toDateString } from '@/utils/date';

// 선택한 날짜를 주소(?date=YYYY-MM-DD)에 저장 (없으면 오늘)
export default function useDateParam() {
  const [searchParams, setSearchParams] = useSearchParams();
  const param = searchParams.get('date') ?? '';
  const date = isDateString(param) ? parseDateString(param) : new Date();

  const setDate = (next: Date) => {
    // 다른 값(?seniorId= 등)은 유지
    setSearchParams(
      (prev) => {
        prev.set('date', toDateString(next));
        return prev;
      },
      { replace: true }
    );
  };

  return [date, setDate] as const;
}
