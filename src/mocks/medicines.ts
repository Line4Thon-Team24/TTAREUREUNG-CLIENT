import type {
  Medicine,
  MedicineForm,
  RecognizedArea,
  RecognizedMedicine,
} from '@/types/medicine';
import { addDaysToDateString, toDateString } from '@/utils/date';

// API 연동 전 임시 저장소 (메모리에만 저장되어 새로고침 시 초기화)
const medicines: Medicine[] = [];

export const getMedicines = (seniorId: number) =>
  medicines.filter((medicine) => medicine.seniorId === seniorId);

export const addMedicines = (seniorId: number, forms: MedicineForm[]) => {
  const added = forms.map((form, index) => ({
    id: Date.now() + index,
    seniorId,
    ...form,
  }));
  medicines.push(...added);
  return added;
};

// 빈 약 정보 (직접 입력용, 오늘부터 일주일)
export const createEmptyMedicineForm = (): MedicineForm => {
  const today = toDateString(new Date());
  return {
    name: '',
    category: '',
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
      accuracy: 99,
      form: {
        ...base,
        name: '아서로신정 25밀리그램',
        category: '진통소염제',
        displayName: '허리 통증 줄여주는 약',
        timesPerDay: 2,
      },
    },
    {
      accuracy: 98,
      form: {
        ...base,
        name: '펠록스정',
        category: '소염진통제',
        displayName: '무릎 통증 줄여주는 약',
        timesPerDay: 2,
      },
    },
    {
      accuracy: 97,
      form: {
        ...base,
        name: '디나드정',
        category: '위산과다증약',
        displayName: '속 편하게 해주는 약',
        timesPerDay: 2,
      },
    },
    {
      accuracy: 96,
      form: {
        ...base,
        name: '뮤테란캡슐',
        category: '진해거담제',
        displayName: '기침 가래 줄여주는 약',
        timesPerDay: 3,
      },
    },
  ];
};
