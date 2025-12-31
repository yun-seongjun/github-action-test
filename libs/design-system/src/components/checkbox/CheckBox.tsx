import React, { forwardRef, PropsWithChildren } from 'react';
import { cva } from 'class-variance-authority';
import CheckBoxAtom, {
  CheckBoxAtomProps,
  CheckBoxSizeEnum,
} from '@design-system/components/checkbox/CheckBoxAtom';
import { DataQuery } from '@design-system/types/common.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

const baseLabelStyle = [
  'peer-has-[:disabled]:cursor-default',
  'peer-has-[:enabled]:text-mono-700',
  'group-hover:peer-has-[:enabled]:text-mono-400',
  'group-active:peer-has-[:enabled]:text-mono-900',
  'peer-has-[:disabled]:text-mono-300',
  'peer-has-[:checked]:peer-has-[:enabled]:text-mono-800',
  'group-hover:peer-has-[:checked]:peer-has-[:enabled]:text-mono-600',
  'group-active:peer-has-[:checked]:peer-has-[:enabled]:text-mono-900',
  'peer-has-[:checked]:peer-has-[:disabled]:text-mono-300',
];

const labelStyle = cva(baseLabelStyle, {
  variants: {
    size: {
      [CheckBoxSizeEnum.S]: 'font-size-12',
      [CheckBoxSizeEnum.M]: 'font-size-14',
      [CheckBoxSizeEnum.L]: 'font-size-16',
      [CheckBoxSizeEnum.XL]: 'font-size-20',
    },
  },
  defaultVariants: {
    size: CheckBoxSizeEnum.M,
  },
});

const wrapperVariants = cva(
  'group flex items-center cursor-pointer has-[:disabled]:cursor-default',
  {
    variants: {
      size: {
        [CheckBoxSizeEnum.S]: 'p-8 gap-2',
        [CheckBoxSizeEnum.M]: 'p-8 gap-4',
        [CheckBoxSizeEnum.L]: 'p-10 gap-4',
        [CheckBoxSizeEnum.XL]: 'p-12 gap-4',
      },
    },
    defaultVariants: {
      size: CheckBoxSizeEnum.M,
    },
  },
);

export interface CheckBoxProps extends CheckBoxAtomProps, DataQuery {
  className?: string;
  labelTextClassName?: string;
}

const CheckBox = forwardRef<HTMLInputElement, PropsWithChildren<CheckBoxProps>>(
  (
    {
      className,
      labelTextClassName,
      children,
      checkBoxSize = CheckBoxSizeEnum.M,
      dataQk,
      ...props
    },
    ref,
  ) => {
    return (
      <label
        className={ComponentUtils.cn(
          wrapperVariants({ size: checkBoxSize }),
          children && 'px-0',
          className,
        )}
        data-qk={dataQk}
      >
        <CheckBoxAtom checkBoxSize={checkBoxSize} ref={ref} {...props} />
        {children && typeof children === 'string' ? (
          <p
            className={ComponentUtils.cn(
              labelStyle({ size: checkBoxSize }),
              labelTextClassName,
            )}
          >
            {children}
          </p>
        ) : (
          children
        )}
      </label>
    );
  },
);

CheckBox.displayName = 'CheckBox';

export default CheckBox;
