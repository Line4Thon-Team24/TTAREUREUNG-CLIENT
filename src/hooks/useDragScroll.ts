import { useRef, useState, type MouseEvent, type PointerEvent } from 'react';

// 이 거리(px)보다 많이 움직여야 드래그로 판단 (조금 흔들린 클릭은 클릭으로 유지)
const DRAG_THRESHOLD = 5;

// 마우스로 클릭한 채 좌우로 끌어서 가로 스크롤하는 훅 (PC용)
// - 터치는 브라우저 기본 스와이프를 그대로 사용
// - 드래그로 끝난 경우 카드 클릭이 실행되지 않도록 막음
// 사용법: const { ref, isDragging, handlers } = useDragScroll<HTMLUListElement>();
//        <ul ref={ref} {...handlers}>
export default function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const dragRef = useRef({
    isPressed: false,
    hasMoved: false,
    startX: 0,
    startScrollLeft: 0,
  });
  const [isDragging, setIsDragging] = useState(false);

  const endDrag = (event: PointerEvent<T>) => {
    const drag = dragRef.current;
    if (!drag.isPressed) return;
    drag.isPressed = false;
    if (!drag.hasMoved) return;

    setIsDragging(false);
    if (ref.current?.hasPointerCapture(event.pointerId)) {
      ref.current.releasePointerCapture(event.pointerId);
    }
  };

  const handlers = {
    onPointerDown: (event: PointerEvent<T>) => {
      // 마우스 왼쪽 버튼만 처리 (터치·펜은 기본 스와이프)
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      if (!ref.current) return;

      dragRef.current = {
        isPressed: true,
        hasMoved: false,
        startX: event.clientX,
        startScrollLeft: ref.current.scrollLeft,
      };
    },
    onPointerMove: (event: PointerEvent<T>) => {
      const drag = dragRef.current;
      const element = ref.current;
      if (!drag.isPressed || !element) return;

      const deltaX = event.clientX - drag.startX;
      if (!drag.hasMoved) {
        if (Math.abs(deltaX) < DRAG_THRESHOLD) return;
        drag.hasMoved = true;
        setIsDragging(true);
        // 드래그가 시작된 뒤에만 캡처 → 목록 밖으로 나가도 계속 끌 수 있음
        // (처음부터 캡처하면 단순 클릭이 카드에 전달되지 않음)
        element.setPointerCapture(event.pointerId);
      }
      element.scrollLeft = drag.startScrollLeft - deltaX;
    },
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onLostPointerCapture: endDrag,
    // 드래그로 끝난 경우 카드 클릭 막기 (단순 클릭은 그대로 통과)
    onClickCapture: (event: MouseEvent<T>) => {
      if (!dragRef.current.hasMoved) return;
      event.preventDefault();
      event.stopPropagation();
      dragRef.current.hasMoved = false;
    },
  };

  return { ref, isDragging, handlers };
}
