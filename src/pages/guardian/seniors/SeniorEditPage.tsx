import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { fetchSenior, updateSenior } from '@/apis/senior';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';
import StepHeader from '@/components/common/StepHeader';
import SeniorInfoForm from '@/components/seniors/SeniorInfoForm';
import useGoBack from '@/hooks/useGoBack';
import useLatestRequest from '@/hooks/useLatestRequest';
import type { ApiError } from '@/types/api';
import type { Senior } from '@/types/senior';
import {
  isSeniorFormChanged,
  isSeniorFormValid,
  toSeniorForm,
  toSeniorFormValue,
  type SeniorFormValue,
} from '@/utils/seniorForm';

// 시니어가 바뀌면 이전 상태가 남지 않도록 새로 그림
const SeniorEditPage = () => {
  const { seniorId } = useParams();
  return <SeniorEditContent key={seniorId} seniorId={Number(seniorId)} />;
};

const SeniorEditContent = ({ seniorId }: { seniorId: number }) => {
  const goBack = useGoBack();
  const startRequest = useLatestRequest();

  // null이면 불러오는 중
  const [senior, setSenior] = useState<Senior | null>(null);
  const [form, setForm] = useState<SeniorFormValue | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLoadError, setIsLoadError] = useState(false);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitError, setIsSubmitError] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetchSenior(seniorId)
      .then((data) => {
        if (ignore) return;
        setSenior(data);
        setForm(toSeniorFormValue(data));
      })
      .catch((error: ApiError) => {
        if (ignore) return;
        // 없는 시니어(404)·잘못된 주소(400)면 목록으로
        if (error.status === 404 || error.status === 400) setIsNotFound(true);
        else setIsLoadError(true);
      });
    return () => {
      ignore = true;
    };
  }, [seniorId]);

  if (isNotFound) {
    return <Navigate to="/seniors" replace />;
  }

  const isChanged =
    !!senior && !!form && isSeniorFormChanged(toSeniorFormValue(senior), form);
  const canSubmit =
    isChanged && !!form && isSeniorFormValid(form) && !isSubmitting;

  // 바꾼 내용이 있으면 버릴지 먼저 확인 (저장 중에는 막음)
  const handleCancel = () => {
    if (isSubmitting) return;
    if (isChanged) setIsDiscardOpen(true);
    else goBack('/seniors');
  };

  const handleSubmit = async () => {
    if (!canSubmit || !senior || !form) return;

    const isLatest = startRequest();
    setIsSubmitting(true);
    setIsSubmitError(false);
    try {
      await updateSenior(senior.id, toSeniorForm(form));
      // 화면을 떠났으면 이동하지 않음
      if (!isLatest()) return;
      goBack('/seniors');
    } catch {
      if (!isLatest()) return;
      setIsSubmitError(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col">
      <StepHeader title="시니어 정보 수정" onBack={handleCancel} />

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pt-6 pb-10">
        {isLoadError ? (
          <p className="pt-20 text-center text-[14px] text-[#6B7684]">
            시니어 정보를 불러오지 못했어요.
          </p>
        ) : (
          form && (
            <SeniorInfoForm
              value={form}
              onChange={setForm}
              onSubmit={handleSubmit}
            />
          )
        )}
      </main>

      {isSubmitError && (
        <p
          role="alert"
          className="shrink-0 bg-white px-5 pt-4 text-center text-[13px] text-[#E5484D]"
        >
          시니어 정보 수정에 실패했어요. 다시 시도해주세요.
        </p>
      )}
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
