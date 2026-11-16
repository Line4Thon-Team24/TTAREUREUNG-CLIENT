import { Navigate, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import BrandBadge from '@/components/common/BrandBadge';
import Button from '@/components/auth/Button';
import { useSignupForm } from '@/hooks/useSignupForm';

const SignupCompletePage = () => {
  const navigate = useNavigate();
  const { guardian } = useSignupForm();

  // 가입 과정을 거치지 않고 주소로 바로 들어온 경우 첫 단계로 이동
  if (!guardian.name) return <Navigate to="/signup" replace />;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-20 px-5 py-10">
        <div className="flex flex-col items-center gap-4.5">
          <BrandBadge label="따르릉 보호자" />
          <h1 className="text-center text-[22px] leading-tight font-bold text-text-title">
            {guardian.name}님,
            <br />
            환영합니다!
          </h1>
        </div>

        <div
          className="flex size-36 items-center justify-center rounded-full border-12 border-[#138A4B]/80"
          aria-hidden
        >
          <Check size={64} strokeWidth={4} className="text-[#138A4B]/80" />
        </div>

        <p className="text-center text-[16px] leading-tight text-text-body">
          시니어의 약 복용 일정 생성을 위해
          <br />
          시니어의 정보를 바로 등록해주세요.
        </p>
      </main>

      <div className="flex flex-col items-center gap-3 px-5 pt-4 pb-10">
        <Button
          onClick={() => navigate('/seniors/register', { replace: true })}
        >
          시니어 등록하러 가기
        </Button>
        <button
          type="button"
          onClick={() => navigate('/schedule', { replace: true })}
          className="text-[16px] text-text-body underline underline-offset-2"
        >
          건너뛰기
        </button>
      </div>
    </div>
  );
};

export default SignupCompletePage;
