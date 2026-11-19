import { useEffect, useState } from 'react';
import { fetchMyGuardianProfileIds } from '@/apis/guardian';
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
    // 다른 계정으로 다시 로그인하면 프로필이 달라 새로 등록 (기기가 그 계정으로 옮겨짐)
    // TODO: 프로필 선택 연동 후 선택된 보호자 프로필로 교체
    fetchMyGuardianProfileIds()
      .then(async ([profileId]) => {
        if (profileId === undefined || profileId === registeredProfileId) {
          return;
        }
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
