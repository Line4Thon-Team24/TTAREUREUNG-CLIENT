// 약 하나의 복용 상태
export type DoseStatus = 'taken' | 'missed' | 'taking' | 'scheduled';

// 시간대 복용 상태
export type SlotStatus = DoseStatus | 'partial';

// 복용 시간대
export type MealTime = 'morning' | 'lunch' | 'dinner';

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
  medicines: ScheduleMedicine[];
};
