import { HTMLAttributes } from 'react';
import { ComponentUtils } from '@design-system/utils/componentUtils';

const SkeletonBase = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={ComponentUtils.cn(
        'relative overflow-hidden bg-gray-50',
        className,
      )}
      {...props}
    >
      <div className="skeleton-animation absolute left-0 top-0 h-full w-full" />
    </div>
  );
};

export default SkeletonBase;
