import {
  fetchVapidKey,
  registerPushDevice,
  unregisterPushDevice,
} from '@/apis/push';

// 이 브라우저에서 웹 푸시를 받을 수 있는지 (아이폰은 홈 화면에 추가한 앱만)
export const isPushSupported = () =>
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

// 공개키(base64url) → 브라우저 구독에 넣는 바이트 배열
const toKeyBytes = (base64Url: string) => {
  const base64 = (base64Url + '='.repeat((4 - (base64Url.length % 4)) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
};

// 알림 권한이 있으면 이 기기를 푸시 수신 기기로 등록 (등록했으면 true, 서버에 키가 없으면 false)
export const registerPush = async (profileId: number) => {
  if (!isPushSupported() || Notification.permission !== 'granted') return false;
  const { enabled, publicKey } = await fetchVapidKey();
  if (!enabled || !publicKey) return false;

  const registration = await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: toKeyBytes(publicKey),
    }));
  await registerPushDevice(profileId, subscription.toJSON());
  return true;
};

// 이 기기의 푸시 수신 해제 (로그아웃·알림 끄기 화면에서 호출)
export const unregisterPush = async () => {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;
  // 서버 해제가 실패해도 기기 구독은 끊어 더는 받지 않음
  await unregisterPushDevice(subscription.endpoint).catch(() => {});
  await subscription.unsubscribe();
};
