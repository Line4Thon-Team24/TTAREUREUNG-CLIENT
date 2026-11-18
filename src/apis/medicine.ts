import { apiClient } from '@/apis/client';
import type { BaseResponse } from '@/types/api';
import type {
  DoseInterval,
  DoseTiming,
  Medicine,
  MedicationItemResponse,
  MedicineSummary,
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

// 시니어별 약 요약 (시니어 id → 등록 여부·복용 중인 약 개수)
export const fetchMedicineSummaries = async (seniorIds: number[]) => {
  const { data } = await apiClient.get<
    BaseResponse<{
      seniors: {
        senior_id: number;
        registered: boolean;
        medication_count: number;
      }[];
    }>
  >('/medications/summary', {
    params: { senior_ids: seniorIds.join(',') },
  });
  return Object.fromEntries(
    data.data.seniors.map((item): [number, MedicineSummary] => [
      item.senior_id,
      { registered: item.registered, count: item.medication_count },
    ])
  );
};

// 약 일괄 삭제 (하나라도 실패하면 전체가 삭제되지 않음)
export const deleteMedicines = async (medicineIds: number[]) => {
  await apiClient.delete('/medications', {
    // 서버가 받는 형식: medication_ids=1,2,3
    params: { medication_ids: medicineIds.join(',') },
  });
};
