import {
  BoxButtonProps,
  ComponentUtils,
  Dialog,
  DialogButtonTypeEnum,
  DialogControlsType,
  DialogTitleProps,
  FullPageLoadingSpinner,
  LoadingSpinner,
  LoadingSpinnerTypeEnum,
} from '@design-system/index';
import { BgColorType, HeightType, WidthType } from '@design-system/types';
import {
  MutableRefObject,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react';
import LoadingFallback from '@design-system/components/LoadingFallback';
import DialogConfirmButton from '@design-system/components/dialog/DialogConfirmButton';
import DialogCancelButton from '@design-system/components/dialog/DialogCancelButton';

export interface LoadingFallbackProps {
  isLoading?: boolean;
  width?: WidthType;
  height?: HeightType;
  className?: string;
}

export interface DialogBodyProps {
  ref?: MutableRefObject<HTMLDivElement | null>;
  className?: string;
  height?: HeightType;
  width?: WidthType;
}

export interface ContentDialogProps<
  TDialogData = unknown,
> extends DialogTitleProps {
  width?: WidthType;
  dialogClassName?: string;
  dialogBodyProps?: DialogBodyProps;
  dialogControls: DialogControlsType<TDialogData>;
  isLoading?: boolean;
  loadingFallbackProps?: LoadingFallbackProps;
  cancelButtonText?: string;
  onCancelButtonClick?: BoxButtonProps['onClick'];
  cancelButtonDisabled?: boolean;
  closeOnCancelButtonClick?: boolean;
  confirmButtonText?: string;
  onConfirmButtonClick?: BoxButtonProps['onClick'];
  confirmButtonDisabled?: boolean;
  confirmButtonRef?: MutableRefObject<HTMLButtonElement | null>;
  closeOnConfirmButtonClick?: boolean;
  confirmButtonBgColor?: BgColorType;
  isShowCancelButton?: boolean;
  isDimClickClose?: boolean;
  onDimClick?: () => void;
}

const ContentDialog = <TDialogData = unknown,>({
  titleText,
  titleClassName,
  subTitleText,
  subTitleClassName,
  titleIcon,
  iconButton,
  width = 'w-500',
  dialogClassName,
  dialogBodyProps,
  dialogControls,
  isLoading = false,
  children,
  loadingFallbackProps = {},
  cancelButtonText,
  onCancelButtonClick,
  cancelButtonDisabled,
  closeOnCancelButtonClick = true,
  confirmButtonText,
  onConfirmButtonClick,
  confirmButtonDisabled,
  confirmButtonRef,
  closeOnConfirmButtonClick,
  confirmButtonBgColor,
  isShowCancelButton = true,
  isDimClickClose = false,
  onDimClick,
  dataQk,
}: PropsWithChildren<ContentDialogProps<TDialogData>>) => {
  const titleRef = useRef<HTMLDivElement | null>(null);
  const buttonAreaRef = useRef<HTMLDivElement | null>(null);
  const [bodyMaxHeight, setBodyMaxHeight] = useState<string>();
  const {
    ref: bodyRef,
    className: bodyClassName,
    width: bodyWidth,
    height: bodyHeight,
  } = dialogBodyProps || {};
  const {
    isLoading: isContentLoading = false,
    width: fallbackWidth,
    height: fallbackHeight,
    className: fallbackClassName,
  } = loadingFallbackProps;

  useEffect(() => {
    let resizeObserver: ResizeObserver | undefined;
    let timeoutId: NodeJS.Timeout | undefined;
    if (dialogControls.isOpen) {
      const dialogPadding = 40;
      resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.target === titleRef.current) {
            const h =
              entry.target.scrollHeight +
              (buttonAreaRef.current?.scrollHeight || 0) +
              dialogPadding;
            setBodyMaxHeight(`calc(80dvh - ${h}px)`);
          } else if (entry.target === buttonAreaRef.current) {
            const h =
              entry.target.scrollHeight +
              (titleRef.current?.scrollHeight || 0) +
              dialogPadding;
            setBodyMaxHeight(`calc(80dvh - ${h}px)`);
          }
        });
      });
      if (titleRef.current && buttonAreaRef.current && resizeObserver) {
        resizeObserver.observe(titleRef.current);
        resizeObserver.observe(buttonAreaRef.current);
      }
    }

    return () => {
      timeoutId && clearTimeout(timeoutId);
      resizeObserver?.disconnect();
    };
  }, [dialogControls.isOpen]);

  const handleCancelButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onCancelButtonClick?.(event);
    closeOnCancelButtonClick && dialogControls.close();
  };

  const handleConfirmButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onConfirmButtonClick?.(event);
    closeOnConfirmButtonClick && dialogControls.close();
  };

  const dialogTitleProps = {
    titleText,
    titleClassName,
    subTitleText,
    subTitleClassName,
    titleIcon,
    iconButton,
  };

  return (
    <Dialog
      dialogControls={dialogControls}
      className={dialogClassName}
      dataQk={dataQk}
      width={width}
      isDimClickClose={isDimClickClose}
      onDimClick={onDimClick}
    >
      <Dialog.Title ref={titleRef} {...dialogTitleProps} />
      <Dialog.Body
        ref={bodyRef}
        width={bodyWidth}
        height={bodyHeight}
        style={{ maxHeight: bodyMaxHeight }}
        className={ComponentUtils.cn(bodyClassName, 'h-fit')}
      >
        <LoadingFallback
          isLoading={isContentLoading}
          fallback={
            <div
              className={ComponentUtils.cn(
                'flex h-full items-center justify-center',
                fallbackWidth,
                fallbackHeight,
                fallbackClassName,
              )}
            >
              <LoadingSpinner type={LoadingSpinnerTypeEnum.Only} />
            </div>
          }
        >
          {children}
        </LoadingFallback>
      </Dialog.Body>
      <Dialog.ButtonArea
        ref={buttonAreaRef}
        type={DialogButtonTypeEnum.TWO_BUTTON}
      >
        {isShowCancelButton && (
          <DialogCancelButton
            onClick={handleCancelButtonClick}
            text={cancelButtonText}
            disabled={cancelButtonDisabled}
          />
        )}
        <DialogConfirmButton
          ref={confirmButtonRef}
          text={confirmButtonText}
          onClick={handleConfirmButtonClick}
          disabled={isContentLoading || confirmButtonDisabled}
          bgColor={confirmButtonBgColor}
        />
      </Dialog.ButtonArea>
      {isLoading && <FullPageLoadingSpinner />}
    </Dialog>
  );
};

export default ContentDialog;
