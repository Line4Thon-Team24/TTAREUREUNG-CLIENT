import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import scheduleIcon from '@/assets/icons/tab-schedule.svg';
import medicineIcon from '@/assets/icons/tab-medicine.svg';
import seniorIcon from '@/assets/icons/tab-senior.svg';
import guardianIcon from '@/assets/icons/tab-guardian.svg';
import profileDefaultImage from '@/assets/images/profile-default.png';

// 하단 safe area(홈 인디케이터)만큼 높이를 추가로 확보
export const BOTTOM_NAVIGATION_HEIGHT =
  'calc(88px + env(safe-area-inset-bottom))';

type IconTab = {
  label: string;
  to: string;
  icon: { src: string; width: number; height: number };
};

// 아이콘 크기는 피그마 SVG 원본 크기 그대로 사용 (20x20 박스 안에 가운데 정렬)
const ICON_TABS: IconTab[] = [
  {
    label: '복용 일정',
    to: ROUTES.SCHEDULE,
    icon: { src: scheduleIcon, width: 16.6667, height: 18.3332 },
  },
  {
    label: '약 목록',
    to: ROUTES.MEDICINES,
    icon: { src: medicineIcon, width: 18.3092, height: 18.3092 },
  },
  {
    label: '시니어 목록',
    to: ROUTES.SENIORS,
    icon: { src: seniorIcon, width: 20.0007, height: 16.6667 },
  },
  {
    label: '보호자 목록',
    to: ROUTES.GUARDIANS,
    icon: { src: guardianIcon, width: 15.75, height: 18.75 },
  },
];

const tabClassName = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center gap-1 ${isActive ? 'text-[#01A16A]' : 'text-[#191F28]'}`;

const labelClassName =
  'text-[12px] leading-[15px] font-medium tracking-[-0.25px] whitespace-nowrap';

// SVG 원본은 단색 stroke라서 mask로 그려 현재 글자색(활성/비활성)을 그대로 입힘
function TabIcon({ src, width, height }: IconTab['icon']) {
  return (
    <span className="flex size-5 items-center justify-center" aria-hidden>
      <span
        className="bg-current"
        style={{
          width,
          height,
          maskImage: `url(${src})`,
          WebkitMaskImage: `url(${src})`,
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
      />
    </span>
  );
}

export default function BottomNavigation() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-[402px] -translate-x-1/2 items-center justify-between border-t border-[#E5E8EB] bg-white px-5 pb-[env(safe-area-inset-bottom)]"
      style={{ height: BOTTOM_NAVIGATION_HEIGHT }}
    >
      {ICON_TABS.map(({ label, to, icon }) => (
        <NavLink key={to} to={to} className={tabClassName}>
          <TabIcon {...icon} />
          <span className={labelClassName}>{label}</span>
        </NavLink>
      ))}
      <NavLink to={ROUTES.PROFILE} className={tabClassName}>
        {({ isActive }) => (
          <>
            <span
              className={`flex size-5 items-center justify-center rounded-full border ${isActive ? 'border-[#01A16A]' : 'border-[#191F28]'}`}
            >
              <img
                src={profileDefaultImage}
                alt=""
                width={18}
                height={18}
                className="size-[18px] rounded-full"
              />
            </span>
            <span className={labelClassName}>프로필</span>
          </>
        )}
      </NavLink>
    </nav>
  );
}
