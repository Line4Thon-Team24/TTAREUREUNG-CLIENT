import { apiClient } from '@/apis/client';
import type { BaseResponse } from '@/types/api';
import type {
  DoseInterval,
  DoseTiming,
  Medicine,
  MedicationItemResponse,
} from '@/types/medicine';

// 복용 간격 일수 → 화면 값 (없으면 매일)
const INTERVAL_FROM_DAYS: Record<number, DoseInterval> = {
  1: 'daily',
  2: 'everyOtherDay',
  7: 'weekly',
};

const TIMING_FROM_API: Record<
  NonNullable<MedicationItemResponse['intake_timing']>,
  DoseTiming
> = {
  BEFORE_MEAL_30M: 'beforeMeal',
  AFTER_MEAL_30M: 'afterMeal',
  RIGHT_AFTER_MEAL: 'withMeal',
  BEFORE_BED: 'bedtime',
};

// 약 목록 응답 → 화면용 약
const toMedicine = (
  item: MedicationItemResponse,
  seniorId: number
): Medicine => ({
  id: item.medication_id,
  seniorId,
  source: item.registration_type === 'AI' ? 'recognized' : 'manual',
  prescription: item.image_url
    ? { fileName: item.prescription_file_name ?? '', imageUrl: item.image_url }
    : null,
  registeredAt: item.created_at,
  name: item.drug_name,
  category: item.category ?? '',
  effect: item.effect ?? '',
  reason: item.intake_reason ?? '',
  displayName: item.custom_drug_name ?? '',
  storageLocation: item.storage_location ?? '',
  startDate: item.start_date,
  endDate: item.end_date,
  interval: INTERVAL_FROM_DAYS[item.interval_days ?? 1] ?? 'daily',
  timesPerDay: item.meal_time_slots.length,
  timing: item.intake_timing ? TIMING_FROM_API[item.intake_timing] : null,
});

// 시니어의 약 목록 조회
export const fetchMedicines = async (seniorId: number) => {
  const { data } = await apiClient.get<
    BaseResponse<{ medications: MedicationItemResponse[] }>
  >('/medications', { params: { senior_id: seniorId } });
  return data.data.medications.map((item) => toMedicine(item, seniorId));
};
