import { ForwardedRef, forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import {
  BUTTON_DEFAULT_CLASS_NAMES,
  ButtonBaseProps,
  ButtonSizeEnum,
  ContentIconOnlyType,
  ContentTextType,
} from '@design-system/components/button/BaseButton';
import Icon from '@design-system/components/common/Icon';
import { IconNamesEnum } from '@design-system/constants/iconNames.enum';
import useDelayPreventer from '@design-system/hooks/useDelayPreventer';
import { DataQuery } from '@design-system/types/common.type';
import { TextColorType } from '@design-system/types/component.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

const textButtonVariantsDefault = ComponentUtils.cn(
  'flex flex-col w-fit overflow-hidden',
  BUTTON_DEFAULT_CLASS_NAMES,
);
const TextButtonVariants = cva('', {
  variants: {
    size: {
      [ButtonSizeEnum.S]: 'h-33 font-size-12',
      [ButtonSizeEnum.M]: 'h-36 font-size-14',
      [ButtonSizeEnum.L]: 'h-42 font-size-16',
      [ButtonSizeEnum.XL]: 'h-52 font-size-20',
    },
  },
});

const ContentVariants = cva('flex items-center justify-center w-full h-full', {
  variants: {
    size: {
      [ButtonSizeEnum.S]: 'gap-2 p-8',
      [ButtonSizeEnum.M]: 'gap-4 p-8',
      [ButtonSizeEnum.L]: 'gap-4 p-10',
      [ButtonSizeEnum.XL]: 'gap-4 p-12',
    },
  },
});

const IconVariants = cva('', {
  variants: {
    size: {
      [ButtonSizeEnum.S]: 'w-16 h-16',
      [ButtonSizeEnum.M]: 'w-16 h-16',
      [ButtonSizeEnum.L]: 'w-16 h-16',
      [ButtonSizeEnum.XL]: 'w-24 h-24',
    },
  },
});

interface ContentProps {
  className?: string;
  size: ButtonSizeEnum;
  text?: string;
  iconNameLeft?: IconNamesEnum;
  iconNameRight?: IconNamesEnum;
  iconName?: IconNamesEnum;
}

const Content = ({
  className,
  size,
  text,
  iconNameLeft,
  iconNameRight,
  iconName,
}: ContentProps) => {
  return (
    <div className={ComponentUtils.cn(ContentVariants({ size }), className)}>
      {iconNameLeft && (
        <Icon
          name={iconNameLeft}
          className={ComponentUtils.cn(IconVariants({ size }))}
        />
      )}
      {text && <span className="truncate">{text}</span>}
      {iconName && (
        <Icon
          name={iconName}
          className={ComponentUtils.cn(IconVariants({ size }))}
        />
      )}
      {iconNameRight && (
        <Icon
          name={iconNameRight}
          className={ComponentUtils.cn(IconVariants({ size }))}
        />
      )}
    </div>
  );
};

type TextButtonProps = ButtonBaseProps & {
  textColor?: TextColorType;
  contentWrapperClassName?: string;
  contentClassName?: string;
} & (ContentTextType | ContentIconOnlyType) &
  DataQuery;

export const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(
  (
    {
      size = ButtonSizeEnum.M,
      text,
      textColor = 'text-mono-800',
      iconNameLeft,
      iconNameRight,
      iconName,
      width,
      className,
      contentWrapperClassName,
      contentClassName,
      onClick,
      dataQk,
      ...props
    }: TextButtonProps,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    const { preventDelay } = useDelayPreventer();
    const { disabled } = props;

    const handleClick = async (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) => {
      onClick && (await preventDelay(onClick, e));
    };

    return (
      <button
        ref={(r) => ComponentUtils.setRefs(r, ref)}
        type="button"
        data-qk={dataQk}
        {...props}
        onClick={handleClick}
        className={ComponentUtils.cn(
          textButtonVariantsDefault,
          className,
          width,
        )}
      >
        <div
          className={ComponentUtils.cn(
            TextButtonVariants({ size }),
            textColor,
            width,
            contentWrapperClassName,
          )}
        >
          <Content
            className={ComponentUtils.cn(
              disabled && 'text-mono-200',
              contentClassName,
            )}
            size={size}
            text={text}
            iconNameLeft={iconNameLeft}
            iconNameRight={iconNameRight}
            iconName={iconName}
          />
          <Content
            className={ComponentUtils.cn(
              'group-active:text-mono-900/30 relative -top-[100%] text-transparent group-hover:text-white/30 group-disabled:text-transparent',
              contentClassName,
            )}
            size={size}
            text={text}
            iconNameLeft={iconNameLeft}
            iconNameRight={iconNameRight}
            iconName={iconName}
          />
        </div>
      </button>
    );
  },
);

TextButton.displayName = 'TextButton';

export default TextButton;
