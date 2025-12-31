import { ForwardedRef, forwardRef } from 'react';
import BaseButton, {
  ButtonBaseProps,
  ButtonDisplayTypeEnum,
  ButtonTypeEnum,
  ContentIconOnlyType,
  ContentTextType,
  DisplayContainedType,
  DisplayOutlinedType,
} from '@design-system/components/button/BaseButton';

type CapsuleButtonProps = ButtonBaseProps &
  (DisplayContainedType | DisplayOutlinedType) &
  (ContentTextType | ContentIconOnlyType);

export const CapsuleButton = forwardRef<HTMLButtonElement, CapsuleButtonProps>(
  (
    {
      displayType = ButtonDisplayTypeEnum.CONTAINED,
      ...props
    }: CapsuleButtonProps,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    return (
      <BaseButton
        ref={ref}
        buttonType={ButtonTypeEnum.CAPSULE}
        displayType={displayType}
        {...props}
      />
    );
  },
);

CapsuleButton.displayName = 'CapsuleButton';

export default CapsuleButton;
