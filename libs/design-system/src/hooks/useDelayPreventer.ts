import { useEffect, useRef } from 'react';

interface UseDelayPreventerProps {
  minDelayPreventMs: number;
}

const useDelayPreventer = <
  TCallback extends (...args: any[]) => ReturnType<TCallback>,
>(
  props?: UseDelayPreventerProps,
) => {
  const { minDelayPreventMs = 300 } = props || {};
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isPreventRef = useRef<boolean>(false);

  const prevent = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    isPreventRef.current = true;
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = undefined;
    }, minDelayPreventMs);
  };

  const release = () => {
    isPreventRef.current = false;
  };

  const isPrevent = () => {
    return timeoutRef.current !== undefined || isPreventRef.current;
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const preventDelay = async (
    callback: TCallback,
    ...args: Parameters<TCallback>
  ): Promise<ReturnType<TCallback> | undefined> => {
    if (isPrevent()) {
      return;
    }
    prevent();

    const result = await callback(...args);
    release();
    return result;
  };

  return { preventDelay };
};

export default useDelayPreventer;
