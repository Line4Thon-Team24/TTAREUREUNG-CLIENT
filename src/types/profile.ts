export type Membership = 'FAMILY';

// 복용 일정 임박 시 알림(N분 전)
export type AlertLeadMinutes = 5 | 10 | 30 | 60;

export type AlertSettings = {
  leadMinutes: number; // 복용 일정 임박 시 알림 (서버: 0~180분)
  notifyOnComplete: boolean; // 복용 완료 시 알림
};

export type Profile = {
  name: string;
  email: string;
  membership: Membership;
  profileImageUrl: string | null;
  alert: AlertSettings;
};

// 공동 보호자 관리 목록
export type CoGuardianSummary = {
  id: number;
  name: string;
  seniorName: string;
  phoneNumber: string;
};

// 프로필 알림 설정 API 응답
export type NotificationSettingResponse = {
  profile_id: number;
  notify_on_complete: boolean;
  notify_on_miss: boolean;
  notify_on_delay: boolean;
  remind_before_minutes: number;
};
