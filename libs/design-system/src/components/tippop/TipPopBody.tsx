import React, { ReactNode } from 'react';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export interface TipPopBodyProps {
  /**
   * 보여줄 리액트 노드
   */
  node: ReactNode;
  /**
   * TipPopBody에 적용될 className
   */
  className?: string;
}

const TipPopBody = ({ node, className }: TipPopBodyProps) => {
  return (
    <div
      className={ComponentUtils.cn(
        'break-words rounded-small bg-mono-900 px-10 py-10 text-white opacity-80 font-size-14',
        className,
      )}
    >
      {node}
    </div>
  );
};

export default TipPopBody;
