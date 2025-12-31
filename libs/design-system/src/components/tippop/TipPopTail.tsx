import React from 'react';
import { cva } from 'class-variance-authority';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export const TAIL_WIDTH = 12;
export const TAIL_HEIGHT = 8;

/**
 * TipPopBody의 중심점을 기준으로 TipPopTail과
 * 아래에 결합하면 BOTTOM_*
 * 위에 결합하면 TOP_*
 * 왼쪽에 결합하면 LEFT_*
 * 오른쪽에 결합하면 RIGHT_*
 */
export enum BindingPositionEnum {
  BOTTOM_CENTER = 'BOTTOM_CENTER',
  BOTTOM_LEFT = 'BOTTOM_LEFT',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT',
  TOP_CENTER = 'TOP_CENTER',
  TOP_LEFT = 'TOP_LEFT',
  TOP_RIGHT = 'TOP_RIGHT',
  LEFT_CENTER = 'LEFT_CENTER',
  LEFT_TOP = 'LEFT_TOP',
  LEFT_BOTTOM = 'LEFT_BOTTOM',
  RIGHT_CENTER = 'RIGHT_CENTER',
  RIGHT_TOP = 'RIGHT_TOP',
  RIGHT_BOTTOM = 'RIGHT_BOTTOM',
}

const wrapperVariants = cva(['flex'], {
  variants: {
    bindingPosition: {
      [BindingPositionEnum.BOTTOM_CENTER]: 'justify-center',
      [BindingPositionEnum.BOTTOM_LEFT]: '',
      [BindingPositionEnum.BOTTOM_RIGHT]: 'justify-end',
      [BindingPositionEnum.TOP_CENTER]: 'justify-center',
      [BindingPositionEnum.TOP_LEFT]: '',
      [BindingPositionEnum.TOP_RIGHT]: 'justify-end',
      [BindingPositionEnum.LEFT_CENTER]: 'items-center justify-center w-8',
      [BindingPositionEnum.LEFT_TOP]: 'items-start justify-center w-8',
      [BindingPositionEnum.LEFT_BOTTOM]: 'items-end justify-center w-8',
      [BindingPositionEnum.RIGHT_CENTER]: 'items-center justify-center w-8',
      [BindingPositionEnum.RIGHT_TOP]: 'items-start justify-center w-8',
      [BindingPositionEnum.RIGHT_BOTTOM]: 'items-end justify-center w-8',
    },
  },
});

const tailVariants = cva(
  ['border-x-6 border-x-transparent border-t-8 border-t-mono-900 opacity-80'],
  {
    variants: {
      bindingPosition: {
        [BindingPositionEnum.BOTTOM_CENTER]: '',
        [BindingPositionEnum.BOTTOM_LEFT]: 'ml-16',
        [BindingPositionEnum.BOTTOM_RIGHT]: 'mr-16',
        [BindingPositionEnum.TOP_CENTER]: 'rotate-180',
        [BindingPositionEnum.TOP_LEFT]: 'rotate-180 ml-16',
        [BindingPositionEnum.TOP_RIGHT]: 'rotate-180 mr-16',
        [BindingPositionEnum.LEFT_CENTER]: 'rotate-90',
        [BindingPositionEnum.LEFT_TOP]: 'rotate-90 mt-16',
        [BindingPositionEnum.LEFT_BOTTOM]: 'rotate-90 mb-16',
        [BindingPositionEnum.RIGHT_CENTER]: '-rotate-90',
        [BindingPositionEnum.RIGHT_TOP]: '-rotate-90 mt-16',
        [BindingPositionEnum.RIGHT_BOTTOM]: '-rotate-90 mb-16',
      },
    },
  },
);

interface TipPopTailProps {
  /**
   * TipPopBody와 TipPopTail 결합 위치
   */
  bindingPosition?: BindingPositionEnum;
  /**
   * TipPopTail에 적용될 className
   */
  className?: string;
}

const TipPopTail = ({ bindingPosition, className }: TipPopTailProps) => {
  return (
    <div className={ComponentUtils.cn(wrapperVariants({ bindingPosition }))}>
      <div
        className={ComponentUtils.cn(
          tailVariants({ bindingPosition }),
          className,
        )}
      />
    </div>
  );
};

export default TipPopTail;
