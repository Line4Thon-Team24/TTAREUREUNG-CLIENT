// 복용 간격
export type DoseInterval = 'daily' | 'everyOtherDay' | 'weekly';

// 복용 시점 (식사 기준)
export type DoseTiming = 'beforeMeal' | 'afterMeal' | 'withMeal' | 'bedtime';

export type Medicine = {
  id: number;
  seniorId: number;
  name: string; // 처방 약품명 (예: 아서로신정)
  category: string; // 약 종류 (예: 소염진통제)
  displayName: string; // 시니어에게 보여주고 음성으로 안내할 쉬운 이름
  storageLocation: string; // 약 보관 위치
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  interval: DoseInterval;
  timesPerDay: number; // 하루 복용 횟수 (1~3)
  timing: DoseTiming;
};

export type MedicineForm = Omit<Medicine, 'id' | 'seniorId'>;

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
  | { seniorId: number; mode: 'recognized'; medicines: RecognizedMedicine[] }
  | { seniorId: number; mode: 'manual' };
