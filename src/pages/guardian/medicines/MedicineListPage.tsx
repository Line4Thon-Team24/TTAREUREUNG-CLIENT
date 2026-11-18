import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, SquarePen } from 'lucide-react';
import { fetchMedicines } from '@/apis/medicine';
import { fetchSeniors } from '@/apis/senior';
import EmptyState from '@/components/common/EmptyState';
import SearchField from '@/components/common/SearchField';
import SeniorChips from '@/components/common/SeniorChips';
import MedicineCard from '@/components/medicines/MedicineCard';
import useSelectedSeniorParam from '@/hooks/useSelectedSeniorParam';
import type { Medicine } from '@/types/medicine';
import type { Senior } from '@/types/senior';
import { filterMedicines } from '@/utils/medicineSearch';

const ICON_BUTTON_CLASS =
  'flex size-9 items-center justify-center rounded-full text-[#4B5563] transition-colors active:bg-[#F2F4F6] disabled:text-[#D1D6DB]';

const MedicineListPage = () => {
  const navigate = useNavigate();
  // null이면 불러오는 중
  const [seniors, setSeniors] = useState<Senior[] | null>(null);
  const [isSeniorError, setIsSeniorError] = useState(false);
  const [selectedSeniorId, selectSenior] = useSelectedSeniorParam(
    seniors ?? []
  );
  // 어느 시니어의 약 목록인지 함께 저장 (시니어를 바꾸면 이전 목록을 보이지 않음)
  const [loaded, setLoaded] = useState<{
    seniorId: number;
    medicines: Medicine[];
  } | null>(null);
  const [errorSeniorId, setErrorSeniorId] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    let ignore = false;
    fetchSeniors()
      .then((data) => {
        if (!ignore) setSeniors(data);
      })
      .catch(() => {
        if (!ignore) setIsSeniorError(true);
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (selectedSeniorId === null) return;
    let ignore = false;
    fetchMedicines(selectedSeniorId)
      .then((data) => {
        if (!ignore) setLoaded({ seniorId: selectedSeniorId, medicines: data });
      })
      .catch(() => {
        if (!ignore) setErrorSeniorId(selectedSeniorId);
      });
    return () => {
      ignore = true;
    };
  }, [selectedSeniorId]);

  // null이면 불러오는 중
  const medicines =
    loaded?.seniorId === selectedSeniorId ? loaded.medicines : null;
  const isMedicineError =
    medicines === null && errorSeniorId === selectedSeniorId;
  const visibleMedicines = filterMedicines(medicines ?? [], keyword);
  const hasSenior = (seniors ?? []).length > 0;
  const hasMedicine = (medicines ?? []).length > 0;

  const goRegister = () =>
    navigate('/medicines/register', {
      state: { seniorId: selectedSeniorId },
    });

  const toggleSearch = () => {
    setIsSearching((prev) => !prev);
    setKeyword('');
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-5 pt-10 pb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-bold text-black">약 목록</h1>
          {hasSenior && (
            <span className="rounded-full border border-[#DCF2E4] bg-[#F0F9F4] px-2.25 py-0.75 text-[12px] font-semibold text-[#0E6E3B]">
              총 {medicines?.length ?? 0}개
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="약 검색"
            aria-pressed={isSearching}
            disabled={!hasMedicine}
            onClick={toggleSearch}
            className={ICON_BUTTON_CLASS}
          >
            <Search size={20} strokeWidth={1.83} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="목록 편집"
            disabled={!hasMedicine}
            onClick={() =>
              navigate(`/medicines/manage?seniorId=${selectedSeniorId}`)
            }
            className={ICON_BUTTON_CLASS}
          >
            <SquarePen size={20} strokeWidth={1.83} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="새 약 추가"
            disabled={!hasSenior}
            onClick={goRegister}
            className={ICON_BUTTON_CLASS}
          >
            <Plus size={20} strokeWidth={1.83} aria-hidden />
          </button>
        </div>
      </header>

      {isSearching && hasMedicine && (
        <div className="px-5 pb-3">
          <SearchField
            value={keyword}
            onChange={setKeyword}
            placeholder="약 이름이나 종류로 검색해주세요."
            aria-label="약 검색"
            autoFocus
          />
        </div>
      )}

      {hasSenior && (
        <div className="border-b border-[#E5E8EB]">
          <SeniorChips
            seniors={seniors ?? []}
            selectedId={selectedSeniorId}
            onSelect={selectSenior}
          />
        </div>
      )}

      {isSeniorError ? (
        <p className="flex flex-1 items-center justify-center text-[14px] text-[#6B7684]">
          시니어 목록을 불러오지 못했어요.
        </p>
      ) : seniors === null ? (
        <div className="flex-1" />
      ) : !hasSenior ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            message="등록된 시니어가 없어요!"
            actionLabel="시니어 등록하기"
            onAction={() =>
              navigate('/seniors/register', {
                state: { returnTo: '/medicines' },
              })
            }
          />
        </div>
      ) : isMedicineError ? (
        <p className="flex flex-1 items-center justify-center text-[14px] text-[#6B7684]">
          약 목록을 불러오지 못했어요.
        </p>
      ) : medicines === null ? (
        <div className="flex-1" />
      ) : !hasMedicine ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            message="등록된 약 정보가 없어요!"
            actionLabel="약 정보 등록하기"
            onAction={goRegister}
          />
        </div>
      ) : visibleMedicines.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-[14px] text-[#6B7684]">
          검색 결과가 없어요.
        </p>
      ) : (
        <ul className="flex flex-col gap-6 px-5 py-6">
          {visibleMedicines.map((medicine) => (
            <li key={medicine.id}>
              <MedicineCard
                medicine={medicine}
                // 약 단건 조회 API가 없어 시니어 id로 목록에서 찾음
                onEdit={() =>
                  navigate(
                    `/medicines/${medicine.id}/edit?seniorId=${medicine.seniorId}`
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MedicineListPage;
