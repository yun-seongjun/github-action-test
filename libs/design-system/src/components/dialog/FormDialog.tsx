import {
  ComponentUtils,
  Form,
  FormProps,
  UseFormMethods,
} from '@design-system/index';
import { HeightType, WidthType } from '@design-system/types';
import { MutableRefObject, PropsWithChildren, useEffect } from 'react';
import { FieldValues } from 'react-hook-form';
import ContentDialog, {
  ContentDialogProps,
} from '@design-system/components/dialog/ContentDialog';
import useDialogButtonKeyboardAction from '@design-system/hooks/modal/useDialogButtonKeyboardAction';
import DataUtils from '@design-system/utils/dataUtils';

interface FormDialogFormProps {
  className?: string;
  height?: HeightType;
  width?: WidthType;
}

interface FormDialogProps<
  TDialogData = unknown,
  TFieldValues extends FieldValues = FieldValues,
>
  extends
    Omit<FormProps<TFieldValues>, 'formControl' | 'className'>,
    ContentDialogProps<TDialogData> {
  formMethods: UseFormMethods<TFieldValues>;
  dialogFormProps?: FormDialogFormProps;
  isPreventEnterSubmit?: boolean;
  ignoreEscWhenFocusedRef?: MutableRefObject<HTMLElement | null>;
}

const FormDialog = <
  TDialogData = unknown,
  TFieldValues extends FieldValues = FieldValues,
>({
  formMethods,
  dialogFormProps,
  isPreventEnterSubmit,
  style,
  autoComplete,
  onSubmit,
  onSubmitError,
  devToolPlacement,
  onKeyDown,
  children,
  confirmButtonDisabled,
  ignoreEscWhenFocusedRef,
  ...props
}: PropsWithChildren<FormDialogProps<TDialogData, TFieldValues>>) => {
  const { dialogControls } = props;

  const {
    clear,
    requestSubmit,
    formState: { isValid, errors },
  } = formMethods;

  useEffect(() => {
    if (!dialogControls.isOpen) {
      clear();
    }
  }, [dialogControls.isOpen]);

  const handleCancelButtonClick = () => {
    dialogControls.close();
  };

  const handleConfirmButtonClick = () => {
    requestSubmit();
  };
  const { confirmButtonRef } = useDialogButtonKeyboardAction({
    enabled: dialogControls.isOpen && !isPreventEnterSubmit,
    closeDialog: handleCancelButtonClick,
    ignoreEscWhenFocusedRef,
  });

  const {
    width: formWidth,
    height: formHeight,
    className: formClassName,
  } = dialogFormProps || {};

  return (
    <ContentDialog<TDialogData>
      {...props}
      confirmButtonRef={confirmButtonRef}
      onConfirmButtonClick={handleConfirmButtonClick}
      confirmButtonDisabled={
        !isValid || confirmButtonDisabled || !DataUtils.isEmpty(errors)
      }
    >
      <Form
        className={ComponentUtils.cn(
          'flex flex-col gap-16',
          formWidth,
          formHeight,
          formClassName,
        )}
        formControl={formMethods}
        style={style}
        autoComplete={autoComplete}
        onSubmit={onSubmit}
        onSubmitError={onSubmitError}
        devToolPlacement={devToolPlacement}
        onKeyDown={onKeyDown}
      >
        {children}
      </Form>
    </ContentDialog>
  );
};

export default FormDialog;
