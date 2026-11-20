// 약 하나의 복용 상태
export type DoseStatus = 'taken' | 'missed' | 'taking' | 'scheduled';

// 시간대 복용 상태
export type SlotStatus = DoseStatus | 'partial';

// 복용 시간대
export type MealTime = 'morning' | 'lunch' | 'dinner' | 'night';

// 약 모양 (카드 아이콘)
export type MedicineShape = 'capsule' | 'tablet' | 'powder';

// 복약 카드 데이터
export type ScheduleMedicine = {
  id: string; // 일정 내 고유 ID
  medicineId: number; // 상세 조회용 약 ID
  displayName: string; // 예: 혈압약 (노바스크)
  dosage: string; // 예: 5mg
  amount: string; // 예: 1정
  shape: MedicineShape;
  imageUrl: string | null;
  status: DoseStatus;
};

// 타임라인 한 칸
export type ScheduleSlot = {
  id: string;
  mealTime: MealTime;
  time: string; // HH:mm
  timingLabel: string; // 예: 아침 식후
  callConfirmedAt?: string; // 복용 확인 전화 받은 시각 (HH:mm)
  medicines: ScheduleMedicine[];
};

// 복용 회차 (API 값)
export type TimeSlot = 'MORNING' | 'LUNCH' | 'DINNER' | 'BEFORE_SLEEP';

// 회차별 시각 (HH:mm)
export type DoseTimes = Record<TimeSlot, string>;

// 날짜별 복용 일정 API 응답
export type ScheduleResponse = {
  date: string;
  today: boolean;
  takenCount: number;
  totalCount: number;
  sessions: {
    sessionId: number | null;
    timeSlot: 'MORNING' | 'LUNCH' | 'DINNER' | 'BEFORE_SLEEP';
    slotName: string;
    doseTime: string; // HH:mm
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'PARTIAL' | 'MISSED';
    answeredAt: string | null;
    medications: {
      medicationId: number;
      name: string;
      strength: string | null;
      doseAmount: string | null;
      imageUrl: string | null;
      status: 'PENDING' | 'TAKEN' | 'MISSED';
    }[];
  }[];
};
