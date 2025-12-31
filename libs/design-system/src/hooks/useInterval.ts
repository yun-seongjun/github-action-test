import { useEffect, useRef } from 'react';

const useInterval = () => {
  const timeoutIdRef = useRef<NodeJS.Timeout>();
  const isActiveRef = useRef<boolean>(false);
  const intervalIndexRef = useRef<number>(0);

  const _clearTimeout = () => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = undefined;
    }
  };
  /**
   *
   * @param callback 매 주기마다 실행할 callback 함수
   * @param intervalMs 주기. 단위: millisecond.리스트인 경우, 각 주기마다 순차적으로 실행
   */
  const startInterval = (
    callback: () => void | Promise<void>,
    intervalMs: number | number[],
  ) => {
    _clearTimeout();
    isActiveRef.current = true;

    _startInterval(callback, intervalMs);
  };

  const _startInterval = (
    callback: () => void | Promise<void>,
    intervalMs: number | number[],
  ) => {
    let currentDelayMs;
    if (Array.isArray(intervalMs)) {
      currentDelayMs = intervalMs[intervalIndexRef.current];
      intervalIndexRef.current = Math.min(
        intervalIndexRef.current + 1,
        intervalMs.length - 1,
      );
    } else {
      currentDelayMs = intervalMs;
    }
    if (currentDelayMs === undefined) {
      return;
    }
    timeoutIdRef.current = setTimeout(async () => {
      await callback();
      if (isActiveRef.current) {
        _startInterval(callback, intervalMs);
      }
    }, currentDelayMs);
  };

  const stopInterval = () => {
    intervalIndexRef.current = 0;
    isActiveRef.current = false;
    _clearTimeout();
  };

  useEffect(() => {
    return () => {
      stopInterval();
    };
  }, []);

  return {
    startInterval,
    stopInterval,
  };
};

export default useInterval;
