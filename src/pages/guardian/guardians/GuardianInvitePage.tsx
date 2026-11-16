import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import BackHeader from '@/components/common/BackHeader';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';
import FormField from '@/components/common/FormField';
import TextField from '@/components/common/TextField';
import { inviteGuardians } from '@/mocks/guardians';
import {
  formatPhoneNumber,
  isValidPhoneNumber,
} from '@/utils/formatPhoneNumber';

const GuardianInvitePage = () => {
  const navigate = useNavigate();
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);

  const count = phoneNumbers.length;
  const isChanged = count > 0 || phoneInput !== '';

  // 번호가 완성되면 자동으로 목록에 추가 (이미 있는 번호는 입력창만 비우고 안내)
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    const isComplete = isValidPhoneNumber(formatted);
    const isDup = isComplete && phoneNumbers.includes(formatted);

    setIsDuplicate(isDup);
    if (isComplete && !isDup) {
      setPhoneNumbers((prev) => [...prev, formatted]);
    }
    setPhoneInput(isComplete ? '' : formatted);
  };

  const removePhoneNumber = (target: string) => {
    setPhoneNumbers((prev) => prev.filter((phone) => phone !== target));
    setIsDuplicate(false);
  };

  // 입력한 내용이 있으면 버릴지 먼저 확인
  const handleCancel = () => {
    if (isChanged) setIsDiscardOpen(true);
    else navigate(-1);
  };

  const handleSubmit = () => {
    if (count === 0) return;
    inviteGuardians(phoneNumbers);
    navigate('/guardians/invite/complete', {
      replace: true,
      state: { invited: true },
    });
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
            입력된 번호로 가입이 완료되면 보호자 목록에
            <br />
            자동으로 추가돼요.
          </p>
        </section>

        <div className="flex flex-col gap-3 px-5 pt-29.5">
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
          {isDuplicate && (
            <p className="text-[12px] text-[#E5484D]">이미 추가한 번호예요.</p>
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

      <div className="flex shrink-0 gap-3 bg-white px-5 pt-4 pb-10">
        <div className="w-29.25 shrink-0">
          <Button variant="secondary" onClick={handleCancel}>
            취소
          </Button>
        </div>
        <div className="min-w-0 flex-1">
          <Button disabled={count === 0} onClick={handleSubmit}>
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
          navigate(-1);
        }}
      />
    </div>
  );
};

export default GuardianInvitePage;
