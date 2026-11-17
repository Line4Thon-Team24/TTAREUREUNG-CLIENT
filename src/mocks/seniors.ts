import { deleteGuardians, getGuardians } from '@/mocks/guardians';
import { deleteMedicines, getMedicines } from '@/mocks/medicines';
import type { Senior, SeniorForm } from '@/types/senior';

// 샘플 시니어
const sampleSeniors: Senior[] = [
  {
    id: 1,
    name: '김순자',
    birthDate: '1948-03-15',
    gender: 'female',
    phoneNumber: '010-1234-5678',
    registeredAt: '2026-11-05T09:00:00.000Z',
    isFavorite: false,
  },
  {
    id: 2,
    name: '박종옥',
    birthDate: '1951-07-22',
    gender: 'female',
    phoneNumber: '010-2345-6789',
    registeredAt: '2026-11-08T09:00:00.000Z',
    isFavorite: true,
  },
  {
    id: 3,
    name: '박태규',
    birthDate: '1946-11-02',
    gender: 'male',
    phoneNumber: '010-3456-7890',
    registeredAt: '2026-11-10T09:00:00.000Z',
    isFavorite: false,
  },
];

// API 연동 전 임시 저장소 (메모리에만 저장되어 새로고침 시 초기화)
const seniors: Senior[] = [...sampleSeniors];

export const getSeniors = () => [...seniors];

export const getSenior = (id: number) =>
  seniors.find((senior) => senior.id === id);

export const addSenior = (form: SeniorForm) => {
  const senior: Senior = {
    id: Date.now(),
    ...form,
    registeredAt: new Date().toISOString(),
    isFavorite: false,
  };
  seniors.push(senior);
  return senior;
};

export const updateSenior = (id: number, form: SeniorForm) => {
  const index = seniors.findIndex((senior) => senior.id === id);
  if (index === -1) return;
  seniors[index] = { ...seniors[index], ...form };
};

export const toggleFavorite = (id: number) => {
  const senior = seniors.find((item) => item.id === id);
  if (senior) senior.isFavorite = !senior.isFavorite;
};

// 시니어 삭제 (등록된 약, 담당 보호자도 함께 삭제)
export const deleteSeniors = (ids: number[]) => {
  deleteGuardians(
    getGuardians()
      .filter((guardian) => ids.includes(guardian.seniorId))
      .map((guardian) => guardian.id)
  );
  for (const id of ids) {
    deleteMedicines(getMedicines(id).map((medicine) => medicine.id));
    const index = seniors.findIndex((senior) => senior.id === id);
    if (index !== -1) seniors.splice(index, 1);
  }
};
