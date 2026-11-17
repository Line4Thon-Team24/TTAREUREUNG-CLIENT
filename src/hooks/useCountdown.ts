import { useEffect, useRef, useState } from 'react';

// seconds초부터 1초마다 줄어들고, 0이 되면 onDone 호출
const useCountdown = (seconds: number, onDone: () => void) => {
  const [remaining, setRemaining] = useState(seconds);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (remaining <= 0) {
      onDoneRef.current();
      return;
    }
    const timer = window.setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [remaining]);

  return remaining;
};

export default useCountdown;
