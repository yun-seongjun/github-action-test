import {
  useRef,
  ForwardedRef,
  forwardRef,
  PropsWithChildren,
  ReactElement,
  CSSProperties,
} from 'react';
import { cva } from 'class-variance-authority';
import ScrollGradationWrapper from '@design-system/components/ScrollGradationWrapper';
import Icon from '@design-system/components/common/Icon';
import Modal, { ModalProps } from '@design-system/components/modal/Modal';
import { IconNamesEnum } from '@design-system/constants/iconNames.enum';
import { DialogControlsType } from '@design-system/hooks/modal/useDialog';
import useFlagAnimation from '@design-system/hooks/modal/useFlagAnimation';
import { DataQuery } from '@design-system/types/common.type';
import {
  HeightType,
  ImgIconsSrcType,
  MinHeightType,
  MinWidthType,
  TextColorType,
  WidthType,
} from '@design-system/types/component.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export interface DialogProps<TDialogData = unknown> extends Omit<
  ModalProps<TDialogData>,
  'modalControls'
> {
  dialogControls: DialogControlsType<TDialogData>;
  width?: WidthType;
  minWidth?: MinWidthType;
  minHeight?: MinHeightType;
  className?: string;
}

const Dialog = <TDialogData,>({
  dialogControls,
  width,
  minWidth,
  minHeight,
  className,
  isDimClickClose = true,
  onDimClick,
  children,
  dataQk,
}: PropsWithChildren<DialogProps<TDialogData>>) => {
  return (
    <Modal<TDialogData>
      modalControls={dialogControls}
      isDimClickClose={isDimClickClose}
      onDimClick={onDimClick}
    >
      <DialogWrapper
        dialogControls={dialogControls}
        className={className}
        minWidth={minWidth}
        width={width}
        minHeight={minHeight}
        dataQk={dataQk}
      >
        {children}
      </DialogWrapper>
    </Modal>
  );
};

export interface DialogWrapperProps<TDialogData>
  extends
    Pick<
      DialogProps<TDialogData>,
      'width' | 'minWidth' | 'minHeight' | 'dialogControls' | 'className'
    >,
    DataQuery {}
export const DialogWrapper = <TDialogData,>({
  children,
  width,
  minWidth,
  minHeight,
  dialogControls,
  className,
  dataQk,
}: PropsWithChildren<DialogWrapperProps<TDialogData>>) => {
  const {
    isOpen,
    animationStartDuration,
    animationCloseDuration,
    closedAfterCallback,
    openedAfterCallback,
  } = dialogControls;
  const dialogRef = useRef<HTMLElement>(null);

  useFlagAnimation({
    flag: isOpen,
    startAnimationCallback: () => {
      if (!dialogRef.current) return;
      dialogRef.current.style.transform = 'scale(0.8)';
      dialogRef.current
        .animate(
          [
            { transform: 'scale(0.8)' }, // 시작 상태
            { transform: 'scale(1)' }, // 종료 상태
          ],
          {
            duration: animationStartDuration, // 지속 시간 (밀리초)
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'forwards',
          },
        )
        .addEventListener('finish', openedAfterCallback);
      dialogRef.current.addEventListener('finish', openedAfterCallback);
    },
    closeAnimationCallback: () => {
      if (!dialogRef.current) return;
      dialogRef.current
        .animate(
          [
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.8)' },
          ],
          {
            duration: animationCloseDuration, // 지속 시간 (밀리초)
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'forwards',
          },
        )
        .addEventListener('finish', closedAfterCallback);
    },
  });

  return (
    <section
      ref={dialogRef}
      className={ComponentUtils.cn(
        'animate-scale-up rounded-medium border-1 border-mono-100 shadow-light-bottom-4 flex max-h-[80vh] max-w-[80vw] flex-col bg-white py-20',
        minWidth,
        minHeight,
        width,
        className,
      )}
      data-qk={dataQk}
    >
      {children}
    </section>
  );
};

/*================================================ Dialog Title ================================================*/

export interface DialogTitleProps extends DataQuery {
  titleText: string;
  titleClassName?: string;
  subTitleText?: string;
  subTitleClassName?: string;
  //Icon은 모든 아이콘들이 들어갈 수 있습니다. 또한 아이콘을 호버 할 시 툴팁이 노출되거나 클릭 핸들러가 다르게 들어갈 수 있습니다.
  titleIcon?: ReactElement;
  iconButton?: ReactElement;
}

const DialogTitle = forwardRef<HTMLDivElement, DialogTitleProps>(
  (
    {
      titleText,
      titleClassName,
      subTitleText,
      subTitleClassName,
      titleIcon,
      iconButton,
      dataQk,
    }: DialogTitleProps,
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className="relative flex w-full flex-col gap-4 px-24 pb-8 pt-11"
        data-qk={dataQk}
      >
        <div className="flex flex-col gap-8">
          {titleIcon}
          <div
            className={ComponentUtils.cn(
              'flex items-center gap-4',
              iconButton && 'mr-24',
              titleClassName,
            )}
          >
            <span
              className={ComponentUtils.cn(
                'text-mono-800 font-size-18 font-bold',
              )}
            >
              {titleText}
            </span>
          </div>
        </div>
        {subTitleText && (
          <span
            className={ComponentUtils.cn(
              'text-mono-500 font-size-14 font-light',
              subTitleClassName,
            )}
          >
            {subTitleText}
          </span>
        )}
        {iconButton && (
          <div className="absolute right-16 top-5">{iconButton}</div>
        )}
      </div>
    );
  },
);

DialogTitle.displayName = 'DialogTitle';

/*================================================ Dialog Icon ================================================*/

export enum DialogIconTypeEnum {
  TITLE = 'title',
  ICON = 'icon',
}

const dialogIconTypeStyle: { [key in DialogIconTypeEnum]: string } = {
  [DialogIconTypeEnum.TITLE]: 'h-20 w-20',
  [DialogIconTypeEnum.ICON]: 'h-40 w-40 p-8 cursor-pointer',
};

interface DialogIconProps extends DataQuery {
  type: DialogIconTypeEnum;
  className?: string;
  onClick?: () => void;
}

const DialogIcon = ({
  name,
  type,
  onClick,
  color = 'text-mono-700',
  dataQk,
}: DialogIconProps & {
  name: IconNamesEnum;
  color?: TextColorType;
}) => {
  return (
    <Icon
      name={name}
      onClick={onClick}
      className={ComponentUtils.cn(color, dialogIconTypeStyle[type])}
      dataQk={dataQk}
    />
  );
};

const DialogImageIcon = ({
  src,
  type,
  onClick,
  dataQk,
}: DialogIconProps &
  DataQuery & {
    src: ImgIconsSrcType;
  }) => {
  return (
    <img
      src={src}
      className={ComponentUtils.cn(dialogIconTypeStyle[type], 'object-cover')}
      onClick={onClick}
      alt={src}
      data-qk={dataQk}
    />
  );
};

/*================================================ Dialog Body ================================================*/
interface DialogBodyProps extends DataQuery {
  className?: string;
  style?: CSSProperties;
  width?: WidthType;
  height?: HeightType;
  scrollEnabled?: boolean;
}

const DialogBody = forwardRef<
  HTMLDivElement,
  PropsWithChildren<DialogBodyProps>
>(
  (
    {
      className,
      style,
      width,
      height,
      scrollEnabled = true,
      children,
      dataQk,
    }: PropsWithChildren<DialogBodyProps>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const classNameDefault = 'px-24 py-8';

    if (!scrollEnabled) {
      return (
        <div
          style={style}
          className={ComponentUtils.cn(
            classNameDefault,
            'h-full',
            width,
            height,
            className,
          )}
          ref={ref}
          data-qk={dataQk}
        >
          {children}
        </div>
      );
    }
    return (
      <ScrollGradationWrapper
        style={style}
        className={ComponentUtils.cn(
          classNameDefault,
          width,
          height,
          className,
        )}
        zIndex="z-modal"
        height="h-full"
        ref={ref}
        dataQk={dataQk}
        wrapperClassName="overflow-auto"
      >
        {children}
      </ScrollGradationWrapper>
    );
  },
);

DialogBody.displayName = 'DialogBody';

/*================================================ Dialog Button ================================================*/
export enum DialogButtonTypeEnum {
  ONE_BUTTON = 'oneButton',
  TWO_BUTTON = 'twoButton',
  UP_AND_DOWN = 'upAndDown',
  TEXT_ONE_BUTTON = 'textOneButton',
  TEXT_TWO_BUTTON = 'textTwoButton',
}

const dialogButtonVariants = cva('relative flex w-full px-24 pb-3 pt-16', {
  variants: {
    dialogButtonType: {
      [DialogButtonTypeEnum.ONE_BUTTON]: '',
      [DialogButtonTypeEnum.TWO_BUTTON]: 'gap-8',
      [DialogButtonTypeEnum.UP_AND_DOWN]: 'flex-col gap-16',
      [DialogButtonTypeEnum.TEXT_ONE_BUTTON]: '',
      [DialogButtonTypeEnum.TEXT_TWO_BUTTON]: 'gap-8',
    },
  },
  defaultVariants: {
    dialogButtonType: DialogButtonTypeEnum.TWO_BUTTON,
  },
});

interface DialogButtonProps extends DataQuery {
  type: DialogButtonTypeEnum;
  className?: string;
}

export const DialogButtonArea = forwardRef<
  HTMLDivElement,
  PropsWithChildren<DialogButtonProps>
>(
  (
    { type, className, children, dataQk }: PropsWithChildren<DialogButtonProps>,
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={ComponentUtils.cn(
          'relative flex w-full px-24 pb-4 pt-16',
          dialogButtonVariants({ dialogButtonType: type }),
          className,
        )}
        data-qk={dataQk}
      >
        {children}
      </div>
    );
  },
);

DialogButtonArea.displayName = 'DialogButtonArea';

Dialog.Title = DialogTitle;
Dialog.Icon = DialogIcon;
Dialog.ImageIcon = DialogImageIcon;
Dialog.Body = DialogBody;
Dialog.ButtonArea = DialogButtonArea;

export default Dialog;
