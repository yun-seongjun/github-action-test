import { forwardRef, HTMLAttributes } from 'react';
import { cva } from 'class-variance-authority';
import Icon from '@design-system/components/common/Icon';
import { IconNamesEnum } from '@design-system/constants/iconNames.enum';
import { DataQuery } from '@design-system/types/common.type';
import {
  BgColorType,
  BorderColorType,
  MinWidthType,
  TextColorType,
} from '@design-system/types/component.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export enum ChipTypeEnum {
  CONTAINED = 'CONTAINED',
  OUTLINED = 'OUTLINED',
}

export enum ChipContentTypeEnum {
  TEXT_ONLY = 'TEXT_ONLY',
  LEFT_ICON = 'LEFT_ICON',
  RIGHT_ICON = 'RIGHT_ICON',
}

export enum ChipSizeEnum {
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
}

interface TextOnlyProps {
  contentType: ChipContentTypeEnum.TEXT_ONLY;
  text: string;
  iconName?: never;
}

interface IconTextProps {
  contentType: ChipContentTypeEnum.LEFT_ICON | ChipContentTypeEnum.RIGHT_ICON;
  text: string;
  iconName: IconNamesEnum;
}

interface ContainedProps {
  chipType: ChipTypeEnum.CONTAINED;
  bgColor: BgColorType;
  borderColor?: never;
}

interface OutlinedProps {
  chipType: ChipTypeEnum.OUTLINED;
  bgColor?: never;
  borderColor: BorderColorType;
}

interface BaseChipProps extends Pick<
  HTMLAttributes<HTMLDivElement>,
  'id' | 'className' | 'onClick' | 'onTouchEnd'
> {
  textColor: TextColorType;
  size: ChipSizeEnum;
  selected: boolean;
  disabled?: boolean;
  minWidth?: MinWidthType;
}

type ChipProps = BaseChipProps &
  (TextOnlyProps | IconTextProps) &
  (ContainedProps | OutlinedProps) &
  DataQuery;

const divVariants = cva(
  'cursor-pointer flex justify-center items-center gap-x-2',
  {
    variants: {
      size: {
        [ChipSizeEnum.S]: 'h-21 px-8 font-size-12 rounded-extra-small',
        [ChipSizeEnum.M]: 'h-36 px-8 font-size-14 rounded-small',
        [ChipSizeEnum.L]: 'h-42 px-10 font-size-16 rounded-small',
        [ChipSizeEnum.XL]: 'h-58 px-12 font-size-20 rounded-small',
      },
      chipType: {
        [ChipTypeEnum.CONTAINED]: '',
        [ChipTypeEnum.OUTLINED]: 'border-1 bg-white',
      },
      selected: {
        true: 'font-bold',
        false: '',
      },
      disabled: {
        true: '',
        false: '',
      },
      contentType: ChipContentTypeEnum,
    },
    compoundVariants: [
      // unSelected 일 경우, 색상 고정
      {
        selected: false,
        disabled: false,
        chipType: ChipTypeEnum.CONTAINED,
        className: 'bg-mono-50 text-mono-600',
      },
      {
        selected: false,
        disabled: false,
        chipType: ChipTypeEnum.OUTLINED,
        className: 'border-mono-200 text-mono-600',
      },
      {
        selected: false,
        disabled: true,
        chipType: ChipTypeEnum.CONTAINED,
        className: 'bg-mono-50 text-mono-200',
      },
      {
        selected: false,
        disabled: true,
        chipType: ChipTypeEnum.OUTLINED,
        className: 'border-mono-200 text-mono-200',
      },

      // selected & disabled 일 경우, opacity 30%
      { selected: true, disabled: true, className: 'opacity-30' },

      // right icon 일 경우, 왼 쪽에 추가 패딩
      {
        contentType: ChipContentTypeEnum.RIGHT_ICON,
        size: ChipSizeEnum.S,
        className: 'pl-10',
      },
      {
        contentType: ChipContentTypeEnum.RIGHT_ICON,
        size: [ChipSizeEnum.M, ChipSizeEnum.L],
        className: 'pl-12',
      },
      {
        contentType: ChipContentTypeEnum.RIGHT_ICON,
        size: ChipSizeEnum.XL,
        className: 'pl-16',
      },

      // left icon 일 경우, 오른 쪽에 추가 패딩
      {
        contentType: ChipContentTypeEnum.LEFT_ICON,
        size: ChipSizeEnum.S,
        className: 'pr-10',
      },
      {
        contentType: ChipContentTypeEnum.LEFT_ICON,
        size: [ChipSizeEnum.M, ChipSizeEnum.L],
        className: 'pr-12',
      },
      {
        contentType: ChipContentTypeEnum.LEFT_ICON,
        size: ChipSizeEnum.XL,
        className: 'pr-16',
      },
    ],
  },
);

const iconVariants = cva('', {
  variants: {
    size: {
      [ChipSizeEnum.S]: 'w-12 h-12',
      [ChipSizeEnum.M]: 'w-16 h-16',
      [ChipSizeEnum.L]: 'w-20 h-20',
      [ChipSizeEnum.XL]: 'w-24 h-24',
    },
  },
});

const Chip = forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      selected,
      disabled = false,
      contentType,
      chipType,
      size,
      text,
      textColor,
      bgColor,
      borderColor,
      iconName,
      minWidth,
      onClick,
      dataQk,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={ComponentUtils.cn(
          divVariants({
            className: [
              selected && chipType === ChipTypeEnum.CONTAINED && bgColor,
              selected && chipType === ChipTypeEnum.OUTLINED && borderColor,
              selected && textColor,
            ],
            size,
            chipType,
            selected,
            disabled,
            contentType,
          }),
          minWidth,
        )}
        onClick={(e) => {
          if (!disabled) {
            onClick?.(e);
          }
        }}
        data-qk={dataQk}
        {...props}
        ref={ref}
      >
        {contentType === ChipContentTypeEnum.LEFT_ICON && iconName && (
          <Icon name={iconName} className={iconVariants({ size })} />
        )}
        <span>{text}</span>
        {contentType === ChipContentTypeEnum.RIGHT_ICON && iconName && (
          <Icon name={iconName} className={iconVariants({ size })} />
        )}
      </div>
    );
  },
);

Chip.displayName = 'Chip';

export default Chip;
