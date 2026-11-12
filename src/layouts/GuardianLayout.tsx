import { Outlet } from 'react-router-dom';
import BottomNavigation, {
  BOTTOM_NAVIGATION_HEIGHT,
} from '@/components/BottomNavigation';

// 보호자 탭 화면 공통 레이아웃 (하단 네비게이션 포함)
export default function GuardianLayout() {
  return (
    <>
      <main style={{ paddingBottom: BOTTOM_NAVIGATION_HEIGHT }}>
        <Outlet />
      </main>
      <BottomNavigation />
    </>
  );
}
