import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cva } from 'class-variance-authority';
import SwitchAtom, {
  SwitchRollEnum,
  SwitchSizeEnum,
} from '@design-system/components/switch/SwitchAtom';
import { DataQuery } from '@design-system/types/common.type';
import { WidthType } from '@design-system/types/component.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

const textContainerVariants = cva(
  ['flex', 'flex-col', 'gap-4', 'whitespace-nowrap'],
  {
    variants: {
      size: {
        [SwitchSizeEnum.L]: 'font-size-16',
        [SwitchSizeEnum.M]: 'font-size-14',
        [SwitchSizeEnum.S]: 'font-size-12',
      },
    },
  },
);

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, DataQuery {
  /**
   * Switch 컴포넌트의 크기
   */
  size?: SwitchSizeEnum;
  /**
   * Switch 컴포넌트의 너비 모드
   */
  role?: SwitchRollEnum;
  /**
   * Switch 컴포넌트의 너비. 지정하지 않으면 flexible 타입으로 사용됩니다
   */
  width?: WidthType;
  /**
   * Switch 컴포넌트 좌측에 노출할 텍스트
   */
  controlText?: string;
  /**
   * Switch 컴포넌트 좌측에 노출할 텍스트의 ClassName
   */
  controlTextClassName?: string;
  /**
   * controlText 아래에 노출할 텍스트
   */
  descriptionText?: string;
  /**
   * controlText 아래에 노출할 텍스트의 ClassName
   */
  descriptionTextClassName?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      size = SwitchSizeEnum.M,
      role,
      width = 'w-min',
      controlText,
      controlTextClassName,
      descriptionText,
      descriptionTextClassName,
      dataQk,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={ComponentUtils.cn(
          'group flex flex-row-reverse items-center justify-between gap-4',
          width,
        )}
        data-qk={dataQk}
      >
        <SwitchAtom size={size} role={role} {...props} ref={ref} />
        <div
          className={ComponentUtils.cn(
            textContainerVariants({ size }),
            width && 'truncate',
          )}
        >
          {controlText && (
            <p
              className={ComponentUtils.cn(
                'text-mono-800 group-hover:text-mono-500 group-active:text-mono-900 group-disabled:text-mono-200',
                width && 'truncate',
                controlTextClassName,
              )}
            >
              {controlText}
            </p>
          )}
          {descriptionText && (
            <p
              className={ComponentUtils.cn(
                'font-light text-mono-500 group-hover:text-mono-300 group-active:text-mono-500 group-disabled:text-mono-200',
                width && 'truncate',
                descriptionTextClassName,
              )}
            >
              {descriptionText}
            </p>
          )}
        </div>
      </div>
    );
  },
);
Switch.displayName = 'Switch';

export default Switch;
