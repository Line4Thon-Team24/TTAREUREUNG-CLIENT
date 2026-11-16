import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, SquarePen } from 'lucide-react';
import FilterChips from '@/components/common/FilterChips';
import GuardianCard from '@/components/guardians/GuardianCard';
import { getGuardians, setRepresentative } from '@/mocks/guardians';
import { getSeniors } from '@/mocks/seniors';
import type { Guardian } from '@/types/guardian';

const ICON_BUTTON_CLASS =
  'flex size-9 items-center justify-center rounded-full text-[#4B5563] transition-colors active:bg-[#F2F4F6] disabled:text-[#D1D6DB]';

type Sort = 'representative' | 'age';

const SORTS: { label: string; value: Sort }[] = [
  { label: '대표 등록순', value: 'representative' },
  { label: '나이순', value: 'age' },
];

// 대표 등록순: 대표 먼저, 나머지는 등록순 / 나이순: 나이 많은 순
const sortGuardians = (guardians: Guardian[], sort: Sort) =>
  [...guardians].sort((a, b) =>
    sort === 'representative'
      ? Number(b.isRepresentative) - Number(a.isRepresentative)
      : a.birthDate.localeCompare(b.birthDate)
  );

const GuardianListPage = () => {
  const navigate = useNavigate();
  const [guardians, setGuardians] = useState(getGuardians);
  const [seniors] = useState(getSeniors);
  const [sort, setSort] = useState<Sort>('representative');

  const hasGuardian = guardians.length > 0;

  const handleSetRepresentative = (id: number) => {
    setRepresentative(id);
    setGuardians(getGuardians());
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-5 pt-10 pb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-bold text-black">보호자 목록</h1>
          <span className="rounded-full border border-[#DCF2E4] bg-[#F0F9F4] px-2.25 py-0.75 text-[12px] font-semibold text-[#0E6E3B]">
            총 {guardians.length}명
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* 검색은 화면이 정해지면 연결 */}
          <button
            type="button"
            aria-label="보호자 검색"
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

      {hasGuardian ? (
        <>
          <FilterChips options={SORTS} value={sort} onChange={setSort} />
          <ul className="flex flex-col gap-6 px-5 pt-3 pb-6">
            {sortGuardians(guardians, sort).map((guardian) => (
              <li key={guardian.id}>
                <GuardianCard
                  guardian={guardian}
                  seniors={seniors}
                  onSetRepresentative={() =>
                    handleSetRepresentative(guardian.id)
                  }
                />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="flex flex-1 items-center justify-center text-[14px] text-[#6B7684]">
          등록된 보호자가 없어요.
        </p>
      )}
    </div>
  );
};

export default GuardianListPage;
