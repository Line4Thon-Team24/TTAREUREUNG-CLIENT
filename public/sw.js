// 웹 푸시 수신용 서비스 워커 (캐시는 쓰지 않음)

// 앱에 보내는 메시지 (src/constants/serviceWorker.ts와 같은 값)
const PUSH_RECEIVED = 'PUSH_RECEIVED';
const NAVIGATE = 'NAVIGATE';

// 새 버전이 설치되면 기다리지 않고 바로 교체
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 푸시 내용 읽기 (JSON이 아니면 본문만 있는 알림으로)
const readPayload = (data) => {
  if (!data) return { title: '따르릉', body: '' };
  try {
    return data.json();
  } catch {
    return { title: '따르릉', body: data.text() };
  }
};

// 같은 알림은 하나만 보이도록 묶는 값
const toTag = (payload) => {
  if (payload.type === 'GUARDIAN_ALERT') return `alert-${payload.alertId}`;
  if (payload.sessionId) return `${payload.type}-${payload.sessionId}`;
  return undefined;
};

// 알림을 눌렀을 때 열 화면
const toUrl = (payload) => {
  if (payload.type === 'DOSE_CALL') {
    return `/senior/call?sessionId=${payload.sessionId}`;
  }
  return '/schedule';
};

// 알림 배너가 있는 보호자 화면인지 (src/routes의 GuardianAlertLayout 아래 주소)
const GUARDIAN_PATHS = ['/schedule', '/medicines', '/seniors', '/guardians'];
const isGuardianPage = (url) => {
  const { pathname } = new URL(url);
  return (
    pathname === '/profile' ||
    GUARDIAN_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    )
  );
};

self.addEventListener('push', (event) => {
  const payload = readPayload(event.data);
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      // 배너를 띄울 수 있는 화면만 (로그인·시니어 화면은 휴대폰 알림으로)
      const visible = windows.filter(
        (w) => w.visibilityState === 'visible' && isGuardianPage(w.url)
      );
      // 보호자 알림은 보호자 화면을 보고 있으면 휴대폰 알림 대신 앱 안 배너로
      // (시니어 전화는 놓치면 안 되므로 항상 알림)
      if (visible.length > 0 && payload.type !== 'DOSE_CALL') {
        visible.forEach((w) => w.postMessage({ type: PUSH_RECEIVED, payload }));
        return;
      }
      await self.registration.showNotification(payload.title || '따르릉', {
        body: payload.body,
        icon: '/app-icon.png',
        tag: toTag(payload),
        // 재전화는 같은 회차라 알림이 교체되므로, 소리·진동이 다시 나도록
        renotify: payload.type === 'DOSE_CALL',
        data: payload,
      });
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = toUrl(event.notification.data ?? {});
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      // 열려 있는 앱은 새로고침 없이 앱 안에서 이동 (새로고침하면 로그인이 풀림)
      const [client] = windows;
      if (client) {
        await client.focus();
        client.postMessage({ type: NAVIGATE, url });
        return;
      }
      await self.clients.openWindow(url);
    })()
  );
});
