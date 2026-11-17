import type { ReactNode } from 'react';
import microphoneIcon from '@/assets/icons/microphone.svg';
import MaskIcon from '@/components/common/MaskIcon';

// 예: 약을 찾으셨다면 "찾았어" 라고 말씀해주세요!
type MicPromptProps = {
  lead: string; // 예: 약을 찾으셨다면
  keyword: string; // 예: 찾았어
  trailing?: ReactNode; // 예: 라고 말씀해주세요!
};

// 음성으로 답해 달라는 안내 문구
const MicPrompt = ({
  lead,
  keyword,
  trailing = '라고 말씀해주세요!',
}: MicPromptProps) => (
  <div className="flex flex-col items-center gap-4 text-center">
    <span className="flex size-24 items-center justify-center rounded-full bg-bg-secondary-pressed/70">
      <span className="flex size-16 items-center justify-center rounded-full bg-bg-secondary">
        <MaskIcon src={microphoneIcon} color="#138A4B" width={20} />
      </span>
    </span>
    <p className="text-[22px] leading-tight font-bold text-text-title">
      {lead}
      <br />
      <span className="text-bg-primary">"{keyword}"</span> {trailing}
    </p>
  </div>
);

export default MicPrompt;
