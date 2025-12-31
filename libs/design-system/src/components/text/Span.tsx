import { forwardRef, HTMLAttributes, useRef } from 'react';
import { TooltipProps } from '@design-system/components/tooltip/Tooltip';
import TooltipTruncated from '@design-system/components/tooltip/TooltipTruncated';
import { PortalTypeEnum } from '@design-system/constants/portalType.enum';
import { DataQuery } from '@design-system/types/common.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

interface SpanProps
  extends
    HTMLAttributes<HTMLSpanElement>,
    Pick<TooltipProps, 'portalType'>,
    DataQuery {}

const Span = forwardRef<HTMLSpanElement, SpanProps>(
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
    const spanRef = useRef<HTMLSpanElement>(null);
    return (
      <>
        <span
          ref={(r) => ComponentUtils.setRefs(r, ref, spanRef)}
          className={ComponentUtils.cn('truncate', className)}
          data-qk={dataQk}
          {...props}
        >
          {children}
        </span>
        <TooltipTruncated targetElementRef={spanRef} portalType={portalType} />
      </>
    );
  },
);

Span.displayName = 'Span';

export default Span;
