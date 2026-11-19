import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import {
  deleteGuardianLinks,
  fetchGuardians,
  linkGuardianSenior,
} from '@/apis/guardian';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import SearchField from '@/components/common/SearchField';
import StepHeader from '@/components/common/StepHeader';
import GuardianCard from '@/components/guardians/GuardianCard';
import useGoBack from '@/hooks/useGoBack';
import useLatestRequest from '@/hooks/useLatestRequest';
import useSeniors from '@/hooks/useSeniors';
import type { Guardian, GuardianGroup } from '@/types/guardian';
import { groupByGuardian } from '@/utils/guardian';
import { filterByName } from '@/utils/nameSearch';

// 삭제 확인 / 변경 취소 확인
type ModalStep = 'delete' | 'discard' | null;

const GuardianManagePage = () => {
  const goBack = useGoBack();
  const startRequest = useLatestRequest();
  // null이면 불러오는 중
  const [links, setLinks] = useState<Guardian[] | null>(null);
  const [myGuardianIds, setMyGuardianIds] = useState<number[]>([]);
  const [isLoadError, setIsLoadError] = useState(false);
  const { seniors } = useSeniors();
  // 삭제할 보호자 (보호자 프로필 id)
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // 저장 전 담당 시니어 선택 (보호자 프로필 id → 시니어 id 목록)
  const [seniorSelections, setSeniorSelections] = useState<
    Record<number, number[]>
  >({});
  const [modalStep, setModalStep] = useState<ModalStep>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveError, setIsSaveError] = useState(false);
  // 다시 시도하면 값이 바뀌어 다시 불러옴
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    fetchGuardians()
      .then(({ guardians: data, myGuardianIds: guardianIds }) => {
        if (ignore) return;
        setLinks(data);
        setMyGuardianIds(guardianIds);
      })
      .catch(() => {
        if (!ignore) setIsLoadError(true);
      });
    return () => {
      ignore = true;
    };
  }, [loadAttempt]);

  // 편집할 보호자가 없으면 목록으로
  if (links?.length === 0) {
    return <Navigate to="/guardians" replace />;
  }

  const groups = groupByGuardian(links ?? []);
  const hasChanges = Object.keys(seniorSelections).length > 0;
  const hasSelection = selectedIds.length > 0;

  const visibleGroups = filterByName(groups, keyword);
  const visibleIds = visibleGroups.map(({ profileId }) => profileId);
  const isAllSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  // 검색으로 가려졌지만 선택된 보호자 (삭제 확인 때 함께 안내)
  const hiddenCount = selectedIds.filter(
    (id) => !visibleIds.includes(id)
  ).length;

  const getOriginalSeniorIds = (group: GuardianGroup) =>
    group.assignments.map(({ seniorId }) => seniorId);

  const getSelectedSeniorIds = (group: GuardianGroup) =>
    seniorSelections[group.profileId] ?? getOriginalSeniorIds(group);

  // 드롭다운 선택지: 내 계정 보호자는 내 시니어 전체, 다른 계정 보호자는 지금 담당만
  // 담당이 1명뿐이면 빼기 막음 (보호자를 빼려면 체크박스로 삭제), 다른 계정 보호자는 추가 막음
  const getSeniorOptions = (group: GuardianGroup) => {
    const isMine = myGuardianIds.includes(group.profileId);
    const selected = getSelectedSeniorIds(group);
    const options = isMine
      ? (seniors ?? []).map(({ id, name }) => ({ id, name }))
      : [];
    for (const { seniorId, seniorName } of group.assignments) {
      // 다른 계정 시니어는 내 시니어 목록에 없어 직접 추가
      if (!options.some(({ id }) => id === seniorId)) {
        options.push({ id: seniorId, name: seniorName });
      }
    }
    const original = getOriginalSeniorIds(group);
    return options.map((option) => {
      const isSelected = selected.includes(option.id);
      return {
        ...option,
        // 다른 계정 보호자도 원래 담당이던 시니어는 다시 체크할 수 있음
        disabled: isSelected
          ? selected.length === 1
          : !isMine && !original.includes(option.id),
      };
    });
  };

  // 체크한 시니어를 저장 전까지 화면에만 반영 (처음과 같아지면 변경 없음)
  const toggleSenior = (group: GuardianGroup, seniorId: number) => {
    const current = getSelectedSeniorIds(group);
    const next = current.includes(seniorId)
      ? current.filter((id) => id !== seniorId)
      : [...current, seniorId];
    const original = getOriginalSeniorIds(group);
    const isSame =
      next.length === original.length &&
      next.every((id) => original.includes(id));
    setSeniorSelections((prev) => {
      const updated = { ...prev };
      if (isSame) delete updated[group.profileId];
      else updated[group.profileId] = next;
      return updated;
    });
  };

  const toggleGuardian = (profileId: number) => {
    setSelectedIds((prev) =>
      prev.includes(profileId)
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId]
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

  // 담당 시니어 변경 저장 (추가 → 연결, 뺀 시니어 → 연결 해제, 삭제할 보호자는 제외)
  // 하나라도 실패하면 true
  const saveSeniorChanges = async (excludeIds: number[]) => {
    const changes = groups.flatMap((group) => {
      const next = seniorSelections[group.profileId];
      if (!next || excludeIds.includes(group.profileId)) return [];
      const original = getOriginalSeniorIds(group);
      return [
        {
          profileId: group.profileId,
          addSeniorIds: next.filter((id) => !original.includes(id)),
          removeLinkIds: group.assignments
            .filter(({ seniorId }) => !next.includes(seniorId))
            .map(({ linkId }) => linkId),
        },
      ];
    });
    // 추가 먼저 (빼는 연결이 대표면 서버가 남은 연결에 대표를 넘김)
    const addResults = await Promise.all(
      changes.map(({ profileId, addSeniorIds }) =>
        Promise.allSettled(
          addSeniorIds.map((id) => linkGuardianSenior(profileId, id))
        )
      )
    );
    // 추가에 실패한 보호자는 기존 담당을 해제하지 않음 (담당이 모두 사라지는 것 방지)
    const failedAddIndexes = addResults.flatMap((results, index) =>
      results.some(({ status }) => status === 'rejected') ? [index] : []
    );
    const removeLinkIds = changes
      .filter((_, index) => !failedAddIndexes.includes(index))
      .flatMap(({ removeLinkIds: ids }) => ids);
    const failedRemovals = await deleteGuardianLinks(removeLinkIds);
    return failedAddIndexes.length > 0 || failedRemovals.length > 0;
  };

  // 일부 실패: 서버 상태와 맞추려고 목록을 다시 불러오고 안내
  const reloadAfterFailure = async () => {
    setSeniorSelections({});
    setSelectedIds([]);
    setIsSaving(false);
    try {
      const { guardians: data, myGuardianIds: guardianIds } =
        await fetchGuardians();
      setLinks(data);
      setMyGuardianIds(guardianIds);
      // 다시 불러오기에 성공했을 때만 안내 (실패하면 불러오기 실패 문구 표시)
      setIsSaveError(true);
    } catch {
      setIsLoadError(true);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;

    const isLatest = startRequest();
    setIsSaving(true);
    setIsSaveError(false);
    const hasFailure = await saveSeniorChanges([]);
    // 화면을 떠났으면 처리하지 않음
    if (!isLatest()) return;
    if (hasFailure) await reloadAfterFailure();
    else goBack('/guardians');
  };

  // 선택한 보호자의 담당을 모두 해제 + 나머지 보호자의 변경 저장
  const handleDelete = async () => {
    if (isSaving) return;

    const isLatest = startRequest();
    const deleteIds = selectedIds;
    const deleteLinkIds = groups
      .filter(({ profileId }) => deleteIds.includes(profileId))
      .flatMap(({ assignments }) => assignments.map(({ linkId }) => linkId));
    setModalStep(null);
    setIsSaving(true);
    setIsSaveError(false);
    const [hasChangeFailure, failedDeletes] = await Promise.all([
      saveSeniorChanges(deleteIds),
      deleteGuardianLinks(deleteLinkIds),
    ]);
    // 화면을 떠났으면 처리하지 않음
    if (!isLatest()) return;
    if (hasChangeFailure || failedDeletes.length > 0) {
      await reloadAfterFailure();
    } else {
      goBack('/guardians');
    }
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
          <ErrorState
            message="보호자 목록을 불러오지 못했어요."
            onRetry={() => {
              // 저장 실패 뒤 남은 예전 목록으로 편집하지 않도록 비우고 다시 불러옴
              setLinks(null);
              setIsLoadError(false);
              setLoadAttempt((prev) => prev + 1);
            }}
            className="pt-20"
          />
        ) : links === null ? (
          <LoadingState className="pt-20" />
        ) : visibleGroups.length === 0 ? (
          <p className="pt-20 text-center text-[14px] text-[#6B7684]">
            검색 결과가 없어요.
          </p>
        ) : (
          <ul className="flex flex-col gap-6">
            {visibleGroups.map((group) => (
              <li key={group.profileId}>
                <GuardianCard
                  guardian={group}
                  assignments={group.assignments}
                  edit={{
                    selected: selectedIds.includes(group.profileId),
                    onToggleSelect: () => toggleGuardian(group.profileId),
                    seniorOptions: getSeniorOptions(group),
                    selectedSeniorIds: getSelectedSeniorIds(group),
                    onToggleSenior: (seniorId) => toggleSenior(group, seniorId),
                  }}
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
          일부를 저장하지 못해 최신 목록을 다시 불러왔어요.
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
              disabled={!hasSelection || isSaving}
              onClick={() => setModalStep('delete')}
            >
              {hasSelection ? `${selectedIds.length}명 삭제하기` : '삭제하기'}
            </Button>
          )}
        </div>
      </div>

      <ConfirmModal
        open={modalStep === 'delete'}
        message={`선택된 보호자 ${selectedIds.length}명이 담당 시니어에서 모두 빠집니다.${
          hiddenCount > 0
            ? `\n(검색 결과에 보이지 않는 ${hiddenCount}명 포함)`
            : ''
        }\n보호자 정보는 그대로 남아요.\n정말 삭제하시겠습니까?`}
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
