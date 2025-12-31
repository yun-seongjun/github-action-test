import React, { forwardRef, PropsWithChildren } from 'react';
import { cva } from 'class-variance-authority';
import RadioButtonAtom, {
  RadioButtonAtomProps,
  RadioButtonSizeEnum,
} from '@design-system/components/radio-button/RadioButtonAtom';
import { DataQuery } from '@design-system/types/common.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

const baseLabelStyle = [
  'peer-has-[:disabled]:cursor-default',
  'peer-has-[:enabled]:text-mono-700',
  'group-hover:peer-has-[:enabled]:text-mono-400',
  'group-active:peer-has-[:enabled]:text-mono-900',
  'peer-has-[:disabled]:text-mono-300',
  'peer-has[:checked]:peer-has-[:enabled]:text-mono-800',
  'group-hover:peer-has[:checked]:peer-has-[:enabled]:text-mono-600',
  'group-active:peer-has[:checked]:peer-has-[:enabled]:text-mono-900',
  'peer-has[:checked]:peer-has-[:disabled]:text-mono-300',
];

const labelStyle = cva(baseLabelStyle, {
  variants: {
    size: {
      [RadioButtonSizeEnum.S]: 'font-size-12',
      [RadioButtonSizeEnum.M]: 'font-size-14',
      [RadioButtonSizeEnum.L]: 'font-size-16',
      [RadioButtonSizeEnum.XL]: 'font-size-20',
    },
  },
  defaultVariants: {
    size: RadioButtonSizeEnum.M,
  },
});

const wrapperVariants = cva(
  'group flex items-center cursor-pointer has-[:disabled]:cursor-default',
  {
    variants: {
      size: {
        [RadioButtonSizeEnum.S]: 'p-8 gap-2',
        [RadioButtonSizeEnum.M]: 'p-8 gap-4',
        [RadioButtonSizeEnum.L]: 'p-10 gap-4',
        [RadioButtonSizeEnum.XL]: 'p-12 gap-4',
      },
    },
    defaultVariants: {
      size: RadioButtonSizeEnum.M,
    },
  },
);

export interface RadioButtonProps extends RadioButtonAtomProps, DataQuery {
  className?: string;
  labelTextClassName?: string;
}

const RadioButton = forwardRef<
  HTMLInputElement,
  PropsWithChildren<RadioButtonProps>
>(
  (
    {
      className,
      labelTextClassName,
      children: labelText,
      radioButtonSize = RadioButtonSizeEnum.M,
      dataQk,
      ...props
    },
    ref,
  ) => {
    return (
      <label
        className={ComponentUtils.cn(
          wrapperVariants({ size: radioButtonSize }),
          labelText && 'px-0',
          className,
        )}
        data-qk={dataQk}
      >
        <RadioButtonAtom
          radioButtonSize={radioButtonSize}
          ref={ref}
          {...props}
        />
        {labelText && (
          <p
            className={ComponentUtils.cn(
              labelStyle({ size: radioButtonSize }),
              labelTextClassName,
            )}
          >
            {labelText}
          </p>
        )}
      </label>
    );
  },
);

RadioButton.displayName = 'RadioButton';

export default RadioButton;
