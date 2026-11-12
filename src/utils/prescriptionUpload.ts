export type UploadSource = 'gallery' | 'file' | 'camera';

// 약 등록 방법 선택 → AI 인식 결과 화면으로 넘기는 값
export type RecognitionState = {
  seniorId: number;
  source: UploadSource;
  fileName: string;
  imageUrl: string | null; // PDF는 미리보기 없음
  selectedIds?: string[]; // 선택한 약 ID (뒤로 돌아왔을 때 선택 유지)
};

// 업로드 방식별 파일 선택창 설정
export const UPLOAD_ACCEPT: Record<UploadSource, string> = {
  gallery: 'image/*',
  file: 'image/*,application/pdf',
  camera: 'image/*',
};

// 글씨 인식이 가능한 최소 사진 크기 (짧은 쪽 기준, px)
const MIN_IMAGE_SIZE = 500;

// 인식 화면으로 넘기기 전 파일 검사 (문제가 있으면 안내 문구, 없으면 null)
// 파일 형식(MIME)만 믿지 않고 실제로 사진을 읽어서 크기까지 확인
export const validatePrescriptionFile = async (
  file: File
): Promise<string | null> => {
  if (file.type === 'application/pdf') return null;
  // SVG는 처방전 사진이 아니고 스크립트를 담을 수 있어 제외
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return '사진 또는 PDF 파일만 올릴 수 있어요.';
  }

  try {
    const bitmap = await createImageBitmap(file);
    const shortSide = Math.min(bitmap.width, bitmap.height);
    bitmap.close();

    if (shortSide < MIN_IMAGE_SIZE) {
      return '사진이 너무 작아 글씨를 읽기 어려워요. 처방전이 잘 보이도록 다시 촬영하거나 다른 사진을 선택해주세요.';
    }
    return null;
  } catch {
    return '사진을 읽을 수 없어요. 다른 사진을 다시 선택해주세요.';
  }
};

// 더 이상 쓰지 않는 미리보기 주소 해제 (메모리 정리)
export const revokePreviewUrl = (state: RecognitionState) => {
  if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
};

// 선택한 파일을 다음 화면으로 넘길 값으로 변환
export const toRecognitionState = (
  seniorId: number,
  source: UploadSource,
  file: File
): RecognitionState => ({
  seniorId,
  source,
  fileName: file.name,
  // API 연동 전에는 미리보기 주소만 넘김
  imageUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
});
