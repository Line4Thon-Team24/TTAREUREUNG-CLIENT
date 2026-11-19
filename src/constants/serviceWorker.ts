// 서비스 워커가 앱에 보내는 메시지 종류 (public/sw.js와 같은 값)
export const SW_MESSAGE = {
  pushReceived: 'PUSH_RECEIVED', // 앱을 보고 있을 때 보호자 알림 푸시 도착
  navigate: 'NAVIGATE', // 알림을 눌러 화면 이동
} as const;
