import React, { MutableRefObject, useEffect, useState } from 'react';
import Portal from '@design-system/components/Portal';
import TipPopCommon, {
  TipPopDirectionEnum,
} from '@design-system/components/tippop/TipPopCommon';
import { PortalTypeEnum } from '@design-system/constants/portalType.enum';
import { DataQuery } from '@design-system/types/common.type';

export interface TooltipProps extends DataQuery {
  /**
   * Tooltip이 띄워질 타겟 엘리먼트. ref로 참조할 수 있는 엘리먼트로 제한됩니다
   */
  targetElementRef: MutableRefObject<HTMLElement | null>;
  /**
   * Tooltip의 팝업 방향
   */
  direction?: TipPopDirectionEnum;
  /**
   * Tooltip 메시지
   */
  message: string;
  /**
   * Tooltip 컴포넌트의 className
   */
  tooltipClassName?: string;
  /**
   * Tooltip 상자의 className
   */
  tooltipBodyClassName?: string;
  /**
   * Tooltip 꼬리의 className
   */
  tooltipTailClassName?: string;
  tooltipTextClassName?: string;
  /**
   * Popover가 띄워질 타겟 엘리먼트. ref로 참조할 수 있는 엘리먼트로 제한됩니다
   */
  portalType?: PortalTypeEnum;
}

const Tooltip = ({
  targetElementRef,
  direction,
  message,
  tooltipClassName,
  tooltipBodyClassName,
  tooltipTailClassName,
  tooltipTextClassName,
  portalType = PortalTypeEnum.TIP_POP_UP,
  dataQk = 'tooltip',
}: TooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleMouseOver = () => {
      setIsOpen(true);
    };
    const handleMouseLeave = () => {
      setIsOpen(false);
    };
    const targetElement = targetElementRef.current;
    if (targetElement) {
      targetElement.addEventListener('mouseover', handleMouseOver);
      targetElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (targetElement) {
        targetElement.removeEventListener('mouseover', handleMouseOver);
        targetElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  if (!targetElementRef.current) {
    return null;
  }

  return (
    <Portal id={portalType}>
      <TipPopCommon
        targetElement={targetElementRef.current}
        direction={direction}
        isOpen={isOpen}
        tipPopClassName={tooltipClassName}
        tipPopBodyClassName={tooltipBodyClassName}
        tipPopTailClassName={tooltipTailClassName}
        onMouseOver={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        dataQk={dataQk}
      >
        <p className={tooltipTextClassName}>{message}</p>
      </TipPopCommon>
    </Portal>
  );
};

export default Tooltip;
