import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BackHeader from '@/components/common/BackHeader';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';
import SeniorInfoForm from '@/components/seniors/SeniorInfoForm';
import { addSenior } from '@/mocks/seniors';
import {
  EMPTY_SENIOR_FORM,
  isSeniorFormChanged,
  isSeniorFormValid,
  toSeniorForm,
} from '@/utils/seniorForm';

const SeniorAddPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // 완료 화면에서 '건너뛰기' 시 돌아갈 곳 (기본: 시니어 목록)
  const returnTo =
    (location.state as { returnTo?: string } | null)?.returnTo ?? '/seniors';

  const [form, setForm] = useState(EMPTY_SENIOR_FORM);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);

  const isChanged = isSeniorFormChanged(EMPTY_SENIOR_FORM, form);
  const canSubmit = isSeniorFormValid(form);

  // 입력한 내용이 있으면 버릴지 먼저 확인
  const handleCancel = () => {
    if (isChanged) setIsDiscardOpen(true);
    else navigate(-1);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const senior = addSenior(toSeniorForm(form));
    navigate('/seniors/register/complete', {
      replace: true,
      state: { seniorId: senior.id, returnTo },
    });
  };

  return (
    <div className="flex h-dvh flex-col">
      <BackHeader onBack={handleCancel} />

      <main className="min-h-0 flex-1 overflow-y-auto pt-8 pb-10">
        <section className="flex flex-col gap-2 px-5">
          <h1 className="text-[22px] font-bold text-[#191F28]">
            추가할 시니어의
            <br />
            정보를 입력해주세요
          </h1>
          <p className="text-[14px] text-[#333D4B]">
            복약 일정 확인 및 맞춤형 안부 전화를 시작할 시니어의 기본 정보를
            입력해주세요.
          </p>
        </section>

        <div className="px-5 pt-14">
          <SeniorInfoForm
            value={form}
            onChange={setForm}
            onSubmit={handleSubmit}
          />
        </div>
      </main>

      <div className="flex shrink-0 gap-3 bg-white px-5 pt-4 pb-10">
        <div className="w-29.25 shrink-0">
          <Button variant="secondary" onClick={handleCancel}>
            취소
          </Button>
        </div>
        <div className="min-w-0 flex-1">
          <Button disabled={!canSubmit} onClick={handleSubmit}>
            추가하기
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

export default SeniorAddPage;
