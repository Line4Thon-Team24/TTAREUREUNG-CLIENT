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
  }, [seniorId]);

  const medicines = loaded?.seniorId === seniorId ? loaded.medicines : null;
  const isError = medicines === null && errorSeniorId === seniorId;
  return { medicines, isError };
}
