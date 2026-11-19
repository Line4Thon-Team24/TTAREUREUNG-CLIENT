import type { ApiError } from '@/types/api';
import type { PrescriptionAnalysis, RegisterFlow } from '@/types/medicine';

export type UploadSource = 'gallery' | 'file' | 'camera';

// 약 등록 방법 선택 → AI 인식 결과 화면으로 넘기는 값
export type RecognitionState = RegisterFlow & {
  source: UploadSource;
  fileName: string;
  imageUrl: string | null; // PDF는 미리보기 없음
  file?: File; // 업로드·인식에 보낼 파일
  analysis?: PrescriptionAnalysis; // 인식 결과 (뒤로 돌아왔을 때 다시 요청하지 않음)
  selectedIds?: string[]; // 선택한 약 ID (뒤로 돌아왔을 때 선택 유지)
};

// 업로드 방식별 파일 선택창 설정
export const UPLOAD_ACCEPT: Record<UploadSource, string> = {
  gallery: 'image/*',
  file: 'image/*,application/pdf',
  camera: 'image/*',
};

// 서버 응답별 인식 실패 문구 (어두운 사진 등으로 약을 못 찾으면 422)
export const toAnalyzeErrorMessage = (error: ApiError) => {
  switch (error.status) {
    case 422:
      return '처방전에서 약을 찾지 못했어요. 밝은 곳에서 다시 찍거나 직접 입력해주세요.';
    case 415:
      return 'JPG, PNG, WEBP, PDF 파일만 올릴 수 있어요.';
    case 413:
      return '10MB 이하 파일만 올릴 수 있어요.';
    default:
      return '처방전을 읽지 못했어요. 다시 올리거나 직접 입력해주세요.';
  }
};

// 만든 미리보기 주소 (쌓으며 이동할 때 한꺼번에 해제)
const previewUrls = new Set<string>();

// 지금 화면이 쓰는 주소만 남기고 해제 (메모리 정리, 등록된 약은 서버 사진 주소를 씀)
// → 쌓으며 이동하면 앞쪽 기록이 지워져서, 해제한 주소로 다시 들어갈 수 없음
export const releasePreviewUrls = (keep: string | null) => {
  for (const url of previewUrls) {
    if (url === keep) continue;
    URL.revokeObjectURL(url);
    previewUrls.delete(url);
  }
};

const createPreviewUrl = (file: File) => {
  const url = URL.createObjectURL(file);
  previewUrls.add(url);
  return url;
};

// 선택한 파일을 다음 화면으로 넘길 값으로 변환
export const toRecognitionState = (
  { seniorId, replaceMedicineId, extraBackSteps }: RegisterFlow,
  source: UploadSource,
  file: File
): RecognitionState => ({
  seniorId,
  replaceMedicineId,
  extraBackSteps,
  source,
  fileName: file.name,
  imageUrl: file.type.startsWith('image/') ? createPreviewUrl(file) : null,
  file,
});
