import React, { MutableRefObject, PropsWithChildren } from 'react';
import Portal from '@design-system/components/Portal';
import TipPopCommon, {
  TipPopDirectionEnum,
} from '@design-system/components/tippop/TipPopCommon';
import { PortalTypeEnum } from '@design-system/constants/portalType.enum';
import { ComponentUtils } from '@design-system/utils/componentUtils';

interface PopoverProps {
  /**
   * Popover가 띄워질 타겟 엘리먼트. ref로 참조할 수 있는 엘리먼트로 제한됩니다
   */
  targetElementRef: MutableRefObject<HTMLElement | null>;
  /**
   * Popover의 팝업 방향
   */
  direction?: TipPopDirectionEnum;
  /**
   * Popover의 팝업 여부. Popover는 사용하는 컴포넌트에서 제어합니다
   */
  isOpen: boolean;
  /**
   * Popover 상자의 className
   */
  popoverBodyClassName?: string;
  /**
   * Popover 꼬리의 className
   */
  popoverTailClassName?: string;
  /**
   * Popover가 띄워질 타겟 엘리먼트. ref로 참조할 수 있는 엘리먼트로 제한됩니다
   */
  portalType?: PortalTypeEnum;
}

const Popover = ({
  targetElementRef,
  direction,
  popoverBodyClassName,
  popoverTailClassName,
  isOpen,
  portalType = PortalTypeEnum.TIP_POP_UP,
  children,
}: PropsWithChildren<PopoverProps>) => {
  if (!targetElementRef.current) {
    return null;
  }

  return (
    <Portal id={portalType}>
      <TipPopCommon
        targetElement={targetElementRef.current}
        direction={direction}
        isOpen={isOpen}
        tipPopBodyClassName={ComponentUtils.cn(
          'bg-mono-50 drop-shadow-lg',
          popoverBodyClassName,
        )}
        tipPopTailClassName={ComponentUtils.cn(
          'border-t-mono-50 drop-shadow-lg',
          popoverTailClassName,
        )}
      >
        {children}
      </TipPopCommon>
    </Portal>
  );
};

export default Popover;
