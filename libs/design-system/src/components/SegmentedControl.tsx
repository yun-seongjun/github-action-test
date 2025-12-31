import {
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  useEffect,
  useRef,
} from 'react';
import { cva } from 'class-variance-authority';
import Icon from '@design-system/components/common/Icon';
import { IconNamesEnum } from '@design-system/constants/iconNames.enum';
import { DataQuery } from '@design-system/types/common.type';
import { BgColorType, WidthType } from '@design-system/types/component.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export enum SegmentedControlButtonTypeEnum {
  FIXED = 'FIXED',
  FLEXIBLE = 'FLEXIBLE',
}

export enum SegmentedControlTypeEnum {
  FIXED = 'FIXED',
  SCROLL = 'SCROLL',
}

export enum SegmentedControlStyleEnum {
  CONTAINED = 'CONTAINED',
  OUTLINED = 'OUTLINED',
}

export enum SegmentedControlSizeEnum {
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
}

type UniqueValueType = number | string | boolean | undefined | null;

type SegmentedControlButtonFlexibleType = {
  buttonType?: SegmentedControlButtonTypeEnum.FLEXIBLE;
  buttonWidth?: never;
};

type SegmentedControlButtonFixedType = {
  buttonType?: SegmentedControlButtonTypeEnum.FIXED;
  buttonWidth: WidthType;
};

export interface LabelProps<TValue extends UniqueValueType> {
  id?: string | number;
  name: string;
  value: TValue;
  rightIconName?: IconNamesEnum;
  leftIconName?: IconNamesEnum;
}

export type SegmentedControlProps<TValue extends UniqueValueType> = {
  type: SegmentedControlTypeEnum;
  style: SegmentedControlStyleEnum;
  size: SegmentedControlSizeEnum;
  width: WidthType;
  labels: LabelProps<TValue>[];
  value: TValue;
  onClick: (label: LabelProps<TValue>) => void;
  primary: boolean;
  bgColor?: BgColorType;
  disabled?: boolean;
} & Pick<HTMLAttributes<HTMLDivElement>, 'id' | 'className'> &
  (SegmentedControlButtonFlexibleType | SegmentedControlButtonFixedType) &
  DataQuery;

const wrapperVariants = cva('p-4 cursor-pointer', {
  variants: {
    type: {
      [SegmentedControlTypeEnum.FIXED]: 'grid grid-flow-col auto-cols-fr',
      [SegmentedControlTypeEnum.SCROLL]: 'flex overflow-x-auto',
    },
    style: {
      [SegmentedControlStyleEnum.CONTAINED]: 'bg-mono-50',
      [SegmentedControlStyleEnum.OUTLINED]:
        'bg-white border-1 border-mono-200 box-border',
    },
    size: {
      [SegmentedControlSizeEnum.S]: 'h-29 rounded-extra-small',
      [SegmentedControlSizeEnum.M]: 'h-44 rounded-small',
      [SegmentedControlSizeEnum.L]: 'h-50 rounded-small',
      [SegmentedControlSizeEnum.XL]: 'h-66 rounded-small',
    },
    disabled: {
      true: 'pointer-events-none',
      false: '',
    },
  },
});

const labelVariants = cva(
  'h-full gap-x-2 text-mono-600 flex justify-center items-center',
  {
    variants: {
      buttonType: SegmentedControlButtonTypeEnum,
      style: SegmentedControlStyleEnum,
      size: {
        [SegmentedControlSizeEnum.S]: 'rounded-extra-small',
        [SegmentedControlSizeEnum.M]: 'rounded-small',
        [SegmentedControlSizeEnum.L]: 'rounded-small',
        [SegmentedControlSizeEnum.XL]: 'rounded-small',
      },
      selected: {
        true: '',
        false: '',
      },
      primary: {
        true: '',
        false: '',
      },
      leftIcon: {
        true: '',
        false: '',
      },
      rightIcon: {
        true: '',
        false: '',
      },
      disabled: {
        true: 'pointer-events-none',
        false: '',
      },
    },
    compoundVariants: [
      // primary & selected 일 경우, 색상 고정
      { primary: true, selected: true, className: 'bg-primary-500 text-white' },

      // selected 일 경우, style에 따라서 색상 고정
      {
        primary: false,
        selected: true,
        style: SegmentedControlStyleEnum.CONTAINED,
        className: 'bg-white',
      },
      {
        primary: false,
        selected: true,
        style: SegmentedControlStyleEnum.OUTLINED,
        className: 'bg-mono-800 text-white',
      },
      // flexible일 경우, size에 따라서 좌우 패딩이 달라짐
      {
        buttonType: SegmentedControlButtonTypeEnum.FLEXIBLE,
        size: [SegmentedControlSizeEnum.S, SegmentedControlSizeEnum.M],
        className: 'px-8',
      },
      {
        buttonType: SegmentedControlButtonTypeEnum.FLEXIBLE,
        size: SegmentedControlSizeEnum.L,
        className: 'px-10',
      },
      {
        buttonType: SegmentedControlButtonTypeEnum.FLEXIBLE,
        size: SegmentedControlSizeEnum.XL,
        className: 'px-12',
      },
      // fixed일 경우, size에 관계없이 좌우 패딩이 없음
      {
        buttonType: SegmentedControlButtonTypeEnum.FIXED,
        size: [
          SegmentedControlSizeEnum.S,
          SegmentedControlSizeEnum.M,
          SegmentedControlSizeEnum.L,
          SegmentedControlSizeEnum.XL,
        ],
        className: 'px-0',
      },

      // right icon 일 경우, 왼 쪽에 추가 패딩
      {
        rightIcon: true,
        size: [SegmentedControlSizeEnum.S, SegmentedControlSizeEnum.M],
        className: 'pl-10',
      },
      { rightIcon: true, size: SegmentedControlSizeEnum.L, className: 'pl-12' },
      {
        rightIcon: true,
        size: SegmentedControlSizeEnum.XL,
        className: 'pl-14',
      },

      // left icon 일 경우, 오른 쪽에 추가 패딩
      {
        leftIcon: true,
        size: [SegmentedControlSizeEnum.S, SegmentedControlSizeEnum.M],
        className: 'pr-10',
      },
      { leftIcon: true, size: SegmentedControlSizeEnum.L, className: 'pr-12' },
      { leftIcon: true, size: SegmentedControlSizeEnum.XL, className: 'pr-14' },

      // disabled 일 경우,
      {
        selected: true,
        primary: true,
        disabled: true,
        className: 'bg-mono-700 text-mono-500',
      },
      {
        selected: false,
        primary: true,
        disabled: true,
        className: 'bg-white text-mono-300',
      },
      {
        selected: true,
        primary: false,
        disabled: true,
        className: 'bg-white text-mono-200',
      },
      {
        selected: false,
        primary: false,
        disabled: true,
        className: 'bg-mono-100 text-mono-300',
      },
    ],
  },
);

const iconVariants = cva('', {
  variants: {
    size: {
      [SegmentedControlSizeEnum.S]: 'w-12 h-12',
      [SegmentedControlSizeEnum.M]: 'w-16 h-16',
      [SegmentedControlSizeEnum.L]: 'w-20 h-20',
      [SegmentedControlSizeEnum.XL]: 'w-24 h-24',
    },
  },
});

const textVariants = cva('whitespace-nowrap', {
  variants: {
    selected: {
      true: 'font-bold',
      false: 'font-medium',
    },
    size: {
      [SegmentedControlSizeEnum.S]: 'font-size-12',
      [SegmentedControlSizeEnum.M]: 'font-size-14',
      [SegmentedControlSizeEnum.L]: 'font-size-16',
      [SegmentedControlSizeEnum.XL]: 'font-size-20',
    },
  },
});

const SegmentedControlInner = <TValue extends UniqueValueType>(
  {
    buttonWidth,
    type,
    size,
    width,
    style,
    primary,
    labels,
    onClick,
    value,
    bgColor,
    className,
    dataQk,
    disabled,
    ...props
  }: SegmentedControlProps<TValue>,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const buttonType = buttonWidth
    ? SegmentedControlButtonTypeEnum.FIXED
    : SegmentedControlButtonTypeEnum.FLEXIBLE;

  useEffect(() => {
    if (wrapperRef.current && labelRef.current) {
      const wrapper = wrapperRef.current;
      const wrapperRect = wrapper.getBoundingClientRect();
      const selectedLabel = labelRef.current;
      const selectedLabelRect = selectedLabel.getBoundingClientRect();

      wrapper.scrollTo({
        left:
          selectedLabel.offsetLeft -
          wrapper.offsetLeft -
          (wrapperRect.width / 2 - selectedLabelRect.width / 2),
        behavior: 'smooth',
      });
    }
  }, [value]);

  if (!labels.length) {
    return null;
  }

  return (
    <div
      className={ComponentUtils.cn(
        wrapperVariants({
          className: [width],
          type,
          style,
          size,
          disabled,
        }),
        bgColor,
        className,
      )}
      data-qk={dataQk}
      {...props}
      ref={(r) => ComponentUtils.setRefs(r, ref, wrapperRef)}
    >
      {labels?.map((label, index) => {
        const selected = label.value === value;
        return (
          <div
            key={label.id ?? index}
            ref={label.value === value ? labelRef : null}
            className={ComponentUtils.cn(
              labelVariants({
                buttonType,
                style,
                size,
                selected,
                primary,
                leftIcon: !!label.leftIconName,
                rightIcon: !!label.rightIconName,
                disabled,
              }),
              buttonWidth,
            )}
            onClick={() => {
              onClick(label);
            }}
            data-qk={`${dataQk}-${label.name}`}
          >
            {label.leftIconName && (
              <Icon
                name={label.leftIconName}
                className={iconVariants({ size })}
              />
            )}
            <span
              className={textVariants({
                size,
                selected,
              })}
            >
              {label.name}
            </span>
            {label.rightIconName && (
              <Icon
                name={label.rightIconName}
                className={iconVariants({ size })}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const SegmentedControl = forwardRef(SegmentedControlInner) as <
  TValue extends UniqueValueType,
>(
  props: SegmentedControlProps<TValue> & { ref?: ForwardedRef<HTMLDivElement> },
) => ReturnType<typeof SegmentedControlInner>;

export default SegmentedControl;
