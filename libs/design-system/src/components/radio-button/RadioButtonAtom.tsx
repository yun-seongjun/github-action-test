import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cva } from 'class-variance-authority';
import Icon from '@design-system/components/common/Icon';
import { IconNamesEnum } from '@design-system/constants/iconNames.enum';
import { DataQuery } from '@design-system/types/common.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export enum RadioButtonSizeEnum {
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
}

const baseUnCheckedRadioStyle = [
  'peer-disabled:cursor-default',
  'peer-checked:hidden',
  'peer-enabled:text-mono-500',
  'group-hover:peer-enabled:text-mono-300',
  'group-active:peer-enabled:text-mono-800',
  'peer-disabled:text-mono-100',
];

const unCheckedRadioVariants = cva(baseUnCheckedRadioStyle, {
  variants: {
    size: {
      [RadioButtonSizeEnum.S]: 'w-16 h-16',
      [RadioButtonSizeEnum.M]: 'w-16 h-16',
      [RadioButtonSizeEnum.L]: 'w-20 h-20',
      [RadioButtonSizeEnum.XL]: 'w-24 h-24',
    },
  },
  defaultVariants: {
    size: RadioButtonSizeEnum.M,
  },
});

const baseCheckedRadioStyle = [
  'hidden',
  'peer-disabled:cursor-default',
  'peer-checked:peer-enabled:cursor-pointer',
  'peer-checked:block',
  'peer-checked:peer-enabled:text-primary-500',
  'group-hover:peer-checked:peer-enabled:text-primary-200',
  'group-active:peer-checked:peer-enabled:text-primary-700',
  'peer-checked:peer-disabled:text-mono-200',
];

const checkedRadioVariants = cva(baseCheckedRadioStyle, {
  variants: {
    size: {
      [RadioButtonSizeEnum.S]: 'w-16 h-16',
      [RadioButtonSizeEnum.M]: 'w-16 h-16',
      [RadioButtonSizeEnum.L]: 'w-20 h-20',
      [RadioButtonSizeEnum.XL]: 'w-24 h-24',
    },
  },
  defaultVariants: {
    size: RadioButtonSizeEnum.M,
  },
});

export interface RadioButtonAtomProps
  extends
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'width' | 'height' | 'required'
    >,
    DataQuery {
  wrapperClassName?: string;
  iconClassName?: string;
  radioButtonSize?: RadioButtonSizeEnum;
}

const getVariants = (iconName: IconNamesEnum) => {
  switch (iconName) {
    case IconNamesEnum.RadioUnchecked:
      return unCheckedRadioVariants;
    case IconNamesEnum.RadioChecked:
      return checkedRadioVariants;
  }

  return null;
};

interface RadioButtonIconProps {
  className?: string;
  iconName: IconNamesEnum;
  radioButtonSize: RadioButtonSizeEnum;
}

const RadioButtonIcon = ({
  className,
  iconName,
  radioButtonSize,
}: RadioButtonIconProps) => {
  const variants = getVariants(iconName);

  if (!variants) {
    return null;
  }

  return (
    <Icon
      name={iconName}
      className={ComponentUtils.cn(
        variants({ size: radioButtonSize }),
        className,
      )}
    />
  );
};

const RadioButtonAtom = forwardRef<HTMLInputElement, RadioButtonAtomProps>(
  (
    {
      wrapperClassName,
      iconClassName,
      radioButtonSize = RadioButtonSizeEnum.M,
      dataQk,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={ComponentUtils.cn('flex', wrapperClassName, 'peer')}
        data-qk={dataQk}
      >
        <input
          type="radio"
          className="peer h-0 w-0 appearance-none"
          ref={ref}
          {...props}
        />
        <RadioButtonIcon
          className={iconClassName}
          iconName={IconNamesEnum.RadioUnchecked}
          radioButtonSize={radioButtonSize}
        />
        <RadioButtonIcon
          className={iconClassName}
          iconName={IconNamesEnum.RadioChecked}
          radioButtonSize={radioButtonSize}
        />
      </div>
    );
  },
);

RadioButtonAtom.displayName = 'RadioButton';

export default RadioButtonAtom;
