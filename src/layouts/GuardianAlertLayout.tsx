import { Outlet } from 'react-router-dom';
import GuardianAlertBanner from '@/components/alert/GuardianAlertBanner';

// 보호자 화면 전체에 복용 알림 배너 표시 (화면을 옮겨도 알림 조회는 이어짐)
export default function GuardianAlertLayout() {
  return (
    <>
      <GuardianAlertBanner />
      <Outlet />
    </>
  );
}
