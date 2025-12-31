import React, { MouseEvent, ReactElement, useState } from 'react';
import { cva } from 'class-variance-authority';
import { MenuListBaseProps } from '@design-system/components/menu-list/MenuList';
import { DataQuery } from '@design-system/types/common.type';
import {
  GapVerticalType,
  TextColorType,
} from '@design-system/types/component.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

enum ClickableStatusEnum {
  CLICKABLE = 'CLICKABLE',
  NONCLICKABLE = 'NONCLICKABLE',
}

const itemWrapperBaseStyle = [
  'relative',
  'rounded-small',
  'p-16',
  'appearance-none',
];

const contentsWrapperBaseStyle = [
  'flex',
  'items-center',
  'justify-between',
  'gap-12',
];

const darkeningLayerBaseStyle = [
  'absolute',
  'inset-0',
  'w-full',
  'h-full',
  'rounded-small',
  'hover:bg-mono-900/5',
  'active:bg-mono-900/20',
];

const itemWrapperVariants = cva(itemWrapperBaseStyle, {
  variants: {
    cursor: {
      [ClickableStatusEnum.CLICKABLE]: 'cursor-pointer',
      [ClickableStatusEnum.NONCLICKABLE]: 'cursor-default',
    },
  },
  defaultVariants: {
    cursor: ClickableStatusEnum.CLICKABLE,
  },
});

const getTextColorStyle = (
  isDisabled: boolean,
  textColor: TextColorType,
): TextColorType => {
  if (isDisabled) {
    return 'text-mono-200';
  } else {
    return textColor;
  }
};

const getClickableStatus = (isDisabled: boolean): ClickableStatusEnum => {
  if (isDisabled) {
    return ClickableStatusEnum.NONCLICKABLE;
  }
  return ClickableStatusEnum.CLICKABLE;
};

export interface MenuSubListProps extends MenuListBaseProps, DataQuery {
  /**
   * 하위 MenuItem 엘리먼트 배열(렌더링 정보 포함)
   */
  children: ReactElement | ReactElement[];
  /**
   * 열림 시에 보여질 엘리먼트
   */
  rightOpenElement?: ReactElement;
  /**
   * 여닫힘 여부
   */
  opened?: boolean;
  /**
   * 하위 MenuItem들이 가질 왼쪽 패딩값
   */
  childrenGap?: GapVerticalType;
}

const MenuSubList = ({
  children,
  labelText,
  id,
  leftElement,
  rightElement,
  rightOpenElement,
  bgColor = 'bg-white',
  textColor = 'text-mono-900',
  fontSize = 'font-size-14',
  opened = false,
  disabled = false,
  currentLeftPadding = 0,
  childrenGap,
  dataQk,
}: MenuSubListProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(opened);
  const [prevOpened, setPrevOpened] = useState<boolean>(opened);
  const isDisabled = disabled;

  const handleClick = (e: MouseEvent<HTMLLIElement>) => {
    setIsOpen(!isOpen);
  };

  if (prevOpened !== opened) {
    setIsOpen(opened);
    setPrevOpened(opened);
  }

  return (
    <ul className={ComponentUtils.cn(['flex', 'flex-col'], childrenGap)}>
      <li
        data-qk={dataQk}
        className={ComponentUtils.cn(
          itemWrapperVariants({ cursor: getClickableStatus(isDisabled) }),
          bgColor,
        )}
        onClick={isDisabled ? undefined : handleClick}
      >
        {!disabled && (
          <div className={ComponentUtils.cn(darkeningLayerBaseStyle)}></div>
        )}
        <div
          className={ComponentUtils.cn(
            contentsWrapperBaseStyle,
            isDisabled ? 'text-mono-200' : textColor,
          )}
          style={{ paddingLeft: currentLeftPadding }}
        >
          {leftElement}
          <p className={ComponentUtils.cn(['w-full', 'truncate'], fontSize)}>
            {labelText}
          </p>
          {isOpen && rightOpenElement ? rightOpenElement : rightElement}
        </div>
      </li>
      <ul
        className={ComponentUtils.cn(
          isOpen ? 'flex flex-col' : 'hidden',
          childrenGap,
        )}
      >
        {children}
      </ul>
    </ul>
  );
};

export default MenuSubList;
