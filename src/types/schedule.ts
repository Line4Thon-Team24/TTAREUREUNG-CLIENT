// 약 하나의 복용 상태
export type DoseStatus = 'taken' | 'missed' | 'taking' | 'scheduled';

// 시간대 전체의 복용 상태 (먹은 약과 안 먹은 약이 섞이면 일부 복용)
export type SlotStatus = DoseStatus | 'partial';

// 복용 시간대
export type MealTime = 'morning' | 'lunch' | 'dinner' | 'night';

// 약 모양 (카드 왼쪽 위 아이콘)
export type MedicineShape = 'capsule' | 'tablet' | 'powder';

// 복용 일정 카드에 보여줄 약
export type ScheduleMedicine = {
  id: string; // 일정 안에서의 고유 ID (같은 약이 여러 시간대에 나올 수 있음)
  medicineId: number; // 약 상세 팝업에서 조회할 약 ID
  displayName: string; // 예: 혈압약 (노바스크)
  dosage: string; // 용량 (예: 5mg)
  amount: string; // 한 번에 먹는 양 (예: 1정)
  shape: MedicineShape;
  imageUrl: string | null;
  status: DoseStatus;
};

// 복용 시간대 하나 (타임라인의 한 칸)
export type ScheduleSlot = {
  id: string;
  mealTime: MealTime;
  time: string; // HH:mm
  timingLabel: string; // 시간 뒤에 붙는 안내 (예: 아침 식후)
  medicines: ScheduleMedicine[];
};
