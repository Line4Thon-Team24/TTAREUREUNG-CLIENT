import type { TimeSlot } from '@/types/schedule';

// 보호자 알림 종류 (예정은 곧 울릴 회차)
export type AlertType =
  'completed' | 'partial' | 'missed' | 'helpRequest' | 'upcoming';

// 배너 한 개
export type GuardianAlert = {
  key: string; // 예정 알림은 alertId가 없어 회차로 구분
  alertId: number | null; // 읽음 처리용 (예정 알림은 null)
  type: AlertType;
  seniorName: string;
  scheduledAt: string; // 회차 시각 (YYYY-MM-DDTHH:mm:ss)
  occurredAt: string; // 알림이 생긴 시각 (예정 알림은 조회 시각)
  minutesLeft: number | null; // 예정 알림의 남은 분
};

// 보호자 알림 API 응답
export type GuardianAlertListResponse = {
  alerts: {
    alertId: number;
    type: 'COMPLETED' | 'PARTIAL' | 'MISSED' | 'HELP_REQUEST';
    seniorId: number;
    seniorName: string;
    sessionId: number;
    timeSlot: TimeSlot;
    slotName: string;
    targetDate: string;
    scheduledAt: string;
    message: string;
    createdAt: string;
    readAt: string | null;
  }[];
  upcoming: {
    seniorId: number;
    seniorName: string;
    sessionId: number;
    timeSlot: TimeSlot;
    slotName: string;
    scheduledAt: string;
    minutesLeft: number;
  }[];
};
