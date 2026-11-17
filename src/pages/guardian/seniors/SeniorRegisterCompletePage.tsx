import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import Button from '@/components/common/Button';
import BrandBadge from '@/components/common/BrandBadge';
import useGoBack from '@/hooks/useGoBack';
import { getMedicines } from '@/mocks/medicines';
import type { RegisterFlow } from '@/types/medicine';

const SeniorRegisterCompletePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const goBack = useGoBack();

  const state = location.state as {
    seniorId?: number;
    returnTo?: string; // 건너뛰기 시 돌아갈 곳 (기본: 복용 일정)
  } | null;
  const seniorId = state?.seniorId;

  // 등록을 거치지 않고 주소로 바로 들어온 경우 복용 일정으로 이동
  if (seniorId === undefined) {
    return <Navigate to="/schedule" replace />;
  }

  // 회원가입 직후 약 등록을 마치고 돌아오면 복용 일정으로
  if (getMedicines(seniorId).length > 0) {
    return <Navigate to={state?.returnTo ?? '/schedule'} replace />;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-23 px-5 py-10">
        <div className="flex flex-col items-center gap-4.5">
          <BrandBadge label="따르릉 약 챙김 대상자" />
          <h1 className="text-[22px] font-bold text-[#191F28]">
            시니어 등록 완료!
          </h1>
        </div>

        <div
          className="flex size-36 items-center justify-center rounded-full border-12 border-[rgba(19,138,75,0.8)] bg-white shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)]"
          aria-hidden
        >
          {/* 피그마 기준 64px 아이콘, 선 굵기 10px → 24 기준 3.75 */}
          <Check size={64} strokeWidth={3.75} className="text-[#138A4B]/80" />
        </div>

        <p className="text-center text-[16px] text-[#333D4B]">
          시니어의 약 복용 일정 생성을 위해
          <br />약 정보를 바로 등록해주세요.
        </p>
      </main>

      <div className="flex flex-col items-center gap-3 px-5 pt-4 pb-10">
        <Button
          onClick={() =>
            // 시작한 화면이 있으면 등록 후 이 화면도 건너뛰어 바로 돌아감
            navigate('/medicines/register', {
              state: {
                seniorId,
                extraBackSteps: state?.returnTo ? 1 : 0,
              } satisfies RegisterFlow,
            })
          }
        >
          약 등록하러 가기
        </Button>
        <button
          type="button"
          onClick={() =>
            // 시작한 화면으로 돌아가고, 회원가입 직후면 복용 일정으로
            state?.returnTo
              ? goBack(state.returnTo)
              : navigate('/schedule', { replace: true })
          }
          className="text-[16px] text-[#333D4B] underline"
        >
          건너뛰기
        </button>
      </div>
    </div>
  );
};

export default SeniorRegisterCompletePage;
