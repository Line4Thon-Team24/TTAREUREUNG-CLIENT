import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import GuardianLayout from '@/layouts/GuardianLayout';
import { ROUTES } from '@/constants/routes';
import HomePage from '@/pages/HomePage';
import SchedulePage from '@/pages/SchedulePage';
import MedicineListPage from '@/pages/MedicineListPage';
import SeniorListPage from '@/pages/SeniorListPage';
import GuardianListPage from '@/pages/GuardianListPage';
import ProfilePage from '@/pages/ProfilePage';

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        // 보호자 탭 화면 (하단 네비게이션 노출)
        element: <GuardianLayout />,
        children: [
          { path: ROUTES.SCHEDULE, element: <SchedulePage /> },
          { path: ROUTES.MEDICINES, element: <MedicineListPage /> },
          { path: ROUTES.SENIORS, element: <SeniorListPage /> },
          { path: ROUTES.GUARDIANS, element: <GuardianListPage /> },
          { path: ROUTES.PROFILE, element: <ProfilePage /> },
        ],
      },
    ],
  },
]);
