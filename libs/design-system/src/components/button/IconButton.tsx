import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import {
  ButtonBaseProps,
  ButtonSizeEnum,
} from '@design-system/components/button/BaseButton';
import Icon from '@design-system/components/common/Icon';
import { IconNamesEnum } from '@design-system/constants/iconNames.enum';
import useDelayPreventer from '@design-system/hooks/useDelayPreventer';
import { TextColorType } from '@design-system/types/component.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

enum IconTextTypeEnum {
  ICON_ONLY = 'ICON_ONLY',
  ICON_TEXT = 'ICON_TEXT',
}

const buttonVariantsDefault =
  'group enabled:active:animate-button-scale-down flex flex-col overflow-hidden items-center justify-center w-fit shrink-0';
const ButtonVariants = cva('', {
  variants: {
    size: ButtonSizeEnum,
    iconTextType: IconTextTypeEnum,
  },
  compoundVariants: [
    {
      size: ButtonSizeEnum.S,
      iconTextType: IconTextTypeEnum.ICON_ONLY,
      className: 'p-8 w-32 h-32',
    },
    {
      size: ButtonSizeEnum.M,
      iconTextType: IconTextTypeEnum.ICON_ONLY,
      className: 'p-8 w-36 h-36',
    },
    {
      size: ButtonSizeEnum.L,
      iconTextType: IconTextTypeEnum.ICON_ONLY,
      className: 'p-8 w-40 h-40',
    },
    {
      size: ButtonSizeEnum.XL,
      iconTextType: IconTextTypeEnum.ICON_ONLY,
      className: 'p-8 w-48 h-48',
    },
    {
      size: ButtonSizeEnum.S,
      iconTextType: IconTextTypeEnum.ICON_TEXT,
      className: 'px-4 py-2 w-fit h-37',
    },
    {
      size: ButtonSizeEnum.M,
      iconTextType: IconTextTypeEnum.ICON_TEXT,
      className: 'px-6 py-4 w-fit h-45',
    },
    {
      size: ButtonSizeEnum.L,
      iconTextType: IconTextTypeEnum.ICON_TEXT,
      className: 'px-8 py-6 w-fit h-53',
    },
    {
      size: ButtonSizeEnum.XL,
      iconTextType: IconTextTypeEnum.ICON_TEXT,
      className: 'px-8 py-6 w-fit h-64',
    },
  ],
});

const IconVariants = cva('', {
  variants: {
    size: {
      [ButtonSizeEnum.S]: 'w-16 h-16',
      [ButtonSizeEnum.M]: 'w-20 h-20',
      [ButtonSizeEnum.L]: 'w-24 h-24',
      [ButtonSizeEnum.XL]: 'w-32 h-32',
    },
  },
});

const TextVariants = cva('', {
  variants: {
    size: {
      [ButtonSizeEnum.S]: 'font-size-12',
      [ButtonSizeEnum.M]: 'font-size-12',
      [ButtonSizeEnum.L]: 'font-size-12',
      [ButtonSizeEnum.XL]: 'font-size-14',
    },
  },
});

interface ContentProps {
  className?: string;
  iconName: IconNamesEnum;
  text?: string;
  size: ButtonSizeEnum;
}

const Content = forwardRef<HTMLDivElement, ContentProps>(
  ({ className, iconName, text, size }, ref) => {
    return (
      <div
        ref={ref}
        className={ComponentUtils.cn(
          'flex w-fit flex-col items-center justify-center',
          className,
        )}
      >
        <Icon
          className={ComponentUtils.cn(IconVariants({ size }))}
          name={iconName}
        />
        {text && (
          <span
            style={{ whiteSpace: 'nowrap' }}
            className={ComponentUtils.cn(TextVariants({ size }))}
          >
            {text}
          </span>
        )}
      </div>
    );
  },
);

Content.displayName = 'Content';

export interface IconButtonProps extends Omit<ButtonBaseProps, 'width'> {
  iconName: IconNamesEnum;
  text?: string;
  textColor?: TextColorType;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      iconName,
      text,
      textColor = 'text-mono-800',
      size = ButtonSizeEnum.M,
      className,
      onClick,
      dataQk,
      ...props
    }: IconButtonProps,
    ref,
  ) => {
    const { preventDelay } = useDelayPreventer();
    const { disabled } = props;
    const handleClick = async (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) => {
      e.stopPropagation();
      onClick && (await preventDelay(onClick, e));
    };

    return (
      <button
        ref={ref}
        data-qk={dataQk}
        {...props}
        onClick={handleClick}
        className={ComponentUtils.cn(buttonVariantsDefault, className)}
      >
        <div
          className={ComponentUtils.cn(
            ButtonVariants({
              size,
              iconTextType: text
                ? IconTextTypeEnum.ICON_TEXT
                : IconTextTypeEnum.ICON_ONLY,
            }),
            textColor,
          )}
        >
          <Content
            className={ComponentUtils.cn(disabled && 'text-mono-200')}
            size={size}
            iconName={iconName}
            text={text}
          />
          <Content
            className="group-active:text-mono-900/30 relative -top-[100%] text-transparent group-hover:text-white/30 group-disabled:text-transparent"
            size={size}
            iconName={iconName}
            text={text}
          />
        </div>
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';

export default IconButton;
