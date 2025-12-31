import React, { useEffect, useState } from 'react';
import Tooltip, {
  TooltipProps,
} from '@design-system/components/tooltip/Tooltip';

interface TooltipTruncatedProps extends Omit<TooltipProps, 'message'> {
  message?: string | null;
}

const getIsTruncated = (targetElement: HTMLElement | null) => {
  if (targetElement) {
    return targetElement.scrollWidth > targetElement.clientWidth;
  }
  return false;
};

/**
 * target이 truncated 되었을 때에만 팝업되는 Tooltip 컴포넌트입니다
 */
const TooltipTruncated = (props: TooltipTruncatedProps) => {
  const { targetElementRef, message } = props;
  const [isTruncated, setIsTruncated] = useState<boolean>(false);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === targetElementRef.current) {
          setIsTruncated(getIsTruncated(targetElementRef.current));
        }
      });
    });
    setIsTruncated(getIsTruncated(targetElementRef.current));
    targetElementRef.current &&
      resizeObserver.observe(targetElementRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [targetElementRef.current]);

  if (
    !isTruncated ||
    !(targetElementRef.current && targetElementRef.current.textContent)
  ) {
    return null;
  }

  return (
    <Tooltip
      {...props}
      message={message ?? targetElementRef.current.textContent}
    />
  );
};

export default TooltipTruncated;
