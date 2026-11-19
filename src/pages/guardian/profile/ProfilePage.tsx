import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/apis/auth';
import { updateNotificationSetting } from '@/apis/notificationSetting';
import { deleteProfile } from '@/apis/profile';
import ConfirmModal from '@/components/common/ConfirmModal';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import AlertSettings from '@/components/profile/AlertSettings';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileRow from '@/components/profile/ProfileRow';
import ProfileSection from '@/components/profile/ProfileSection';
import { MEMBERSHIP_LABELS } from '@/constants/profile';
import type { ApiError } from '@/types/api';
import type { AlertSettings as AlertSettingsValue } from '@/types/profile';
import { getGuardians } from '@/mocks/guardians';
import { getProfile } from '@/mocks/profile';
import { getSeniors } from '@/mocks/seniors';
import useNotificationSetting from '@/hooks/useNotificationSetting';
import useProfiles from '@/hooks/useProfiles';
import { getCareLabel, getCoGuardianSummaries } from '@/utils/profile';
import settingIcon from '@/assets/icons/setting.svg';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { profiles, isError, retry } = useProfiles();
  // TODO: 프로필 선택 연동 후 선택된 보호자 프로필로 교체
  const me = profiles?.find(({ role }) => role === 'GUARDIAN');
  const notification = useNotificationSetting(me?.profileId);
  const [mockProfile] = useState(getProfile);
  const [editedAlert, setEditedAlert] = useState<AlertSettingsValue | null>(
    null
  );
  const alert = editedAlert ?? notification.setting;
  const [mockSeniors] = useState(getSeniors);
  const [guardians] = useState(getGuardians);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleLogout = async () => {
    // 서버 요청에 실패해도 로그인 화면으로 이동
    await logout().catch(() => {});
    navigate('/login', { replace: true });
  };

  // 내 프로필 삭제 후 다른 보호자 프로필이 있으면 프로필 선택, 없으면 로그인 화면으로 이동
  const handleDeleteProfile = async () => {
    if (!me || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteProfile(me.profileId);
    } catch (error) {
      setIsDeleteOpen(false);
      setIsDeleting(false);
      setDeleteError(
        (error as ApiError).code === 'PROFILE_006'
          ? '담당 시니어가 있어 마지막 보호자 프로필은 삭제할 수 없어요.'
          : '프로필을 삭제하지 못했어요. 잠시 후 다시 시도해주세요.'
      );
      return;
    }
    const hasOtherGuardian = profiles?.some(
      ({ role, profileId }) => role === 'GUARDIAN' && profileId !== me.profileId
    );
    if (hasOtherGuardian) {
      navigate('/profile/select', { replace: true });
      return;
    }
    await logout().catch(() => {});
    navigate('/login', { replace: true });
  };

  // 알림 설정 변경
  const handleAlertChange = (next: AlertSettingsValue) => {
    if (!me || !alert) return;
    const previous = alert;
    setEditedAlert(next);
    updateNotificationSetting(me.profileId, {
      ...(next.leadMinutes !== previous.leadMinutes && {
        leadMinutes: next.leadMinutes,
      }),
      ...(next.notifyOnComplete !== previous.notifyOnComplete && {
        notifyOnComplete: next.notifyOnComplete,
      }),
    }).catch(() => setEditedAlert(previous));
  };

  if (isError) {
    return <ErrorState message="프로필을 불러오지 못했어요." onRetry={retry} />;
  }
  if (!profiles) return <LoadingState />;

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
        {notification.isError ? (
          <ErrorState
            message="알림 설정을 불러오지 못했어요."
            onRetry={notification.retry}
            className="py-6"
          />
        ) : alert ? (
          <AlertSettings value={alert} onChange={handleAlertChange} />
        ) : (
          <LoadingState className="py-6" />
        )}
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

      <div className="flex flex-col items-center pb-4">
        {deleteError && (
          <p
            role="alert"
            className="px-5 pb-2 text-center text-[13px] text-status-missed"
          >
            {deleteError}
          </p>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLogoutOpen(true)}
            className="cursor-pointer p-2 text-[14px] text-text-sub underline underline-offset-2 active:opacity-60"
          >
            로그아웃
          </button>
          <span aria-hidden className="h-3 w-px bg-text-placeholder" />
          <button
            type="button"
            onClick={() => {
              setDeleteError(null);
              setIsDeleteOpen(true);
            }}
            className="cursor-pointer p-2 text-[14px] text-text-sub underline underline-offset-2 active:opacity-60"
          >
            프로필 삭제
          </button>
        </div>
      </div>

      <ConfirmModal
        open={isLogoutOpen}
        message="로그아웃 하시겠어요?"
        cancelLabel="취소"
        confirmLabel="로그아웃"
        onCancel={() => setIsLogoutOpen(false)}
        onConfirm={handleLogout}
      />

      <ConfirmModal
        open={isDeleteOpen}
        message={
          '시니어와의 연결도 함께 삭제됩니다.\n프로필을 삭제 하시겠어요?'
        }
        cancelLabel="취소"
        confirmLabel="삭제"
        confirmVariant="danger"
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteProfile}
      />
    </div>
  );
};

export default ProfilePage;
