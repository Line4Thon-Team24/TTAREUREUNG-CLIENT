import type { AlertLeadMinutes, Membership } from '@/types/profile';

export const MEMBERSHIP_LABELS: Record<Membership, string> = {
  FAMILY: 'FAMILY',
};

export const ALERT_LEAD_OPTIONS: { label: string; value: AlertLeadMinutes }[] =
  [
    { label: '5분 전', value: 5 },
    { label: '10분 전', value: 10 },
    { label: '30분 전', value: 30 },
    { label: '1시간 전', value: 60 },
  ];
