import type { TimeSlot } from '@/types/schedule';

// 복용 회차 상태 (API 값)
export type DoseSessionStatus =
  'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'PARTIAL' | 'MISSED';

// 찾아서 먹을 약 안내
export type MedicationGuide = {
  order: number; // 순서 (1부터)
  medicationId: number;
  name: string;
  imageUrl: string | null;
  appearance: string; // 겉모습 설명 (예: 파란색 원기둥)
  storageLocation: string; // 보관 위치 (예: 약 상자 위에서 2번째 칸)
  doseAmount: string; // 복용 수량 (예: 2정)
  voiceText: string; // TTS로 읽을 문장
};

// 지금 울려야 할 회차
export type SessionCall = {
  sessionId: number;
  timeSlot: TimeSlot;
  slotName: string; // 예: 점심 식후
  scheduledAt: string; // 복용 시각 (KST, 예: 2026-11-08T15:00:00)
  status: DoseSessionStatus;
  callAttempts: number; // 미응답 횟수
  totalCount: number; // 회차 전체 약 수
  voiceText: string; // TTS로 읽을 인사말
  medications: MedicationGuide[];
};

// 다음 회차 정보
export type NextCallInfo = {
  scheduledAt: string;
  timeSlot: TimeSlot;
  slotName: string;
  medicationNames: string[];
};

// 지금 울려야 할 회차 API 응답
export type CurrentSession = {
  serverTime: string; // KST 서버 시각
  current: SessionCall | null; // 없으면 null
  next: NextCallInfo | null; // 없으면 null
};

// 약 판독 결과 (API 값)
export type RecognitionResult = 'MATCH' | 'MISMATCH' | 'UNCERTAIN';

// 약 판독 API 응답
export type RecognitionResultResponse = {
  recognitionId: number;
  medicationId: number;
  result: RecognitionResult; // MATCH → 복용 화면, MISMATCH → 다시 찾기, UNCERTAIN → 사진 보고 직접 선택
  message: string; // 화면 문구
  voiceText: string; // TTS로 읽을 문장
  attemptsLeft: number; // 이 회차·약에 남은 판독 횟수
};
