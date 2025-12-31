import { forwardRef, HTMLAttributes } from 'react';
import { cva } from 'class-variance-authority';
import Icon from '@design-system/components/common/Icon';
import Span from '@design-system/components/text/Span';
import { IconNamesEnum } from '@design-system/constants/iconNames.enum';
import { DataQuery } from '@design-system/types/common.type';
import {
  BgColorType,
  BorderColorType,
  FontSizeType,
  HeightType,
  TextColorType,
  WidthType,
} from '@design-system/types/component.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export enum TagContentTypeEnum {
  TEXT_ONLY = 'TEXT_ONLY',
  LEFT_ICON = 'LEFT_ICON',
  RIGHT_ICON = 'RIGHT_ICON',
}

export enum TagTypeEnum {
  CONTAINED = 'CONTAINED',
  OUTLINED = 'OUTLINED',
}

export interface TagTextOnlyProps {
  contentType: TagContentTypeEnum.TEXT_ONLY;
  text: string;
  fontSize: FontSizeType;
  iconName?: never;
  iconSize?: never;
}

interface IconTextProps {
  contentType: TagContentTypeEnum.LEFT_ICON | TagContentTypeEnum.RIGHT_ICON;
  text: string;
  fontSize: FontSizeType;
  iconName: IconNamesEnum;
  iconSize: `${WidthType} ${HeightType}`;
}

export interface ContainedProps {
  tagType: TagTypeEnum.CONTAINED;
  bgColor: BgColorType;
  borderColor?: never;
}

interface OutlinedProps {
  tagType: TagTypeEnum.OUTLINED;
  bgColor?: never;
  borderColor: BorderColorType;
}

export interface BaseTagProps
  extends Pick<HTMLAttributes<HTMLDivElement>, 'id' | 'className'>, DataQuery {
  textColor: TextColorType;
  textClassName?: string;
}

type TagProps = BaseTagProps &
  (TagTextOnlyProps | IconTextProps) &
  (ContainedProps | OutlinedProps);

const divVariants = cva(
  'h-17 whitespace-nowrap font-medium w-fit rounded-medium flex items-center justify-center px-8 cursor-default gap-x-2',
  {
    variants: {
      contentType: {
        [TagContentTypeEnum.TEXT_ONLY]: '',
        [TagContentTypeEnum.RIGHT_ICON]: 'pl-10',
        [TagContentTypeEnum.LEFT_ICON]: 'pr-10',
      },
      tagType: {
        [TagTypeEnum.CONTAINED]: '',
        [TagTypeEnum.OUTLINED]: 'border-1 bg-white',
      },
    },
  },
);

const iconVariants = cva('w-12 h-12', {
  variants: {},
});

const Tag = forwardRef<HTMLDivElement, TagProps>(
  (
    {
      contentType,
      tagType,
      text,
      textColor,
      bgColor,
      borderColor,
      iconName,
      fontSize,
      iconSize,
      className,
      textClassName,
      dataQk,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={ComponentUtils.cn(
          divVariants({
            className: [
              tagType === TagTypeEnum.CONTAINED && bgColor,
              tagType === TagTypeEnum.OUTLINED && borderColor,
              textColor,
            ],
            contentType,
            tagType,
          }),
          className,
        )}
        data-qk={dataQk}
        {...props}
        ref={ref}
      >
        {contentType === TagContentTypeEnum.LEFT_ICON && iconName && (
          <Icon
            name={iconName}
            className={iconVariants({ className: iconSize })}
          />
        )}
        <Span className={ComponentUtils.cn(fontSize, textClassName)}>
          {text}
        </Span>
        {contentType === TagContentTypeEnum.RIGHT_ICON && iconName && (
          <Icon
            name={iconName}
            className={iconVariants({ className: iconSize })}
          />
        )}
      </div>
    );
  },
);

Tag.displayName = 'Tag';

export default Tag;
