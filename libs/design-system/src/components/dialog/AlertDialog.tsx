import { MutableRefObject } from 'react';
import useDialogButtonKeyboardAction from '@design-system/hooks/modal/useDialogButtonKeyboardAction';
import {
  BoxButtonProps,
  Dialog,
  DialogButtonTypeEnum,
  DialogProps,
  DialogTitleProps,
} from '@design-system/index';
import DialogContent, {
  DialogContentProps,
} from '@design-system/components/dialog/DialogContent';
import DialogConfirmButton from '@design-system/components/dialog/DialogConfirmButton';

export interface AlertDialogProps<TDialogData = unknown>
  extends
    Omit<
      DialogProps<TDialogData>,
      'minWidth' | 'onDimClick' | 'onDimMouseOver' | 'wrapperClassName'
    >,
    DialogContentProps,
    Pick<DialogTitleProps, 'titleClassName'> {
  title?: string;
  okButtonText?: string;
  onOkButtonClick?: BoxButtonProps['onClick'];
  okButtonDisabled?: boolean;
  closeOnOkClick?: boolean;
  bodyRef?: MutableRefObject<HTMLDivElement | null>;
  buttonBgColor?: BoxButtonProps['bgColor'];
  isEnterEnabled?: boolean;
}

const AlertDialog = <TDialogData,>({
  dialogControls,
  titleClassName,
  okButtonText,
  content,
  title,
  onOkButtonClick,
  okButtonDisabled,
  closeOnOkClick = true,
  bodyRef,
  buttonBgColor,
  className,
  isDimClickClose = true,
  isEnterEnabled = true,
  minHeight,
  width = 'w-343',
}: AlertDialogProps<TDialogData>) => {
  const { confirmButtonRef } = useDialogButtonKeyboardAction({
    enabled: dialogControls.isOpen,
    closeDialog: dialogControls.close,
    isEnterEnabled,
  });

  const handleOkButtonClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    onOkButtonClick?.(e);
    closeOnOkClick && dialogControls.close();
  };

  return (
    <Dialog
      dialogControls={dialogControls}
      width={width}
      minWidth="min-w-343"
      className={className}
      isDimClickClose={isDimClickClose}
      minHeight={minHeight}
    >
      {title && (
        <Dialog.Title titleText={title} titleClassName={titleClassName} />
      )}
      <Dialog.Body ref={bodyRef}>
        <DialogContent content={content} />
      </Dialog.Body>
      <Dialog.ButtonArea type={DialogButtonTypeEnum.ONE_BUTTON}>
        <DialogConfirmButton
          ref={confirmButtonRef}
          text={okButtonText}
          disabled={okButtonDisabled}
          onClick={handleOkButtonClick}
          bgColor={buttonBgColor}
        />
      </Dialog.ButtonArea>
    </Dialog>
  );
};

export default AlertDialog;
