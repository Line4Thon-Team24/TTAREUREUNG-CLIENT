import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandBadge from '@/components/common/BrandBadge';
import CareSeniorSection from '@/components/profileSelect/CareSeniorSection';
import FamilyMemberSection from '@/components/profileSelect/FamilyMemberSection';
import MyProfileCard from '@/components/profileSelect/MyProfileCard';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import useProfiles from '@/hooks/useProfiles';
import { getCareLabel } from '@/utils/profile';
import { setSelectedProfileId } from '@/utils/selectedProfile';
import { toCareSeniors, toFamilyMembers } from '@/utils/profileSelect';
import arrowDownIcon from '@/assets/icons/arrow-down-black.svg';
import arrowUpIcon from '@/assets/icons/arrow-up-black.svg';

// 로그인/회원가입 후 프로필 선택 화면
const ProfileSelectPage = () => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const { profiles, isError, retry } = useProfiles();
  const guardians = profiles?.filter(({ role }) => role === 'GUARDIAN') ?? [];

  // 선택한 보호자 프로필을 저장해 다른 화면에서도 같은 프로필을 쓰게 함
  const handleSelect = (profileId: number) => {
    setSelectedProfileId(profileId);
    navigate('/schedule', { replace: true });
  };

  return (
    <div className="flex min-h-dvh flex-col px-5 pt-14 pb-8">
      <header className="flex flex-col gap-2">
        <div>
          <BrandBadge label="따르릉 FAMILY" />
        </div>
        <h1 className="text-[22px] leading-tight font-bold text-text-title">
          본인의 프로필을
          <br />
          선택해주세요.
        </h1>
        <p className="text-[14px] text-text-body">
          약 복용 일정 화면으로 안전하게 연결됩니다.
        </p>
      </header>

      {/* showAll일 때만 상단 여백(52px) 적용 */}
      {isError ? (
        <ErrorState message="프로필을 불러오지 못했어요." onRetry={retry} />
      ) : !profiles ? (
        <LoadingState />
      ) : (
        <main
          className={`flex flex-1 flex-col justify-center gap-6 pb-5 ${
            showAll ? 'pt-13' : 'pt-0'
          }`}
        >
          {guardians.map((guardian) => (
            <MyProfileCard
              key={guardian.profileId}
              name={guardian.name}
              careLabel={getCareLabel(guardian)}
              profileImageUrl={null}
              onSelect={() => handleSelect(guardian.profileId)}
            />
          ))}
          {showAll && (
            <>
              <CareSeniorSection seniors={toCareSeniors(profiles)} />
              <FamilyMemberSection
                members={toFamilyMembers(profiles)}
                onInvite={() => navigate('/guardians/invite')}
              />
            </>
          )}
        </main>
      )}

      <footer className="flex flex-col items-center gap-6">
        <button
          type="button"
          aria-expanded={showAll}
          onClick={() => setShowAll((prev) => !prev)}
          className="flex items-center gap-2.5 rounded-full border border-border-divider bg-bg-section px-6 py-3 text-[14px] leading-6 font-semibold text-text-body"
        >
          {showAll ? '내 프로필만 보기' : '프로필 전체 보기'}
          <img
            src={showAll ? arrowUpIcon : arrowDownIcon}
            alt=""
            width={10}
            height={5}
          />
        </button>

        <div className="flex items-center gap-3 text-[12px] text-text-sub">
          <Link to="/login" replace>
            다른 계정으로 로그인
          </Link>
          <span aria-hidden>·</span>
          <span>고객지원센터</span>
        </div>
      </footer>
    </div>
  );
};

export default ProfileSelectPage;
