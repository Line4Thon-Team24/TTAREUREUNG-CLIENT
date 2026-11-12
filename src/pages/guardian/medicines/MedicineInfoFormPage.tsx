import { Fragment, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Button from '@/components/common/Button';
import StepHeader from '@/components/common/StepHeader';
import MedicineInfoCard from '@/components/medicines/MedicineInfoCard';
import {
  addMedicines,
  createEmptyMedicineForm,
  getRecognizedMedicines,
} from '@/mocks/medicines';
import type { MedicineForm } from '@/types/medicine';
import { formatDateTime } from '@/utils/date';
import { isMedicineFormValid } from '@/utils/medicineForm';

// recognized: AI 인식 결과로 자동 입력 / manual: 직접 입력
type FormState = { seniorId: number; mode: 'recognized' | 'manual' };

const MedicineInfoFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as FormState | null;
  const isManual = state?.mode === 'manual';

  const [forms, setForms] = useState<MedicineForm[]>(() =>
    isManual
      ? [createEmptyMedicineForm()]
      : getRecognizedMedicines().map(({ form }) => form)
  );
  const [registeredAt] = useState(() => formatDateTime(new Date()));

  // 이전 단계를 거치지 않고 주소로 바로 들어온 경우 복용 일정으로 이동
  if (!state) {
    return <Navigate to="/schedule" replace />;
  }

  const isValid = forms.every((form) => isMedicineFormValid(form, isManual));

  const updateForm = (index: number, next: MedicineForm) => {
    setForms((prev) => prev.map((form, i) => (i === index ? next : form)));
  };

  const handleSubmit = () => {
    if (!isValid) return;

    addMedicines(
      state.seniorId,
      forms.map((form) => ({
        ...form,
        name: form.name.trim(),
        displayName: form.displayName.trim(),
        storageLocation: form.storageLocation.trim(),
      }))
    );
    navigate('/schedule', { replace: true });
  };

  return (
    <div className="flex h-dvh flex-col">
      <StepHeader
        title="새로운 약 정보"
        subtitle={
          isManual
            ? '약 정보를 직접 입력해주세요'
            : `총 ${forms.length}개 감지 및 자동 변환 완료`
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
          {forms.map((form, index) => (
            <Fragment key={index}>
              {index > 0 && <hr className="border-[#E5E8EB]" />}
              <MedicineInfoCard
                index={index}
                value={form}
                onChange={(next) => updateForm(index, next)}
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
            {forms.length}개 등록하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MedicineInfoFormPage;
