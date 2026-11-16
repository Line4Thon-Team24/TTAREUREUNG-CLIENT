import { useEffect, useRef } from 'react';
import MedicineCard from '@/components/medicines/MedicineCard';
import type { Medicine } from '@/types/medicine';

type MedicineDetailModalProps = {
  medicine: Medicine | null; // null이면 닫힘
  onClose: () => void;
};

// 약 상세 팝업
export default function MedicineDetailModal({
  medicine,
  onClose,
}: MedicineDetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (medicine && !dialog.open) dialog.showModal();
    if (!medicine && dialog.open) dialog.close();
  }, [medicine]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={medicine ? `${medicine.name} 상세 정보` : undefined}
      // Esc로 닫기
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // 바깥(배경) 클릭 시 닫기
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[calc(100%-40px)] max-w-90.5 border-0 bg-transparent p-0 backdrop:bg-black/60 backdrop:backdrop-blur-[2.5px]"
    >
      {medicine && <MedicineCard medicine={medicine} onClose={onClose} />}
    </dialog>
  );
}
