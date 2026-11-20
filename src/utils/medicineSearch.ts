import type { Medicine } from '@/types/medicine';

// 약 이름, 시니어가 보는 이름, 종류, 효과 중 하나라도 검색어를 포함하면 표시
export const filterMedicines = (medicines: Medicine[], keyword: string) => {
  const query = keyword.trim().toLowerCase();
  if (!query) return medicines;

  return medicines.filter((medicine) =>
    [medicine.name, medicine.displayName, medicine.category, medicine.effect]
      .join(' ')
      .toLowerCase()
      .includes(query)
  );
};
