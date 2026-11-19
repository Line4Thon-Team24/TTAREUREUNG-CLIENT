// 웹 푸시 수신용 서비스 워커 (캐시는 쓰지 않음)

// 새 버전이 설치되면 기다리지 않고 바로 교체
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
