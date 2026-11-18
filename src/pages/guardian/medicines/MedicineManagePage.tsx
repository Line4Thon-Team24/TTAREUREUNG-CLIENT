import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { deleteMedicines, fetchMedicines } from '@/apis/medicine';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';
import SearchField from '@/components/common/SearchField';
import StepHeader from '@/components/common/StepHeader';
import MedicineCard from '@/components/medicines/MedicineCard';
import useGoBack from '@/hooks/useGoBack';
import useLatestRequest from '@/hooks/useLatestRequest';
import type { ApiError } from '@/types/api';
import type { Medicine } from '@/types/medicine';
import { filterMedicines } from '@/utils/medicineSearch';

// 삭제 전 팝업 단계: 의사 확인 → 삭제 확인
type ModalStep = 'doctor' | 'confirm' | null;

const MedicineManagePage = () => {
  const goBack = useGoBack();
  const startRequest = useLatestRequest();
  const [searchParams] = useSearchParams();
  const seniorId = Number(searchParams.get('seniorId'));

  // null이면 불러오는 중
  const [medicines, setMedicines] = useState<Medicine[] | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLoadError, setIsLoadError] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [keyword, setKeyword] = useState('');
  const [modalStep, setModalStep] = useState<ModalStep>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteError, setIsDeleteError] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetchMedicines(seniorId)
      .then((data) => {
        if (!ignore) setMedicines(data);
      })
      .catch((error: ApiError) => {
        if (ignore) return;
        // 없는 시니어(404)·잘못된 주소(400)면 약 목록으로
        if (error.status === 404 || error.status === 400) setIsNotFound(true);
        else setIsLoadError(true);
      });
    return () => {
      ignore = true;
    };
  }, [seniorId]);

  // 편집할 약이 없으면 약 목록으로 이동
  if (isNotFound || medicines?.length === 0) {
    return <Navigate to="/medicines" replace />;
  }

  const visibleMedicines = filterMedicines(medicines ?? [], keyword);
  const visibleIds = visibleMedicines.map(({ id }) => id);
  const isAllSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const count = selectedIds.length;

  const toggleMedicine = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((prevId) => prevId !== id) : [...prev, id]
    );
  };

  // 전체 선택은 지금 보이는(검색된) 약 기준
  const toggleAll = () => {
    setSelectedIds((prev) =>
      isAllSelected
        ? prev.filter((id) => !visibleIds.includes(id))
        : [...new Set([...prev, ...visibleIds])]
    );
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    const isLatest = startRequest();
    setIsDeleting(true);
    setIsDeleteError(false);
    setModalStep(null);
    try {
      await deleteMedicines(selectedIds);
      // 화면을 떠났으면 이동하지 않음
      if (!isLatest()) return;
      goBack(`/medicines?seniorId=${seniorId}`);
    } catch {
      if (!isLatest()) return;
      setIsDeleteError(true);
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col">
      <StepHeader
        title="약 목록 편집"
        onBack={() => goBack(`/medicines?seniorId=${seniorId}`)}
      />

      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
        <label className="flex shrink-0 items-center gap-2 px-1.25 text-[14px] font-semibold text-[#191F28]">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={toggleAll}
            disabled={visibleIds.length === 0}
            className="size-4 accent-[#01A16A]"
          />
          전체 선택
        </label>
        <SearchField
          value={keyword}
          onChange={setKeyword}
          placeholder="약 검색"
          aria-label="약 검색"
          className="w-45.25"
        />
      </div>

      {/* 목록만 스크롤, 마지막 카드가 하단 버튼에 가리지 않도록 아래 여백 확보 */}
      <main className="min-h-0 flex-1 overflow-y-auto px-5 pt-2 pb-12">
        {isLoadError ? (
          <p className="pt-20 text-center text-[14px] text-[#6B7684]">
            약 목록을 불러오지 못했어요.
          </p>
        ) : medicines === null ? null : visibleMedicines.length === 0 ? (
          <p className="pt-20 text-center text-[14px] text-[#6B7684]">
            검색 결과가 없어요.
          </p>
        ) : (
          <ul className="flex flex-col gap-6">
            {visibleMedicines.map((medicine) => (
              <li key={medicine.id}>
                <MedicineCard
                  medicine={medicine}
                  selectable
                  selected={selectedIds.includes(medicine.id)}
                  onToggleSelect={() => toggleMedicine(medicine.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      {isDeleteError && (
        <p
          role="alert"
          className="shrink-0 border-t border-[#E5E8EB] bg-white px-5 pt-4 text-center text-[13px] text-[#E5484D]"
        >
          약 삭제에 실패했어요. 다시 시도해주세요.
        </p>
      )}
      <div className="z-10 flex shrink-0 gap-3 border-t border-[#E5E8EB] bg-white px-5 pt-4 pb-10">
        <div className="w-29.25 shrink-0">
          <Button
            variant="secondary"
            onClick={() => goBack(`/medicines?seniorId=${seniorId}`)}
          >
            취소
          </Button>
        </div>
        <div className="min-w-0 flex-1">
          <Button
            variant="danger"
            disabled={count === 0 || isDeleting}
            onClick={() => setModalStep('doctor')}
          >
            {count > 0 ? `${count}개 삭제하기` : '삭제하기'}
          </Button>
        </div>
      </div>

      <ConfirmModal
        open={modalStep === 'doctor'}
        message={'담당 의사와 논의 후\n삭제해야 합니다.'}
        cancelLabel="논의 안 함"
        confirmLabel="논의함"
        onCancel={() => setModalStep(null)}
        onConfirm={() => setModalStep('confirm')}
      />
      <ConfirmModal
        open={modalStep === 'confirm'}
        message={'선택된 약 목록이 삭제됩니다.\n정말 삭제하시겠습니까?'}
        cancelLabel="취소"
        confirmLabel="삭제하기"
        confirmVariant="danger"
        onCancel={() => setModalStep(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default MedicineManagePage;
