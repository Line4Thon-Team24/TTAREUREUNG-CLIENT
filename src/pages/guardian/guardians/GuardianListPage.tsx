import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, SquarePen } from 'lucide-react';
import { fetchGuardians } from '@/apis/guardian';
import FilterChips from '@/components/common/FilterChips';
import SearchField from '@/components/common/SearchField';
import GuardianCard, {
  type GuardianAssignment,
} from '@/components/guardians/GuardianCard';
import useSeniors from '@/hooks/useSeniors';
import type { Guardian } from '@/types/guardian';
import { filterByName } from '@/utils/nameSearch';

const ICON_BUTTON_CLASS =
  'flex size-9 items-center justify-center rounded-full text-[#4B5563] transition-colors active:bg-[#F2F4F6] disabled:text-[#D1D6DB]';

type Sort = 'representative' | 'age';

const SORTS: { label: string; value: Sort }[] = [
  { label: '대표 등록순', value: 'representative' },
  { label: '나이순', value: 'age' },
];

// 같은 보호자의 연결을 카드 1장으로 묶음 (담당 시니어는 칩으로 나열)
type GuardianGroup = Guardian & { assignments: GuardianAssignment[] };

const groupByGuardian = (links: Guardian[]) => {
  const groups = new Map<number, GuardianGroup>();
  for (const link of links) {
    const assignment = {
      seniorId: link.seniorId,
      isRepresentative: link.isRepresentative,
    };
    const group = groups.get(link.profileId);
    if (group) group.assignments.push(assignment);
    else groups.set(link.profileId, { ...link, assignments: [assignment] });
  }
  return [...groups.values()];
};

const isAnyRepresentative = ({ assignments }: GuardianGroup) =>
  assignments.some((item) => item.isRepresentative);

// 대표 등록순: 대표 먼저, 나머지는 등록순 / 나이순: 나이 많은 순 (생년월일 없으면 뒤로)
const sortGuardians = (guardians: GuardianGroup[], sort: Sort) =>
  [...guardians].sort((a, b) =>
    sort === 'representative'
      ? Number(isAnyRepresentative(b)) - Number(isAnyRepresentative(a))
      : (a.birthDate || '9999').localeCompare(b.birthDate || '9999')
  );

const GuardianListPage = () => {
  const navigate = useNavigate();
  // null이면 불러오는 중
  const [guardians, setGuardians] = useState<Guardian[] | null>(null);
  const [isError, setIsError] = useState(false);
  const { seniors } = useSeniors();
  const [sort, setSort] = useState<Sort>('representative');
  const [isSearching, setIsSearching] = useState(false);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    let ignore = false;
    fetchGuardians()
      .then((data) => {
        if (!ignore) setGuardians(data);
      })
      .catch(() => {
        if (!ignore) setIsError(true);
      });
    return () => {
      ignore = true;
    };
  }, []);

  // 총 인원은 연결 수가 아닌 보호자 수
  const guardianList = groupByGuardian(guardians ?? []);
  const hasGuardian = guardianList.length > 0;
  const visibleGuardians = sortGuardians(
    filterByName(guardianList, keyword),
    sort
  );

  const toggleSearch = () => {
    setIsSearching((prev) => !prev);
    setKeyword('');
  };

  // 그 시니어의 보호자 중 이 보호자만 대표로 표시
  // TODO: 대표 보호자 설정 API 연동 (다음 단계)
  const handleSetRepresentative = (profileId: number, seniorId: number) => {
    setGuardians((prev) =>
      (prev ?? []).map((link) =>
        link.seniorId === seniorId
          ? { ...link, isRepresentative: link.profileId === profileId }
          : link
      )
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-5 pt-10 pb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-bold text-black">보호자 목록</h1>
          <span className="rounded-full border border-[#DCF2E4] bg-[#F0F9F4] px-2.25 py-0.75 text-[12px] font-semibold text-[#0E6E3B]">
            총 {guardianList.length}명
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="보호자 검색"
            aria-pressed={isSearching}
            disabled={!hasGuardian}
            onClick={toggleSearch}
            className={ICON_BUTTON_CLASS}
          >
            <Search size={20} strokeWidth={1.83} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="목록 편집"
            disabled={!hasGuardian}
            onClick={() => navigate('/guardians/manage')}
            className={ICON_BUTTON_CLASS}
          >
            <SquarePen size={20} strokeWidth={1.83} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="보호자 추가"
            onClick={() => navigate('/guardians/invite')}
            className={ICON_BUTTON_CLASS}
          >
            <Plus size={20} strokeWidth={1.83} aria-hidden />
          </button>
        </div>
      </header>

      {isSearching && hasGuardian && (
        <div className="px-5 pb-3">
          <SearchField
            value={keyword}
            onChange={setKeyword}
            placeholder="보호자 이름으로 검색해주세요."
            aria-label="보호자 검색"
            autoFocus
          />
        </div>
      )}

      {isError ? (
        <p className="flex flex-1 items-center justify-center text-[14px] text-[#6B7684]">
          보호자 목록을 불러오지 못했어요.
        </p>
      ) : guardians === null ? (
        <div className="flex-1" />
      ) : !hasGuardian ? (
        <p className="flex flex-1 items-center justify-center text-[14px] text-[#6B7684]">
          등록된 보호자가 없어요.
        </p>
      ) : (
        <>
          <FilterChips options={SORTS} value={sort} onChange={setSort} />
          {visibleGuardians.length === 0 ? (
            <p className="flex flex-1 items-center justify-center text-[14px] text-[#6B7684]">
              검색 결과가 없어요.
            </p>
          ) : (
            <ul className="flex flex-col gap-6 px-5 pt-3 pb-6">
              {visibleGuardians.map((guardian) => (
                <li key={guardian.profileId}>
                  <GuardianCard
                    guardian={guardian}
                    seniors={seniors ?? []}
                    assignments={guardian.assignments}
                    onSetRepresentative={(seniorId) =>
                      handleSetRepresentative(guardian.profileId, seniorId)
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default GuardianListPage;
