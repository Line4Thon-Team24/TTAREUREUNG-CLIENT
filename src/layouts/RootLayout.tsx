import { Outlet } from 'react-router-dom';

// 모든 화면을 피그마 기준 폭(402px)의 모바일 컨테이너 안에 렌더링
export default function RootLayout() {
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[402px] bg-white">
      <Outlet />
    </div>
  );
}
