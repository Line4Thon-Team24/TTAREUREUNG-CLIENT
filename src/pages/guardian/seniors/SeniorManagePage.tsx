import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';
import SearchField from '@/components/common/SearchField';
import StepHeader from '@/components/common/StepHeader';
import SeniorCard from '@/components/seniors/SeniorCard';
import useGoBack from '@/hooks/useGoBack';
import { getMedicines } from '@/mocks/medicines';
import { deleteSeniors, getSeniors } from '@/mocks/seniors';
import { filterByName } from '@/utils/nameSearch';

const SeniorManagePage = () => {
  const goBack = useGoBack();
  // 목록과 같은 최근 추가순
  const [seniors] = useState(() =>
    getSeniors().sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [keyword, setKeyword] = useState('');

  // 편집할 시니어가 없으면 목록으로
  if (seniors.length === 0) {
    return <Navigate to="/seniors" replace />;
  }

  const visibleSeniors = filterByName(seniors, keyword);
  const visibleIds = visibleSeniors.map(({ id }) => id);
  const isAllSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  // 검색으로 가려졌지만 선택된 시니어 (삭제 확인 때 함께 안내)
  const hiddenCount = selectedIds.filter(
    (id) => !visibleIds.includes(id)
  ).length;

  const toggleSenior = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((prevId) => prevId !== id) : [...prev, id]
    );
  };

  // 전체 선택은 지금 보이는(검색된) 시니어 기준
  const toggleAll = () => {
    setSelectedIds((prev) =>
      isAllSelected
        ? prev.filter((id) => !visibleIds.includes(id))
        : [...new Set([...prev, ...visibleIds])]
    );
  };

  const toggleSearch = () => {
    setIsSearching((prev) => !prev);
    setKeyword('');
  };

  const handleDelete = () => {
    deleteSeniors(selectedIds);
    setIsConfirmOpen(false);
    goBack('/seniors');
  };

  return (
    <div className="flex h-dvh flex-col">
      <StepHeader title="시니어 목록 편집" onBack={() => goBack('/seniors')} />

      <div className="flex items-center justify-between px-5 py-4">
        <label className="flex items-center gap-2 px-1.25 text-[14px] font-semibold text-[#191F28]">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={toggleAll}
            disabled={visibleIds.length === 0}
            className="size-4 accent-[#01A16A]"
          />
          전체 선택
        </label>
        <button
          type="button"
          aria-label="시니어 검색"
          aria-pressed={isSearching}
          onClick={toggleSearch}
          className="flex size-6 items-center justify-center text-[#4B5563]"
        >
          <Search size={16} strokeWidth={2} aria-hidden />
        </button>
      </div>

      {isSearching && (
        <div className="px-5 pb-1">
          <SearchField
            value={keyword}
            onChange={setKeyword}
            placeholder="시니어 이름으로 검색해주세요."
            aria-label="시니어 검색"
            autoFocus
          />
        </div>
      )}

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pt-3 pb-12">
        {visibleSeniors.length === 0 ? (
          <p className="pt-20 text-center text-[14px] text-[#6B7684]">
            검색 결과가 없어요.
          </p>
        ) : (
          <ul className="flex flex-col gap-6">
            {visibleSeniors.map((senior) => (
              <li key={senior.id}>
                <SeniorCard
                  senior={senior}
                  medicineCount={getMedicines(senior.id).length}
                  selectable
                  selected={selectedIds.includes(senior.id)}
                  onToggleSelect={() => toggleSenior(senior.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      <div className="z-10 flex shrink-0 gap-3 border-t border-[#E5E8EB] bg-white px-5 pt-4 pb-10">
        <div className="w-29.25 shrink-0">
          <Button variant="secondary" onClick={() => goBack('/seniors')}>
            취소
          </Button>
        </div>
        <div className="min-w-0 flex-1">
          <Button
            variant="danger"
            disabled={selectedIds.length === 0}
            onClick={() => setIsConfirmOpen(true)}
          >
            {selectedIds.length > 0
              ? `${selectedIds.length}명 삭제하기`
              : '삭제하기'}
          </Button>
        </div>
      </div>

      <ConfirmModal
        open={isConfirmOpen}
        message={`선택된 시니어 ${selectedIds.length}명과 약 정보, 담당 보호자가\n함께 삭제됩니다.${
          hiddenCount > 0
            ? `\n(검색 결과에 보이지 않는 ${hiddenCount}명 포함)`
            : ''
        }\n정말 삭제하시겠습니까?`}
        cancelLabel="취소"
        confirmLabel="삭제하기"
        confirmVariant="danger"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default SeniorManagePage;
