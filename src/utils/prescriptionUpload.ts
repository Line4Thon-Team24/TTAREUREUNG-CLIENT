export type UploadSource = 'gallery' | 'file' | 'camera';

// 약 등록 방법 선택 → AI 인식 결과 화면으로 넘기는 값
export type RecognitionState = {
  seniorId: number;
  source: UploadSource;
  fileName: string;
  imageUrl: string | null; // PDF는 미리보기 없음
};

// 업로드 방식별 파일 선택창 설정
export const UPLOAD_ACCEPT: Record<UploadSource, string> = {
  gallery: 'image/*',
  file: 'image/*,application/pdf',
  camera: 'image/*',
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
