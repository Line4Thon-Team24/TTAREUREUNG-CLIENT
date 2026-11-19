import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { CircleCheck, RefreshCw } from 'lucide-react';
import { analyzePrescription } from '@/apis/medicine';
import Button from '@/components/common/Button';
import StepHeader from '@/components/common/StepHeader';
import PrescriptionViewer from '@/components/medicines/PrescriptionViewer';
import RecognizedMedicineList from '@/components/medicines/RecognizedMedicineList';
import UploadErrorMessage from '@/components/medicines/UploadErrorMessage';
import useLatestRequest from '@/hooks/useLatestRequest';
import type { ApiError } from '@/types/api';
import type { MedicineFormState } from '@/types/medicine';
import {
  releasePreviewUrls,
  toAnalyzeErrorMessage,
  toRecognitionState,
  UPLOAD_ACCEPT,
  validatePrescriptionFile,
  type RecognitionState,
} from '@/utils/prescriptionUpload';

const MedicineRecognitionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as RecognitionState | null;

  const reuploadRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // 인식 실패 문구 (null이면 실패 아님)
  const [analyzeFailure, setAnalyzeFailure] = useState<string | null>(null);
  const startRequest = useLatestRequest();

  // 인식 결과가 없으면 업로드·인식 요청 (결과는 화면 기록에 저장)
  // 화면을 떠나거나 다른 파일로 바꾸면 이전 요청은 취소
  useEffect(() => {
    if (!state || state.analysis || !state.file) return;
    const controller = new AbortController();
    analyzePrescription(state.file, controller.signal)
      .then((analysis) => {
        if (controller.signal.aborted) return;
        navigate(location.pathname, {
          replace: true,
          state: { ...state, analysis },
        });
      })
      .catch((error: ApiError) => {
        if (!controller.signal.aborted) {
          setAnalyzeFailure(toAnalyzeErrorMessage(error));
        }
      });
    return () => controller.abort();
  }, [state, navigate, location.pathname]);

  // 업로드를 거치지 않고 주소로 바로 들어온 경우 복용 일정으로 이동
  if (!state) {
    return <Navigate to="/schedule" replace />;
  }

  const isCamera = state.source === 'camera';
  const { analysis } = state;
  const medicines = analysis?.medicines ?? [];
  // 새로고침 등으로 파일이 없어져 인식할 수 없는 경우도 실패로 안내
  const isFailed = analyzeFailure !== null || (!analysis && !state.file);
  const isAnalyzing = !analysis && !isFailed;
  const analyzeError = isFailed
    ? (analyzeFailure ??
      '처방전을 읽지 못했어요. 다시 올리거나 직접 입력해주세요.')
    : analysis && medicines.length === 0
      ? '처방전에서 약을 찾지 못했어요. 다시 올리거나 직접 입력해주세요.'
      : null;

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
    const isLatest = startRequest();
    const errorMessage = await validatePrescriptionFile(file);
    // 검사 중 화면을 떠났거나 다른 파일을 다시 골랐으면 이전 결과는 무시
    // (주소 해제·화면 교체도 하지 않음)
    if (!isLatest()) return;

    setUploadError(errorMessage);
    if (errorMessage) return;

    setAnalyzeFailure(null);
    // 이전 사진 주소는 바로 해제하지 않음 (교체 이동은 앞쪽 기록이 남아 앞으로가기로 다시 쓸 수 있음)
    navigate(location.pathname, {
      replace: true,
      state: toRecognitionState(state, state.source, file),
    });
  };

  return (
    <div className="flex h-dvh flex-col">
      <StepHeader
        title="따르릉 AI 자동 인식"
        subtitle="AI 처방전 자동 분석 단계"
        status={analysis ? '인식 완료' : isAnalyzing ? '인식 중' : undefined}
      />

      {/* 본문만 스크롤, 마지막 항목이 하단 버튼에 가리지 않도록 아래 여백 확보 */}
      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-[#F6F8F7] px-5 pt-5 pb-8">
        {medicines.length > 0 && (
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
        )}

        {uploadError && <UploadErrorMessage message={uploadError} />}
        {!uploadError && analyzeError && (
          <UploadErrorMessage message={analyzeError} />
        )}

        <PrescriptionViewer
          fileName={state.fileName}
          imageUrl={state.imageUrl}
          confidence={analysis ? analysis.confidence : null}
          areas={analysis?.areas ?? []}
        />

        {isAnalyzing ? (
          <p className="py-6 text-center text-[14px] text-[#6B7684]">
            AI가 처방전을 읽고 있어요.
          </p>
        ) : (
          medicines.length > 0 && (
            <RecognizedMedicineList
              medicines={medicines}
              selectedIds={selectedIds}
              onToggle={toggleMedicine}
            />
          )
        )}
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
            onClick={() => {
              if (!analysis) return;
              // 앞쪽 기록이 지워지므로 지금 사진 외 미리보기 주소 해제
              releasePreviewUrls(state.imageUrl);
              navigate('/medicines/register/form', {
                state: {
                  seniorId: state.seniorId,
                  replaceMedicineId: state.replaceMedicineId,
                  extraBackSteps: state.extraBackSteps,
                  mode: 'recognized',
                  medicines: selectedMedicines,
                  // 약 목록에서 보여줄 처방전 정보
                  prescription: {
                    fileName: state.fileName,
                    imageUrl: state.imageUrl,
                  },
                  fileKey: analysis.fileKey,
                } satisfies MedicineFormState,
              });
            }}
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
