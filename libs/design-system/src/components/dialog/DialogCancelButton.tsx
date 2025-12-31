import { forwardRef } from 'react';
import { useTranslation } from 'next-i18next';
import TextButton from '@design-system/components/button/TextButton';
import {
  BoxButton,
  BoxButtonProps,
  ButtonSizeEnum,
} from '@design-system/index';
import { DataQuery } from '@design-system/types/common.type';

export enum DialogCancelButtonTypeEnum {
  BOX = 'box',
  TEXT = 'text',
}

export interface DialogCancelButtonProps
  extends Pick<BoxButtonProps, 'onClick' | 'disabled' | 'type'>, DataQuery {
  text?: string;
  cancelButtonType?: DialogCancelButtonTypeEnum;
}

const DialogCancelButton = forwardRef<
  HTMLButtonElement,
  DialogCancelButtonProps
>(
  (
    {
      text,
      onClick,
      disabled,
      type,
      cancelButtonType,
      dataQk,
    }: DialogCancelButtonProps,
    ref,
  ) => {
    const { t } = useTranslation();

    const _text = text ?? t('common:dialog-button.cancel');

    if (cancelButtonType === DialogCancelButtonTypeEnum.TEXT) {
      return (
        <TextButton
          text={_text}
          size={ButtonSizeEnum.L}
          onClick={onClick}
          width="w-full"
          disabled={disabled}
        />
      );
    }
    return (
      <BoxButton
        ref={ref}
        bgColor="bg-mono-50"
        width="w-full"
        size={ButtonSizeEnum.XL}
        textColor="text-mono-600"
        text={_text}
        disabled={disabled}
        onClick={onClick}
        type={type}
        dataQk={dataQk}
      />
    );
  },
);

DialogCancelButton.displayName = 'DialogCancelButton';

export default DialogCancelButton;
