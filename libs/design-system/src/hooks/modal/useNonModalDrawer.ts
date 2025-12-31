import { NonModalControlsType, useNonModal } from '@design-system/hooks';

const drawerOpenDuration = 200;
const drawerCloseDuration = 200;
export interface NonModalDrawerControlsType<
  TDrawerData = unknown,
> extends NonModalControlsType<TDrawerData> {}
const useNonModalDrawer = <
  TDrawerData,
>(): NonModalDrawerControlsType<TDrawerData> => {
  const nonModalControls = useNonModal<TDrawerData>({
    animationStartDuration: drawerOpenDuration,
    animationCloseDuration: drawerCloseDuration,
  });
  return { ...nonModalControls };
};

export default useNonModalDrawer;
