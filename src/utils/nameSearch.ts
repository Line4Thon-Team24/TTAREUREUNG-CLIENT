// 이름에 검색어가 포함된 항목만 표시 (검색어가 없으면 전체)
export const filterByName = <T extends { name: string }>(
  items: T[],
  keyword: string
) => {
  const query = keyword.trim().toLowerCase();
  if (!query) return items;

  return items.filter((item) => item.name.toLowerCase().includes(query));
};
