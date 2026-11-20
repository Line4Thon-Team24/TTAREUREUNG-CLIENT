import ProfileAvatar from '@/components/profileSelect/ProfileAvatar';
import SectionTitle from '@/components/profileSelect/SectionTitle';
import type { CareSenior } from '@/types/profileSelect';

type CareSeniorSectionProps = {
  seniors: CareSenior[];
  onSelect: (profileId: number) => void;
};

// 돌봄 대상 시니어 (누르면 해당 시니어 화면으로 진입)
export default function CareSeniorSection({
  seniors,
  onSelect,
}: CareSeniorSectionProps) {
  return (
    <section className="flex flex-col gap-2.5">
      <SectionTitle title="돌봄 대상 시니어" count={seniors.length} />
      <ul className="grid grid-cols-2 gap-2.5">
        {seniors.map((senior, index) => (
          <li key={senior.id}>
            <button
              type="button"
              onClick={() => onSelect(senior.id)}
              className="flex w-full flex-col gap-3 rounded-2xl border border-border-divider bg-bg-section p-3 text-left"
            >
              <ProfileAvatar name={senior.name} index={index} shape="circle" />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[14px] font-bold text-text-title">
                  {senior.name} 어르신
                </span>
                <span className="text-[11px] text-text-sub">
                  {[
                    senior.age !== null && `만 ${senior.age}세`,
                    senior.relation,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
