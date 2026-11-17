import ProfileAvatar from '@/components/profileSelect/ProfileAvatar';
import SectionTitle from '@/components/profileSelect/SectionTitle';
import plusIcon from '@/assets/icons/plus.svg';
import type { FamilyMember } from '@/types/profileSelect';

type FamilyMemberSectionProps = {
  members: FamilyMember[];
  onInvite: () => void;
};

// 가족 및 공동 보호자 목록 + 멤버 초대
export default function FamilyMemberSection({
  members,
  onInvite,
}: FamilyMemberSectionProps) {
  return (
    <section className="flex flex-col gap-2.5">
      <SectionTitle title="가족 및 공동 보호자" count={members.length} />
      <ul className="grid grid-cols-4 gap-3">
        {members.map((member, index) => (
          <li key={member.id} className="flex flex-col items-center gap-2">
            <ProfileAvatar name={member.name} index={index} shape="square" />
            <span className="flex flex-col items-center">
              <span className="max-w-full truncate text-[12px] leading-5 font-semibold text-text-title">
                {member.name}
              </span>
              <span className="text-[10px] text-text-sub">
                {member.relation}
              </span>
            </span>
          </li>
        ))}

        <li className="flex flex-col items-center gap-2">
          <button
            type="button"
            aria-label="멤버 초대"
            onClick={onInvite}
            className="flex size-16 items-center justify-center rounded-2xl border border-dashed border-status-planned bg-bg-section"
          >
            <img src={plusIcon} alt="" width={15} height={15} />
          </button>
          <span className="flex flex-col items-center">
            <span className="text-[12px] font-semibold text-text-sub">
              멤버 초대
            </span>
            <span className="text-[10px] leading-5 font-semibold text-status-planned">
              + 추가
            </span>
          </span>
        </li>
      </ul>
    </section>
  );
}
