import { apiClient } from '@/apis/client';
import type { BaseResponse } from '@/types/api';
import type {
  DoseInterval,
  DoseTiming,
  Medicine,
  MedicationItemResponse,
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
    medicines: response.medications.map((item, index) => ({
      id: `rx-${index + 1}`,
      accuracy: item.confidence ?? 0,
      strength: item.strength,
      doseAmount: item.dose_amount,
      form: {
        ...base,
        name: item.drug_name ?? '',
        category: item.category ?? '',
        effect: item.effect ?? '',
        reason: item.intake_reason ?? '',
        displayName: item.custom_drug_name ?? '',
        storageLocation: item.storage_location ?? '',
        interval: INTERVAL_FROM_DAYS[item.interval_days ?? 1] ?? 'daily',
        // 시간대를 못 읽었으면 1회, 화면 선택지는 최대 3회
        timesPerDay: Math.min(Math.max(item.meal_time_slots.length, 1), 3),
        timing: item.intake_timing ? TIMING_FROM_API[item.intake_timing] : null,
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
