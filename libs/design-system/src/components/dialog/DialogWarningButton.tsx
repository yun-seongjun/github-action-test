import {
  BoxButtonProps,
  ButtonDisplayTypeEnum,
  ButtonSizeEnum,
} from '@design-system/index';
import { forwardRef } from 'react';
import BoxButton from '@design-system/components/button/BoxButton';

export interface DialogWarningButtonProps extends Pick<
  BoxButtonProps,
  'onClick' | 'disabled' | 'type'
> {
  text: string;
}

const DialogWarningButton = forwardRef<
  HTMLButtonElement,
  DialogWarningButtonProps
>(({ text, onClick, disabled, type }: DialogWarningButtonProps, ref) => {
  return (
    <BoxButton
      ref={ref}
      bgColor="bg-red-400"
      width="w-full"
      displayType={ButtonDisplayTypeEnum.CONTAINED}
      size={ButtonSizeEnum.XL}
      textColor="text-white"
      text={text}
      onClick={onClick}
      disabled={disabled}
      type={type}
    />
  );
});

DialogWarningButton.displayName = 'DialogWarningButton';

export default DialogWarningButton;
