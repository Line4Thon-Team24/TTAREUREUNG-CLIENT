import { useCallback, useEffect, useRef } from 'react';

// 비동기 작업 결과가 아직 유효한지 확인하는 훅
// - 화면을 떠났거나(언마운트) 더 최신 요청이 시작되었으면 이전 결과는 무시
// 사용법: const isLatest = startRequest(); await 작업; if (!isLatest()) return;
export default function useLatestRequest() {
  const requestIdRef = useRef(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(() => {
    const requestId = ++requestIdRef.current;
    return () => mountedRef.current && requestId === requestIdRef.current;
  }, []);
}
