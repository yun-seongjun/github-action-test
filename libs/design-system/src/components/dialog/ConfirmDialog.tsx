import useDialogButtonKeyboardAction from '@design-system/hooks/modal/useDialogButtonKeyboardAction';
import {
  BgColorType,
  BoxButtonProps,
  ComponentUtils,
  DataQuery,
  Dialog,
  DialogButtonTypeEnum,
  DialogIconTypeEnum,
  DialogProps,
  IconNamesEnum,
} from '@design-system/index';
import { MutableRefObject, ReactElement } from 'react';
import DialogCancelButton, {
  DialogCancelButtonTypeEnum,
} from '@design-system/components/dialog/DialogCancelButton';
import DialogContent, {
  DialogContentProps,
} from '@design-system/components/dialog/DialogContent';
import DialogConfirmButton from '@design-system/components/dialog/DialogConfirmButton';

interface ConfirmDialogProps<TDialogData = unknown>
  extends
    Omit<
      DialogProps<TDialogData>,
      'minWidth' | 'onDimClick' | 'onDimMouseOver' | 'wrapperClassName'
    >,
    DialogContentProps,
    DataQuery {
  title?: string;
  titleIcon?: ReactElement;
  titleClassName?: string;
  bodyRef?: MutableRefObject<HTMLDivElement | null>;
  bodyClassName?: string;
  confirmButtonText?: string;
  onConfirmButtonClick?: BoxButtonProps['onClick'];
  confirmButtonDisabled?: boolean;
  closeOnConfirmButtonClick?: boolean;
  cancelButtonText?: string;
  onCancelButtonClick?: BoxButtonProps['onClick'];
  cancelButtonDisabled?: boolean;
  closeOnCancelButtonClick?: boolean;
  confirmButtonBgColor?: BgColorType;
  dialogClassName?: string;
  dialogButtonTypes?: DialogButtonTypeEnum;
  dialogButtonAreaClassName?: string;
  hasTitleClose?: boolean;
  bodyScrollEnabled?: boolean;
}

const ConfirmDialog = <TDialogDataType,>({
  title,
  titleClassName,
  titleIcon,
  bodyRef,
  bodyClassName,
  confirmButtonText,
  onConfirmButtonClick,
  confirmButtonDisabled,
  closeOnConfirmButtonClick = true,
  cancelButtonText,
  onCancelButtonClick,
  cancelButtonDisabled,
  closeOnCancelButtonClick = true,
  content,
  dialogControls,
  dialogClassName,
  dialogButtonTypes = DialogButtonTypeEnum.TWO_BUTTON,
  dialogButtonAreaClassName,
  confirmButtonBgColor,
  isDimClickClose = false,
  hasTitleClose = false,
  bodyScrollEnabled = true,
  dataQk,
}: ConfirmDialogProps<TDialogDataType>) => {
  const { confirmButtonRef } = useDialogButtonKeyboardAction({
    enabled: dialogControls.isOpen,
    closeDialog: dialogControls.close,
  });

  const handleCancelButtonClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    onCancelButtonClick?.(e);
    closeOnCancelButtonClick && dialogControls.close();
  };

  const handleConfirmButtonClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    onConfirmButtonClick?.(e);
    closeOnConfirmButtonClick && dialogControls.close();
  };

  return (
    <Dialog
      dialogControls={dialogControls}
      width="w-343"
      minWidth="min-w-343"
      isDimClickClose={isDimClickClose}
      className={dialogClassName}
    >
      {title && (
        <Dialog.Title
          titleText={title}
          titleIcon={titleIcon}
          titleClassName={titleClassName}
          iconButton={
            hasTitleClose ? (
              <Dialog.Icon
                type={DialogIconTypeEnum.ICON}
                name={IconNamesEnum.Close}
                onClick={() => dialogControls.close()}
              />
            ) : undefined
          }
        />
      )}
      <Dialog.Body
        ref={bodyRef}
        className={bodyClassName}
        scrollEnabled={bodyScrollEnabled}
      >
        <DialogContent content={content} />
      </Dialog.Body>
      <Dialog.ButtonArea
        type={dialogButtonTypes}
        className={
          dialogButtonTypes === DialogButtonTypeEnum.UP_AND_DOWN
            ? ComponentUtils.cn('flex-col-reverse', dialogButtonAreaClassName)
            : dialogButtonAreaClassName
        }
      >
        <DialogCancelButton
          text={cancelButtonText}
          disabled={cancelButtonDisabled}
          cancelButtonType={
            dialogButtonTypes === DialogButtonTypeEnum.UP_AND_DOWN
              ? DialogCancelButtonTypeEnum.TEXT
              : DialogCancelButtonTypeEnum.BOX
          }
          onClick={handleCancelButtonClick}
          dataQk={`${dataQk}-cancel-button`}
        />
        <DialogConfirmButton
          ref={confirmButtonRef}
          text={confirmButtonText}
          disabled={confirmButtonDisabled}
          onClick={handleConfirmButtonClick}
          bgColor={confirmButtonBgColor}
          dataQk={`${dataQk}-confirm-button`}
        />
      </Dialog.ButtonArea>
    </Dialog>
  );
};

export default ConfirmDialog;
