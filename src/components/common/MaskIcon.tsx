import type { CSSProperties } from 'react';

type MaskIconProps = {
  src: string; // svg 경로 (import한 에셋)
  color: string; // 색상 코드 (예: '#FFFFFF')
  width?: number;
  height?: number;
  className?: string;
};

// svg 마스크를 사용해 색상을 변경할 수 있는 아이콘 컴포넌트
const MaskIcon = ({
  src,
  color,
  width = 16,
  height = width,
  className = '',
}: MaskIconProps) => {
  const style: CSSProperties = {
    width,
    height,
    backgroundColor: color,
    maskImage: `url("${src}")`,
    WebkitMaskImage: `url("${src}")`,
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
  };

  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 ${className}`}
      style={style}
    />
  );
};

export default MaskIcon;
