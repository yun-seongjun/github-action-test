import { useEffect } from 'react';

interface UseOverlayAnimationHookProps {
  flag: boolean;
  startAnimationCallback: () => void;
  closeAnimationCallback: () => void;
}

const useFlagAnimation = ({
  flag,
  closeAnimationCallback,
  startAnimationCallback,
}: UseOverlayAnimationHookProps) => {
  useEffect(() => {
    if (flag) {
      startAnimationCallback();
    } else {
      closeAnimationCallback();
    }
  }, [flag]);

  return;
};

export default useFlagAnimation;
