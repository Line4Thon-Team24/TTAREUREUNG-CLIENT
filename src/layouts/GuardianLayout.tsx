import { Outlet } from 'react-router-dom';
import BottomNavigation, {
  BOTTOM_NAVIGATION_HEIGHT,
} from '@/components/common/BottomNavigation';

// 보호자 탭 화면 공통 레이아웃 (하단 네비게이션 포함)
export default function GuardianLayout() {
  return (
    <>
      {/* 탭바 높이만큼 아래 여백을 두고, 페이지는 flex-1로 남은 높이를 채움 */}
      <main
        className="flex min-h-dvh flex-col"
        style={{ paddingBottom: BOTTOM_NAVIGATION_HEIGHT }}
      >
        <Outlet />
      </main>
      <BottomNavigation />
    </>
  );
}
