import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import GuardianLayout from '@/layouts/GuardianLayout';
import SchedulePage from '@/pages/guardian/schedule/SchedulePage';
import MedicineListPage from '@/pages/guardian/medicines/MedicineListPage';
import SeniorListPage from '@/pages/guardian/seniors/SeniorListPage';
import GuardianListPage from '@/pages/guardian/guardians/GuardianListPage';
import ProfilePage from '@/pages/guardian/profile/ProfilePage';
import SeniorRegisterPage from '@/pages/guardian/seniors/SeniorRegisterPage';
import SeniorRegisterCompletePage from '@/pages/guardian/seniors/SeniorRegisterCompletePage';
import MedicineRegisterMethodPage from '@/pages/guardian/medicines/MedicineRegisterMethodPage';
import MedicineRecognitionPage from '@/pages/guardian/medicines/MedicineRecognitionPage';
import MedicineInfoFormPage from '@/pages/guardian/medicines/MedicineInfoFormPage';
import MedicineManagePage from '@/pages/guardian/medicines/MedicineManagePage';

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
      // 시니어 등록 흐름 (하단 네비게이션 미노출)
      { path: '/seniors/register', element: <SeniorRegisterPage /> },
      {
        path: '/seniors/register/complete',
        element: <SeniorRegisterCompletePage />,
      },
      // 약 등록 흐름 (하단 네비게이션 미노출)
      { path: '/medicines/register', element: <MedicineRegisterMethodPage /> },
      {
        path: '/medicines/register/recognition',
        element: <MedicineRecognitionPage />,
      },
      { path: '/medicines/register/form', element: <MedicineInfoFormPage /> },
      // 약 목록 편집 (선택 삭제)
      { path: '/medicines/manage', element: <MedicineManagePage /> },
    ],
  },
]);
