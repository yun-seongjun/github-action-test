import React, {
  forwardRef,
  InputHTMLAttributes,
  useEffect,
  useRef,
} from 'react';
import { cva } from 'class-variance-authority';
import Icon from '@design-system/components/common/Icon';
import { IconNamesEnum } from '@design-system/constants/iconNames.enum';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export enum CheckBoxSizeEnum {
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
}

export enum CheckBoxTypeEnum {
  OUTLINED = 'OUTLINED',
  FILLED = 'FILLED',
}

const baseUnCheckedBoxStyle = [
  'peer-disabled:cursor-default',
  'peer-checked:hidden',
  'peer-enabled:text-mono-500',
  'group-hover:peer-enabled:text-mono-300',
  'group-active:peer-enabled:text-mono-800',
  'peer-disabled:text-mono-100',
];

const unCheckedBoxVariants = cva(baseUnCheckedBoxStyle, {
  variants: {
    size: {
      [CheckBoxSizeEnum.S]: 'w-16 h-16',
      [CheckBoxSizeEnum.M]: 'w-16 h-16',
      [CheckBoxSizeEnum.L]: 'w-20 h-20',
      [CheckBoxSizeEnum.XL]: 'w-24 h-24',
    },
  },
  defaultVariants: {
    size: CheckBoxSizeEnum.M,
  },
});

const baseCheckedBoxStyle = [
  'hidden',
  'peer-disabled:cursor-default',
  'peer-checked:peer-enabled:cursor-pointer',
  'peer-checked:block',
  'peer-checked:peer-enabled:text-primary-300',
  'group-hover:peer-checked:peer-enabled:text-primary-200',
  'group-active:peer-checked:peer-enabled:text-primary-700',
  'peer-checked:peer-disabled:text-mono-200',
];

const checkedBoxVariants = cva(baseCheckedBoxStyle, {
  variants: {
    size: {
      [CheckBoxSizeEnum.S]: 'w-16 h-16',
      [CheckBoxSizeEnum.M]: 'w-16 h-16',
      [CheckBoxSizeEnum.L]: 'w-20 h-20',
      [CheckBoxSizeEnum.XL]: 'w-24 h-24',
    },
  },
  defaultVariants: {
    size: CheckBoxSizeEnum.M,
  },
});

export interface CheckBoxAtomProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'width' | 'height' | 'required'
> {
  wrapperClassName?: string;
  iconClassName?: string;
  checkBoxSize?: CheckBoxSizeEnum;
  uncheckedColor?: `peer-enabled:text-${string}`;
  checkedColor?: `peer-checked:peer-enabled:text-${string}`;
  checkBoxType?: CheckBoxTypeEnum;
}

const getVariants = (iconName: IconNamesEnum) => {
  switch (iconName) {
    case IconNamesEnum.CheckboxUnchecked:
      return unCheckedBoxVariants;
    case IconNamesEnum.CheckboxChecked:
      return checkedBoxVariants;
    case IconNamesEnum.CheckboxCheckedFilled:
      return checkedBoxVariants;
  }

  return null;
};

interface CheckBoxIconProps {
  className?: string;
  iconName: IconNamesEnum;
  checkBoxSize: CheckBoxSizeEnum;
}

const CheckBoxIcon = ({
  className,
  iconName,
  checkBoxSize,
}: CheckBoxIconProps) => {
  const variants = getVariants(iconName);

  if (!variants) {
    return null;
  }

  return (
    <Icon
      name={iconName}
      className={ComponentUtils.cn(variants({ size: checkBoxSize }), className)}
    />
  );
};

const CheckBoxAtom = forwardRef<HTMLInputElement, CheckBoxAtomProps>(
  (
    {
      wrapperClassName,
      iconClassName,
      checkBoxSize = CheckBoxSizeEnum.M,
      uncheckedColor,
      checkedColor,
      onChange,
      checkBoxType = CheckBoxTypeEnum.OUTLINED,
      ...props
    },
    ref,
  ) => {
    const { checked } = props;
    const checkboxRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const animate = () => {
        if (!checkboxRef.current) return;
        if (checked) {
          checkboxRef.current.animate(
            [{ scale: 1 }, { scale: 0.85 }, { scale: 1 }],
            {
              duration: 150,
              fill: 'forwards',
            },
          );
        } else {
          checkboxRef.current.animate(
            [{ scale: 1 }, { scale: 0.85 }, { scale: 1 }],
            {
              duration: 150,
              fill: 'forwards',
            },
          );
        }
      };

      animate();
    }, [checked]);

    return (
      <div
        ref={checkboxRef}
        className={ComponentUtils.cn('flex', wrapperClassName, 'peer')}
      >
        <input
          type="checkbox"
          className="peer h-0 w-0 appearance-none"
          ref={ref}
          onChange={(e) => onChange?.(e)}
          {...props}
        />
        <CheckBoxIcon
          className={ComponentUtils.cn(iconClassName, uncheckedColor)}
          iconName={IconNamesEnum.CheckboxUnchecked}
          checkBoxSize={checkBoxSize}
        />

        {checkBoxType === CheckBoxTypeEnum.OUTLINED ? (
          <CheckBoxIcon
            className={ComponentUtils.cn(iconClassName, checkedColor)}
            iconName={IconNamesEnum.CheckboxChecked}
            checkBoxSize={checkBoxSize}
          />
        ) : (
          <CheckBoxIcon
            className={ComponentUtils.cn(iconClassName, checkedColor)}
            iconName={IconNamesEnum.CheckboxCheckedFilled}
            checkBoxSize={checkBoxSize}
          />
        )}
      </div>
    );
  },
);

CheckBoxAtom.displayName = 'CheckBox';

export default CheckBoxAtom;
