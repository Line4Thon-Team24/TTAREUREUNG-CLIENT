import { useEffect, useState } from 'react';
import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { fetchMedicines, updateMedicine } from '@/apis/medicine';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';
import StepHeader from '@/components/common/StepHeader';
import MedicineInfoCard from '@/components/medicines/MedicineInfoCard';
import PrescriptionSummary from '@/components/medicines/PrescriptionSummary';
import useGoBack from '@/hooks/useGoBack';
import useLatestRequest from '@/hooks/useLatestRequest';
import type { ApiError } from '@/types/api';
import type { Medicine, MedicineForm, RegisterFlow } from '@/types/medicine';
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

// 약이 바뀌면 이전 상태가 남지 않도록 새로 그림
const MedicineEditPage = () => {
  const { medicineId } = useParams();
  const [searchParams] = useSearchParams();
  const seniorId = searchParams.get('seniorId');
  return (
    <MedicineEditContent
      key={`${seniorId}/${medicineId}`}
      medicineId={Number(medicineId)}
      seniorId={Number(seniorId)}
    />
  );
};

const MedicineEditContent = ({
  medicineId,
  seniorId,
}: {
  medicineId: number;
  seniorId: number;
}) => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const startRequest = useLatestRequest();

  // null이면 불러오는 중 (약 단건 조회 API가 없어 시니어의 약 목록에서 찾음)
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [form, setForm] = useState<MedicineForm | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLoadError, setIsLoadError] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>(null);
  const [leaveTarget, setLeaveTarget] = useState<LeaveTarget>('back');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitError, setIsSubmitError] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetchMedicines(seniorId)
      .then((medicines) => {
        if (ignore) return;
        const found = medicines.find(({ id }) => id === medicineId);
        if (!found) {
          setIsNotFound(true);
          return;
        }
        setMedicine(found);
        setForm(toMedicineForm(found));
      })
      .catch((error: ApiError) => {
        if (ignore) return;
        // 없는 시니어(404)·잘못된 주소(400)면 약 목록으로
        if (error.status === 404 || error.status === 400) setIsNotFound(true);
        else setIsLoadError(true);
      });
    return () => {
      ignore = true;
    };
  }, [seniorId, medicineId]);

  // 없는 약이면 약 목록으로 이동
  if (isNotFound) {
    return <Navigate to="/medicines" replace />;
  }

  if (!medicine || !form) {
    return (
      <div className="flex h-dvh flex-col">
        <StepHeader
          title="약 정보 수정"
          onBack={() => goBack(`/medicines?seniorId=${seniorId}`)}
        />
        {isLoadError && (
          <p className="pt-20 text-center text-[14px] text-[#6B7684]">
            약 정보를 불러오지 못했어요.
          </p>
        )}
      </div>
    );
  }

  const isManual = medicine.source === 'manual';
  const isChanged = isMedicineFormChanged(toMedicineForm(medicine), form);
  const canSubmit = isChanged && isMedicineFormValid(form, isManual);

  const leave = (target: LeaveTarget) => {
    if (target === 'back') {
      goBack(`/medicines?seniorId=${medicine.seniorId}`);
    } else {
      // 등록을 마치면 이 약을 새 정보로 교체하고, 수정 화면은 건너뛰어 목록으로
      navigate('/medicines/register', {
        state: {
          seniorId: medicine.seniorId,
          replaceMedicineId: medicine.id,
          extraBackSteps: 1,
        } satisfies RegisterFlow,
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

  // 저장 중에는 이동을 막음 (저장이 계속 진행되므로)
  const handleCancel = () => {
    if (!isSubmitting) requestLeave('back');
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const isLatest = startRequest();
    setModalStep(null);
    setIsSubmitting(true);
    setIsSubmitError(false);
    try {
      await updateMedicine(medicine.id, trimMedicineForm(form));
      // 화면을 떠났으면 이동하지 않음
      if (!isLatest()) return;
      goBack(`/medicines?seniorId=${medicine.seniorId}`);
    } catch {
      if (!isLatest()) return;
      setIsSubmitError(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col">
      <StepHeader title="약 정보 수정" onBack={handleCancel} />

      {/* 본문만 스크롤, 마지막 항목이 하단 버튼에 가리지 않도록 아래 여백 확보 */}
      <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pt-8 pb-12">
        <PrescriptionSummary
          prescription={medicine.prescription}
          onReRegister={() => !isSubmitting && requestLeave('reRegister')}
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

      {isSubmitError && (
        <p
          role="alert"
          className="shrink-0 border-t border-[#E5E8EB] bg-white px-5 pt-4 text-center text-[13px] text-[#E5484D]"
        >
          약 정보 수정에 실패했어요. 다시 시도해주세요.
        </p>
      )}
      <div className="z-10 flex shrink-0 gap-3 border-t border-[#E5E8EB] bg-white px-5 pt-4 pb-10">
        <div className="w-29.25 shrink-0">
          <Button variant="secondary" onClick={handleCancel}>
            취소
          </Button>
        </div>
        <div className="min-w-0 flex-1">
          <Button
            disabled={!canSubmit || isSubmitting}
            onClick={() => setModalStep('doctor')}
          >
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
