import type {
  Medicine,
  MedicineForm,
  Prescription,
  RecognizedArea,
  RecognizedMedicine,
} from '@/types/medicine';
import { addDaysToDateString, toDateString } from '@/utils/date';

// API 연동 전 임시 저장소 (메모리에만 저장되어 새로고침 시 초기화)
const medicines: Medicine[] = [];

// 최근 등록한 약이 위로 오도록 정렬
export const getMedicines = (seniorId: number) =>
  medicines
    .filter((medicine) => medicine.seniorId === seniorId)
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));

export const getMedicine = (id: number) =>
  medicines.find((medicine) => medicine.id === id);

export const addMedicines = (
  seniorId: number,
  forms: MedicineForm[],
  prescription: Prescription | null
) => {
  const registeredAt = new Date().toISOString();
  const added: Medicine[] = forms.map((form, index) => ({
    id: Date.now() + index,
    seniorId,
    source: prescription ? 'recognized' : 'manual',
    prescription,
    registeredAt,
    ...form,
  }));
  medicines.push(...added);
  return added;
};

export const updateMedicine = (id: number, form: MedicineForm) => {
  const index = medicines.findIndex((medicine) => medicine.id === id);
  if (index === -1) return;
  medicines[index] = { ...medicines[index], ...form };
};

export const deleteMedicines = (ids: number[]) => {
  for (const id of ids) {
    const index = medicines.findIndex((medicine) => medicine.id === id);
    if (index !== -1) medicines.splice(index, 1);
  }
};

// 빈 약 정보 (직접 입력용, 오늘부터 일주일)
export const createEmptyMedicineForm = (): MedicineForm => {
  const today = toDateString(new Date());
  return {
    name: '',
    category: '',
    effect: '',
    reason: '',
    displayName: '',
    storageLocation: '',
    startDate: today,
    endDate: addDaysToDateString(today, 6),
    interval: 'daily',
    timesPerDay: 3,
    timing: 'afterMeal',
  };
};

// AI 인식 API 연동 전 고정 결과
export const RECOGNITION_CONFIDENCE = 98.5;

export const RECOGNIZED_AREAS: RecognizedArea[] = [
  { label: '문서유형', top: 43.3, right: 68, bottom: 48.9, left: 6 },
  { label: '조제일자', top: 44.5, right: 26, bottom: 48.9, left: 52 },
  { label: '복용법', top: 50.5, right: 35, bottom: 41.1, left: 38 },
  { label: '약품명', top: 60.2, right: 74, bottom: 33.2, left: 6 },
  { label: '약품명', top: 68, right: 74, bottom: 25.4, left: 6 },
  { label: '복용 횟수', top: 68.6, right: 8, bottom: 14.6, left: 66 },
];

export const getRecognizedMedicines = (): RecognizedMedicine[] => {
  const base = createEmptyMedicineForm();
  return [
    {
      id: 'rx-1',
      accuracy: 99,
      form: {
        ...base,
        name: '아서로신정 25밀리그램',
        category: '진통소염제',
        effect: '관절 연골 보호 / 통증 완화',
        reason:
          '무릎 관절 연골 마모로 인한 만성 통증 완화 및 염증 억제를 위한 처방 약입니다. 속쓰림 방지를 위해 반드시 매 식사 30분 후 규칙적으로 복용해야 합니다.',
        displayName: '허리 통증 줄여주는 약',
        timesPerDay: 2,
      },
    },
    {
      id: 'rx-2',
      accuracy: 98,
      form: {
        ...base,
        name: '펠록스정',
        category: '소염진통제',
        effect: '염증 억제 / 붓기 완화',
        reason:
          '허리와 무릎의 염증을 가라앉히고 붓기를 줄이기 위한 약입니다. 위가 쓰릴 수 있어 식사 후 복용해야 합니다.',
        displayName: '무릎 통증 줄여주는 약',
        timesPerDay: 2,
      },
    },
    {
      id: 'rx-3',
      accuracy: 97,
      form: {
        ...base,
        name: '디나드정',
        category: '위산과다증약',
        effect: '위 점막 보호 / 속쓰림 완화',
        reason:
          '함께 복용하는 진통제로 인한 속쓰림을 막고 위 점막을 보호하기 위한 약입니다.',
        displayName: '속 편하게 해주는 약',
        timesPerDay: 2,
      },
    },
    {
      id: 'rx-4',
      accuracy: 96,
      form: {
        ...base,
        name: '뮤테란캡슐',
        category: '진해거담제',
        effect: '기침 완화 / 가래 배출',
        reason:
          '기침을 줄이고 가래를 묽게 해 쉽게 뱉을 수 있도록 돕는 약입니다.',
        displayName: '기침 가래 줄여주는 약',
        timesPerDay: 3,
      },
    },
  ];
};
