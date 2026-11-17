import { Navigate, useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';
import Button from '@/components/common/Button';
import BrandBadge from '@/components/common/BrandBadge';
import useGoBack from '@/hooks/useGoBack';

const GuardianInviteCompletePage = () => {
  const goBack = useGoBack();
  const location = useLocation();
  const invited = (location.state as { invited?: boolean } | null)?.invited;

  // 초대를 거치지 않고 주소로 바로 들어온 경우 보호자 목록으로
  if (!invited) {
    return <Navigate to="/guardians" replace />;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-23 px-5 py-10">
        <div className="flex flex-col items-center gap-4.5">
          <BrandBadge label="따르릉 보호자" />
          <h1 className="text-[22px] font-bold text-[#191F28]">
            보호자 추가 완료!
          </h1>
        </div>

        <div
          className="flex size-36 items-center justify-center rounded-full border-12 border-[rgba(19,138,75,0.8)] bg-white shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)]"
          aria-hidden
        >
          <Check size={64} strokeWidth={3.75} className="text-[#138A4B]/80" />
        </div>

        <p className="text-center text-[16px] text-[#333D4B]">
          입력된 전화번호로 가입이 완료되면
          <br />
          자동으로 목록에 추가돼요.
        </p>
      </main>

      <div className="px-5 pt-4 pb-10">
        <Button onClick={() => goBack('/guardians')}>확인</Button>
      </div>
    </div>
  );
};

export default GuardianInviteCompletePage;
