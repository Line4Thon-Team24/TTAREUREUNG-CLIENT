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
  timing: DoseTiming;
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
};

// 약 정보 입력 화면으로 넘기는 값
// recognized: AI 인식 결과 중 선택한 약만 전달 / manual: 직접 입력
export type MedicineFormState =
  | {
      seniorId: number;
      mode: 'recognized';
      medicines: RecognizedMedicine[];
      prescription: Prescription;
    }
  | { seniorId: number; mode: 'manual' };
