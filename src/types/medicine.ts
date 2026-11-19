// 복용 간격
export type DoseInterval = 'daily' | 'everyOtherDay' | 'weekly';

// 복용 시점 (식사 기준)
export type DoseTiming = 'beforeMeal' | 'afterMeal' | 'withMeal' | 'bedtime';

// 약을 등록할 때 올린 처방전 (직접 입력이면 없음)
export type Prescription = {
  fileName: string;
  imageUrl: string | null; // PDF는 미리보기 없음
};

export type Medicine = {
  id: number;
  seniorId: number;
  source: 'recognized' | 'manual'; // AI 인식으로 등록 / 직접 입력으로 등록
  prescription: Prescription | null;
  registeredAt: string; // 등록 일시 (ISO 문자열)
  name: string; // 처방 약품명 (예: 아서로신정)
  category: string; // 약 종류 (예: 소염진통제)
  effect: string; // 효과 (AI 인식 결과, 직접 입력이면 빈 값)
  reason: string; // 복용 이유 (AI 인식 결과, 직접 입력이면 빈 값)
  displayName: string; // 시니어에게 보여주고 음성으로 안내할 쉬운 이름
  storageLocation: string; // 약 보관 위치
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  interval: DoseInterval;
  timesPerDay: number; // 하루 복용 횟수 (1~3)
  timing: DoseTiming | null; // 미입력이면 null
  doseAmount: string; // 1회 복용량 (예: 1정, 미입력이면 빈 값)
};

// 시니어 카드용 약 요약
export type MedicineSummary = {
  registered: boolean; // 약을 한 번이라도 등록했는지
  count: number; // 복용 중인 약 개수 (종료일이 오늘 이후)
};

// 약 목록 API 응답 항목
export type MedicationItemResponse = {
  medication_id: number;
  drug_name: string;
  custom_drug_name: string | null;
  category: string | null;
  image_url: string | null;
  prescription_file_name: string | null;
  registration_type: 'AI' | 'MANUAL' | null;
  effect: string | null;
  storage_location: string | null;
  dose_amount: string | null;
  intake_reason: string | null;
  interval_days: number | null;
  intake_timing:
    | 'BEFORE_MEAL_30M'
    | 'AFTER_MEAL_30M'
    | 'RIGHT_AFTER_MEAL'
    | 'BEFORE_BED'
    | null;
  meal_time_slots: ('MORNING' | 'LUNCH' | 'DINNER' | 'BEFORE_SLEEP')[];
  start_date: string;
  end_date: string;
  created_at: string;
};

// 입력 화면에서 다루는 값 (등록 시 시스템이 정하는 값 제외)
export type MedicineForm = Omit<
  Medicine,
  'id' | 'seniorId' | 'source' | 'prescription' | 'registeredAt'
>;

// 처방전 사진에서 글씨가 인식된 영역 (사진 기준 % 위치)
export type RecognizedArea = {
  label: string;
  top: number;
  right: number;
  bottom: number;
  left: number;
};

// AI 인식 결과로 감지된 약
export type RecognizedMedicine = {
  id: string; // 인식 결과 내 고유 ID (선택 상태 관리용)
  form: MedicineForm;
  accuracy: number; // 정확도 (%)
  // 입력 화면에 없지만 등록할 때 함께 저장하는 값
  strength?: string | null; // 함량 (예: 5mg)
};

// 처방전 업로드·AI 인식 결과
export type PrescriptionAnalysis = {
  fileKey: string; // 등록 시 image_url로 저장
  confidence: number; // 전체 신뢰도 (%)
  areas: RecognizedArea[];
  medicines: RecognizedMedicine[];
};

// AI 인식 API 응답
type RecognitionRegion = {
  field: string;
  x: number; // 0~1 비율, 왼쪽 위 기준
  y: number;
  width: number;
  height: number;
};

export type RecognitionResponse = {
  file_name: string;
  document_type: string | null;
  document_region: RecognitionRegion | null;
  overall_confidence: number | null;
  medications: {
    drug_name: string | null;
    custom_drug_name: string | null;
    category: string | null;
    strength: string | null;
    effect: string | null;
    intake_reason: string | null;
    storage_location: string | null;
    dose_amount: string | null;
    interval_days: number | null;
    intake_timing: MedicationItemResponse['intake_timing'];
    meal_time_slots: MedicationItemResponse['meal_time_slots'];
    frequency: string | null; // 예: 하루 2회
    confidence: number | null;
    regions: RecognitionRegion[];
  }[];
};

// 약 등록 흐름 전체에 넘기는 값 (방법 선택 → AI 인식 → 입력)
export type RegisterFlow = {
  seniorId: number;
  replaceMedicineId?: number; // 다시 등록하기: 등록 후 삭제할 기존 약
  extraBackSteps?: number; // 등록 후 흐름 시작 화면보다 더 건너뛸 기록 수
};

// 약 정보 입력 화면으로 넘기는 값
// recognized: AI 인식 결과 중 선택한 약만 전달 / manual: 직접 입력
export type MedicineFormState = RegisterFlow &
  (
    | {
        mode: 'recognized';
        medicines: RecognizedMedicine[];
        prescription: Prescription;
        fileKey: string; // 업로드한 처방전 파일 (등록 시 image_url)
      }
    | { mode: 'manual' }
  );
