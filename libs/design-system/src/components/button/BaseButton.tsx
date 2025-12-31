import { ButtonHTMLAttributes, ForwardedRef, forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import Icon from '@design-system/components/common/Icon';
import { IconNamesEnum } from '@design-system/constants/iconNames.enum';
import useDelayPreventer from '@design-system/hooks/useDelayPreventer';
import { DataQuery } from '@design-system/types/common.type';
import {
  BgColorType,
  BorderColorType,
  FontWeightType,
  TextColorType,
  WidthType,
} from '@design-system/types/component.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export enum ButtonTypeEnum {
  BOX = 'BOX',
  CAPSULE = 'CAPSULE',
}

export enum ButtonSizeEnum {
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
}

export enum ButtonDisplayTypeEnum {
  CONTAINED = 'CONTAINED',
  OUTLINED = 'OUTLINED',
}

/**
 * ======================================================
 * Radius
 * ======================================================
 */

const RadiusVariants = cva('', {
  variants: {
    buttonType: ButtonTypeEnum,
    size: ButtonSizeEnum,
  },
  compoundVariants: [
    // radius
    {
      buttonType: ButtonTypeEnum.BOX,
      size: ButtonSizeEnum.S,
      className: 'rounded-extra-small',
    },
    {
      buttonType: ButtonTypeEnum.BOX,
      size: [ButtonSizeEnum.M, ButtonSizeEnum.L, ButtonSizeEnum.XL],
      className: 'rounded-small',
    },
    {
      buttonType: ButtonTypeEnum.CAPSULE,
      size: [
        ButtonSizeEnum.S,
        ButtonSizeEnum.M,
        ButtonSizeEnum.L,
        ButtonSizeEnum.XL,
      ],
      className: 'rounded-full',
    },
  ],
});

/**
 * ======================================================
 * Fixed & Flexible
 * ======================================================
 */

export enum ButtonFixRoleTypeEnum {
  FIXED = 'FIXED',
  FLEXIBLE = 'FLEXIBLE',
}

/**
 * ======================================================
 * Display
 * ======================================================
 */

export type DisplayContainedType = {
  displayType?: ButtonDisplayTypeEnum.CONTAINED;
  bgColor?: BgColorType;
  borderColor?: never;
  textColor?: TextColorType;
  fontWeight?: FontWeightType;
  textClassName?: string;
};

export type DisplayOutlinedType = {
  displayType?: ButtonDisplayTypeEnum.OUTLINED;
  bgColor?: never;
  borderColor?: BorderColorType;
  textColor?: TextColorType;
  fontWeight?: FontWeightType;
  textClassName?: string;
};

/**
 * ======================================================
 * Content Overlay & Padding
 * ======================================================
 */

const ContentOverlayVariants = cva('w-full h-full overflow-hidden', {
  variants: {
    displayType: {
      [ButtonDisplayTypeEnum.CONTAINED]:
        'group-enabled:hover:bg-white/30 group-enabled:active:bg-mono-900/30',
      [ButtonDisplayTypeEnum.OUTLINED]:
        'relative box-content -top-1 -left-1 border-1 border-transparent group-enabled:hover:border-white/50 group-enabled:active:border-mono-900/50',
    },
  },
});

const ContentPaddingVariants = cva(
  'flex justify-center items-center w-full h-full',
  {
    variants: {
      buttonType: ButtonTypeEnum,
      displayType: ButtonDisplayTypeEnum,
      size: ButtonSizeEnum,
      fixRoleType: ButtonFixRoleTypeEnum,
    },
    compoundVariants: [
      // margin
      {
        fixRoleType: ButtonFixRoleTypeEnum.FLEXIBLE,
        buttonType: [ButtonTypeEnum.BOX, ButtonTypeEnum.CAPSULE],
        size: ButtonSizeEnum.S,
        className: 'px-4',
      },
      {
        fixRoleType: ButtonFixRoleTypeEnum.FLEXIBLE,
        buttonType: [ButtonTypeEnum.BOX, ButtonTypeEnum.CAPSULE],
        size: ButtonSizeEnum.M,
        className: 'px-6',
      },
      {
        fixRoleType: ButtonFixRoleTypeEnum.FLEXIBLE,
        buttonType: [ButtonTypeEnum.BOX, ButtonTypeEnum.CAPSULE],
        size: ButtonSizeEnum.L,
        className: 'px-8',
      },
      {
        fixRoleType: ButtonFixRoleTypeEnum.FLEXIBLE,
        buttonType: [ButtonTypeEnum.BOX, ButtonTypeEnum.CAPSULE],
        size: ButtonSizeEnum.XL,
        className: 'px-12',
      },
    ],
  },
);

/**
 * ======================================================
 * Content
 * ======================================================
 */
export type ContentTextType = {
  text: string;
  iconNameLeft?: IconNamesEnum;
  iconNameRight?: IconNamesEnum;
  iconName?: never;
  iconClassName?: string;
  contentClassName?: string;
};

export type ContentIconOnlyType = {
  text?: never;
  iconNameLeft?: IconNamesEnum;
  iconNameRight?: IconNamesEnum;
  iconName: IconNamesEnum;
  iconClassName?: string;
};

export enum ContentTypeEnum {
  TEXT_ONLY = 'TEXT_ONLY',
  TEXT_LEFT_ICON = 'TEXT_LEFT_ICON',
  TEXT_RIGHT_ICON = 'TEXT_RIGHT_ICON',
  TEXT_LEFT_RIGHT_ICON = 'TEXT_LEFT_RIGHT_ICON',
  ICON_ONLY = 'ICON_ONLY',
}

export const getContentType = (
  text: string | undefined,
  iconNameLeft: IconNamesEnum | undefined,
  iconNameRight: IconNamesEnum | undefined,
  iconName: IconNamesEnum | undefined,
): ContentTypeEnum => {
  if (text && iconNameLeft && iconNameRight)
    return ContentTypeEnum.TEXT_LEFT_RIGHT_ICON;
  if (text && iconNameLeft) return ContentTypeEnum.TEXT_LEFT_ICON;
  if (text && iconNameRight) return ContentTypeEnum.TEXT_RIGHT_ICON;
  if (text) return ContentTypeEnum.TEXT_ONLY;
  if (iconName) return ContentTypeEnum.ICON_ONLY;
  if (iconName && iconNameLeft) return ContentTypeEnum.ICON_ONLY;
  if (iconName && iconNameRight) return ContentTypeEnum.ICON_ONLY;
  if (iconName && iconNameLeft && iconNameRight)
    return ContentTypeEnum.ICON_ONLY;
  return ContentTypeEnum.TEXT_ONLY;
};

export const ContentVariants = cva('flex justify-center items-center w-full', {
  variants: {
    size: {
      [ButtonSizeEnum.S]: 'gap-2',
      [ButtonSizeEnum.M]: 'gap-4',
      [ButtonSizeEnum.L]: 'gap-4',
      [ButtonSizeEnum.XL]: 'gap-4',
    },
    buttonType: ButtonTypeEnum,
    fixRoleType: ButtonFixRoleTypeEnum,
    contentType: ContentTypeEnum,
  },
  compoundVariants: [
    {
      buttonType: [ButtonTypeEnum.BOX, ButtonTypeEnum.CAPSULE],
      fixRoleType: ButtonFixRoleTypeEnum.FLEXIBLE,
      contentType: [
        ContentTypeEnum.TEXT_ONLY,
        ContentTypeEnum.TEXT_LEFT_RIGHT_ICON,
      ],
      className: 'px-4',
    },
    {
      buttonType: [ButtonTypeEnum.BOX, ButtonTypeEnum.CAPSULE],
      fixRoleType: ButtonFixRoleTypeEnum.FLEXIBLE,
      contentType: ContentTypeEnum.TEXT_LEFT_ICON,
      className: 'pl-4 pr-8',
    },
    {
      buttonType: [ButtonTypeEnum.BOX, ButtonTypeEnum.CAPSULE],
      fixRoleType: ButtonFixRoleTypeEnum.FLEXIBLE,
      contentType: ContentTypeEnum.TEXT_RIGHT_ICON,
      className: 'pl-8 pr-4',
    },
    {
      fixRoleType: ButtonFixRoleTypeEnum.FIXED,
      size: ButtonSizeEnum.S,
      className: 'px-4',
    },
    {
      fixRoleType: ButtonFixRoleTypeEnum.FIXED,
      size: ButtonSizeEnum.M,
      className: 'px-6',
    },
    {
      fixRoleType: ButtonFixRoleTypeEnum.FIXED,
      size: ButtonSizeEnum.L,
      className: 'px-8',
    },
    {
      fixRoleType: ButtonFixRoleTypeEnum.FIXED,
      size: ButtonSizeEnum.XL,
      className: 'px-12',
    },
  ],
});

const IconVariants = cva('shrink-0', {
  variants: {
    size: ButtonSizeEnum,
    contentType: ContentTypeEnum,
  },
  compoundVariants: [
    {
      contentType: [
        ContentTypeEnum.TEXT_LEFT_ICON,
        ContentTypeEnum.TEXT_RIGHT_ICON,
        ContentTypeEnum.TEXT_LEFT_RIGHT_ICON,
      ],
      size: ButtonSizeEnum.S,
      className: 'w-12 h-12',
    },
    {
      contentType: [
        ContentTypeEnum.TEXT_LEFT_ICON,
        ContentTypeEnum.TEXT_RIGHT_ICON,
        ContentTypeEnum.TEXT_LEFT_RIGHT_ICON,
      ],
      size: [ButtonSizeEnum.M, ButtonSizeEnum.L],
      className: 'w-16 h-16',
    },
    {
      contentType: [
        ContentTypeEnum.TEXT_LEFT_ICON,
        ContentTypeEnum.TEXT_RIGHT_ICON,
        ContentTypeEnum.TEXT_LEFT_RIGHT_ICON,
      ],
      size: ButtonSizeEnum.XL,
      className: 'w-20 h-20',
    },
    {
      contentType: ContentTypeEnum.ICON_ONLY,
      size: ButtonSizeEnum.S,
      className: 'w-17 h-17',
    },
    {
      contentType: ContentTypeEnum.ICON_ONLY,
      size: ButtonSizeEnum.M,
      className: 'w-20 h-20',
    },
    {
      contentType: ContentTypeEnum.ICON_ONLY,
      size: [ButtonSizeEnum.L, ButtonSizeEnum.XL],
      className: 'w-22 h-22',
    },
  ],
});

interface ContentProps {
  size: ButtonSizeEnum;
  buttonType: ButtonTypeEnum;
  fixRoleType?: ButtonFixRoleTypeEnum;
  text?: string;
  iconNameLeft?: IconNamesEnum;
  iconNameRight?: IconNamesEnum;
  iconName?: IconNamesEnum;
  iconClassName?: string;
  fontWeight?: FontWeightType;
  textClassName?: string;
  contentClassName?: string;
}

const Content = ({
  size,
  buttonType,
  fixRoleType,
  text,
  iconNameLeft,
  iconNameRight,
  iconName,
  iconClassName,
  fontWeight,
  textClassName,
  contentClassName,
}: ContentProps) => {
  const contentType = getContentType(
    text,
    iconNameLeft,
    iconNameRight,
    iconName,
  );
  const _iconClassName = ComponentUtils.cn(
    iconClassName,
    IconVariants({ size, contentType }),
  );

  return (
    <div
      className={ComponentUtils.cn(
        ContentVariants({ size, buttonType, fixRoleType, contentType }),
        contentClassName,
      )}
    >
      {iconNameLeft && <Icon className={_iconClassName} name={iconNameLeft} />}
      {text && (
        <span
          className={ComponentUtils.cn('truncate', fontWeight, textClassName)}
        >
          {text}
        </span>
      )}
      {iconName && <Icon className={_iconClassName} name={iconName} />}
      {iconNameRight && (
        <Icon className={_iconClassName} name={iconNameRight} />
      )}
    </div>
  );
};

/**
 * ======================================================
 * Variants
 * ======================================================
 */
export const BUTTON_DEFAULT_CLASS_NAMES =
  'group overflow-hidden enabled:active:animate-button-scale-down font-medium';
const ButtonVariants = cva(BUTTON_DEFAULT_CLASS_NAMES, {
  variants: {
    buttonType: {
      [ButtonTypeEnum.BOX]: '',
      [ButtonTypeEnum.CAPSULE]: '',
    },
    displayType: {
      [ButtonDisplayTypeEnum.CONTAINED]:
        'disabled:text-mono-300 disabled:bg-mono-100',
      [ButtonDisplayTypeEnum.OUTLINED]:
        'border-1 overflow-visible disabled:text-mono-200 disabled:border-mono-100',
    },
    size: ButtonSizeEnum,
    fixRoleType: {
      [ButtonFixRoleTypeEnum.FIXED]: 'w-full',
      [ButtonFixRoleTypeEnum.FLEXIBLE]: 'w-fit',
    },
  },
  compoundVariants: [
    // height, font-size
    {
      buttonType: [ButtonTypeEnum.BOX, ButtonTypeEnum.CAPSULE],
      size: ButtonSizeEnum.S,
      className: 'h-25 font-size-12',
    },
    {
      buttonType: [ButtonTypeEnum.BOX, ButtonTypeEnum.CAPSULE],
      size: ButtonSizeEnum.M,
      className: 'h-32 font-size-14',
    },
    {
      buttonType: [ButtonTypeEnum.BOX, ButtonTypeEnum.CAPSULE],
      size: ButtonSizeEnum.L,
      className: 'h-40 font-size-16',
    },
    {
      buttonType: [ButtonTypeEnum.BOX, ButtonTypeEnum.CAPSULE],
      size: ButtonSizeEnum.XL,
      className: 'h-48 font-size-16',
    },
  ],
});

/**
 * ======================================================
 * Default values
 * ======================================================
 */

const DEFAULT_CONTAINED = {
  TEXT_COLOR: 'text-white',
  BG_COLOR: 'bg-primary-500',
} as const;

const DEFAULT_OUTLINED = {
  TEXT_COLOR: 'text-mono-800',
  BG_COLOR: 'bg-white',
  BORDER_COLOR: 'border-mono-300',
} as const;

const getColorClassName = (
  displayType: ButtonDisplayTypeEnum | undefined,
  bgColor: BgColorType | undefined,
  borderColor: BorderColorType | undefined,
  textColor: TextColorType | undefined,
) => {
  let textColorClassName = undefined;
  let bgColorClassName = undefined;
  let borderColorClassName = undefined;

  if (displayType === ButtonDisplayTypeEnum.CONTAINED) {
    textColorClassName = textColor || DEFAULT_CONTAINED.TEXT_COLOR;
    bgColorClassName = bgColor || DEFAULT_CONTAINED.BG_COLOR;
  } else if (displayType === ButtonDisplayTypeEnum.OUTLINED) {
    textColorClassName = textColor || DEFAULT_OUTLINED.TEXT_COLOR;
    bgColorClassName = bgColor || DEFAULT_OUTLINED.BG_COLOR;
    borderColorClassName = borderColor || DEFAULT_OUTLINED.BORDER_COLOR;
  }

  return ComponentUtils.cn(
    textColorClassName,
    bgColorClassName,
    borderColorClassName,
  );
};

/**
 * ======================================================
 * Buttons
 * ======================================================
 */

export interface ButtonBaseProps
  extends
    Pick<
      ButtonHTMLAttributes<HTMLButtonElement>,
      | 'id'
      | 'type'
      | 'disabled'
      | 'onClick'
      | 'onMouseDown'
      | 'onMouseMove'
      | 'onMouseUp'
      | 'className'
    >,
    DataQuery {
  width?: WidthType;
  size?: ButtonSizeEnum;
}

export type BaseButtonProps = ButtonBaseProps & {
  buttonType?: ButtonTypeEnum;
  displayType?: ButtonDisplayTypeEnum;
  bgColor?: BgColorType;
  borderColor?: BorderColorType;
  textColor?: TextColorType;
  width?: WidthType;
  text?: string;
  iconNameLeft?: IconNamesEnum;
  iconNameRight?: IconNamesEnum;
  iconName?: IconNamesEnum;
  iconClassName?: string;
  fontWeight?: FontWeightType;
  textClassName?: string;
  contentClassName?: string;
};

const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  (
    {
      buttonType = ButtonTypeEnum.BOX,
      size = ButtonSizeEnum.M,
      displayType,
      bgColor,
      borderColor,
      textColor,
      width,
      text,
      iconNameLeft,
      iconNameRight,
      iconName,
      iconClassName,
      className,
      fontWeight,
      textClassName,
      contentClassName,
      onClick,
      dataQk,
      type = 'button',
      ...props
    }: BaseButtonProps,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    const { preventDelay } = useDelayPreventer();
    const fixRoleType = width
      ? ButtonFixRoleTypeEnum.FIXED
      : ButtonFixRoleTypeEnum.FLEXIBLE;

    const handleClick = async (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) => {
      onClick && (await preventDelay(onClick, e));
    };

    return (
      <button
        ref={(r) => ComponentUtils.setRefs(r, ref)}
        type={type}
        data-qk={dataQk}
        {...props}
        onClick={handleClick}
        className={ComponentUtils.cn(
          ButtonVariants({ buttonType, displayType, fixRoleType, size }),
          RadiusVariants({ buttonType, size }),
          getColorClassName(displayType, bgColor, borderColor, textColor),
          width,
          className,
        )}
      >
        <div
          className={ComponentUtils.cn(
            ContentOverlayVariants({ displayType }),
            RadiusVariants({ buttonType, size }),
          )}
        >
          <div
            className={ComponentUtils.cn(
              ContentPaddingVariants({
                buttonType,
                displayType,
                fixRoleType,
                size,
              }),
            )}
          >
            <Content
              size={size}
              buttonType={buttonType}
              fixRoleType={fixRoleType}
              text={text}
              iconNameLeft={iconNameLeft}
              iconNameRight={iconNameRight}
              iconName={iconName}
              iconClassName={iconClassName}
              fontWeight={fontWeight}
              textClassName={textClassName}
              contentClassName={contentClassName}
            />
          </div>
        </div>
      </button>
    );
  },
);

BaseButton.displayName = 'BaseButton';

export default BaseButton;
