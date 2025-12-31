import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cva } from 'class-variance-authority';
import Icon from '@design-system/components/common/Icon';
import { IconNamesEnum } from '@design-system/constants/iconNames.enum';
import { DataQuery } from '@design-system/types/common.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export enum SwitchSizeEnum {
  L = 'L',
  M = 'M',
  S = 'S',
}

export enum SwitchRollEnum {
  FIXED = 'FIXED',
  FLEXIBLE = 'FLEXIBLE',
}

const switchAtomLabelVariants = cva(['peer', 'block'], {
  variants: {
    size: {
      [SwitchSizeEnum.L]: 'w-62 h-40 p-8',
      [SwitchSizeEnum.M]: 'w-50 h-32 p-6',
      [SwitchSizeEnum.S]: 'w-42 h-26 p-4',
    },
    role: SwitchRollEnum,
  },
  compoundVariants: [
    {
      size: SwitchSizeEnum.L,
      role: [SwitchRollEnum.FLEXIBLE, SwitchRollEnum.FIXED],
      className: 'w-54 min-w-54 h-40 min-h-40 pr-0',
    },
    {
      size: SwitchSizeEnum.M,
      role: [SwitchRollEnum.FLEXIBLE, SwitchRollEnum.FIXED],
      className: 'w-44 min-w-44 h-32 min-h-32 pr-0',
    },
    {
      size: SwitchSizeEnum.S,
      role: [SwitchRollEnum.FLEXIBLE, SwitchRollEnum.FIXED],
      className: 'w-38 min-w-38 h-26 min-h-26 pr-0',
    },
  ],
});

const switchOffAtomBaseStyle = [
  'block',
  'peer-enabled:cursor-pointer',
  'peer-checked:hidden',
  'peer-enabled:text-mono-300',
  'hover:peer-enabled:text-mono-200',
  'active:peer-enabled:text-mono-500',
  'peer-disabled:text-mono-100',
];

const switchOnAtomBaseStyle = [
  'hidden',
  'peer-enabled:cursor-pointer',
  'peer-checked:block',
  'peer-checked:peer-enabled:text-primary-400',
  'hover:peer-checked:peer-enabled:text-primary-200',
  'active:peer-checked:peer-enabled:text-primary-700',
  'peer-checked:peer-disabled:text-primary-100',
];

export interface SwitchAtomProps
  extends
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      'value' | 'id' | 'checked' | 'disabled' | 'onChange' | 'name'
    >,
    DataQuery {
  size?: SwitchSizeEnum;
  role?: SwitchRollEnum;
}

const SwitchAtom = forwardRef<HTMLInputElement, SwitchAtomProps>(
  ({ size = SwitchSizeEnum.M, role, dataQk, ...props }, ref) => {
    return (
      <label
        className={ComponentUtils.cn(switchAtomLabelVariants({ size, role }))}
      >
        <input
          type="checkbox"
          className="peer hidden appearance-none"
          ref={ref}
          data-qk={dataQk}
          {...props}
        />
        <Icon
          name={IconNamesEnum.SwitchOff}
          className={ComponentUtils.cn(switchOffAtomBaseStyle)}
        />
        <Icon
          name={IconNamesEnum.SwitchOn}
          className={ComponentUtils.cn(switchOnAtomBaseStyle)}
        />
      </label>
    );
  },
);
SwitchAtom.displayName = 'Switch';

export default SwitchAtom;
