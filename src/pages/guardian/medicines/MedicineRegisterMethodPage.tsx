import { useRef, useState, type ChangeEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Camera,
  CalendarCheck,
  FolderOpen,
  Images,
  Lightbulb,
} from 'lucide-react';
import BackHeader from '@/components/common/BackHeader';
import BrandBadge from '@/components/common/BrandBadge';
import MethodOptionCard from '@/components/medicines/MethodOptionCard';
import UploadErrorMessage from '@/components/medicines/UploadErrorMessage';
import useLatestRequest from '@/hooks/useLatestRequest';
import {
  toRecognitionState,
  UPLOAD_ACCEPT,
  validatePrescriptionFile,
  type UploadSource,
} from '@/utils/prescriptionUpload';

const MedicineRegisterMethodPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const seniorId = (location.state as { seniorId?: number } | null)?.seniorId;

  const galleryRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const startRequest = useLatestRequest();

  // 어떤 시니어의 약인지 모르면 등록할 수 없으므로 복용 일정으로 이동
  if (seniorId === undefined) {
    return <Navigate to="/schedule" replace />;
  }

  const handleFile =
    (source: UploadSource) => async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ''; // 같은 파일을 다시 골라도 동작하도록 초기화
      if (!file) return;

      // 인식이 어려운 사진이면 이동하지 않고 다시 선택하도록 안내
      const isLatest = startRequest();
      const errorMessage = await validatePrescriptionFile(file);
      // 검사 중 화면을 떠났거나 다른 파일을 다시 골랐으면 이전 결과는 무시
      if (!isLatest()) return;

      setUploadError(errorMessage);
      if (errorMessage) return;

      navigate('/medicines/register/recognition', {
        state: toRecognitionState(seniorId, source, file),
      });
    };

  return (
    <div className="flex min-h-dvh flex-col">
      <BackHeader />

      <div className="flex flex-1 flex-col justify-between gap-8 px-5 pt-8 pb-10">
        <section className="flex flex-col items-start gap-4">
          <BrandBadge label="따르릉 AI 자동 인식" />
          <div className="flex flex-col gap-2">
            <h1 className="text-[22px] font-bold text-[#191F28]">
              시니어의 약 정보를
              <br />
              등록할 방법을 선택해주세요
            </h1>
            <p className="text-[14px] text-[#333D4B]">
              처방전이나 약봉투를 등록하시면 AI가 약 정보와 정확한 복용 일정을
              알아서 정리해 드립니다.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <MethodOptionCard
              icon={<Images size={24} aria-hidden />}
              title="갤러리에서 불러오기"
              description="촬영해 둔 처방전 및 약봉투 사진"
              recommended
              onClick={() => galleryRef.current?.click()}
            />
            <MethodOptionCard
              icon={<FolderOpen size={24} aria-hidden />}
              title="파일 업로드"
              description="전자 처방전, 병원 진료 영수증 (PDF, JPG)"
              onClick={() => fileRef.current?.click()}
            />
            <MethodOptionCard
              icon={<Camera size={24} aria-hidden />}
              title="카메라로 바로 촬영"
              description="지금 가지고 있는 약 또는 처방전 찍기"
              onClick={() => cameraRef.current?.click()}
            />
          </div>

          {uploadError && <UploadErrorMessage message={uploadError} />}

          <div className="flex items-start gap-2.5 rounded-xl border border-[#E5E8EB] bg-[#FAFAFA] p-3.75 text-[13px] leading-4.5 text-[#6B7684]">
            <Lightbulb
              size={16}
              aria-hidden
              className="mt-px shrink-0 fill-[#F59E0B] text-[#F59E0B]"
            />
            <p>
              <strong className="font-bold text-[#333D4B]">촬영 팁:</strong>{' '}
              처방전의 전체 내용이 평평하고 빛 반사 없이 잘 보이도록 등록하면
              가장 정확하게 복약 정보를 인식합니다.
            </p>
          </div>
        </section>

        <div className="flex flex-col items-center gap-2">
          <p className="text-[12px] text-[#6B7684]">
            사진이나 서류가 없으신가요?
          </p>
          <button
            type="button"
            onClick={() =>
              navigate('/medicines/register/form', {
                state: { seniorId, mode: 'manual' },
              })
            }
            className="flex items-center gap-1 text-[14px] font-bold text-[#01A16A]"
          >
            직접 약 이름과 시간 입력하기
            <CalendarCheck size={15} strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      </div>

      {/* 각 카드를 누르면 해당 파일 선택창이 열림 */}
      <input
        ref={galleryRef}
        type="file"
        accept={UPLOAD_ACCEPT.gallery}
        hidden
        onChange={handleFile('gallery')}
      />
      <input
        ref={fileRef}
        type="file"
        accept={UPLOAD_ACCEPT.file}
        hidden
        onChange={handleFile('file')}
      />
      {/* capture: 모바일에서 폰 기본 카메라가 바로 열림 */}
      <input
        ref={cameraRef}
        type="file"
        accept={UPLOAD_ACCEPT.camera}
        capture="environment"
        hidden
        onChange={handleFile('camera')}
      />
    </div>
  );
};

export default MedicineRegisterMethodPage;
