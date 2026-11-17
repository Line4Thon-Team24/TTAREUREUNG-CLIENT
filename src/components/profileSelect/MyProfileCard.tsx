import { UserRound } from 'lucide-react';
import arrowRightGreenIcon from '@/assets/icons/arrow-right-green.svg';
import pencilIcon from '@/assets/icons/pencil.svg';

type MyProfileCardProps = {
  name: string;
  careLabel: string; // 예: '김순자 시니어 담당'
  profileImageUrl: string | null;
  onSelect: () => void;
};

// 내 프로필 선택 카드
export default function MyProfileCard({
  name,
  careLabel,
  profileImageUrl,
  onSelect,
}: MyProfileCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-6 rounded-[20px] border-2 border-border-focus bg-white p-5 text-left shadow-[0_4px_12px_0_rgba(205,235,216,0.9)]"
    >
      <span className="relative shrink-0">
        <span className="flex size-18 items-center justify-center overflow-hidden rounded-full border border-border-divider bg-status-planned-bg text-text-placeholder">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={`${name} 프로필 사진`}
              className="size-full object-cover"
            />
          ) : (
            <UserRound size={40} aria-hidden />
          )}
        </span>
        <span
          aria-hidden
          className="absolute right-0 bottom-0 flex size-6 items-center justify-center rounded-full bg-border-focus ring-2 ring-white"
        >
          <img src={pencilIcon} alt="" width={14} height={14} />
        </span>
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center gap-2 text-[12px] font-semibold text-border-focus">
          <span className="rounded-full bg-bg-secondary px-3 py-1">
            내 프로필
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-border-focus" />
            최근 접속
          </span>
        </span>
        <span className="truncate text-[22px] font-bold text-text-title">
          {name}
        </span>
        <span className="truncate text-[16px] text-text-body">{careLabel}</span>
      </span>

      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-secondary"
      >
        <img src={arrowRightGreenIcon} alt="" height={12} />
      </span>
    </button>
  );
}
