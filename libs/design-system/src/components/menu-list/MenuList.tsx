import React, { Fragment, ReactElement } from 'react';
import MenuItem from '@design-system/components/menu-list/MenuItem';
import MenuSubList from '@design-system/components/menu-list/MenuSubList';
import { DataQuery } from '@design-system/types/common.type';
import {
  BgColorType,
  FontSizeType,
  GapVerticalType,
  TextColorType,
  WidthType,
} from '@design-system/types/component.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export interface MenuListBaseProps {
  /**
   * 라벨 텍스트
   */
  labelText: string;
  /**
   * 고유 식별 id값
   */
  id: number;
  /**
   * 왼쪽 엘리먼트
   */
  leftElement?: ReactElement;
  /**
   * 오른쪽 엘리먼트
   */
  rightElement?: ReactElement;
  /**
   * 백그라운드 색상
   */
  bgColor?: BgColorType;
  /**
   * 텍스트 색상
   */
  textColor?: TextColorType;
  /**
   * 텍스트 크기
   */
  fontSize?: FontSizeType;
  /**
   * disabled 여부
   */
  disabled?: boolean;
  /**
   * 왼쪽 패딩(기준점은 최상위 박스의 패딩값이 적용된 지점부터)
   */
  currentLeftPadding?: number;
}

export interface MenuListItemInterface<TValue = unknown>
  extends MenuListBaseProps, DataQuery {
  /**
   * (for MenuSubList) 하위 MenuItem들(렌더링 정보 포함X)
   */
  children?: MenuListItemInterface<TValue>[];
  /**
   * (for MenuItem) 윗 부분에 표시 (뉴비고에서 Divider 들어가있음)
   */
  topElement?: ReactElement;
  /**
   * (for MenuSubList) 열림 시에 보여질 엘리먼트
   */
  rightOpenElement?: ReactElement;
  /**
   * (for MenuSubList) 여닫힘 여부
   */
  opened?: boolean;
  /**
   * (for MenuSubList) 하위 MenuItem들이 가질 왼쪽 패딩값
   */
  childrenLeftPadding?: number;
  /**
   * (for MenuSubList) 하위 MenuItem들의 수직 간격값
   */
  childrenGap?: GapVerticalType;
  /**
   * (for MenuItem) 초기 선택 여부(주의: 렌더링 상태만 반영하므로, 상태관리 하지 않을경우 예상치 못할 때에 선택 여부가 변경될 수 있음)
   */
  selected?: boolean;
  /**
   * (for MenuItem) id - value 쌍의 value
   */
  value?: TValue;
}

const renderItem = <TValue,>(
  item: MenuListItemInterface<TValue>,
  selectedIds?: number[],
  onClick?: (key: number, value?: TValue) => void,
  currentLeftPadding = 0,
) => {
  if (item.children) {
    const {
      selected,
      value,
      children,
      childrenLeftPadding = 0,
      ...menuSubListProps
    } = item;
    const modifiedChildren = children.map((child) => {
      const childrenLeftPadding =
        (child?.childrenLeftPadding ?? 0) + (child?.currentLeftPadding ?? 0);
      return renderItem(child, selectedIds, onClick, childrenLeftPadding);
    });

    return (
      <MenuSubList
        {...menuSubListProps}
        key={item.id}
        currentLeftPadding={currentLeftPadding}
      >
        {modifiedChildren}
      </MenuSubList>
    );
  }
  const {
    children,
    rightOpenElement,
    opened,
    childrenLeftPadding,
    topElement,
    ...menuListItemProps
  } = item;
  return (
    <>
      {topElement}
      <MenuItem<TValue>
        {...menuListItemProps}
        key={item.id}
        selectedIds={selectedIds}
        onClick={onClick}
        currentLeftPadding={currentLeftPadding}
      />
    </>
  );
};

interface MenuListProps<TValue> {
  /**
   * MenuSubList와 MenuItem을 포함한 모든 아이템들
   */
  items: MenuListItemInterface<TValue>[];
  /**
   * 최상위 아이템들 사이의 수직 간격값
   */
  itemsGap?: GapVerticalType;
  /**
   * MenuList의 너비
   */
  width?: WidthType;
  /**
   * 선택된 아이템들의 id가 담길 배열
   */
  selectedIds?: number[];
  /**
   * MenuItem이 클릭되었을 때의 핸들러
   * @param id id-value 쌍의 id. MenuItem으로 부터 입력 받는다
   * @param value id-value 쌍의 value. MenuItem으로 부터 입력 받는다
   */
  onClick?: (id: number, value?: TValue) => void;

  customRenderItem?: (
    items: MenuListItemInterface<TValue>,
    selectedIds?: number[],
    onClick?: (id: number, value?: TValue) => void,
  ) => JSX.Element;
}

const MenuList = <TValue,>({
  items,
  itemsGap,
  width,
  selectedIds,
  onClick,
  customRenderItem,
}: MenuListProps<TValue>) => {
  return (
    <menu className={ComponentUtils.cn(['flex', 'flex-col'], width, itemsGap)}>
      {items.map((item) => {
        return (
          <Fragment key={item.id}>
            {customRenderItem
              ? customRenderItem(item, selectedIds, onClick)
              : renderItem<TValue>(item, selectedIds, onClick)}
          </Fragment>
        );
      })}
    </menu>
  );
};

export default MenuList;
