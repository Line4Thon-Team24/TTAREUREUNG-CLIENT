import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, SquarePen } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import FilterChips from '@/components/common/FilterChips';
import SearchField from '@/components/common/SearchField';
import SeniorCard from '@/components/seniors/SeniorCard';
import { getMedicines } from '@/mocks/medicines';
import { getSeniors, toggleFavorite } from '@/mocks/seniors';
import { filterByName } from '@/utils/nameSearch';

const ICON_BUTTON_CLASS =
  'flex size-9 items-center justify-center rounded-full text-[#4B5563] transition-colors active:bg-[#F2F4F6] disabled:text-[#D1D6DB]';

type Filter = 'recent' | 'favorite';

const FILTERS: { label: string; value: Filter }[] = [
  { label: '최근 추가순', value: 'recent' },
  { label: '즐겨찾기', value: 'favorite' },
];

const SeniorListPage = () => {
  const navigate = useNavigate();
  const [seniors, setSeniors] = useState(getSeniors);
  const [filter, setFilter] = useState<Filter>('recent');
  const [isSearching, setIsSearching] = useState(false);
  const [keyword, setKeyword] = useState('');

  const hasSenior = seniors.length > 0;

  // 최근 추가순 정렬 (즐겨찾기는 그중 별 표시한 시니어만)
  const visibleSeniors = filterByName(seniors, keyword)
    .filter((senior) => filter === 'recent' || senior.isFavorite)
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));

  const toggleSearch = () => {
    setIsSearching((prev) => !prev);
    setKeyword('');
  };

  const handleToggleFavorite = (id: number) => {
    toggleFavorite(id);
    setSeniors(getSeniors());
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-5 pt-10 pb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-bold text-black">시니어 목록</h1>
          <span className="rounded-full border border-[#DCF2E4] bg-[#F0F9F4] px-2.25 py-0.75 text-[12px] font-semibold text-[#0E6E3B]">
            총 {seniors.length}명
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="시니어 검색"
            aria-pressed={isSearching}
            disabled={!hasSenior}
            onClick={toggleSearch}
            className={ICON_BUTTON_CLASS}
          >
            <Search size={20} strokeWidth={1.83} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="목록 편집"
            disabled={!hasSenior}
            onClick={() => navigate('/seniors/manage')}
            className={ICON_BUTTON_CLASS}
          >
            <SquarePen size={20} strokeWidth={1.83} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="시니어 추가"
            onClick={() => navigate('/seniors/add')}
            className={ICON_BUTTON_CLASS}
          >
            <Plus size={20} strokeWidth={1.83} aria-hidden />
          </button>
        </div>
      </header>

      {isSearching && hasSenior && (
        <div className="px-5 pb-3">
          <SearchField
            value={keyword}
            onChange={setKeyword}
            placeholder="시니어 이름으로 검색해주세요."
            aria-label="시니어 검색"
            autoFocus
          />
        </div>
      )}

      {hasSenior && (
        <FilterChips options={FILTERS} value={filter} onChange={setFilter} />
      )}

      {!hasSenior ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            message="등록된 시니어가 없어요!"
            actionLabel="시니어 등록하기"
            onAction={() => navigate('/seniors/register')}
          />
        </div>
      ) : visibleSeniors.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-[14px] text-[#6B7684]">
          {keyword.trim()
            ? '검색 결과가 없어요.'
            : '즐겨찾기한 시니어가 없어요.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-6 px-5 pt-3 pb-6">
          {visibleSeniors.map((senior) => (
            <li key={senior.id}>
              <SeniorCard
                senior={senior}
                medicineCount={getMedicines(senior.id).length}
                onToggleFavorite={() => handleToggleFavorite(senior.id)}
                onEdit={() => navigate(`/seniors/${senior.id}/edit`)}
                onMedicineDetail={() =>
                  navigate(`/medicines?seniorId=${senior.id}`)
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SeniorListPage;
