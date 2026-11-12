import { useEffect, useRef } from 'react';

type ConfirmModalProps = {
  open: boolean;
  message: string; // 줄바꿈(\n)은 그대로 표시
  cancelLabel: string;
  confirmLabel: string;
  confirmVariant?: 'primary' | 'danger';
  onCancel: () => void;
  onConfirm: () => void;
};

const CONFIRM_CLASS = {
  primary: 'bg-[#01A16A] active:bg-[#138A4B]',
  danger: 'bg-[#E5484D] active:bg-[#C93C40]',
};

// 확인 팝업 (기본 dialog 사용 → 포커스 가두기, Esc 닫기는 브라우저가 처리)
export default function ConfirmModal({
  open,
  message,
  cancelLabel,
  confirmLabel,
  confirmVariant = 'primary',
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // open 값에 맞춰 팝업 열기/닫기
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={message}
      // Esc로 닫을 때도 취소와 같은 동작
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      className="m-auto w-[calc(100%-86px)] max-w-79 rounded-[22px] border-0 bg-white p-6 drop-shadow-[4px_0_2px_rgba(0,0,0,0.1)] backdrop:bg-[rgba(45,45,45,0.6)]"
    >
      <div className="flex flex-col items-center gap-3">
        <p className="p-5 text-center text-[16px] font-bold whitespace-pre-line text-[#191F28]">
          {message}
        </p>
        <div className="flex w-full gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="h-13 flex-1 rounded-xl bg-[#E5E8EB] text-[16px] font-bold tracking-[-0.4px] whitespace-nowrap text-[#191F28] transition-colors active:bg-[#D1D6DB]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-13 flex-1 rounded-xl text-[16px] font-bold tracking-[-0.4px] whitespace-nowrap text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-colors ${CONFIRM_CLASS[confirmVariant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
