import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';
import StepHeader from '@/components/common/StepHeader';
import SeniorInfoForm from '@/components/seniors/SeniorInfoForm';
import useGoBack from '@/hooks/useGoBack';
import { getSenior, updateSenior } from '@/mocks/seniors';
import {
  isSeniorFormChanged,
  isSeniorFormValid,
  toSeniorForm,
  toSeniorFormValue,
} from '@/utils/seniorForm';

const SeniorEditPage = () => {
  const goBack = useGoBack();
  const { seniorId } = useParams();

  const [senior] = useState(() => getSenior(Number(seniorId)));
  const [form, setForm] = useState(() =>
    senior ? toSeniorFormValue(senior) : null
  );
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);

  // 없는 시니어면 목록으로
  if (!senior || !form) {
    return <Navigate to="/seniors" replace />;
  }

  const isChanged = isSeniorFormChanged(toSeniorFormValue(senior), form);
  const canSubmit = isChanged && isSeniorFormValid(form);

  // 바꾼 내용이 있으면 버릴지 먼저 확인
  const handleCancel = () => {
    if (isChanged) setIsDiscardOpen(true);
    else goBack('/seniors');
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    updateSenior(senior.id, toSeniorForm(form));
    goBack('/seniors');
  };

  return (
    <div className="flex h-dvh flex-col">
      <StepHeader title="시니어 정보 수정" onBack={handleCancel} />

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pt-6 pb-10">
        <SeniorInfoForm
          value={form}
          onChange={setForm}
          onSubmit={handleSubmit}
        />
      </main>

      <div className="flex shrink-0 gap-3 bg-white px-5 pt-4 pb-10">
        <div className="w-29.25 shrink-0">
          <Button variant="secondary" onClick={handleCancel}>
            취소
          </Button>
        </div>
        <div className="min-w-0 flex-1">
          <Button disabled={!canSubmit} onClick={handleSubmit}>
            수정하기
          </Button>
        </div>
      </div>

      <ConfirmModal
        open={isDiscardOpen}
        message={'변경한 내용이 사라집니다.\n그래도 취소하시겠습니까?'}
        cancelLabel="돌아가기"
        confirmLabel="취소하기"
        onCancel={() => setIsDiscardOpen(false)}
        onConfirm={() => {
          setIsDiscardOpen(false);
          goBack('/seniors');
        }}
      />
    </div>
  );
};

export default SeniorEditPage;
