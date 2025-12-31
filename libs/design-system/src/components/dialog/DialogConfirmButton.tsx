import { forwardRef } from 'react';
import { useTranslation } from 'next-i18next';
import { DataQuery } from '@design-system/types/common.type';
import {
  BoxButtonProps,
  ButtonDisplayTypeEnum,
  ButtonSizeEnum,
} from '@design-system/index';
import BoxButton from '@design-system/components/button/BoxButton';

export interface DialogConfirmButtonProps
  extends
    DataQuery,
    Pick<BoxButtonProps, 'onClick' | 'disabled' | 'type' | 'bgColor'> {
  text?: string;
}

const DialogConfirmButton = forwardRef<
  HTMLButtonElement,
  DialogConfirmButtonProps
>(
  (
    {
      text,
      onClick,
      disabled,
      type,
      bgColor,
      dataQk,
    }: DialogConfirmButtonProps,
    ref,
  ) => {
    const { t } = useTranslation();

    return (
      <BoxButton
        ref={ref}
        bgColor={bgColor ?? 'bg-primary-500'}
        width="w-full"
        displayType={ButtonDisplayTypeEnum.CONTAINED}
        size={ButtonSizeEnum.XL}
        textColor="text-white"
        text={text ?? t('common:dialog-button.confirm')}
        onClick={onClick}
        disabled={disabled}
        type={type}
        dataQk={dataQk}
      />
    );
  },
);

DialogConfirmButton.displayName = 'DialogConfirmButton';

export default DialogConfirmButton;
