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

export type BoxButtonProps = ButtonBaseProps &
  (DisplayContainedType | DisplayOutlinedType) &
  (ContentTextType | ContentIconOnlyType);

export const BoxButton = forwardRef<HTMLButtonElement, BoxButtonProps>(
  (
    { displayType = ButtonDisplayTypeEnum.CONTAINED, ...props }: BoxButtonProps,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    return (
      <BaseButton
        ref={ref}
        buttonType={ButtonTypeEnum.BOX}
        displayType={displayType}
        {...props}
      />
    );
  },
);

BoxButton.displayName = 'BoxButton';

export default BoxButton;
