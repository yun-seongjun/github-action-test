import { ModalControlsType, useModal } from '@design-system/hooks';

export const drawerOpenDuration = 200;
const drawerCloseDuration = 200;
export interface ModalDrawerControlsType<
  TDrawerData = unknown,
> extends ModalControlsType<TDrawerData> {}
const useModalDrawer = <
  TDrawerData,
>(): ModalDrawerControlsType<TDrawerData> => {
  const modalControls = useModal<TDrawerData>({
    animationStartDuration: drawerOpenDuration,
    animationCloseDuration: drawerCloseDuration,
  });
  return { ...modalControls };
};

export default useModalDrawer;
