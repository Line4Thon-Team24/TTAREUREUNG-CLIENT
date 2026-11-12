import { Fragment, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Button from '@/components/common/Button';
import StepHeader from '@/components/common/StepHeader';
import MedicineInfoCard from '@/components/medicines/MedicineInfoCard';
import { addMedicines, createEmptyMedicineForm } from '@/mocks/medicines';
import type { MedicineForm, MedicineFormState } from '@/types/medicine';
import { formatDateTime } from '@/utils/date';
import { isMedicineFormValid, trimMedicineForm } from '@/utils/medicineForm';

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

  const handleSubmit = () => {
    if (!isValid) return;

    // 선택한 약만 등록 요청에 포함
    addMedicines(
      state.seniorId,
      drafts.map(({ form }) => trimMedicineForm(form)),
      state.mode === 'recognized' ? state.prescription : null
    );
    // 이동하기 전에 완료 표시 (등록 처리 중 다시 렌더링되어도 이동과 엇갈리지 않도록 state를 바꾸지 않음)
    completedKeys.add(location.key);
    // 약 등록 흐름(방법 선택 → AI 인식 결과 → 입력)을 기록에서 되돌려 시작 화면으로 이동
    // → 등록 후 뒤로가기로 입력 화면에 다시 들어가 중복 등록하는 것을 방지
    // (인식 결과 다시 올리기·약 선택은 replace라 기록이 늘지 않음)
    navigate(isManual ? -2 : -3);
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

      <div className="z-10 flex shrink-0 gap-3 border-t border-[#E5E8EB] bg-white px-5 pt-4 pb-10">
        <div className="w-29.25 shrink-0">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            취소
          </Button>
        </div>
        <div className="min-w-0 flex-1">
          <Button disabled={!isValid} onClick={handleSubmit}>
            {count}개 등록하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MedicineInfoFormPage;
