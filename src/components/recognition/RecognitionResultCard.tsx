import type { ReactNode } from 'react';

type RecognitionResultCardProps = {
  icon: ReactNode;
  title: string; // 인식 결과
  children?: ReactNode; // 서브 문구
};

// 인식 결과를 화면 중앙에 보여주는 흰색 카드 모달
const RecognitionResultCard = ({
  icon,
  title,
  children,
}: RecognitionResultCardProps) => (
  <div
    role="status"
    className="flex w-full flex-col items-center gap-6 rounded-[28px] bg-white px-7.5 py-6 shadow-xl"
  >
    {icon}
    <div className="flex flex-col items-center gap-4 text-center text-[22px] font-medium text-[#4B5563]">
      <h2 className="text-[28px] leading-tight font-bold text-text-title">
        {title}
      </h2>
      {children}
    </div>
  </div>
);

export default RecognitionResultCard;
