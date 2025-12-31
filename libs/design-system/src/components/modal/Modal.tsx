import { PropsWithChildren } from 'react';
import Dimmed from '@design-system/components/Dimmed';
import Portal from '@design-system/components/Portal';
import { PortalTypeEnum } from '@design-system/constants/portalType.enum';
import { ModalControlsType } from '@design-system/hooks/modal/useModal';
import { DataQuery } from '@design-system/types/common.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export interface ModalProps<TModalData = unknown> extends DataQuery {
  isDimClickClose?: boolean;
  onDimClick?(): void;
  modalControls: ModalControlsType<TModalData>;
  wrapperClassName?: string;
}

const Modal = <TModalData,>({
  modalControls,
  isDimClickClose = true,
  onDimClick,
  children,
  wrapperClassName = 'left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]',
  dataQk,
}: PropsWithChildren<ModalProps<TModalData>>) => {
  const { close, isMount, isOpen } = modalControls;

  if (!isMount) {
    return null;
  }

  return (
    <Portal id={PortalTypeEnum.MODAL}>
      <Dimmed
        className={isDimClickClose ? undefined : 'cursor-default'}
        isOpen={isOpen}
        onClick={() => {
          onDimClick?.();
          isDimClickClose && close();
        }}
      />
      <div
        className={ComponentUtils.cn('fixed', wrapperClassName)}
        data-qk={dataQk}
      >
        {children}
      </div>
    </Portal>
  );
};

export default Modal;
