import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import GuardianLayout from '@/layouts/GuardianLayout';
import LoginPage from '@/pages/auth/LoginPage';
import SignupLayout from '@/layouts/SignupLayout';
import SignupEmailPage from '@/pages/auth/SignupEmailPage';
import SignupPasswordPage from '@/pages/auth/SignupPasswordPage';
import SignupGuardianPage from '@/pages/auth/SignupGuardianPage';
import SignupCompletePage from '@/pages/auth/SignupCompletePage';
import SchedulePage from '@/pages/guardian/schedule/SchedulePage';
import ScheduleMonthPage from '@/pages/guardian/schedule/ScheduleMonthPage';
import MedicineListPage from '@/pages/guardian/medicines/MedicineListPage';
import SeniorListPage from '@/pages/guardian/seniors/SeniorListPage';
import GuardianListPage from '@/pages/guardian/guardians/GuardianListPage';
import ProfilePage from '@/pages/guardian/profile/ProfilePage';
import SeniorRegisterPage from '@/pages/guardian/seniors/SeniorRegisterPage';
import SeniorRegisterCompletePage from '@/pages/guardian/seniors/SeniorRegisterCompletePage';
import SeniorAddPage from '@/pages/guardian/seniors/SeniorAddPage';
import SeniorEditPage from '@/pages/guardian/seniors/SeniorEditPage';
import GuardianManagePage from '@/pages/guardian/guardians/GuardianManagePage';
import GuardianInvitePage from '@/pages/guardian/guardians/GuardianInvitePage';
import GuardianInviteCompletePage from '@/pages/guardian/guardians/GuardianInviteCompletePage';
import SeniorSchedulePage from '@/pages/senior/SeniorSchedulePage';
import MedicineRegisterMethodPage from '@/pages/guardian/medicines/MedicineRegisterMethodPage';
import MedicineRecognitionPage from '@/pages/guardian/medicines/MedicineRecognitionPage';
import MedicineInfoFormPage from '@/pages/guardian/medicines/MedicineInfoFormPage';
import MedicineManagePage from '@/pages/guardian/medicines/MedicineManagePage';
import MedicineEditPage from '@/pages/guardian/medicines/MedicineEditPage';
import SeniorIncomingCallPage from '@/pages/senior/SeniorIncomingCallPage';
import SeniorRecognitionPage from '@/pages/senior/SeniorRecognitionPage';
import SeniorFindMedicinePage from '@/pages/senior/SeniorFindMedicinePage';
import SeniorDosePage from '@/pages/senior/SeniorDosePage';
import SeniorDoseResultPage from '@/pages/senior/SeniorDoseResultPage';

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
      // 로그인 (하단 네비게이션 미노출)
      { path: '/login', element: <LoginPage /> },
      // 회원가입 흐름 (하단 네비게이션 미노출)
      {
        element: <SignupLayout />,
        children: [
          { path: '/signup', element: <SignupEmailPage /> },
          { path: '/signup/password', element: <SignupPasswordPage /> },
          { path: '/signup/guardian', element: <SignupGuardianPage /> },
          { path: '/signup/complete', element: <SignupCompletePage /> },
        ],
      },
      {
        // 보호자 탭 화면 (하단 네비게이션 노출)
        element: <GuardianLayout />,
        children: [
          { path: '/schedule', element: <SchedulePage /> },
          { path: '/schedule/month', element: <ScheduleMonthPage /> },
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
      // 시니어 추가 / 정보 수정 (시니어 목록)
      { path: '/seniors/add', element: <SeniorAddPage /> },
      { path: '/seniors/:seniorId/edit', element: <SeniorEditPage /> },
      // 보호자 목록 편집 / 보호자 초대 (보호자 목록)
      { path: '/guardians/manage', element: <GuardianManagePage /> },
      { path: '/guardians/invite', element: <GuardianInvitePage /> },
      {
        path: '/guardians/invite/complete',
        element: <GuardianInviteCompletePage />,
      },
      // 시니어 약 섭취 일정 (오늘 / 내일)
      { path: '/senior', element: <SeniorSchedulePage day="today" /> },
      {
        path: '/senior/tomorrow',
        element: <SeniorSchedulePage day="tomorrow" />,
      },
      // 시니어 복약 알림 수신
      { path: '/senior/call', element: <SeniorIncomingCallPage /> },
      // 시니어 약 인식 흐름: 카메라 인식 → 약 사진 안내 → 복용 안내 → 복용 결과
      { path: '/senior/recognition', element: <SeniorRecognitionPage /> },
      { path: '/senior/find', element: <SeniorFindMedicinePage /> },
      { path: '/senior/dose', element: <SeniorDosePage /> },
      { path: '/senior/result', element: <SeniorDoseResultPage /> },
      // 약 등록 흐름 (하단 네비게이션 미노출)
      { path: '/medicines/register', element: <MedicineRegisterMethodPage /> },
      {
        path: '/medicines/register/recognition',
        element: <MedicineRecognitionPage />,
      },
      { path: '/medicines/register/form', element: <MedicineInfoFormPage /> },
      // 약 목록 편집 (선택 삭제)
      { path: '/medicines/manage', element: <MedicineManagePage /> },
      // 약 세부 정보 수정
      { path: '/medicines/:medicineId/edit', element: <MedicineEditPage /> },
    ],
  },
]);
