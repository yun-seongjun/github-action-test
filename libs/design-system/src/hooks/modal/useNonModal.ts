import useOverlay, {
  OverlayControlsType,
  UseOverlayHookProps,
} from '@design-system/hooks/modal/useOverlay';

export interface NonModalControlsType<
  TNonModalData = unknown,
> extends OverlayControlsType<TNonModalData> {}

interface UseNonModalHookProps extends UseOverlayHookProps {}
const useNonModal = <TNonModalData>(
  hookProps: UseNonModalHookProps,
): NonModalControlsType<TNonModalData> => {
  const overlayControls = useOverlay<TNonModalData>(hookProps);

  return {
    ...overlayControls,
  };
};

export default useNonModal;
