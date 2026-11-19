import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import type { SignupAccount, GuardianInfo } from '@/types/auth';

export default function SignupLayout() {
  const [account, setAccount] = useState<SignupAccount>({
    email: '',
    password: '',
  });
  // 계정 생성에 성공한 정보: 뒤로 갔다 와도 가입 요청을 중복으로 보내지 않기 위함
  const [createdAccount, setCreatedAccount] = useState<SignupAccount | null>(
    null
  );
  const [guardian, setGuardian] = useState<GuardianInfo>({
    name: '',
    birthDate: { year: '', month: '', day: '' },
    gender: '',
    phoneNumber: '',
  });

  return (
    <Outlet
      context={{
        account,
        setAccount,
        guardian,
        setGuardian,
        createdAccount,
        setCreatedAccount,
      }}
    />
  );
}
