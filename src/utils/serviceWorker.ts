import { SW_MESSAGE } from '@/constants/serviceWorker';
import { router } from '@/routes';

// 푸시를 받을 서비스 워커 등록 (지원하지 않는 브라우저는 건너뜀)
export const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js').catch(() => {
    // 등록에 실패해도 앱 사용에는 영향 없음 (푸시만 못 받음)
  });
  // 알림을 누르면 새로고침 없이 해당 화면으로 이동
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === SW_MESSAGE.navigate) {
      router.navigate(event.data.url);
    }
  });
};
