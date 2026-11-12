import { useRef, useState, type ChangeEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { CircleCheck, RefreshCw } from 'lucide-react';
import Button from '@/components/common/Button';
import StepHeader from '@/components/common/StepHeader';
import PrescriptionViewer from '@/components/medicines/PrescriptionViewer';
import RecognizedMedicineList from '@/components/medicines/RecognizedMedicineList';
import UploadErrorMessage from '@/components/medicines/UploadErrorMessage';
import {
  getRecognizedMedicines,
  RECOGNITION_CONFIDENCE,
  RECOGNIZED_AREAS,
} from '@/mocks/medicines';
import type { MedicineFormState } from '@/types/medicine';
import {
  revokePreviewUrl,
  toRecognitionState,
  UPLOAD_ACCEPT,
  validatePrescriptionFile,
  type RecognitionState,
} from '@/utils/prescriptionUpload';

const MedicineRecognitionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as RecognitionState | null;

  const [medicines] = useState(getRecognizedMedicines);
  const reuploadRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 업로드를 거치지 않고 주소로 바로 들어온 경우 복용 일정으로 이동
  if (!state) {
    return <Navigate to="/schedule" replace />;
  }

  const isCamera = state.source === 'camera';

  // 선택 상태를 현재 화면의 history state에 저장 → 다음 화면에서 뒤로 와도 유지
  const selectedIds = state.selectedIds ?? [];
  const selectedMedicines = medicines.filter(({ id }) =>
    selectedIds.includes(id)
  );

  // 이미 선택된 약을 다시 누르면 선택 해제
  const toggleMedicine = (id: string) => {
    const nextIds = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];

    navigate(location.pathname, {
      replace: true,
      state: { ...state, selectedIds: nextIds },
    });
  };

  // 같은 방식으로 다시 올리면 현재 화면의 사진만 교체
  const handleReupload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    // 인식이 어려운 사진이면 기존 사진을 유지하고 다시 선택하도록 안내
    const errorMessage = await validatePrescriptionFile(file);
    setUploadError(errorMessage);
    if (errorMessage) return;

    // 교체되어 더 이상 쓰지 않는 이전 사진의 미리보기 주소 해제
    revokePreviewUrl(state);
    navigate(location.pathname, {
      replace: true,
      state: toRecognitionState(state.seniorId, state.source, file),
    });
  };

  return (
    <div className="flex h-dvh flex-col">
      <StepHeader
        title="따르릉 AI 자동 인식"
        subtitle="AI 처방전 자동 분석 단계"
        status="인식 완료"
      />

      {/* 본문만 스크롤, 마지막 항목이 하단 버튼에 가리지 않도록 아래 여백 확보 */}
      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-[#F6F8F7] px-5 pt-5 pb-8">
        <div className="flex items-start gap-3 rounded-2xl border border-[#E5E8EB] bg-white p-3.75 drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#E7F6EC] text-[#01A16A]"
            aria-hidden
          >
            <CircleCheck size={16} strokeWidth={2.5} />
          </span>
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-bold text-[#191F28]">
              녹색 영역 속 글씨가 자동 추출되었습니다
            </p>
            <p className="text-[12px] text-[#6B7684]">
              인식된 글씨 영역을 터치하거나, 하단 목록에서 내용을 확인할 수
              있어요.
            </p>
          </div>
        </div>

        {uploadError && <UploadErrorMessage message={uploadError} />}

        <PrescriptionViewer
          fileName={state.fileName}
          imageUrl={state.imageUrl}
          confidence={RECOGNITION_CONFIDENCE}
          areas={RECOGNIZED_AREAS}
        />

        <RecognizedMedicineList
          medicines={medicines}
          selectedIds={selectedIds}
          onToggle={toggleMedicine}
        />
      </main>

      <div className="z-10 flex shrink-0 gap-3 border-t border-[#E5E8EB] bg-white px-5 pt-4 pb-10">
        <div className="w-29.25 shrink-0">
          <Button
            variant="secondary"
            onClick={() => reuploadRef.current?.click()}
          >
            <RefreshCw size={16} strokeWidth={2.5} aria-hidden />
            {isCamera ? '재촬영' : '재업로드'}
          </Button>
        </div>
        <div className="min-w-0 flex-1">
          {/* 선택한 약이 없으면 비활성, 선택한 약만 다음 화면으로 전달 */}
          <Button
            disabled={selectedMedicines.length === 0}
            onClick={() =>
              navigate('/medicines/register/form', {
                state: {
                  seniorId: state.seniorId,
                  mode: 'recognized',
                  medicines: selectedMedicines,
                } satisfies MedicineFormState,
              })
            }
          >
            다음
          </Button>
        </div>
      </div>

      <input
        ref={reuploadRef}
        type="file"
        accept={UPLOAD_ACCEPT[state.source]}
        capture={isCamera ? 'environment' : undefined}
        hidden
        onChange={handleReupload}
      />
    </div>
  );
};

export default MedicineRecognitionPage;
