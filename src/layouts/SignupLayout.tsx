import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import type { SignupAccount, GuardianInfo } from '@/types/auth';

export default function SignupLayout() {
  const [account, setAccount] = useState<SignupAccount>({
    email: '',
    password: '',
  });
  const [guardian, setGuardian] = useState<GuardianInfo>({
    name: '',
    birthDate: { year: '', month: '', day: '' },
    gender: '',
    phoneNumber: '',
  });

  return <Outlet context={{ account, setAccount, guardian, setGuardian }} />;
}
