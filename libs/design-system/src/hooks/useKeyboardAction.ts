import { useCallback, useEffect } from 'react';

export interface UseKeyboardAction {
  actionRecord: Record<string, () => void>;
  enabled?: boolean;
  enabledDelay?: number;
}
const useKeyboardAction = ({
  actionRecord,
  enabled,
  enabledDelay,
}: UseKeyboardAction) => {
  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      actionRecord[e.key]?.();
    },
    [actionRecord],
  );

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (enabled) {
      if (enabledDelay) {
        timeoutId = setTimeout(() => {
          window.addEventListener('keyup', handleKeyUp);
        }, enabledDelay);
      } else {
        window.addEventListener('keyup', handleKeyUp);
      }
    }
    return () => {
      if (enabled) {
        window.removeEventListener('keyup', handleKeyUp);
      }
      timeoutId && clearTimeout(timeoutId);
    };
  }, [enabled, enabledDelay, handleKeyUp]);
};

export default useKeyboardAction;
