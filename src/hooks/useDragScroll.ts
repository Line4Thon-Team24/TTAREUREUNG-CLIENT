import { useRef, useState, type MouseEvent, type PointerEvent } from 'react';

// 이만큼 움직여야 드래그로 판단
const DRAG_THRESHOLD = 5;

// 마우스 드래그로 가로 스크롤 (터치는 기본 스와이프)
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
      // 마우스 왼쪽 버튼만
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
        // 드래그 시작 후에만 캡처 (단순 클릭 유지)
        element.setPointerCapture(event.pointerId);
      }
      element.scrollLeft = drag.startScrollLeft - deltaX;
    },
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onLostPointerCapture: endDrag,
    // 드래그 후 클릭 막기
    onClickCapture: (event: MouseEvent<T>) => {
      if (!dragRef.current.hasMoved) return;
      event.preventDefault();
      event.stopPropagation();
      dragRef.current.hasMoved = false;
    },
  };

  return { ref, isDragging, handlers };
}
