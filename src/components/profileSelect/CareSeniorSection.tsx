import ProfileAvatar from '@/components/profileSelect/ProfileAvatar';
import SectionTitle from '@/components/profileSelect/SectionTitle';
import type { CareSenior } from '@/types/profileSelect';

type CareSeniorSectionProps = {
  seniors: CareSenior[];
};

// 돌봄 대상 시니어
export default function CareSeniorSection({ seniors }: CareSeniorSectionProps) {
  return (
    <section className="flex flex-col gap-2.5">
      <SectionTitle title="돌봄 대상 시니어" count={seniors.length} />
      <ul className="grid grid-cols-2 gap-2.5">
        {seniors.map((senior, index) => (
          <li
            key={senior.id}
            className="flex flex-col gap-3 rounded-2xl border border-border-divider bg-bg-section p-3"
          >
            <ProfileAvatar name={senior.name} index={index} shape="circle" />
            <div className="flex flex-col">
              <span className="truncate text-[14px] font-bold text-text-title">
                {senior.name} 어르신
              </span>
              <span className="text-[11px] text-text-sub">
                만 {senior.age}세{senior.relation && ` · ${senior.relation}`}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
