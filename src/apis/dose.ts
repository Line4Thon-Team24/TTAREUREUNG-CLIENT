import { apiClient } from '@/apis/client';
import type { BaseResponse } from '@/types/api';
import { getAccessToken } from '@/utils/accessToken';
import type {
  CurrentSession,
  IntakeResponse,
  RecognitionResultResponse,
  SessionCall,
} from '@/types/dose';

// 지금 울려야 할 회차 조회
export const fetchCurrentSession = async (seniorId: number) => {
  const { data } = await apiClient.get<BaseResponse<CurrentSession>>(
    `/seniors/${seniorId}/dose-sessions/current`
  );
  return data.data;
};

// 전화 받기 (회차를 진행 중으로 바꾸고 아직 안 먹은 약 목록 반환, 다시 호출해도 같은 목록)
export const answerSession = async (sessionId: number) => {
  const { data } = await apiClient.post<BaseResponse<SessionCall>>(
    `/dose-sessions/${sessionId}/answer`
  );
  return data.data;
};

// 전화 미응답 알림 (받지 않고 화면을 닫을 때 호출, 10분 뒤 재전화 예약·3회째면 미복용 상태로 확정)
// 화면이 닫히는 중에도 요청이 끝까지 가도록 keepalive fetch 사용
export const reportNoAnswer = (sessionId: number) => {
  const token = getAccessToken();
  void fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/dose-sessions/${sessionId}/no-answer`,
    {
      method: 'POST',
      keepalive: true,
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  ).catch(() => {});
};

// 약 판독 (카메라로 찍은 사진이 이 약인지 확인, JPG/PNG/WEBP 5MB 이하, 회차·약당 10회)
// MATCH여도 복용 처리는 따로 호출해야 함
export const recognizeMedication = async (
  sessionId: number,
  medicationId: number,
  image: Blob
) => {
  const body = new FormData();
  body.append('file', image, 'capture.jpg');
  const { data } = await apiClient.post<
    BaseResponse<RecognitionResultResponse>
  >(
    `/dose-sessions/${sessionId}/medications/${medicationId}/recognitions`,
    body
  );
  return data.data;
};

// 복용 처리 ("다 먹었어" 시 호출, 직전 판독이 MATCH면 VISION·아니면 MANUAL로 기록)
// 같은 약을 다시 호출해도 처음 기록 유지, nextMedication이 null이면 해당 회차에 복용 완료
export const takeMedication = async (
  sessionId: number,
  medicationId: number
) => {
  const { data } = await apiClient.post<BaseResponse<IntakeResponse>>(
    `/dose-sessions/${sessionId}/medications/${medicationId}/intake`
  );
  return data.data;
};
