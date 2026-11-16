import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';
import StepHeader from '@/components/common/StepHeader';
import GuardianCard from '@/components/guardians/GuardianCard';
import {
  changeGuardianSenior,
  deleteGuardians,
  getGuardians,
} from '@/mocks/guardians';
import { getSeniors } from '@/mocks/seniors';

const GuardianManagePage = () => {
  const navigate = useNavigate();
  const [guardians, setGuardians] = useState(getGuardians);
  const [seniors] = useState(getSeniors);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // 편집할 보호자가 없으면 목록으로
  if (guardians.length === 0) {
    return <Navigate to="/guardians" replace />;
  }

  const allIds = guardians.map(({ id }) => id);
  const isAllSelected = allIds.every((id) => selectedIds.includes(id));

  const toggleGuardian = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((prevId) => prevId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => setSelectedIds(isAllSelected ? [] : allIds);

  // 담당 시니어는 바로 반영
  const handleChangeSenior = (id: number, seniorId: number) => {
    changeGuardianSenior(id, seniorId);
    setGuardians(getGuardians());
  };

  const handleDelete = () => {
    deleteGuardians(selectedIds);
    setIsConfirmOpen(false);
    navigate(-1);
  };

  return (
    <div className="flex h-dvh flex-col">
      <StepHeader title="보호자 목록 편집" />

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
        {/* 검색은 화면이 정해지면 연결 */}
        <button
          type="button"
          aria-label="보호자 검색"
          className="flex size-6 items-center justify-center text-[#4B5563]"
        >
          <Search size={16} strokeWidth={2} aria-hidden />
        </button>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pt-3 pb-12">
        <ul className="flex flex-col gap-6">
          {guardians.map((guardian) => (
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
        message={'선택된 보호자가 삭제됩니다.\n정말 삭제하시겠습니까?'}
        cancelLabel="취소"
        confirmLabel="삭제하기"
        confirmVariant="danger"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default GuardianManagePage;
