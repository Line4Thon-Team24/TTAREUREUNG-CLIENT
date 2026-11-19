import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, SquarePen } from 'lucide-react';
import { fetchSeniors, updateSeniorFavorite } from '@/apis/senior';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import FilterChips from '@/components/common/FilterChips';
import SearchField from '@/components/common/SearchField';
import SeniorCard from '@/components/seniors/SeniorCard';
import { fetchMedicineSummaries } from '@/apis/medicine';
import type { MedicineSummary } from '@/types/medicine';
import type { Senior } from '@/types/senior';
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
  // null이면 불러오는 중
  const [seniors, setSeniors] = useState<Senior[] | null>(null);
  const [isError, setIsError] = useState(false);
  const [summaries, setSummaries] = useState<Record<number, MedicineSummary>>(
    {}
  );
  const [filter, setFilter] = useState<Filter>('recent');
  const [isSearching, setIsSearching] = useState(false);
  const [keyword, setKeyword] = useState('');
  // 다시 시도하면 값이 바뀌어 다시 불러옴
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    fetchSeniors()
      .then((data) => {
        if (ignore) return;
        setSeniors(data);
        // 약 요약은 실패해도 목록은 표시 ('-')
        if (data.length === 0) return;
        fetchMedicineSummaries(data.map(({ id }) => id))
          .then((result) => {
            if (!ignore) setSummaries(result);
          })
          .catch(() => {});
      })
      .catch(() => {
        if (!ignore) setIsError(true);
      });
    return () => {
      ignore = true;
    };
  }, [loadAttempt]);

  const seniorList = seniors ?? [];
  const hasSenior = seniorList.length > 0;

  // 최근 추가순 (즐겨찾기는 그중 별 표시한 시니어만)
  const visibleSeniors = filterByName(seniorList, keyword).filter(
    (senior) => filter === 'recent' || senior.isFavorite
  );

  const toggleSearch = () => {
    setIsSearching((prev) => !prev);
    setKeyword('');
  };

  // 즐겨찾기 API 추가 전까지 화면 상태로만 유지
  const setFavorite = (id: number, isFavorite: boolean) => {
    setSeniors((prev) =>
      (prev ?? []).map((senior) =>
        senior.id === id ? { ...senior, isFavorite } : senior
      )
    );
  };

  // 화면에 먼저 반영하고 저장, 실패하면 원래대로
  const handleToggleFavorite = (senior: Senior) => {
    const next = !senior.isFavorite;
    setFavorite(senior.id, next);
    updateSeniorFavorite(senior.id, next).catch(() =>
      setFavorite(senior.id, !next)
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-5 pt-10 pb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-bold text-black">시니어 목록</h1>
          <span className="rounded-full border border-[#DCF2E4] bg-[#F0F9F4] px-2.25 py-0.75 text-[12px] font-semibold text-[#0E6E3B]">
            총 {seniorList.length}명
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

      {isError ? (
        <ErrorState
          message="시니어 목록을 불러오지 못했어요."
          onRetry={() => {
            setIsError(false);
            setLoadAttempt((prev) => prev + 1);
          }}
        />
      ) : seniors === null ? (
        <LoadingState />
      ) : !hasSenior ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            message="등록된 시니어가 없어요!"
            actionLabel="시니어 등록하기"
            onAction={() =>
              navigate('/seniors/register', { state: { returnTo: '/seniors' } })
            }
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
                medicineSummary={summaries[senior.id] ?? null}
                onToggleFavorite={() => handleToggleFavorite(senior)}
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
