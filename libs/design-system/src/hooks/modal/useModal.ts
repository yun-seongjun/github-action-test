import { useEffect } from 'react';
import useOverlay, {
  OverlayControlsType,
  UseOverlayHookProps,
} from '@design-system/hooks/modal/useOverlay';
import { StyleUtils } from '@design-system/utils/StyleUtils';

export interface ModalControlsType<
  TModalData = unknown,
> extends OverlayControlsType<TModalData> {}

interface UseModalHookProps extends UseOverlayHookProps {}
const useModal = <TModalData>(
  hookProps: UseModalHookProps,
): ModalControlsType<TModalData> => {
  const overlayControls = useOverlay<TModalData>(hookProps);
  const { isOpen } = overlayControls;

  useEffect(() => {
    let isMainScrollDisabledInvoked = false;
    if (!StyleUtils.isMainScrollDisabled()) {
      if (!isOpen) {
        StyleUtils.enableMainScroll();
      } else {
        isMainScrollDisabledInvoked = true;
        StyleUtils.disabledMainScroll();
      }
    }
    return () => {
      if (isMainScrollDisabledInvoked) {
        StyleUtils.enableMainScroll();
      }
    };
  }, [isOpen]);

  return {
    ...overlayControls,
  };
};

export default useModal;
