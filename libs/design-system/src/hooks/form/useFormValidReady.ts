import { useCallback, useEffect, useState } from 'react';

/**
 * 랜더링 시 isValid가 false -> true -> false로 변경되는 이슈가 있음
 * isValid에 따라서 등록 버튼의 disabled가 변경되기 때문에, 버튼의 disabled 상태를 딜레이 주기 위해서 예외처리 함
 * @link {https://github.com/react-hook-form/react-hook-form/issues/9765}
 */
const useFormValidReady = () => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [trigger, setTrigger] = useState<boolean>(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined = undefined;
    if (trigger) {
      timeout = setTimeout(() => {
        setIsReady(true);
        setTrigger(false);
        timeout = undefined;
      }, 100);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [setTimeout, trigger]);

  const resetReady = useCallback(() => {
    setIsReady(false);
    setTrigger(true);
  }, [setIsReady, setTrigger]);

  return {
    isReady,
    resetReady,
  };
};

export default useFormValidReady;
