import { Fragment, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import {
  createMedicine,
  createRecognizedMedicines,
  deleteMedicines,
} from '@/apis/medicine';
import Button from '@/components/common/Button';
import StepHeader from '@/components/common/StepHeader';
import MedicineInfoCard from '@/components/medicines/MedicineInfoCard';
import useLatestRequest from '@/hooks/useLatestRequest';
import type { MedicineForm, MedicineFormState } from '@/types/medicine';
import { formatDateTime } from '@/utils/date';
import { getHistoryIndex } from '@/utils/history';
import {
  createEmptyMedicineForm,
  isMedicineFormValid,
  trimMedicineForm,
} from '@/utils/medicineForm';

// 입력 중인 약 (인식 결과의 고유 ID 기준으로 관리)
type MedicineDraft = { id: string; form: MedicineForm };

// 등록을 마친 입력 화면의 기록 키
// → 앞으로가기로 같은 입력 화면에 다시 들어와 중복 등록하는 것을 막음
// (렌더링과 무관한 값이라 state가 아닌 모듈 변수로 관리)
const completedKeys = new Set<string>();

const MedicineInfoFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as MedicineFormState | null;
  const isManual = state?.mode === 'manual';

  // 인식 결과는 이전 화면에서 선택한 약만, 직접 입력은 빈 약 1개
  const [drafts, setDrafts] = useState<MedicineDraft[]>(() => {
    if (state?.mode === 'recognized') {
      return state.medicines.map(({ id, form }) => ({ id, form }));
    }
    return [{ id: 'manual-1', form: createEmptyMedicineForm() }];
  });
  const [registeredAt] = useState(() => formatDateTime(new Date()));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitError, setIsSubmitError] = useState(false);
  const startRequest = useLatestRequest();

  // 이전 단계를 거치지 않았거나, 선택한 약이 없거나, 이미 등록을 마친 화면이면 복용 일정으로 이동
  if (!state || drafts.length === 0 || completedKeys.has(location.key)) {
    return <Navigate to="/schedule" replace />;
  }

  const count = drafts.length;
  const isValid = drafts.every(({ form }) =>
    isMedicineFormValid(form, isManual)
  );

  const updateForm = (id: string, next: MedicineForm) => {
    setDrafts((prev) =>
      prev.map((draft) => (draft.id === id ? { id, form: next } : draft))
    );
  };

  // 등록을 마치면 흐름 시작 화면으로 이동
  const finishRegister = () => {
    // 이동하기 전에 완료 표시 (등록 처리 중 다시 렌더링되어도 이동과 엇갈리지 않도록 state를 바꾸지 않음)
    completedKeys.add(location.key);
    // 약 등록 흐름(방법 선택 → AI 인식 결과 → 입력)을 기록에서 되돌려 시작 화면으로 이동
    // → 등록 후 뒤로가기로 입력 화면에 다시 들어가 중복 등록하는 것을 방지
    // (인식 결과 다시 올리기·약 선택은 replace라 기록이 늘지 않음)
    // 흐름 시작 화면이 거쳐 갈 곳이면 더 건너뜀 (삭제된 약의 수정 화면, 시니어 등록 완료 화면)
    const steps = (isManual ? 2 : 3) + (state.extraBackSteps ?? 0);
    // 앱 안 기록이 모자라면(주소로 바로 들어온 경우) 약 목록으로
    if (getHistoryIndex() >= steps) navigate(-steps);
    else navigate(`/medicines?seniorId=${state.seniorId}`, { replace: true });
  };

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    const isLatest = startRequest();
    setIsSubmitting(true);
    setIsSubmitError(false);
    try {
      if (state.mode === 'manual') {
        // 직접 입력은 약 1개
        await createMedicine(state.seniorId, trimMedicineForm(drafts[0].form));
      } else {
        // 선택한 약만 등록 (함량·복용량은 인식 결과에서 가져옴)
        await createRecognizedMedicines(
          state.seniorId,
          drafts.map(({ id, form }) => {
            const recognized = state.medicines.find(
              (medicine) => medicine.id === id
            );
            return {
              form: trimMedicineForm(form),
              strength: recognized?.strength,
              doseAmount: recognized?.doseAmount,
            };
          }),
          { fileKey: state.fileKey, fileName: state.prescription.fileName }
        );
      }
      // 다시 등록하기면 기존 약 삭제 (실패해도 새 약은 등록됐으므로 계속 진행)
      if (state.replaceMedicineId !== undefined) {
        await deleteMedicines([state.replaceMedicineId]).catch(() => {});
      }
      // 화면을 떠났으면 이동하지 않음
      if (!isLatest()) return;
      finishRegister();
    } catch {
      if (!isLatest()) return;
      setIsSubmitError(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col">
      <StepHeader
        title="새로운 약 정보"
        subtitle={
          isManual
            ? '약 정보를 직접 입력해주세요'
            : `총 ${count}개 선택 및 자동 변환 완료`
        }
        status={isManual ? undefined : '변환 완료'}
      />

      {/* 입력 폼만 스크롤, 마지막 항목이 하단 버튼에 가리지 않도록 아래 여백 확보 */}
      <main className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-5 pt-8 pb-12">
        {!isManual && (
          <div className="flex items-start gap-3 rounded-2xl border border-[#CDEBD8] bg-[#E7F6EC] p-3.75">
            <Sparkles
              size={20}
              aria-hidden
              className="mt-0.5 shrink-0 text-[#01A16A]"
            />
            <p className="text-[14px] leading-[17.88px] font-medium text-[#01A16A]">
              등록된 사진을 기반으로 자동 입력되었습니다.
              <br />
              내용을 확인해 주세요.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {drafts.map(({ id, form }, index) => (
            <Fragment key={id}>
              {index > 0 && <hr className="border-[#E5E8EB]" />}
              <MedicineInfoCard
                index={index}
                value={form}
                onChange={(next) => updateForm(id, next)}
                registeredAt={registeredAt}
                isManual={isManual}
              />
            </Fragment>
          ))}
        </div>
      </main>

      {isSubmitError && (
        <p
          role="alert"
          className="shrink-0 border-t border-[#E5E8EB] bg-white px-5 pt-4 text-center text-[13px] text-[#E5484D]"
        >
          약 등록에 실패했어요. 다시 시도해주세요.
        </p>
      )}
      <div className="z-10 flex shrink-0 gap-3 border-t border-[#E5E8EB] bg-white px-5 pt-4 pb-10">
        <div className="w-29.25 shrink-0">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            취소
          </Button>
        </div>
        <div className="min-w-0 flex-1">
          <Button disabled={!isValid || isSubmitting} onClick={handleSubmit}>
            {count}개 등록하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MedicineInfoFormPage;
