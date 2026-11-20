import { apiClient } from '@/apis/client';
import type { BaseResponse } from '@/types/api';

// 푸시 공개키 (enabled가 false면 서버에 키가 없어 발송 불가)
export const fetchVapidKey = async () => {
  const { data } = await apiClient.get<
    BaseResponse<{ enabled: boolean; publicKey: string | null }>
  >('/push-subscriptions/vapid-public-key');
  return data.data;
};

// 이 기기를 프로필의 푸시 수신 기기로 등록 (같은 기기면 갱신)
export const registerPushDevice = async (
  profileId: number,
  subscription: PushSubscriptionJSON
) => {
  await apiClient.post('/push-subscriptions', {
    profileId,
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys?.p256dh,
      auth: subscription.keys?.auth,
    },
  });
};

// 이 기기의 푸시 수신 해제 (로그아웃·알림 끄기)
export const unregisterPushDevice = async (endpoint: string) => {
  await apiClient.delete('/push-subscriptions', { data: { endpoint } });
};
