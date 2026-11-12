import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';
import StepHeader from '@/components/common/StepHeader';
import MedicineInfoCard from '@/components/medicines/MedicineInfoCard';
import PrescriptionSummary from '@/components/medicines/PrescriptionSummary';
import { getMedicine, updateMedicine } from '@/mocks/medicines';
import { formatDateTime } from '@/utils/date';
import {
  isMedicineFormChanged,
  isMedicineFormValid,
  toMedicineForm,
  trimMedicineForm,
} from '@/utils/medicineForm';

// 팝업 단계: 수정 전 의사 확인 → 수정 확인 / 변경 내용 버리기 확인
type ModalStep = 'doctor' | 'confirm' | 'discard' | null;

// 변경 내용을 버리고 이동할 곳: 이전 화면 / 약 다시 등록하기
type LeaveTarget = 'back' | 'reRegister';

const MedicineEditPage = () => {
  const navigate = useNavigate();
  const { medicineId } = useParams();

  const [medicine] = useState(() => getMedicine(Number(medicineId)));
  const [form, setForm] = useState(() =>
    medicine ? toMedicineForm(medicine) : null
  );
  const [modalStep, setModalStep] = useState<ModalStep>(null);
  const [leaveTarget, setLeaveTarget] = useState<LeaveTarget>('back');

  // 없는 약이면 약 목록으로 이동
  if (!medicine || !form) {
    return <Navigate to="/medicines" replace />;
  }

  const isManual = medicine.source === 'manual';
  const isChanged = isMedicineFormChanged(toMedicineForm(medicine), form);
  const canSubmit = isChanged && isMedicineFormValid(form, isManual);

  const leave = (target: LeaveTarget) => {
    if (target === 'back') {
      navigate(-1);
    } else {
      navigate('/medicines/register', {
        state: { seniorId: medicine.seniorId },
      });
    }
  };

  // 바꾼 내용이 있으면 버릴지 먼저 확인하고, 확인했을 때만 이동
  const requestLeave = (target: LeaveTarget) => {
    if (isChanged) {
      setLeaveTarget(target);
      setModalStep('discard');
    } else {
      leave(target);
    }
  };

  const handleCancel = () => requestLeave('back');

  const handleSubmit = () => {
    updateMedicine(medicine.id, trimMedicineForm(form));
    setModalStep(null);
    navigate(-1);
  };

  return (
    <div className="flex h-dvh flex-col">
      <StepHeader title="약 정보 수정" onBack={handleCancel} />

      {/* 본문만 스크롤, 마지막 항목이 하단 버튼에 가리지 않도록 아래 여백 확보 */}
      <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pt-8 pb-12">
        <PrescriptionSummary
          prescription={medicine.prescription}
          onReRegister={() => requestLeave('reRegister')}
        />

        <div className="relative flex items-center justify-center py-2">
          <hr className="w-full border-[#E5E8EB]" />
          <span className="absolute bg-white px-3 text-[12px] leading-4 font-medium text-[#B0B8C1]">
            또는 직접 수정
          </span>
        </div>

        <MedicineInfoCard
          index={0}
          numbered={false}
          value={form}
          onChange={setForm}
          registeredAt={formatDateTime(new Date(medicine.registeredAt))}
          isManual={isManual}
        />
      </main>

      <div className="z-10 flex shrink-0 gap-3 border-t border-[#E5E8EB] bg-white px-5 pt-4 pb-10">
        <div className="w-29.25 shrink-0">
          <Button variant="secondary" onClick={handleCancel}>
            취소
          </Button>
        </div>
        <div className="min-w-0 flex-1">
          <Button disabled={!canSubmit} onClick={() => setModalStep('doctor')}>
            수정하기
          </Button>
        </div>
      </div>

      <ConfirmModal
        open={modalStep === 'doctor'}
        message={'담당 의사와 논의 후\n수정해야 합니다.'}
        cancelLabel="논의 안 함"
        confirmLabel="논의함"
        onCancel={() => setModalStep(null)}
        onConfirm={() => setModalStep('confirm')}
      />
      <ConfirmModal
        open={modalStep === 'confirm'}
        message={'약 정보가 수정됩니다.\n정말 수정하시겠습니까?'}
        cancelLabel="취소"
        confirmLabel="수정하기"
        onCancel={() => setModalStep(null)}
        onConfirm={handleSubmit}
      />
      <ConfirmModal
        open={modalStep === 'discard'}
        message={'변경한 내용이 사라집니다.\n그래도 취소하시겠습니까?'}
        cancelLabel="돌아가기"
        confirmLabel="취소하기"
        onCancel={() => setModalStep(null)}
        onConfirm={() => {
          setModalStep(null);
          leave(leaveTarget);
        }}
      />
    </div>
  );
};

export default MedicineEditPage;
