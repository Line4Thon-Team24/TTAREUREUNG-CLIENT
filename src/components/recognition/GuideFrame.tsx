import medicineOutline from '@/assets/images/medicine-outline.png';

// 카메라 화면 가운데 약병 윤곽 가이드
const GuideFrame = ({ className = '' }: { className?: string }) => (
  <img
    src={medicineOutline}
    alt=""
    aria-hidden="true"
    className={`pointer-events-none absolute object-contain ${className}`}
  />
);

export default GuideFrame;
