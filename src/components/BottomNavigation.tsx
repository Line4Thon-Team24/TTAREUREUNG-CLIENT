import { NavLink } from 'react-router-dom';
import {
  Calendar,
  CircleUserRound,
  FileText,
  Pill,
  Users,
  type LucideIcon,
} from 'lucide-react';

// 하단 safe area(홈 인디케이터)만큼 높이를 추가로 확보
export const BOTTOM_NAVIGATION_HEIGHT =
  'calc(88px + env(safe-area-inset-bottom))';

type Tab = {
  label: string;
  to: string;
  Icon: LucideIcon;
};

const TABS: Tab[] = [
  { label: '복용 일정', to: '/schedule', Icon: Calendar },
  { label: '약 목록', to: '/medicines', Icon: Pill },
  { label: '시니어 목록', to: '/seniors', Icon: Users },
  { label: '보호자 목록', to: '/guardians', Icon: FileText },
  { label: '프로필', to: '/profile', Icon: CircleUserRound },
];

const tabClassName = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center gap-1 ${isActive ? 'text-[#01A16A]' : 'text-[#191F28]'}`;

export default function BottomNavigation() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-100.5 -translate-x-1/2 items-center justify-between border-t border-[#E5E8EB] bg-white px-5 pb-[env(safe-area-inset-bottom)]"
      style={{ height: BOTTOM_NAVIGATION_HEIGHT }}
    >
      {TABS.map(({ label, to, Icon }) => (
        <NavLink key={to} to={to} className={tabClassName}>
          {/* 아이콘 색은 currentColor라 활성/비활성 글자색을 그대로 따라감 */}
          <Icon size={20} aria-hidden />
          <span className="text-[12px] leading-3.75 font-medium tracking-[-0.25px] whitespace-nowrap">
            {label}
          </span>
        </NavLink>
      ))}
    </nav>
  );
}
