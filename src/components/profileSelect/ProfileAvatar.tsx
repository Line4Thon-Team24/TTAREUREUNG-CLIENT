import type { AvatarTone } from '@/types/profileSelect';
import { getShortName } from '@/utils/profileSelect';

// 프로필 색상(목록 순서대로 반복해서 사용)
const AVATAR_TONES: AvatarTone[] = [
  { bg: '#EEF2FF', border: '#E0E7FF', text: '#4338CA' },
  { bg: '#F0F9FF', border: '#E0F2FE', text: '#0369A1' },
  { bg: '#FFF1F2', border: '#FFE4E6', text: '#BE123C' },
];

type ProfileAvatarProps = {
  name: string;
  index: number; // 프로필 색상 순번
  shape: 'circle' | 'square';
};

// 성을 제외한 이름을 표시하는 프로필
export default function ProfileAvatar({
  name,
  index,
  shape,
}: ProfileAvatarProps) {
  const tone = AVATAR_TONES[index % AVATAR_TONES.length];
  const isCircle = shape === 'circle';

  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center border font-bold ${
        isCircle
          ? 'size-11 rounded-full text-[14px]'
          : 'size-16 rounded-2xl text-[16px]'
      }`}
      style={{
        backgroundColor: tone.bg,
        borderColor: tone.border,
        color: tone.text,
      }}
    >
      {getShortName(name)}
    </span>
  );
}
