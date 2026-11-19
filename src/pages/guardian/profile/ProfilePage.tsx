import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/apis/auth';
import ConfirmModal from '@/components/common/ConfirmModal';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import AlertSettings from '@/components/profile/AlertSettings';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileRow from '@/components/profile/ProfileRow';
import ProfileSection from '@/components/profile/ProfileSection';
import { MEMBERSHIP_LABELS } from '@/constants/profile';
import { getGuardians } from '@/mocks/guardians';
import { getProfile } from '@/mocks/profile';
import { getSeniors } from '@/mocks/seniors';
import useProfiles from '@/hooks/useProfiles';
import { getCareLabel, getCoGuardianSummaries } from '@/utils/profile';
import settingIcon from '@/assets/icons/setting.svg';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { profiles, isError, retry } = useProfiles();
  const [mockProfile] = useState(getProfile);
  const [alert, setAlert] = useState(mockProfile.alert);
  const [mockSeniors] = useState(getSeniors);
  const [guardians] = useState(getGuardians);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleLogout = async () => {
    // 서버 요청에 실패해도 로그인 화면으로 이동
    await logout().catch(() => {});
    navigate('/login', { replace: true });
  };

  if (isError) {
    return <ErrorState message="프로필을 불러오지 못했어요." onRetry={retry} />;
  }
  if (!profiles) return <LoadingState />;

  // TODO: 프로필 선택 연동 후 선택된 보호자 프로필로 교체
  const me = profiles.find(({ role }) => role === 'GUARDIAN');
  const profile = { ...mockProfile, name: me?.name ?? mockProfile.name };
  const careLabel = getCareLabel(me);

  // 시니어 프로필 (최근 추가순)
  const seniors = profiles
    .filter(({ role }) => role === 'SENIOR')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ profileId, name, phoneNumber }) => ({
      id: profileId,
      name,
      phoneNumber: phoneNumber ?? '',
    }));

  const coGuardians = getCoGuardianSummaries(guardians, mockSeniors);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-5 py-4">
        <h1 className="text-[22px] font-bold text-text-title">프로필</h1>
        <button
          type="button"
          aria-label="설정"
          className="flex size-8 cursor-pointer items-center justify-center"
        >
          <img src={settingIcon} alt="" width={24} height={24} />
        </button>
      </header>

      <ProfileHeader profile={profile} careLabel={careLabel} />

      <ProfileSection title="계정 정보">
        <ProfileRow
          label="이메일"
          value={profile.email}
          valueClassName="text-text-title"
        />
        <ProfileRow
          label="멤버십"
          value={MEMBERSHIP_LABELS[profile.membership]}
          valueClassName="font-bold text-border-focus"
          onClick={() => {}}
        />
      </ProfileSection>

      <ProfileSection title="시니어 관리" badge={`총 ${seniors.length}명`}>
        {seniors.map(({ id, name, phoneNumber }) => (
          <ProfileRow
            key={id}
            label={name}
            value={phoneNumber}
            valueClassName="text-text-body"
            onClick={() => navigate(`/seniors/${id}/edit`)}
          />
        ))}
      </ProfileSection>

      <ProfileSection
        title="공동 보호자 관리"
        badge={`총 ${coGuardians.length}명`}
      >
        {coGuardians.map(({ id, name, seniorName, phoneNumber }) => (
          <ProfileRow
            key={id}
            label={
              <>
                {name}
                <span className="rounded-sm bg-bg-secondary p-1 text-[11px] leading-3 font-medium text-border-focus">
                  {seniorName}
                </span>
              </>
            }
            value={phoneNumber}
            valueClassName="text-text-body"
            onClick={() => navigate('/guardians')}
          />
        ))}
      </ProfileSection>

      <ProfileSection title="알림">
        <AlertSettings value={alert} onChange={setAlert} />
      </ProfileSection>

      {/* 개발용: 알림 배너 테스트 (5종을 차례로 띄움) */}
      {import.meta.env.DEV && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              const pad = (n: number) => String(n).padStart(2, '0');
              // Date → 'YYYY-MM-DDTHH:mm:00' (서버와 같은 한국 시간 형식)
              const toLocal = (d: Date) =>
                `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
              const local = toLocal(now);
              // 복용 예정은 10분 뒤, 나머지는 오늘 오후 3시 회차
              const inTenMinutes = toLocal(
                new Date(now.getTime() + 10 * 60_000)
              );
              const types = [
                'completed',
                'partial',
                'missed',
                'helpRequest',
                'upcoming',
              ] as const;
              window.dispatchEvent(
                new CustomEvent('guardian-alert-test', {
                  detail: types.map((type) => ({
                    key: `test-${type}-${now.getTime()}`,
                    alertId: null,
                    type,
                    seniorName: '김순자',
                    scheduledAt:
                      type === 'upcoming'
                        ? inTenMinutes
                        : `${local.slice(0, 10)}T15:00:00`,
                    occurredAt: local,
                    minutesLeft: type === 'upcoming' ? 10 : null,
                  })),
                })
              );
            }}
            className="rounded-full border border-[#E5E8EB] px-4 py-2 text-[14px] text-text-sub"
          >
            알림 테스트
          </button>
        </div>
      )}

      <div className="flex justify-center pb-4">
        <button
          type="button"
          onClick={() => setIsLogoutOpen(true)}
          className="p-2 text-[14px] text-text-sub underline underline-offset-2 active:opacity-60"
        >
          로그아웃
        </button>
      </div>

      <ConfirmModal
        open={isLogoutOpen}
        message="로그아웃 하시겠어요?"
        cancelLabel="취소"
        confirmLabel="로그아웃"
        onCancel={() => setIsLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default ProfilePage;
