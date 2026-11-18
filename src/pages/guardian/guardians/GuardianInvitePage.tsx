import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { inviteGuardians } from '@/apis/guardian';
import BackHeader from '@/components/common/BackHeader';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';
import DropdownField from '@/components/common/DropdownField';
import FormField from '@/components/common/FormField';
import TextField from '@/components/common/TextField';
import useGoBack from '@/hooks/useGoBack';
import useLatestRequest from '@/hooks/useLatestRequest';
import useSeniors from '@/hooks/useSeniors';
import {
  formatPhoneNumber,
  isValidPhoneNumber,
} from '@/utils/formatPhoneNumber';

// 한 번에 초대할 수 있는 번호 수 (서버 제한)
const MAX_INVITES = 10;

// 번호 입력 안내 문구
const PHONE_ERRORS = {
  duplicate: '이미 추가한 번호예요.',
  tooLong: '전화번호는 숫자 11자리까지 입력할 수 있어요.',
  tooMany: `한 번에 ${MAX_INVITES}명까지 초대할 수 있어요.`,
};

const GuardianInvitePage = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [phoneError, setPhoneError] = useState<
    keyof typeof PHONE_ERRORS | null
  >(null);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const { seniors } = useSeniors();
  // 초대받은 보호자가 맡을 시니어 (고르기 전에는 첫 번째 시니어)
  const [pickedSeniorId, setPickedSeniorId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitError, setIsSubmitError] = useState(false);
  const [isAlreadyLinked, setIsAlreadyLinked] = useState(false);
  const startRequest = useLatestRequest();

  const seniorId = pickedSeniorId ?? seniors?.[0]?.id ?? null;
  const hasSenior = (seniors ?? []).length > 0;
  const count = phoneNumbers.length;
  const isChanged = count > 0 || phoneInput !== '';

  // 번호가 완성되면 자동으로 목록에 추가 (이미 있는 번호는 입력창만 비우고 안내)
  const handlePhoneChange = (value: string) => {
    // 11자리를 넘으면 잘라서 추가하지 않고 그대로 두고 안내 (붙여넣기 등)
    if (value.replace(/\D/g, '').length > 11) {
      setPhoneError('tooLong');
      setPhoneInput(value);
      return;
    }

    const formatted = formatPhoneNumber(value);
    const isComplete = isValidPhoneNumber(formatted);
    const isDup = isComplete && phoneNumbers.includes(formatted);

    // 최대 개수면 추가하지 않고 입력값은 그대로 둠
    if (isComplete && !isDup && phoneNumbers.length >= MAX_INVITES) {
      setPhoneError('tooMany');
      setPhoneInput(formatted);
      return;
    }

    setPhoneError(isDup ? 'duplicate' : null);
    if (isComplete && !isDup) {
      setPhoneNumbers((prev) => [...prev, formatted]);
    }
    setPhoneInput(isComplete ? '' : formatted);
  };

  const removePhoneNumber = (target: string) => {
    setPhoneNumbers((prev) => prev.filter((phone) => phone !== target));
    // 번호를 지우면 중복·개수 초과 안내는 해제
    setPhoneError((prev) =>
      prev === 'duplicate' || prev === 'tooMany' ? null : prev
    );
  };

  // 입력한 내용이 있으면 버릴지 먼저 확인
  const handleCancel = () => {
    if (isChanged) setIsDiscardOpen(true);
    else goBack('/guardians');
  };

  // 초대 링크를 만들고 완료 화면에서 번호별 링크를 전달
  const handleSubmit = async () => {
    if (count === 0 || seniorId === null || isSubmitting) return;

    const isLatest = startRequest();
    setIsSubmitting(true);
    setIsSubmitError(false);
    setIsAlreadyLinked(false);
    try {
      const invitations = await inviteGuardians(seniorId, phoneNumbers);
      // 화면을 떠났으면 이동하지 않음
      if (!isLatest()) return;
      // 서버는 이미 연결된 번호를 건너뛰어, 모두 연결된 번호면 링크가 없음
      if (invitations.length === 0) {
        setIsAlreadyLinked(true);
        setIsSubmitting(false);
        return;
      }
      navigate('/guardians/invite/complete', {
        replace: true,
        state: { invitations },
      });
    } catch {
      if (!isLatest()) return;
      setIsSubmitError(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col">
      <BackHeader onBack={handleCancel} />

      <main className="min-h-0 flex-1 overflow-y-auto pt-8 pb-10">
        <section className="flex flex-col gap-2 px-5">
          <h1 className="text-[22px] font-bold text-[#191F28]">
            추가할 보호자의
            <br />
            전화번호를 입력해주세요
          </h1>
          <p className="text-[14px] text-[#333D4B]">
            번호마다 초대 링크를 만들어 드려요.
            <br />
            링크를 받은 보호자가 수락하면 목록에 추가돼요.
          </p>
        </section>

        {/* 초대 API에 담당 시니어가 필요해 선택 칸 추가 (Figma에 없음) */}
        <div className="flex flex-col gap-3 px-5 pt-29.5">
          <FormField label="담당 시니어">
            {hasSenior ? (
              <DropdownField
                aria-label="담당 시니어"
                placeholder="시니어를 선택해주세요."
                options={(seniors ?? []).map(({ id, name }) => ({
                  label: name,
                  value: String(id),
                }))}
                value={seniorId === null ? '' : String(seniorId)}
                onChange={(next) => setPickedSeniorId(Number(next))}
              />
            ) : (
              seniors && (
                <p className="text-[14px] text-[#6B7684]">
                  먼저 시니어를 등록해주세요.
                </p>
              )
            )}
          </FormField>
        </div>

        <div className="flex flex-col gap-3 px-5 pt-6">
          <FormField label="전화번호" htmlFor="guardian-phone">
            <TextField
              id="guardian-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="전화번호를 입력해주세요."
              value={phoneInput}
              onChange={(e) => handlePhoneChange(e.target.value)}
            />
          </FormField>
          {phoneError && (
            <p role="alert" className="text-[12px] text-[#E5484D]">
              {PHONE_ERRORS[phoneError]}
            </p>
          )}
          {count > 0 && (
            <ul className="flex flex-wrap gap-x-3 gap-y-2">
              {phoneNumbers.map((phone) => (
                <li key={phone} className="flex items-center gap-1">
                  <span className="rounded-full bg-[#E7F6EC] px-2.5 py-1 pl-3.5 text-[12px] font-semibold text-[#01A16A]">
                    {phone}
                  </span>
                  <button
                    type="button"
                    aria-label={`${phone} 삭제`}
                    onClick={() => removePhoneNumber(phone)}
                    className="flex size-5 items-center justify-center text-[#8B95A1]"
                  >
                    <X size={14} strokeWidth={2} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {(isSubmitError || isAlreadyLinked) && (
        <p
          role="alert"
          className="shrink-0 bg-white px-5 pt-4 text-center text-[13px] text-[#E5484D]"
        >
          {isAlreadyLinked
            ? '입력한 번호는 모두 이미 이 시니어의 보호자예요.'
            : '초대 링크를 만들지 못했어요. 다시 시도해주세요.'}
        </p>
      )}
      <div className="flex shrink-0 gap-3 bg-white px-5 pt-4 pb-10">
        <div className="w-29.25 shrink-0">
          <Button variant="secondary" onClick={handleCancel}>
            취소
          </Button>
        </div>
        <div className="min-w-0 flex-1">
          <Button
            disabled={count === 0 || seniorId === null || isSubmitting}
            onClick={handleSubmit}
          >
            {count > 0 ? `${count}명 초대하기` : '초대하기'}
          </Button>
        </div>
      </div>

      <ConfirmModal
        open={isDiscardOpen}
        message={'입력한 내용이 사라집니다.\n그래도 취소하시겠습니까?'}
        cancelLabel="돌아가기"
        confirmLabel="취소하기"
        onCancel={() => setIsDiscardOpen(false)}
        onConfirm={() => {
          setIsDiscardOpen(false);
          goBack('/guardians');
        }}
      />
    </div>
  );
};

export default GuardianInvitePage;
