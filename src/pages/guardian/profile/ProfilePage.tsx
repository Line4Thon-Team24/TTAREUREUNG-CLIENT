import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertSettings from '@/components/profile/AlertSettings';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileRow from '@/components/profile/ProfileRow';
import ProfileSection from '@/components/profile/ProfileSection';
import { MEMBERSHIP_LABELS } from '@/constants/profile';
import { getGuardians } from '@/mocks/guardians';
import { getProfile } from '@/mocks/profile';
import { getSeniors } from '@/mocks/seniors';
import { getCoGuardianSummaries, getMyCareLabel } from '@/utils/profile';
import settingIcon from '@/assets/icons/setting.svg';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile] = useState(getProfile);
  const [alert, setAlert] = useState(profile.alert);
  const [seniors] = useState(getSeniors);
  const [guardians] = useState(getGuardians);

  const coGuardians = getCoGuardianSummaries(guardians, seniors);

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

      <ProfileHeader
        profile={profile}
        careLabel={getMyCareLabel(guardians, seniors)}
      />

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
    </div>
  );
};

export default ProfilePage;
