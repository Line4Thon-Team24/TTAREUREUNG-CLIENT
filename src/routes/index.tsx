import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import GuardianLayout from '@/layouts/GuardianLayout';
import SchedulePage from '@/pages/guardian/SchedulePage';
import MedicineListPage from '@/pages/guardian/MedicineListPage';
import SeniorListPage from '@/pages/guardian/SeniorListPage';
import GuardianListPage from '@/pages/guardian/GuardianListPage';
import ProfilePage from '@/pages/guardian/ProfilePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        // 기본 경로는 복용 일정 화면으로 이동
        element: <Navigate to="/schedule" replace />,
      },
      {
        // 보호자 탭 화면 (하단 네비게이션 노출)
        element: <GuardianLayout />,
        children: [
          { path: '/schedule', element: <SchedulePage /> },
          { path: '/medicines', element: <MedicineListPage /> },
          { path: '/seniors', element: <SeniorListPage /> },
          { path: '/guardians', element: <GuardianListPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
]);
