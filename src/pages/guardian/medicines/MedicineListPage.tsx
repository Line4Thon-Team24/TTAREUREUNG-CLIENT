import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, SquarePen } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import SearchField from '@/components/common/SearchField';
import SeniorChips from '@/components/common/SeniorChips';
import MedicineCard from '@/components/medicines/MedicineCard';
import useSelectedSeniorParam from '@/hooks/useSelectedSeniorParam';
import useSeniorMedicines from '@/hooks/useSeniorMedicines';
import useSeniors from '@/hooks/useSeniors';
import { filterMedicines } from '@/utils/medicineSearch';

const ICON_BUTTON_CLASS =
  'flex size-9 items-center justify-center rounded-full text-[#4B5563] transition-colors active:bg-[#F2F4F6] disabled:text-[#D1D6DB]';

const MedicineListPage = () => {
  const navigate = useNavigate();
  const { seniors, isError: isSeniorError, retry: retrySeniors } = useSeniors();
  const [selectedSeniorId, selectSenior] = useSelectedSeniorParam(
    seniors ?? []
  );
  // 시니어를 바꾸면 이전 시니어의 목록은 보이지 않음
  const {
    medicines,
    isError: isMedicineError,
    retry: retryMedicines,
  } = useSeniorMedicines(selectedSeniorId);
  const [isSearching, setIsSearching] = useState(false);
  const [keyword, setKeyword] = useState('');

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
        <ErrorState
          message="시니어 목록을 불러오지 못했어요."
          onRetry={retrySeniors}
        />
      ) : seniors === null ? (
        <LoadingState />
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
        <ErrorState
          message="약 목록을 불러오지 못했어요."
          onRetry={retryMedicines}
        />
      ) : medicines === null ? (
        <LoadingState />
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
