import { apiClient } from '@/apis/client';
import type {
  AlertType,
  GuardianAlert,
  GuardianAlertListResponse,
} from '@/types/alert';
import type { BaseResponse } from '@/types/api';

const ALERT_TYPE_FROM_API: Record<
  GuardianAlertListResponse['alerts'][number]['type'],
  AlertType
> = {
  COMPLETED: 'completed',
  PARTIAL: 'partial',
  MISSED: 'missed',
  HELP_REQUEST: 'helpRequest',
};

// 안 읽은 알림 + 곧 울릴 회차 (profileId의 알림 설정 적용, 최신순)
export const fetchGuardianAlerts = async (
  profileId: number
): Promise<GuardianAlert[]> => {
  const { data } = await apiClient.get<BaseResponse<GuardianAlertListResponse>>(
    '/guardian-alerts',
    { params: { profileId, unreadOnly: true } }
  );
  const { alerts, upcoming } = data.data;
  return [
    ...upcoming.map((item) => ({
      key: `upcoming-${item.sessionId}`,
      alertId: null,
      type: 'upcoming' as const,
      seniorName: item.seniorName,
      scheduledAt: item.scheduledAt,
      occurredAt: new Date().toISOString(),
      minutesLeft: item.minutesLeft,
    })),
    ...alerts.map((item) => ({
      key: `alert-${item.alertId}`,
      alertId: item.alertId,
      type: ALERT_TYPE_FROM_API[item.type],
      seniorName: item.seniorName,
      scheduledAt: item.scheduledAt,
      occurredAt: item.createdAt,
      minutesLeft: null,
    })),
  ];
};

// 알림 읽음 처리 (이미 읽은 알림은 서버가 처음 읽은 시각 유지)
export const markAlertRead = async (alertId: number) => {
  await apiClient.patch(`/guardian-alerts/${alertId}/read`);
};
