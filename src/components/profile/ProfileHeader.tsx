import { UserRound } from 'lucide-react';
import arrowRightIcon from '@/assets/icons/arrow-right.svg';
import pencilIcon from '@/assets/icons/pencil.svg';
import { MEMBERSHIP_LABEL } from '@/constants/profile';
import type { Profile } from '@/types/profile';

type ProfileHeaderProps = {
  profile: Profile;
  careLabel: string; // 예: '김순자 시니어 담당'
  onEditImage?: () => void;
  onDetail?: () => void;
};

// 프로필 상단: 프로필 사진(편집 버튼) + 이름·멤버십 + 담당 시니어
export default function ProfileHeader({
  profile,
  careLabel,
  onEditImage,
  onDetail,
}: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-6 px-5 py-3">
      <div className="relative shrink-0">
        <div className="flex size-18 items-center justify-center overflow-hidden rounded-full border border-border-divider bg-status-planned-bg text-text-placeholder">
          {profile.profileImageUrl ? (
            <img
              src={profile.profileImageUrl}
              alt={`${profile.name} 프로필 사진`}
              className="size-full object-cover"
            />
          ) : (
            <UserRound size={40} aria-hidden />
          )}
        </div>

        <button
          type="button"
          aria-label="프로필 사진 편집"
          onClick={onEditImage}
          className="absolute right-0 bottom-0 flex size-6.5 items-center justify-center rounded-full bg-[#01A16A] ring-2 ring-white"
        >
          <img src={pencilIcon} alt="" width={14} height={14} />
        </button>
      </div>

      <button
        type="button"
        onClick={onDetail}
        className="flex min-w-0 flex-1 items-start justify-between text-left"
      >
        <span className="flex min-w-0 flex-col gap-2">
          <span className="flex items-center gap-2">
            <span className="truncate text-[22px] font-bold text-text-title">
              {profile.name}
            </span>
            <span className="rounded-full bg-bg-secondary px-2 py-0.5 text-[12px] font-semibold text-border-focus">
              {MEMBERSHIP_LABEL}
            </span>
          </span>
          <span className="text-[16px] text-text-body">{careLabel}</span>
        </span>
        <img src={arrowRightIcon} alt="" height={10} className="mt-2" />
      </button>
    </div>
  );
}
