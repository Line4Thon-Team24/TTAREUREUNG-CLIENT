import { useEffect, useState, type ReactNode } from 'react';
import appIcon from '@/assets/images/alert-app-icon.png';
import useGuardianAlerts from '@/hooks/useGuardianAlerts';
import type { AlertType, GuardianAlert } from '@/types/alert';
import { formatKoreanTime } from '@/utils/schedule';

// 배너가 자동으로 사라지기까지 시간
const AUTO_DISMISS_MS = 5_000;

const TITLES: Record<AlertType, string> = {
  completed: '약 복용 완료',
  partial: '약 일부 복용',
  missed: '약 미복용',
  helpRequest: '도움 요청',
  upcoming: '약 복용 예정',
};

const Green = ({ children }: { children: ReactNode }) => (
  <span className="text-status-done">{children}</span>
);
const Orange = ({ children }: { children: ReactNode }) => (
  <span className="text-status-partial">{children}</span>
);
const Red = ({ children }: { children: ReactNode }) => (
  <span className="text-status-missed">{children}</span>
);

// 알림 종류별 문구 (일부 복용·도움 요청은 Figma에 없어 같은 형식으로 작성)
const renderMessage = (alert: GuardianAlert, minutesLeft: number) => {
  const name = `${alert.seniorName}님께서`;
  // 'YYYY-MM-DDTHH:mm:ss' → '오후 3시'
  const time = formatKoreanTime(alert.scheduledAt.slice(11, 16));
  switch (alert.type) {
    case 'completed':
      return (
        <>
          {name} <Green>{alert.occurredAt.slice(11, 16)}</Green> {time} 약{' '}
          <Green>복용 완료</Green>하였습니다.
        </>
      );
    case 'partial':
      return (
        <>
          {name} {time} 약 <Orange>일부 복용</Orange> 하였습니다.
        </>
      );
    case 'missed':
      return (
        <>
          {name} {time} 약 <Red>미복용</Red> 하였습니다.
        </>
      );
    case 'helpRequest':
      return (
        <>
          {name} {time} 약 복용 중 <Red>도움을 요청</Red>하였습니다.
        </>
      );
    case 'upcoming':
      return (
        <>
          {name} {minutesLeft}분 후 {time} 약 복용 예정입니다.
        </>
      );
  }
};

// 알림이 생긴 지 얼마나 지났는지 (예: '방금', '10분 전')
const formatElapsed = (occurredAt: string, now: number) => {
  const minutes = Math.floor((now - new Date(occurredAt).getTime()) / 60_000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  return `${Math.floor(minutes / 60)}시간 전`;
};

// 보호자 화면 상단 알림 배너 (몇 초 뒤 자동으로 닫히고, 누르면 바로 닫힘)
export default function GuardianAlertBanner() {
  const { current, dismiss } = useGuardianAlerts();
  if (!current) return null;
  return <AlertCard key={current.key} alert={current} onClose={dismiss} />;
}

const AlertCard = ({
  alert,
  onClose,
}: {
  alert: GuardianAlert;
  onClose: () => void;
}) => {
  // 배너를 띄운 시각 기준으로 계산 (대기하는 동안 지난 시간 반영)
  const [now] = useState(Date.now);
  const elapsed = formatElapsed(alert.occurredAt, now);
  const minutesLeft = Math.ceil(
    (new Date(alert.scheduledAt).getTime() - now) / 60_000
  );
  // 복용 시각이 이미 지난 예정 알림은 띄우지 않고 넘김
  const isExpired = alert.type === 'upcoming' && minutesLeft <= 0;

  useEffect(() => {
    const timer = window.setTimeout(onClose, isExpired ? 0 : AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [onClose, isExpired]);

  if (isExpired) return null;

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 top-3.5 z-60 mx-auto w-full max-w-100.5 px-2"
    >
      <button
        type="button"
        onClick={onClose}
        className="pointer-events-auto flex w-full animate-slide-down flex-col gap-1 overflow-hidden rounded-[20px] bg-[#F3F3F3]/90 p-4 text-left backdrop-blur-[2px] motion-reduce:animate-none"
      >
        <span className="flex w-full items-center justify-between text-[14px] text-[#333D4B]/80">
          <span className="flex items-center gap-2">
            <img src={appIcon} alt="" width={32} height={32} />
            따르릉
          </span>
          {elapsed}
        </span>
        <span className="flex flex-col gap-1 text-[16px]">
          <span className="font-semibold text-[#191F28]">
            {TITLES[alert.type]}
          </span>
          <span className="font-medium text-[#333D4B]">
            {renderMessage(alert, minutesLeft)}
          </span>
        </span>
      </button>
    </div>
  );
};
