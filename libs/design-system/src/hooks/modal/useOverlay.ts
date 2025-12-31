import { Dispatch, SetStateAction, useRef, useState } from 'react';
import useStateRef from '@design-system/hooks/useStateRef';

export interface OverlayControlsType<TOverlayData = unknown> {
  open(): void;
  close(): void;
  isOpen: boolean;
  isMount: boolean;
  data?: TOverlayData;
  setData: Dispatch<SetStateAction<TOverlayData | undefined>>;
  setBeforeOpenEventListener(callback: OverlayCallbackType): void;
  setBeforeCloseEventListener(callback: OverlayCallbackType): void;
  openedAfterCallback: () => void;
  closedAfterCallback: () => void;
  animationStartDuration: number;
  animationCloseDuration: number;
}

type OverlayCallbackType = () => void;

export enum OverlayStatusEnum {
  // mount 및 애니메이션 시작
  OPENING = 'OPENING',
  // open 애니메이션 종료
  OPENED = 'OPENED',
  // close 애니메이션 시작
  CLOSING = 'CLOSING',
  // close 애니메이션 종료 및 unmount
  CLOSED = 'CLOSED',
}

export interface UseOverlayHookProps extends Partial<
  Pick<OverlayControlsType, 'animationStartDuration' | 'animationCloseDuration'>
> {}

const defaultAnimationDuration = 100;

const useOverlay = <TOverlayData>({
  animationStartDuration = defaultAnimationDuration,
  animationCloseDuration = defaultAnimationDuration,
}: UseOverlayHookProps): OverlayControlsType<TOverlayData> => {
  const [openStatus, setOpenStatus, getOpenStatus] =
    useStateRef<OverlayStatusEnum>(OverlayStatusEnum.CLOSED);
  const [data, setData] = useState<TOverlayData>();
  const beforeOpenCallbackRef = useRef<OverlayCallbackType>();
  const beforeCloseCallbackRef = useRef<OverlayCallbackType>();

  const setBeforeOpenEventListener = (callback: OverlayCallbackType) => {
    beforeOpenCallbackRef.current = callback;
  };
  const setBeforeCloseEventListener = (callback: OverlayCallbackType) => {
    beforeCloseCallbackRef.current = callback;
  };

  const open = () => {
    if (
      getOpenStatus() === OverlayStatusEnum.OPENED ||
      getOpenStatus() === OverlayStatusEnum.OPENING
    ) {
      return false;
    }
    beforeOpenCallbackRef.current?.();
    setOpenStatus(OverlayStatusEnum.OPENING);
    return true;
  };

  const close = () => {
    if (
      getOpenStatus() === OverlayStatusEnum.CLOSED ||
      getOpenStatus() === OverlayStatusEnum.CLOSING
    ) {
      return false;
    }
    beforeCloseCallbackRef.current?.();
    setOpenStatus(OverlayStatusEnum.CLOSING);
    setData(undefined);
    return true;
  };

  const openedAfterCallback = () => {
    setOpenStatus(OverlayStatusEnum.OPENED);
  };

  const closedAfterCallback = () => {
    setOpenStatus(OverlayStatusEnum.CLOSED);
  };

  return {
    open,
    close,
    isOpen:
      openStatus === OverlayStatusEnum.OPENED ||
      openStatus === OverlayStatusEnum.OPENING,
    isMount: openStatus !== OverlayStatusEnum.CLOSED,
    data,
    setData,
    setBeforeOpenEventListener,
    setBeforeCloseEventListener,
    openedAfterCallback,
    closedAfterCallback,
    animationStartDuration,
    animationCloseDuration,
  };
};

export default useOverlay;
