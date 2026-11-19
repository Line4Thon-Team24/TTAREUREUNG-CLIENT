import { useEffect, useState } from 'react';
import { fetchMyGuardianProfileIds } from '@/apis/guardian';
import { isPushSupported, registerPush } from '@/utils/push';

// 앱을 열 때 한 번만 등록 (탭 화면을 오갈 때마다 요청하지 않도록)
let hasRegistered = false;
// 안내 띠를 닫았는지 (앱을 다시 열 때까지 유지)
let hasDismissed = false;

// 알림 권한 상태와 기기 등록 (지원하지 않는 브라우저는 거부와 같게 취급)
export default function usePushPermission() {
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    isPushSupported() ? Notification.permission : 'denied'
  );
  const [isDismissed, setIsDismissed] = useState(() => hasDismissed);

  // 권한이 있으면 기기 등록을 맞춰 둠 (구독 만료·서버 키 설정 대비, 같은 기기는 갱신)
  useEffect(() => {
    if (permission !== 'granted' || hasRegistered) return;
    hasRegistered = true;
    // TODO: 프로필 선택 연동 후 선택된 보호자 프로필로 교체
    fetchMyGuardianProfileIds()
      .then(([profileId]) => {
        if (profileId !== undefined) return registerPush(profileId);
      })
      .catch(() => {
        // 실패하면 다음에 화면을 열 때 다시 등록
        hasRegistered = false;
      });
  }, [permission]);

  // 권한 요청은 버튼을 누른 바로 그 순간에 해야 브라우저가 창을 띄움
  const requestPermission = async () => {
    setPermission(await Notification.requestPermission());
  };

  return {
    isBarVisible: permission === 'default' && !isDismissed,
    requestPermission,
    dismiss: () => {
      hasDismissed = true;
      setIsDismissed(true);
    },
  };
}
