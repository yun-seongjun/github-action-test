import useModal, {
  ModalControlsType,
} from '@design-system/hooks/modal/useModal';

export interface DialogControlsType<
  TDialogData = unknown,
> extends ModalControlsType<TDialogData> {}

const dialogOpenDuration = 300;
const dialogCloseDuration = 300;

const useDialog = <TDialogData>(): DialogControlsType<TDialogData> => {
  const modalControls = useModal<TDialogData>({
    animationStartDuration: dialogOpenDuration,
    animationCloseDuration: dialogCloseDuration,
  });

  return { ...modalControls };
};

export default useDialog;
