import { useEffect, useState } from 'react';
import { fetchSelectedGuardianProfileId } from '@/apis/guardian';
import { isPushSupported, registerPush } from '@/utils/push';

// 이 기기를 등록한 보호자 프로필 (같은 프로필이면 다시 등록하지 않음)
let registeredProfileId: number | null = null;
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
    if (permission !== 'granted') return;
    // 고른 보호자로 등록 (다른 계정·프로필로 바꾸면 기기가 그 프로필로 옮겨짐)
    fetchSelectedGuardianProfileId()
      .then(async (profileId) => {
        if (profileId === undefined || profileId === registeredProfileId) {
          return;
        }
        // 등록 중 실패해도 서버는 이미 옮겼을 수 있어 이전 값은 먼저 지움
        registeredProfileId = null;
        if (await registerPush(profileId)) registeredProfileId = profileId;
      })
      .catch(() => {
        // 실패하면 다음에 화면을 열 때 다시 등록
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
