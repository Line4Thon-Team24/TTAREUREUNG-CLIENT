import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';
import SearchField from '@/components/common/SearchField';
import StepHeader from '@/components/common/StepHeader';
import GuardianCard from '@/components/guardians/GuardianCard';
import useGoBack from '@/hooks/useGoBack';
import {
  changeGuardianSenior,
  deleteGuardians,
  getGuardians,
} from '@/mocks/guardians';
import { getSeniors } from '@/mocks/seniors';
import { filterByName } from '@/utils/nameSearch';

// 삭제 확인 / 변경 취소 확인
type ModalStep = 'delete' | 'discard' | null;

const GuardianManagePage = () => {
  const goBack = useGoBack();
  const [savedGuardians] = useState(getGuardians);
  const [seniors] = useState(getSeniors);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // 저장 전 담당 시니어 변경 (보호자 id → 시니어 id)
  const [seniorChanges, setSeniorChanges] = useState<Record<number, number>>(
    {}
  );
  const [modalStep, setModalStep] = useState<ModalStep>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [keyword, setKeyword] = useState('');

  // 편집할 보호자가 없으면 목록으로
  if (savedGuardians.length === 0) {
    return <Navigate to="/guardians" replace />;
  }

  // 화면에는 변경 내용을 반영해서 표시 (담당 시니어가 바뀌면 대표 해제)
  const guardians = savedGuardians.map((guardian) =>
    guardian.id in seniorChanges
      ? {
          ...guardian,
          seniorId: seniorChanges[guardian.id],
          isRepresentative: false,
        }
      : guardian
  );
  const hasChanges = Object.keys(seniorChanges).length > 0;
  const hasSelection = selectedIds.length > 0;

  const visibleGuardians = filterByName(guardians, keyword);
  const visibleIds = visibleGuardians.map(({ id }) => id);
  const isAllSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  // 검색으로 가려졌지만 선택된 보호자 (삭제 확인 때 함께 안내)
  const hiddenCount = selectedIds.filter(
    (id) => !visibleIds.includes(id)
  ).length;

  const toggleGuardian = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((prevId) => prevId !== id) : [...prev, id]
    );
  };

  // 전체 선택은 지금 보이는(검색된) 보호자 기준
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

  // 담당 시니어 변경은 저장 전까지 화면에만 반영 (원래 값으로 돌리면 변경 없음)
  const handleChangeSenior = (id: number, seniorId: number) => {
    const original = savedGuardians.find((guardian) => guardian.id === id);
    setSeniorChanges((prev) => {
      const next = { ...prev };
      if (original?.seniorId === seniorId) delete next[id];
      else next[id] = seniorId;
      return next;
    });
  };

  // 삭제할 보호자를 빼고 담당 시니어 변경 저장
  const saveChanges = () => {
    for (const [id, seniorId] of Object.entries(seniorChanges)) {
      if (!selectedIds.includes(Number(id))) {
        changeGuardianSenior(Number(id), seniorId);
      }
    }
  };

  const handleSave = () => {
    saveChanges();
    goBack('/guardians');
  };

  const handleDelete = () => {
    saveChanges();
    deleteGuardians(selectedIds);
    setModalStep(null);
    goBack('/guardians');
  };

  // 바꾼 내용이 있으면 버릴지 먼저 확인
  const handleCancel = () => {
    if (hasChanges) setModalStep('discard');
    else goBack('/guardians');
  };

  return (
    <div className="flex h-dvh flex-col">
      <StepHeader title="보호자 목록 편집" onBack={handleCancel} />

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
          aria-label="보호자 검색"
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
            placeholder="보호자 이름으로 검색해주세요."
            aria-label="보호자 검색"
            autoFocus
          />
        </div>
      )}

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pt-3 pb-12">
        {visibleGuardians.length === 0 ? (
          <p className="pt-20 text-center text-[14px] text-[#6B7684]">
            검색 결과가 없어요.
          </p>
        ) : (
          <ul className="flex flex-col gap-6">
            {visibleGuardians.map((guardian) => (
              <li key={guardian.id}>
                <GuardianCard
                  guardian={guardian}
                  seniors={seniors}
                  selectable
                  selected={selectedIds.includes(guardian.id)}
                  onToggleSelect={() => toggleGuardian(guardian.id)}
                  onChangeSenior={(seniorId) =>
                    handleChangeSenior(guardian.id, seniorId)
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      <div className="z-10 flex shrink-0 gap-3 border-t border-[#E5E8EB] bg-white px-5 pt-4 pb-10">
        <div className="w-29.25 shrink-0">
          <Button variant="secondary" onClick={handleCancel}>
            취소
          </Button>
        </div>
        <div className="min-w-0 flex-1">
          {/* 선택한 보호자가 없고 담당 시니어만 바꿨으면 저장 버튼 */}
          {!hasSelection && hasChanges ? (
            <Button onClick={handleSave}>저장하기</Button>
          ) : (
            <Button
              variant="danger"
              disabled={!hasSelection}
              onClick={() => setModalStep('delete')}
            >
              {hasSelection ? `${selectedIds.length}명 삭제하기` : '삭제하기'}
            </Button>
          )}
        </div>
      </div>

      <ConfirmModal
        open={modalStep === 'delete'}
        message={`선택된 보호자 ${selectedIds.length}명이 삭제됩니다.${
          hiddenCount > 0
            ? `\n(검색 결과에 보이지 않는 ${hiddenCount}명 포함)`
            : ''
        }\n정말 삭제하시겠습니까?`}
        cancelLabel="취소"
        confirmLabel="삭제하기"
        confirmVariant="danger"
        onCancel={() => setModalStep(null)}
        onConfirm={handleDelete}
      />
      <ConfirmModal
        open={modalStep === 'discard'}
        message={'변경한 내용이 사라집니다.\n그래도 취소하시겠습니까?'}
        cancelLabel="돌아가기"
        confirmLabel="취소하기"
        onCancel={() => setModalStep(null)}
        onConfirm={() => {
          setModalStep(null);
          goBack('/guardians');
        }}
      />
    </div>
  );
};

export default GuardianManagePage;
