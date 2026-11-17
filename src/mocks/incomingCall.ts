import type { IncomingCall } from '@/types/call';
import prescriptionSampleImage from '@/assets/images/prescription-sample.png';

// 수신 화면 목업 데이터
export const mockIncomingCall: IncomingCall = {
  scheduledAt: '2026-11-08T15:00:00',
  medicineOrder: 1,
  remainingCount: 5,
  prescriptionImageUrl: prescriptionSampleImage,
  storageGuide: {
    prefix: '약 상자 위에서',
    highlight: '2번째 칸',
    suffix: '에 있는 처방전',
  },
};
