import type { Profile } from '@/types/profile';

// 프로필 목업 데이터
const profile: Profile = {
  name: '홍길동',
  email: 'example@naver.com',
  membership: 'FAMILY',
  profileImageUrl: null,
  alert: { leadMinutes: 10, notifyOnComplete: true },
};

export const getProfile = (): Profile => ({
  ...profile,
  alert: { ...profile.alert },
});
