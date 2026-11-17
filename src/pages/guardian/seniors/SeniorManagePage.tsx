import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';
import StepHeader from '@/components/common/StepHeader';
import SeniorCard from '@/components/seniors/SeniorCard';
import { getMedicines } from '@/mocks/medicines';
import { deleteSeniors, getSeniors } from '@/mocks/seniors';

const SeniorManagePage = () => {
  const navigate = useNavigate();
  // 목록과 같은 최근 추가순
  const [seniors] = useState(() =>
    getSeniors().sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // 편집할 시니어가 없으면 목록으로
  if (seniors.length === 0) {
    return <Navigate to="/seniors" replace />;
  }

  const allIds = seniors.map(({ id }) => id);
  const isAllSelected = allIds.every((id) => selectedIds.includes(id));

  const toggleSenior = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((prevId) => prevId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => setSelectedIds(isAllSelected ? [] : allIds);

  const handleDelete = () => {
    deleteSeniors(selectedIds);
    setIsConfirmOpen(false);
    // 주소로 바로 들어온 경우에도 목록으로
    navigate('/seniors', { replace: true });
  };

  return (
    <div className="flex h-dvh flex-col">
      <StepHeader title="시니어 목록 편집" />

      <div className="flex items-center justify-between px-5 py-4">
        <label className="flex items-center gap-2 px-1.25 text-[14px] font-semibold text-[#191F28]">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={toggleAll}
            className="size-4 accent-[#01A16A]"
          />
          전체 선택
        </label>
        {/* 검색은 이름 검색 작업 때 연결 */}
        <button
          type="button"
          aria-label="시니어 검색"
          className="flex size-6 items-center justify-center text-[#4B5563]"
        >
          <Search size={16} strokeWidth={2} aria-hidden />
        </button>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pt-3 pb-12">
        <ul className="flex flex-col gap-6">
          {seniors.map((senior) => (
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
      </main>

      <div className="z-10 flex shrink-0 gap-3 border-t border-[#E5E8EB] bg-white px-5 pt-4 pb-10">
        <div className="w-29.25 shrink-0">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            취소
          </Button>
        </div>
        <div className="min-w-0 flex-1">
          <Button
            variant="danger"
            disabled={selectedIds.length === 0}
            onClick={() => setIsConfirmOpen(true)}
          >
            삭제하기
          </Button>
        </div>
      </div>

      <ConfirmModal
        open={isConfirmOpen}
        message={
          '선택된 시니어와 등록된 약 정보가 삭제됩니다.\n정말 삭제하시겠습니까?'
        }
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
