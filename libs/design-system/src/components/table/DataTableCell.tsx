import { DetailedHTMLProps, forwardRef, HTMLAttributes } from 'react';
import Tag, {
  BaseTagProps,
  ContainedProps,
  TagContentTypeEnum,
  TagTypeEnum,
  TagTextOnlyProps,
} from '@design-system/components/Tag';
import {
  BaseRectangleButtonLegacyProps,
  BoxButtonLegacy,
  FlexibleProps,
  OutlinedProps,
  RectangleButtonRolEnum,
  RectangleButtonTypeEnum,
  TextOnlyProps,
} from '@design-system/components/button/BaseRectangleButtonLegacy';
import IconButtonLegacy, {
  IconButtonContentTypeEnum,
  IconButtonLegacyProps,
  IconOnlyProps,
} from '@design-system/components/button/IconButtonLegacy';
import TextButtonLegacy, {
  IconTextProps,
  TextButtonColorTypeEnum,
  TextButtonContentTypeEnum,
  TextButtonLegacyProps,
} from '@design-system/components/button/TextButtonLegacy';
import SwitchAtom, {
  SwitchAtomProps,
  SwitchSizeEnum,
} from '@design-system/components/switch/SwitchAtom';
import { DataQuery } from '@design-system/types/common.type';
import { ButtonSizeEnum } from '@design-system/root/src';

/*================================================ DataTable ContentBody TextOnly ================================================*/
interface DataTableContentBodyTextProps
  extends
    Omit<
      DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>,
      'className'
    >,
    DataQuery {
  text: string;
}
export const DataTableContentBodyText = forwardRef<
  HTMLSpanElement,
  DataTableContentBodyTextProps
>(({ text, dataQk, ...props }, ref) => {
  return (
    <span
      {...props}
      className="text-mono-700 font-size-14 whitespace-nowrap font-light"
      ref={ref}
      data-qk={dataQk}
    >
      {text}
    </span>
  );
});
DataTableContentBodyText.displayName = 'DataTableContentBodyText';
/*================================================ DataTable ContentBody Tag ================================================*/
type DataTableContentBodyTagProps = Omit<
  BaseTagProps & TagTextOnlyProps & ContainedProps,
  'textColor' | 'contentType' | 'fontSize' | 'tagType' | 'bgColor'
>;
export const DataTableContentBodyTag = forwardRef<
  HTMLDivElement,
  DataTableContentBodyTagProps
>(({ ...props }, ref) => {
  return (
    <Tag
      {...props}
      ref={ref}
      textColor="text-white"
      contentType={TagContentTypeEnum.TEXT_ONLY}
      fontSize="font-size-12"
      tagType={TagTypeEnum.CONTAINED}
      bgColor="bg-primary-500"
    />
  );
});
DataTableContentBodyTag.displayName = 'DataTableContentBodyTag';
/*================================================ DataTable ContentBody BoxButton ================================================*/
type DataTableContentBodyBoxButtonProps = Omit<
  BaseRectangleButtonLegacyProps &
    FlexibleProps &
    TextOnlyProps &
    OutlinedProps,
  'radiusType' | 'buttonType' | 'role' | 'size' | 'textColor' | 'borderColor'
>;

export const DataTableContentBodyBoxButton = forwardRef<
  HTMLButtonElement,
  DataTableContentBodyBoxButtonProps
>(({ ...props }, ref) => {
  return (
    <BoxButtonLegacy
      {...props}
      ref={ref}
      buttonType={RectangleButtonTypeEnum.OUTLINED}
      role={RectangleButtonRolEnum.FLEXIBLE}
      size={ButtonSizeEnum.M}
      textColor="text-mono-800"
      borderColor="border-mono-300"
    />
  );
});
DataTableContentBodyBoxButton.displayName = 'DataTableContentBodyBoxButton';
/*================================================ DataTable ContentBody TextButton ================================================*/
type DataTableContentBodyTextButtonProps = Omit<
  TextButtonLegacyProps & IconTextProps,
  'size' | 'colorType' | 'contentType'
>;

export const DataTableContentBodyTextButton = forwardRef<
  HTMLButtonElement,
  DataTableContentBodyTextButtonProps
>(({ ...props }, ref) => {
  return (
    <TextButtonLegacy
      {...props}
      ref={ref}
      size={ButtonSizeEnum.M}
      colorType={TextButtonColorTypeEnum.MONO}
      contentType={TextButtonContentTypeEnum.RIGHT_ICON}
    />
  );
});
DataTableContentBodyTextButton.displayName = 'DataTableContentBodyTextButton';
/*================================================ DataTable ContentBody IconButton ================================================*/
type DataTableContentBodyIconButtonProps = Omit<
  IconButtonLegacyProps & IconOnlyProps,
  'size' | 'textColor' | 'contentType'
>;

export const DataTableContentBodyIconButton = forwardRef<
  HTMLButtonElement,
  DataTableContentBodyIconButtonProps
>(({ ...props }, ref) => {
  return (
    <IconButtonLegacy
      {...props}
      ref={ref}
      size={ButtonSizeEnum.M}
      textColor="text-mono-700"
      contentType={IconButtonContentTypeEnum.ICON_ONLY}
    />
  );
});
DataTableContentBodyIconButton.displayName = 'DataTableContentBodyIconButton';
/*================================================ DataTable ContentBody Switch ================================================*/
type DataTableContentBodySwitchProps = Omit<SwitchAtomProps, 'size'>;
export const DataTableContentBodySwitch = forwardRef<
  HTMLInputElement,
  DataTableContentBodySwitchProps
>(({ ...props }, ref) => {
  return <SwitchAtom {...props} ref={ref} size={SwitchSizeEnum.L} />;
});
DataTableContentBodySwitch.displayName = 'DataTableContentBodySwitch';
