import { useEffect, useRef } from 'react';

const useTimer = () => {
  const timerIdRef = useRef<NodeJS.Timeout>();

  /**
   * 타이머가 실행중인지 확인합니다.
   */
  const isTimerRunning = () => {
    return timerIdRef.current !== undefined;
  };

  /**
   * 타이머를 중지합니다.
   */
  const stopTimer = () => {
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = undefined;
    }
  };

  /**
   * 타이머를 시작합니다.
   * @param handler
   * @param timeoutMs
   */
  const startTimer = (handler: () => void, timeoutMs: number) => {
    stopTimer();
    timerIdRef.current = setTimeout(() => {
      handler();
    }, timeoutMs);
  };

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  return {
    isTimerRunning,
    stopTimer,
    startTimer,
  };
};

export default useTimer;
