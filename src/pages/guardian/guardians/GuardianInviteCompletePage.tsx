import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Check, Copy, Share2 } from 'lucide-react';
import Button from '@/components/common/Button';
import BrandBadge from '@/components/common/BrandBadge';
import useGoBack from '@/hooks/useGoBack';
import { formatPhoneNumber } from '@/utils/formatPhoneNumber';

type Invitation = { phoneNumber: string; inviteUrl: string };

// 터치 화면(휴대폰)은 공유하기(카톡 등), PC는 복사
const canShare =
  !!navigator.share && window.matchMedia('(pointer: coarse)').matches;

const GuardianInviteCompletePage = () => {
  const goBack = useGoBack();
  const location = useLocation();
  const invitations = (location.state as { invitations?: Invitation[] } | null)
    ?.invitations;
  // 복사를 마친 링크 (버튼에 '복사됨' 표시)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isCopyError, setIsCopyError] = useState(false);

  // 초대를 거치지 않고 주소로 바로 들어온 경우 보호자 목록으로
  if (!invitations) {
    return <Navigate to="/guardians" replace />;
  }

  // 서버가 문자를 보내지 않아 링크를 직접 전달
  const deliverLink = async (inviteUrl: string) => {
    setIsCopyError(false);
    if (canShare) {
      // 공유 창을 닫은 경우도 오류로 오므로 무시
      await navigator
        .share({ text: '따르릉 보호자 초대', url: inviteUrl })
        .catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedUrl(inviteUrl);
    } catch {
      setIsCopyError(true);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-5 py-10">
        <div className="flex flex-col items-center gap-4.5">
          <BrandBadge label="따르릉 보호자" />
          <h1 className="text-[22px] font-bold text-[#191F28]">
            초대 링크를 만들었어요!
          </h1>
        </div>

        <div
          className="flex size-36 items-center justify-center rounded-full border-12 border-[rgba(19,138,75,0.8)] bg-white shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)]"
          aria-hidden
        >
          <Check size={64} strokeWidth={3.75} className="text-[#138A4B]/80" />
        </div>

        <p className="text-center text-[16px] text-[#333D4B]">
          아래 링크를 보호자에게 전달해주세요.
          <br />
          링크를 수락하면 보호자 목록에 추가돼요.
        </p>

        {/* 번호별 초대 링크 (Figma에 없음) */}
        <ul className="flex w-full flex-col gap-2">
          {invitations.map(({ phoneNumber, inviteUrl }) => (
            <li
              key={inviteUrl}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E8EB] bg-[#FAFAFA] px-3.75 py-3"
            >
              <span className="text-[14px] font-semibold text-[#333D4B]">
                {formatPhoneNumber(phoneNumber)}
              </span>
              <button
                type="button"
                onClick={() => deliverLink(inviteUrl)}
                className="flex shrink-0 items-center gap-1 rounded-full bg-[#E7F6EC] px-3 py-1.5 text-[12px] font-semibold text-[#01A16A] active:bg-[#CDEBD8]"
              >
                {canShare ? (
                  <Share2 size={14} strokeWidth={2.5} aria-hidden />
                ) : copiedUrl === inviteUrl ? (
                  <Check size={14} strokeWidth={2.5} aria-hidden />
                ) : (
                  <Copy size={14} strokeWidth={2.5} aria-hidden />
                )}
                {canShare
                  ? '링크 공유'
                  : copiedUrl === inviteUrl
                    ? '복사됨'
                    : '링크 복사'}
              </button>
            </li>
          ))}
        </ul>
        {isCopyError && (
          <p role="alert" className="text-[13px] text-[#E5484D]">
            링크를 복사하지 못했어요. 다시 시도해주세요.
          </p>
        )}
      </main>

      <div className="px-5 pt-4 pb-10">
        <Button onClick={() => goBack('/guardians')}>확인</Button>
      </div>
    </div>
  );
};

export default GuardianInviteCompletePage;
