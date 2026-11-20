import { useEffect, useState, type CSSProperties } from 'react';

// 모바일 가상 키보드가 올라오면 키보드 위의 가시 영역에 맞게 스타일 조정
// 키보드가 없으면 undefined (기본 레이아웃 유지)
export const useKeyboardViewportStyle = (): CSSProperties | undefined => {
  const [style, setStyle] = useState<CSSProperties>();

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      if (window.innerHeight - viewport.height < 100) {
        setStyle(undefined);
        return;
      }
      setStyle({
        height: viewport.height,
        minHeight: 0,
        transform: `translateY(${viewport.offsetTop}px)`,
      });
    };

    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };
  }, []);

  return style;
};
