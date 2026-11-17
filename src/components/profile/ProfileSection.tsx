import type { ReactNode } from 'react';

type ProfileSectionProps = {
  title: string;
  badge?: string;
  children: ReactNode;
};

export default function ProfileSection({
  title,
  badge,
  children,
}: ProfileSectionProps) {
  return (
    <section className="flex flex-col gap-3 border-t border-border-divider p-5 first-of-type:border-t-0">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-text-title">{title}</h2>
        {badge && (
          <span className="rounded-full bg-bg-secondary px-2 py-0.5 text-[12px] font-semibold text-border-focus">
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}
