import { forwardRef, HTMLAttributes, useRef } from 'react';
import { TooltipProps } from '@design-system/components/tooltip/Tooltip';
import TooltipTruncated from '@design-system/components/tooltip/TooltipTruncated';
import { PortalTypeEnum } from '@design-system/constants/portalType.enum';
import { DataQuery } from '@design-system/types/common.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

interface Props
  extends
    HTMLAttributes<HTMLParagraphElement>,
    Pick<TooltipProps, 'portalType'>,
    DataQuery {}

const P = forwardRef<HTMLParagraphElement, Props>(
  (
    {
      portalType = PortalTypeEnum.MODAL,
      children,
      className,
      dataQk,
      ...props
    },
    ref,
  ) => {
    const pRef = useRef<HTMLParagraphElement>(null);

    return (
      <>
        <p
          ref={(r) => ComponentUtils.setRefs(r, ref, pRef)}
          className={ComponentUtils.cn('truncate', className)}
          data-qk={dataQk}
          {...props}
        >
          {children}
        </p>
        <TooltipTruncated
          targetElementRef={pRef}
          message={pRef.current?.textContent}
          portalType={portalType}
        />
      </>
    );
  },
);

P.displayName = 'P';

export default P;
