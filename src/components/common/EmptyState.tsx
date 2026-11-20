import { Plus } from 'lucide-react';

type EmptyStateProps = {
  message: string;
  actionLabel: string;
  onAction: () => void;
};

// 데이터가 없을 때 안내 문구 + 등록 버튼
export default function EmptyState({
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-[12px] text-black">{message}</p>
      <button
        type="button"
        onClick={onAction}
        className="flex items-center gap-1.5 rounded-full bg-[#01A16A] px-4 py-2 text-[14px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-transform active:scale-95 motion-reduce:transition-none"
      >
        <Plus size={16} aria-hidden />
        {actionLabel}
      </button>
    </div>
  );
}
