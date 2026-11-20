import { useEffect, useState } from 'react';
import { fetchMedicines } from '@/apis/medicine';
import type { Medicine } from '@/types/medicine';

// 선택한 시니어의 약 목록 (medicines가 null이면 불러오는 중)
// 시니어를 바꾸면 이전 시니어의 목록은 보이지 않음
export default function useSeniorMedicines(seniorId: number | null) {
  const [loaded, setLoaded] = useState<{
    seniorId: number;
    medicines: Medicine[];
  } | null>(null);
  const [errorSeniorId, setErrorSeniorId] = useState<number | null>(null);
  // 다시 시도하면 값이 바뀌어 다시 불러옴
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (seniorId === null) return;
    let ignore = false;
    fetchMedicines(seniorId)
      .then((data) => {
        if (!ignore) setLoaded({ seniorId, medicines: data });
      })
      .catch(() => {
        if (!ignore) setErrorSeniorId(seniorId);
      });
    return () => {
      ignore = true;
    };
  }, [seniorId, attempt]);

  const medicines = loaded?.seniorId === seniorId ? loaded.medicines : null;
  // 시니어가 없으면 오류가 아님
  const isError =
    seniorId !== null && medicines === null && errorSeniorId === seniorId;
  const retry = () => {
    setErrorSeniorId(null);
    setAttempt((prev) => prev + 1);
  };
  return { medicines, isError, retry };
}
