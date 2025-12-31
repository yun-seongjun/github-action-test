import { MutableRefObject, PropsWithChildren } from 'react';
import { HeightType, WidthType } from '@design-system/types';
import {
  ComponentUtils,
  Dialog,
  DialogButtonTypeEnum,
  DialogControlsType,
  FullPageLoadingSpinner,
  LoadingSpinner,
  LoadingSpinnerTypeEnum,
} from '@design-system/index';
import useDialogButtonKeyboardAction from '@design-system/hooks/modal/useDialogButtonKeyboardAction';
import LoadingFallback from '@design-system/components/LoadingFallback';
import DialogCancelButton from '@design-system/components/dialog/DialogCancelButton';
import DialogConfirmButton from '@design-system/components/dialog/DialogConfirmButton';
import { DataQuery } from '@design-system/types/common.type';

export interface ContentLoadingFallbackProps {
  isLoading?: boolean;
  width?: WidthType;
  height?: HeightType;
  className?: string;
}

export interface FetchingDialogProps<TDialogData = unknown> extends DataQuery {
  title: string;
  dialogClassName?: string;
  dialogBodyRef?: MutableRefObject<HTMLDivElement | null>;
  dialogBodyClassName?: string;
  dialogControls: DialogControlsType<TDialogData>;
  isLoading?: boolean;
  contentLoadingFallbackProps?: ContentLoadingFallbackProps;
  confirmButtonText?: string;
  confirmButtonDisabled?: boolean;
  onConfirmButtonClick?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
}

const FetchingDialog = <TDialogData = unknown,>({
  title,
  dialogClassName,
  dialogBodyClassName,
  dialogBodyRef,
  dialogControls,
  isLoading = false,
  children,
  contentLoadingFallbackProps = {},
  confirmButtonText,
  confirmButtonDisabled,
  onConfirmButtonClick,
  dataQk,
}: PropsWithChildren<FetchingDialogProps<TDialogData>>) => {
  const {
    isLoading: isContentLoading = false,
    width: fallbackWidth,
    height: fallbackHeight,
    className: fallbackClassName,
  } = contentLoadingFallbackProps;

  const handleCancelButtonClick = () => {
    dialogControls.close();
  };

  const { confirmButtonRef } = useDialogButtonKeyboardAction({
    enabled: dialogControls.isOpen,
    closeDialog: handleCancelButtonClick,
  });

  return (
    <Dialog
      dialogControls={dialogControls}
      className={dialogClassName}
      minWidth="min-w-500"
      isDimClickClose={false}
      dataQk={dataQk}
    >
      <Dialog.Title titleText={title} />
      <Dialog.Body
        className={ComponentUtils.cn(dialogBodyClassName)}
        ref={dialogBodyRef}
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
      <Dialog.ButtonArea type={DialogButtonTypeEnum.TWO_BUTTON}>
        <DialogCancelButton onClick={handleCancelButtonClick} dataQk={dataQk} />
        <DialogConfirmButton
          ref={confirmButtonRef}
          text={confirmButtonText}
          onClick={onConfirmButtonClick}
          disabled={confirmButtonDisabled}
        />
      </Dialog.ButtonArea>
      {isLoading && <FullPageLoadingSpinner />}
    </Dialog>
  );
};

export default FetchingDialog;
