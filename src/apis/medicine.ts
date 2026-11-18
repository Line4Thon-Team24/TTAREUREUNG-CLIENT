import { apiClient } from '@/apis/client';
import type { BaseResponse } from '@/types/api';
import type {
  DoseInterval,
  DoseTiming,
  Medicine,
  MedicationItemResponse,
  MedicineForm,
  MedicineSummary,
  PrescriptionAnalysis,
  RecognitionResponse,
  RecognizedArea,
} from '@/types/medicine';
import { createEmptyMedicineForm } from '@/utils/medicineForm';

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

const INTERVAL_TO_DAYS: Record<DoseInterval, number> = {
  daily: 1,
  everyOtherDay: 2,
  weekly: 7,
};

const TIMING_TO_API: Record<
  DoseTiming,
  NonNullable<MedicationItemResponse['intake_timing']>
> = {
  beforeMeal: 'BEFORE_MEAL_30M',
  afterMeal: 'AFTER_MEAL_30M',
  withMeal: 'RIGHT_AFTER_MEAL',
  bedtime: 'BEFORE_BED',
};

// 하루 복용 횟수 → 시간대 (취침 전이면 자기 전 하나)
const toMealTimeSlots = (
  form: MedicineForm
): MedicationItemResponse['meal_time_slots'] => {
  if (form.timing === 'bedtime') return ['BEFORE_SLEEP'];
  if (form.timesPerDay >= 3) return ['MORNING', 'LUNCH', 'DINNER'];
  if (form.timesPerDay === 2) return ['MORNING', 'DINNER'];
  return ['MORNING'];
};

// 시간대 → 하루 복용 횟수 (취침 전은 1회, 못 읽었으면 1회, 선택지는 최대 3회)
const toTimesPerDay = (
  slots: MedicationItemResponse['meal_time_slots'],
  timing: MedicationItemResponse['intake_timing']
) => (timing === 'BEFORE_BED' ? 1 : Math.min(Math.max(slots.length, 1), 3));

// 화면 입력값 → 약 등록·수정 요청 (빈 값은 보내지 않음)
const toMedicationRequest = (form: MedicineForm) => ({
  drug_name: form.name,
  custom_drug_name: form.displayName || undefined,
  category: form.category || undefined,
  effect: form.effect || undefined,
  intake_reason: form.reason || undefined,
  storage_location: form.storageLocation,
  start_date: form.startDate,
  end_date: form.endDate,
  cycle_type: 'DAILY',
  interval_days: INTERVAL_TO_DAYS[form.interval],
  intake_timing: form.timing ? TIMING_TO_API[form.timing] : undefined,
  meal_time_slots: toMealTimeSlots(form),
  dose_amount: form.doseAmount || undefined,
});

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
  timesPerDay: toTimesPerDay(item.meal_time_slots, item.intake_timing),
  timing: item.intake_timing ? TIMING_FROM_API[item.intake_timing] : null,
  doseAmount: item.dose_amount ?? '',
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

// 처방전 파일 업로드 (등록 시 image_url로 쓸 fileKey 반환)
const uploadPrescriptionFile = async (file: File, signal?: AbortSignal) => {
  const body = new FormData();
  body.append('file', file);
  const { data } = await apiClient.post<BaseResponse<{ fileKey: string }>>(
    '/files',
    body,
    { signal }
  );
  return data.data.fileKey;
};

const REGION_LABELS: Record<string, string> = {
  DRUG_NAME: '약품명',
  INTAKE_METHOD: '복용법',
  FREQUENCY: '복용 횟수',
};

type Region = NonNullable<RecognitionResponse['document_region']>;

// 0~1 비율 위치 → 사진 기준 % 위치
const toArea = (label: string, region: Region): RecognizedArea => ({
  label,
  top: region.y * 100,
  left: region.x * 100,
  right: (1 - region.x - region.width) * 100,
  bottom: (1 - region.y - region.height) * 100,
});

// 인식 응답 → 화면용 결과 (복용 기간은 인식되지 않아 오늘부터 일주일)
const toAnalysis = (
  response: RecognitionResponse,
  fileKey: string
): PrescriptionAnalysis => {
  const base = createEmptyMedicineForm();
  const areas = [
    ...(response.document_region
      ? [toArea('문서유형', response.document_region)]
      : []),
    ...response.medications.flatMap(({ regions }) =>
      regions.map((region) =>
        toArea(REGION_LABELS[region.field] ?? region.field, region)
      )
    ),
  ];

  return {
    fileKey,
    confidence: response.overall_confidence ?? 0,
    areas,
    // 약 이름을 못 읽은 약은 이름을 고칠 수 없어 등록이 안 되므로 제외
    medicines: response.medications
      .filter((item) => item.drug_name?.trim())
      .map((item, index) => ({
        id: `rx-${index + 1}`,
        accuracy: item.confidence ?? 0,
        strength: item.strength,
        form: {
          ...base,
          name: item.drug_name ?? '',
          category: item.category ?? '',
          effect: item.effect ?? '',
          reason: item.intake_reason ?? '',
          displayName: item.custom_drug_name ?? '',
          storageLocation: item.storage_location ?? '',
          interval: INTERVAL_FROM_DAYS[item.interval_days ?? 1] ?? 'daily',
          timesPerDay: toTimesPerDay(item.meal_time_slots, item.intake_timing),
          timing: item.intake_timing
            ? TIMING_FROM_API[item.intake_timing]
            : null,
          doseAmount: item.dose_amount ?? '',
        },
      })),
  };
};

// 처방전 업로드와 AI 인식을 함께 요청 (둘 중 하나라도 실패하면 실패)
// signal: 화면을 떠나면 요청 취소
export const analyzePrescription = async (file: File, signal?: AbortSignal) => {
  const recognize = async () => {
    const body = new FormData();
    body.append('file', file);
    const { data } = await apiClient.post<BaseResponse<RecognitionResponse>>(
      '/medications/recognition',
      body,
      { signal }
    );
    return data.data;
  };
  const [fileKey, response] = await Promise.all([
    uploadPrescriptionFile(file, signal),
    recognize(),
  ]);
  return toAnalysis(response, fileKey);
};

// AI 인식으로 등록할 약 (입력값 + 인식 결과에만 있는 값)
export type RecognizedMedicineRequest = {
  form: MedicineForm;
  strength?: string | null;
};

// AI 인식 약 일괄 등록 (처방전 파일과 함께 저장, 등록된 약 id 반환)
export const createRecognizedMedicines = async (
  seniorId: number,
  medicines: RecognizedMedicineRequest[],
  prescription: { fileKey: string; fileName: string }
) => {
  const { data } = await apiClient.post<
    BaseResponse<{ medication_ids: number[] }>
  >('/medications/bulk', {
    senior_profile_id: seniorId,
    medications: medicines.map(({ form, strength }) => ({
      ...toMedicationRequest(form),
      strength: strength || undefined,
      image_url: prescription.fileKey,
      prescription_file_name: prescription.fileName,
      registration_type: 'AI',
      // 서버 알림 로직에서 쓰지 않는 값이라 계정 기본값과 같이 켜 둠
      notify_on_miss: true,
    })),
  });
  return data.data.medication_ids;
};

// 직접 입력한 약 등록 (등록된 약 id 반환)
export const createMedicine = async (seniorId: number, form: MedicineForm) => {
  const { data } = await apiClient.post<
    BaseResponse<{ medication_id: number }>
  >('/medications', {
    senior_profile_id: seniorId,
    ...toMedicationRequest(form),
    registration_type: 'MANUAL',
    notify_on_miss: true,
  });
  return data.data.medication_id;
};

// 약 정보 수정 (지운 항목도 반영되도록 선택 항목은 빈 값 그대로 보냄)
// 횟수·시점·간격을 바꾸지 않았으면 시간대·간격은 보내지 않음
// → 서버의 기존 값을 유지 (다르게 보내면 오늘 이후 복용 기록이 다시 만들어짐)
export const updateMedicine = async (
  medicineId: number,
  form: MedicineForm,
  before: MedicineForm
) => {
  const isSlotChanged =
    form.timesPerDay !== before.timesPerDay || form.timing !== before.timing;
  const isIntervalChanged = form.interval !== before.interval;
  await apiClient.put(`/medications/${medicineId}`, {
    ...toMedicationRequest(form),
    custom_drug_name: form.displayName,
    category: form.category,
    effect: form.effect,
    intake_reason: form.reason,
    meal_time_slots: isSlotChanged ? toMealTimeSlots(form) : undefined,
    interval_days: isIntervalChanged
      ? INTERVAL_TO_DAYS[form.interval]
      : undefined,
  });
};
