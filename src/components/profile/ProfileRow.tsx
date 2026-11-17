import type { ReactNode } from 'react';
import arrowRightIcon from '@/assets/icons/arrow-right.svg';

type ProfileRowProps = {
  label: ReactNode;
  value?: ReactNode;
  valueClassName?: string;
  onClick?: () => void;
};

const BASE_CLASS =
  'flex w-full items-center justify-between gap-2 py-2 text-left';

export default function ProfileRow({
  label,
  value,
  valueClassName = 'text-text-body',
  onClick,
}: ProfileRowProps) {
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-3 text-[16px] font-medium text-text-body">
        {label}
      </span>
      <span
        className={`flex shrink-0 items-center gap-3 text-[16px] ${valueClassName}`}
      >
        {value}
        {onClick && <img src={arrowRightIcon} alt="" height={10} />}
      </span>
    </>
  );

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={`${BASE_CLASS} active:opacity-60`}
    >
      {content}
    </button>
  ) : (
    <div className={BASE_CLASS}>{content}</div>
  );
}
