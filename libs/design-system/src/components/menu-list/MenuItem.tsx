import React from 'react';
import { cva } from 'class-variance-authority';
import { MenuListBaseProps } from '@design-system/components/menu-list/MenuList';
import { DataQuery } from '@design-system/types/common.type';
import { TextColorType } from '@design-system/types/component.type';
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
  isActive: boolean,
  isDisabled: boolean,
  textColor: TextColorType,
): TextColorType => {
  if (isDisabled) {
    return 'text-mono-200';
  } else if (isActive) {
    return 'text-primary-500';
  }
  return textColor;
};

const getClickableStatus = (isDisabled: boolean): ClickableStatusEnum => {
  if (isDisabled) {
    return ClickableStatusEnum.NONCLICKABLE;
  }
  return ClickableStatusEnum.CLICKABLE;
};

const getIsActive = (id: number, selectedIds: number[], selected: boolean) => {
  if (selected || selectedIds.includes(id)) {
    return true;
  }
  return false;
};

export interface MenuItemProps<TValue> extends MenuListBaseProps, DataQuery {
  /**
   * id - value 쌍의 value
   */
  value?: TValue;
  /**
   * 초기 선택 여부(주의: 렌더링 상태만 반영하므로, 상태관리 하지 않을경우 예상치 못할 때에 선택 여부가 변경될 수 있음)
   */
  selected?: boolean;
  /**
   * 선택된 아이템들의 id가 담긴 배열
   */
  selectedIds?: number[];
  /**
   * MenuItem이 클릭되었을 때의 핸들러
   * @param id - id-value 쌍의 id. props로 받은 id를 넘겨준다
   * @param value - id-value 쌍의 value. props로 받은 value를 넘겨준다
   */
  onClick?: (id: number, value?: TValue) => void;
}

const MenuItem = <TValue,>({
  labelText,
  id,
  value,
  selectedIds = [],
  leftElement,
  rightElement,
  bgColor = 'bg-white',
  textColor = 'text-mono-900',
  fontSize = 'font-size-14',
  selected = false,
  disabled = false,
  currentLeftPadding = 0,
  onClick,
  dataQk,
}: MenuItemProps<TValue>) => {
  const isActive = getIsActive(id, selectedIds, selected);
  const isDisabled = disabled;

  const handleClick = (id: number, value?: TValue) => {
    onClick?.(id, value);
  };

  return (
    <li
      data-qk={dataQk}
      className={ComponentUtils.cn(
        itemWrapperVariants({ cursor: getClickableStatus(isDisabled) }),
        isActive ? 'bg-[#E6F8F2]' : bgColor,
      )}
      onClick={isDisabled ? undefined : () => handleClick(id, value)}
    >
      {!disabled && (
        <div className={ComponentUtils.cn(darkeningLayerBaseStyle)}></div>
      )}
      <div
        className={ComponentUtils.cn(
          contentsWrapperBaseStyle,
          getTextColorStyle(isActive, isDisabled, textColor),
        )}
        style={{ paddingLeft: currentLeftPadding }}
      >
        {leftElement}
        <p className={ComponentUtils.cn(['w-full', 'truncate'], fontSize)}>
          {labelText}
        </p>
        {rightElement}
      </div>
    </li>
  );
};

export default MenuItem;
