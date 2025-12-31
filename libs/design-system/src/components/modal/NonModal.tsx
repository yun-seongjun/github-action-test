import { PropsWithChildren } from 'react';
import Portal from '@design-system/components/Portal';
import { PortalTypeEnum } from '@design-system/constants/portalType.enum';
import { NonModalControlsType } from '@design-system/hooks/modal/useNonModal';
import { DataQuery } from '@design-system/types/common.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export interface NonModalProps<TNonModalData = unknown> extends DataQuery {
  nonModalControls: NonModalControlsType<TNonModalData>;
  wrapperClassName?: string;
  portalId?: string;
}

const NonModal = <TNonModalData,>({
  nonModalControls,
  children,
  wrapperClassName = 'left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]',
  portalId,
  dataQk,
}: PropsWithChildren<NonModalProps<TNonModalData>>) => {
  const { isMount } = nonModalControls;

  if (!isMount) {
    return null;
  }

  return (
    <Portal id={portalId ?? PortalTypeEnum.NON_MODAL}>
      <div
        className={ComponentUtils.cn('fixed', wrapperClassName)}
        data-qk={dataQk}
      >
        {children}
      </div>
    </Portal>
  );
};

export default NonModal;
