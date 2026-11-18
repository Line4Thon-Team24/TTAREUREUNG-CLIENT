import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { changeGuardianSenior, fetchGuardians } from '@/apis/guardian';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';
import SearchField from '@/components/common/SearchField';
import StepHeader from '@/components/common/StepHeader';
import GuardianCard from '@/components/guardians/GuardianCard';
import useGoBack from '@/hooks/useGoBack';
import useLatestRequest from '@/hooks/useLatestRequest';
import useSeniors from '@/hooks/useSeniors';
import { deleteGuardians } from '@/mocks/guardians';
import type { Guardian } from '@/types/guardian';
import { filterByName } from '@/utils/nameSearch';

// 삭제 확인 / 변경 취소 확인
type ModalStep = 'delete' | 'discard' | null;

const GuardianManagePage = () => {
  const goBack = useGoBack();
  const startRequest = useLatestRequest();
  // 편집은 연결(보호자-시니어) 단위 카드 (null이면 불러오는 중)
  const [savedGuardians, setSavedGuardians] = useState<Guardian[] | null>(null);
  const [isLoadError, setIsLoadError] = useState(false);
  const { seniors } = useSeniors();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveError, setIsSaveError] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // 저장 전 담당 시니어 변경 (보호자 id → 시니어 id)
  const [seniorChanges, setSeniorChanges] = useState<Record<number, number>>(
    {}
  );
  const [modalStep, setModalStep] = useState<ModalStep>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    let ignore = false;
    fetchGuardians()
      .then((data) => {
        if (!ignore) setSavedGuardians(data);
      })
      .catch(() => {
        if (!ignore) setIsLoadError(true);
      });
    return () => {
      ignore = true;
    };
  }, []);

  // 편집할 보호자가 없으면 목록으로
  if (savedGuardians?.length === 0) {
    return <Navigate to="/guardians" replace />;
  }

  // 화면에는 변경 내용을 반영해서 표시 (담당 시니어가 바뀌면 대표 해제)
  const guardians = (savedGuardians ?? []).map((guardian) =>
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
    const original = savedGuardians?.find((guardian) => guardian.id === id);
    setSeniorChanges((prev) => {
      const next = { ...prev };
      if (original?.seniorId === seniorId) delete next[id];
      else next[id] = seniorId;
      return next;
    });
  };

  // 삭제할 보호자를 빼고 담당 시니어 변경 저장 (실패한 연결 id 반환)
  const saveChanges = async () => {
    const changes = Object.entries(seniorChanges)
      .map(([id, seniorId]) => [Number(id), seniorId] as const)
      .filter(([id]) => !selectedIds.includes(id));
    const results = await Promise.allSettled(
      changes.map(([id, seniorId]) => changeGuardianSenior(id, seniorId))
    );
    return changes
      .filter((_, index) => results[index].status === 'rejected')
      .map(([id]) => id);
  };

  const handleSave = async () => {
    if (isSaving) return;

    const isLatest = startRequest();
    setIsSaving(true);
    setIsSaveError(false);
    const failedIds = await saveChanges();
    // 화면을 떠났으면 처리하지 않음
    if (!isLatest()) return;
    if (failedIds.length === 0) {
      goBack('/guardians');
      return;
    }
    // 저장된 변경은 반영하고, 실패한 변경만 남겨 다시 시도할 수 있게 함
    setSavedGuardians((prev) =>
      (prev ?? []).map((guardian) =>
        guardian.id in seniorChanges && !failedIds.includes(guardian.id)
          ? { ...guardian, seniorId: seniorChanges[guardian.id] }
          : guardian
      )
    );
    setSeniorChanges((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([id]) => failedIds.includes(Number(id)))
      )
    );
    setIsSaveError(true);
    setIsSaving(false);
  };

  // TODO: 연결 해제 API 연동 (다음 단계)
  const handleDelete = async () => {
    await saveChanges();
    deleteGuardians(selectedIds);
    setModalStep(null);
    goBack('/guardians');
  };

  // 같은 보호자가 이미 맡은 시니어는 고를 수 없음 (서버가 거부)
  const getSelectableSeniors = (target: Guardian) => {
    const taken = guardians
      .filter(
        (guardian) =>
          guardian.profileId === target.profileId && guardian.id !== target.id
      )
      .map((guardian) => guardian.seniorId);
    return (seniors ?? []).filter(({ id }) => !taken.includes(id));
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
        {isLoadError ? (
          <p className="pt-20 text-center text-[14px] text-[#6B7684]">
            보호자 목록을 불러오지 못했어요.
          </p>
        ) : savedGuardians === null ? null : visibleGuardians.length === 0 ? (
          <p className="pt-20 text-center text-[14px] text-[#6B7684]">
            검색 결과가 없어요.
          </p>
        ) : (
          <ul className="flex flex-col gap-6">
            {visibleGuardians.map((guardian) => (
              <li key={guardian.id}>
                <GuardianCard
                  guardian={guardian}
                  seniors={getSelectableSeniors(guardian)}
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

      {isSaveError && (
        <p
          role="alert"
          className="shrink-0 border-t border-[#E5E8EB] bg-white px-5 pt-4 text-center text-[13px] text-[#E5484D]"
        >
          담당 시니어를 바꾸지 못한 보호자가 있어요. 다시 시도해주세요.
        </p>
      )}
      <div className="z-10 flex shrink-0 gap-3 border-t border-[#E5E8EB] bg-white px-5 pt-4 pb-10">
        <div className="w-29.25 shrink-0">
          <Button variant="secondary" onClick={handleCancel}>
            취소
          </Button>
        </div>
        <div className="min-w-0 flex-1">
          {/* 선택한 보호자가 없고 담당 시니어만 바꿨으면 저장 버튼 */}
          {!hasSelection && hasChanges ? (
            <Button disabled={isSaving} onClick={handleSave}>
              저장하기
            </Button>
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
