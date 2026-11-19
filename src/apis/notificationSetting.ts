import { apiClient } from '@/apis/client';
import type { BaseResponse } from '@/types/api';
import type {
  AlertSettings,
  NotificationSettingResponse,
} from '@/types/profile';

// 알림 설정 조회 (저장된 설정이 없으면 서버의 기본값을 조회)
export const fetchNotificationSetting = async (
  profileId: number
): Promise<AlertSettings> => {
  const { data } = await apiClient.get<
    BaseResponse<NotificationSettingResponse>
  >('/notification-settings', { params: { profile_id: profileId } });
  return {
    leadMinutes: data.data.remind_before_minutes,
    notifyOnComplete: data.data.notify_on_complete,
  };
};
