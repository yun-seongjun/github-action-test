import {
  forwardRef,
  ReactElement,
  Ref,
  RefObject,
  SelectHTMLAttributes,
  useRef,
} from 'react';
import {
  BaseDisplay,
  DisplayTypeEnum,
  WrapperProps,
} from '@design-system/components/BaseDisplay';
import {
  RenderDropdownElementItemType,
  RenderSelectedOptionsContentType,
  SelectCommon,
  SelectMultipleOptionInterface,
} from '@design-system/components/select/SelectCommon';
import {
  DropdownWrapperProps,
  SelectDropdown,
} from '@design-system/components/select/SelectDropdown';
import useDropdown, {
  UseDropdownProps,
} from '@design-system/hooks/useDropdown';
import useOption, {
  OptionInterface,
  OptionSelectEventType,
  SelectValueType,
} from '@design-system/hooks/useOption';
import { HeightType, MaxHeightType } from '@design-system/types/component.type';
import { ArrayOrElement } from '@design-system/types/generic.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export interface SelectMultipleProps<
  TValues extends SelectValueType[] = [],
  TData = unknown,
  TSelectMultipleOptionInterface extends SelectMultipleOptionInterface<
    ArrayOrElement<TValues>,
    TData
  > = SelectMultipleOptionInterface<ArrayOrElement<TValues>, TData>,
>
  extends
    Omit<WrapperProps, 'componentRef' | 'className'>,
    Pick<
      SelectHTMLAttributes<HTMLSelectElement>,
      'id' | 'name' | 'placeholder'
    >,
    Pick<UseDropdownProps, 'onDropDownOpenChange'> {
  /**
   * SelectCommon.SelectedOptionContentWrapper의 className
   */
  selectOptionContentWrapperClassName?: string;
  /**
   * BaseDisplay.Wrapper의 className
   */
  selectWrapperClassName?: string;
  /**
   * DropDown 하단에 노출할 컴포넌트를 랜더링 하는 함수
   * @param closeDropdown DorpDown을 닫는 함수
   */
  renderDropdownFooter?: (
    closeDropdown: ReturnType<typeof useDropdown>['closeDropdown'],
  ) => ReactElement | null;
  /**
   * Dropdown의 ref
   */
  dropdownRef?: RefObject<HTMLDivElement>;
  /**
   * Dropdown의 최대 높이
   */
  dropdownMaxHeight?: MaxHeightType;
  /**
   * DropdownEmpty의 높이
   */
  dropdownEmptyHeight?: HeightType;
  /**
   * Dropdown Wrapper의 Element의 attribute(예: position)가 변경될 때 호출되는 함수
   * @param element Element. undefined일 경우 Dropdown이 닫힌 상태
   */
  onDropdownElementMutate?: DropdownWrapperProps['onWrapperElementMutate'];
  /**
   * 선택된 values
   */
  values?: ArrayOrElement<TValues>[];
  /**
   * Dropdown에 노출할 옵션들
   */
  options: TSelectMultipleOptionInterface[];
  /**
   * 옵션 선택 이벤트
   */
  onOptionSelect?: OptionSelectEventType<
    ArrayOrElement<TValues>,
    TData,
    HTMLLIElement,
    TSelectMultipleOptionInterface
  >;
  /**
   * 옵션 선택 시 dropdown을 닫을지 여부
   * @default false
   */
  closeDropdownOnSelected?: boolean;
  /**
   * 옵션이 없을 때 노출할 메시지
   */
  optionEmptyMessage?: string;
  /**
   * 옵션 변경 이벤트
   * @param values 선택된 옵션들의 값
   * @param options 선택한 옵션들
   */
  onChange?: (
    values: ArrayOrElement<TValues>[],
    options: TSelectMultipleOptionInterface[],
  ) => void;
  /**
   * 부모 컴포넌트의 ref
   * 스크롤 위치에 따라서 dropdown의 위치를 변경하기 위해 필요
   */
  parentRef?: RefObject<HTMLElement>;
  /**
   * DropDown의 옵션들을 랜더링하는 함수. 없는 경우 기본 랜더링 함수를 사용함
   */
  renderDropdownElementItem?: RenderDropdownElementItemType<
    ArrayOrElement<TValues>,
    TData,
    TSelectMultipleOptionInterface
  >;
  /**
   * 선택된 옵션들을 Select에 출력하는 랜더링 함수. 없는 경우 기본 랜더링 함수를 사용함
   */
  renderSelectedOptionsContent?: RenderSelectedOptionsContentType<
    ArrayOrElement<TValues>,
    TData,
    TSelectMultipleOptionInterface
  >;
}

const SelectMultiple = forwardRef(
  <
    TValues extends SelectValueType[] = [],
    TData = unknown,
    TSelectMultipleOptionInterface extends SelectMultipleOptionInterface<
      ArrayOrElement<TValues>,
      TData
    > = SelectMultipleOptionInterface<ArrayOrElement<TValues>, TData>,
  >(
    {
      id,
      name,
      placeholder,
      selectOptionContentWrapperClassName,
      selectWrapperClassName,
      renderDropdownFooter,
      values = [] as ArrayOrElement<TValues>[],
      options,
      optionEmptyMessage = 'Empty',
      onOptionSelect,
      closeDropdownOnSelected = false,
      onChange,
      parentRef,
      renderDropdownElementItem = SelectCommon.renderSelectMultipleDropdownElementItemDefault,
      renderSelectedOptionsContent = SelectCommon.renderSelectMultipleSelectedOptionsContentDefault,
      dropdownRef,
      dropdownMaxHeight,
      dropdownEmptyHeight,
      onDropDownOpenChange,
      onDropdownElementMutate,
      dataQk,
      ...wrapperProps
    }: SelectMultipleProps<TValues, TData, TSelectMultipleOptionInterface>,
    ref: Ref<HTMLSelectElement>,
  ) => {
    const { isError, disabled, displayType, width, height, onWrapperClick } =
      wrapperProps;
    const selectRef = useRef<HTMLSelectElement>(null);
    const {
      focusingElementRef,
      isDropdownOpen,
      closeDropdown,
      toggleDropdown,
      componentRef,
      childRef,
      childStyle,
    } = useDropdown<HTMLElement, HTMLDivElement, HTMLDivElement>({
      parentRef,
      distancePxWithComponent: 8,
      onDropDownOpenChange,
    });
    const { getOptions } = useOption<
      ArrayOrElement<TValues>,
      TData,
      TSelectMultipleOptionInterface
    >({ options });
    const handleWrapperClick = (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
      e.stopPropagation();
      if (disabled) {
        return;
      }
      toggleDropdown();
      onWrapperClick?.(e);
    };

    const handleOptionSelect = (
      option: TSelectMultipleOptionInterface | undefined,
      e: React.MouseEvent<HTMLLIElement>,
    ) => {
      closeDropdownOnSelected && closeDropdown();
      e.stopPropagation();
      if (!option) {
        return;
      }
      onOptionSelect?.(option, e);
      if (onChange && option.value !== undefined) {
        const valuesNew = (
          values?.find((v) => option && v === option?.value)
            ? values.filter((v) => option && v !== option?.value)
            : [...(values || []), option.value]
        ) as ArrayOrElement<TValues>[];
        onChange(valuesNew, getOptions(valuesNew));
      }
    };

    const isOptionSelected = (
      option: OptionInterface<ArrayOrElement<TValues>, TData>,
    ): boolean => {
      return !!values?.find((v) => v === option.value);
    };

    return (
      <BaseDisplay.Wrapper
        {...wrapperProps}
        ref={componentRef}
        onWrapperClick={handleWrapperClick}
        componentRef={selectRef}
        className={ComponentUtils.cn('relative px-0', selectWrapperClassName)}
        isActiveBorderWhenHover
        dataQk={dataQk}
      >
        <input
          id={id || name}
          name={name}
          readOnly
          multiple
          ref={(r) =>
            ComponentUtils.setRefs(r, selectRef, ref, focusingElementRef)
          }
          className={BaseDisplay.getComponentClassName(
            isError,
            displayType,
            ComponentUtils.cn(
              'flex h-full appearance-none items-center truncate px-12',
              displayType === DisplayTypeEnum.UNDERLINED ? 'pr-36' : 'pr-40',
            ),
          )}
          onChange={() => {}}
          value={''}
          disabled={disabled}
          onMouseDown={BaseDisplay.onMouseDown}
          data-qk={dataQk}
        />
        <SelectCommon.SelectedOptionContentWrapper
          className={selectOptionContentWrapperClassName}
          isError={isError}
          displayType={displayType}
          disabled={disabled}
        >
          {renderSelectedOptionsContent(
            placeholder,
            getOptions(values as unknown as ArrayOrElement<TValues>[]),
            disabled,
            displayType,
          )}
        </SelectCommon.SelectedOptionContentWrapper>
        <SelectCommon.ChevronIcon
          selectRef={selectRef}
          isDropdownOpen={isDropdownOpen}
          displayType={displayType}
          disabled={disabled}
          isError={isError}
        />
        <SelectDropdown.Wrapper
          ref={(r) => ComponentUtils.setRefs(r, childRef, dropdownRef)}
          style={childStyle}
          maxHeight={dropdownMaxHeight}
          isDropdownOpen={isDropdownOpen}
          onWrapperElementMutate={onDropdownElementMutate}
          width={width || BaseDisplay.wrapperWidthDefault}
          parentHeight={height || BaseDisplay.wrapperHeightDefault}
          footer={renderDropdownFooter?.(closeDropdown)}
        >
          {options.length === 0 && (
            <SelectDropdown.Empty
              height={dropdownEmptyHeight}
              message={optionEmptyMessage}
            />
          )}
          {options.length > 0 &&
            options.map((option) => {
              const isSelected = isOptionSelected(option);
              return (
                <SelectDropdown.ElementItemWrapper<
                  ArrayOrElement<TValues>,
                  TData,
                  TSelectMultipleOptionInterface
                >
                  key={String(option.key || option.value)}
                  onOptionSelect={handleOptionSelect}
                  option={option}
                  isSelected={isSelected}
                  disabled={disabled || option.disabled}
                  dataQk={`${dataQk}-option`}
                >
                  {renderDropdownElementItem(
                    option,
                    isSelected,
                    disabled || option.disabled,
                    displayType,
                  )}
                </SelectDropdown.ElementItemWrapper>
              );
            })}
        </SelectDropdown.Wrapper>
      </BaseDisplay.Wrapper>
    );
  },
);

SelectMultiple.displayName = 'SelectMultiple';

export default SelectMultiple as <
  TValues extends SelectValueType[] = [],
  TData = unknown,
  TSelectMultipleOptionInterface extends SelectMultipleOptionInterface<
    ArrayOrElement<TValues>,
    TData
  > = SelectMultipleOptionInterface<ArrayOrElement<TValues>, TData>,
>(
  props: SelectMultipleProps<TValues, TData, TSelectMultipleOptionInterface> & {
    ref?: Ref<HTMLSelectElement>;
  },
) => JSX.Element;
