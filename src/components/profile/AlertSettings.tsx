import arrowDownIcon from '@/assets/icons/arrow-down.svg';
import { ALERT_LEAD_OPTIONS } from '@/constants/profile';
import type {
  AlertLeadMinutes,
  AlertSettings as AlertSettingsValue,
} from '@/types/profile';

type AlertSettingsProps = {
  value: AlertSettingsValue;
  onChange: (value: AlertSettingsValue) => void;
};

// 알림 설정: 복용 일정 임박 알림 시간 선택 + 복용 완료 알림 ON/OFF
export default function AlertSettings({ value, onChange }: AlertSettingsProps) {
  return (
    <>
      <div className="flex min-h-8 items-center justify-between">
        <label
          htmlFor="alert-lead-minutes"
          className="text-[16px] font-medium text-text-body"
        >
          복용 일정 임박 시 알림
        </label>
        <div className="relative">
          <select
            id="alert-lead-minutes"
            value={value.leadMinutes}
            onChange={(e) =>
              onChange({
                ...value,
                leadMinutes: Number(e.target.value) as AlertLeadMinutes,
              })
            }
            className="appearance-none rounded-md border border-border-divider bg-bg-section py-1 pr-5 pl-2 text-[12px] font-semibold text-text-sub outline-none focus:border-border-focus"
          >
            {ALERT_LEAD_OPTIONS.map(({ label, value: option }) => (
              <option key={option} value={option}>
                {label}
              </option>
            ))}
          </select>
          <img
            src={arrowDownIcon}
            alt=""
            width={8}
            className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2"
          />
        </div>
      </div>

      <div className="flex min-h-12 items-center justify-between gap-3">
        <span
          id="alert-complete-label"
          className="text-[16px] font-medium text-text-body"
        >
          복용 완료 시 알림
        </span>
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={`text-[14px] font-medium ${value.notifyOnComplete ? 'text-border-focus' : 'text-text-placeholder'}`}
          >
            {value.notifyOnComplete ? 'ON' : 'OFF'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={value.notifyOnComplete}
            aria-labelledby="alert-complete-label"
            onClick={() =>
              onChange({ ...value, notifyOnComplete: !value.notifyOnComplete })
            }
            className={`relative h-8 w-12 rounded-full transition-colors ${value.notifyOnComplete ? 'bg-border-focus' : 'bg-border-default'}`}
          >
            <span
              className={`absolute top-1 left-1 size-6 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${value.notifyOnComplete ? 'translate-x-4' : ''}`}
            />
          </button>
        </div>
      </div>
    </>
  );
}
