import {
  forwardRef,
  ReactElement,
  ReactNode,
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
  RenderSelectedOptionContentType,
  SelectCommon,
  SelectOptionInterface,
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
import { ComponentUtils } from '@design-system/utils/componentUtils';
import { IconNamesEnum } from '@design-system/root/src';

export interface SelectProps<
  TValue extends SelectValueType | unknown = SelectValueType,
  TData = unknown,
  TSelectOptionInterface extends OptionInterface<TValue, TData> =
    SelectOptionInterface<TValue, TData>,
>
  extends
    Omit<WrapperProps, 'componentRef' | 'className'>,
    Pick<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'name' | 'value'>,
    Pick<UseDropdownProps, 'onDropDownOpenChange'> {
  /**
   * placeHolder
   */
  placeholder?: ReactNode;
  /**
   * SelectCommon.SelectedOptionContentWrapper의 className
   */
  selectOptionContentWrapperClassName?: string;
  /**
   * BaseDisplay.Wrapper의 className
   */
  selectWrapperClassName?: string;
  /**
   * Dropdown 하단에 노출할 컴포넌트를 랜더링 하는 함수
   * @param closeDropdown DorpDown을 닫는 함수
   */
  renderDropdownFooter?: (
    closeDropdown: ReturnType<typeof useDropdown>['closeDropdown'],
  ) => ReactElement;
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
   * dropdownWrapper의 스타일
   */
  dropdownWrapperClassName?: string;
  /**
   * Dropdown에 노출할 옵션들
   */
  options: TSelectOptionInterface[];
  /**
   * 옵션 선택 이벤트
   */
  onOptionSelect?: OptionSelectEventType<
    TValue,
    TData,
    HTMLLIElement,
    TSelectOptionInterface
  >;
  /**
   * 옵션 선택 시 dropdown을 닫을지 여부
   * @default true
   */
  closeDropdownOnSelected?: boolean;
  /**
   * 옵션이 없을 때 노출할 메시지
   */
  optionEmptyMessage?: string;
  /**
   * 옵션의 값 변경 이벤트
   * @param value
   * @param option
   */
  onChange?: (
    value: TValue | undefined,
    option: TSelectOptionInterface | undefined,
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
    TValue,
    TData,
    TSelectOptionInterface
  >;
  /**
   * 선택된 옵션을 Select에 출력하는 랜더링 함수. 없는 경우 기본 랜더링 함수를 사용함
   */
  renderSelectedOptionContent?: RenderSelectedOptionContentType<
    TValue,
    TData,
    TSelectOptionInterface
  >;
  /**
   * input 의 좌측에 표시 될 아이콘 이름
   */
  leftIconName?: IconNamesEnum;
}

/**
 * Select를 hidden으로 하지 않는 이유: focusOut 이벤트를 이용하여 OptionList를 닫기 위함
 */
const Select = forwardRef(
  <
    TValue extends SelectValueType = SelectValueType,
    TData = unknown,
    TSelectOptionInterface extends OptionInterface<TValue, TData> =
      SelectOptionInterface<TValue, TData>,
  >(
    {
      id,
      name,
      placeholder,
      value,
      selectOptionContentWrapperClassName,
      selectWrapperClassName,
      options,
      optionEmptyMessage = 'Empty',
      onOptionSelect,
      closeDropdownOnSelected = true,
      onChange,
      parentRef,
      renderDropdownFooter,
      renderDropdownElementItem = SelectCommon.renderSelectDropdownElementItemDefault,
      renderSelectedOptionContent = SelectCommon.renderSelectSelectedOptionContentDefault,
      dropdownRef,
      dropdownMaxHeight,
      dropdownEmptyHeight,
      onDropDownOpenChange,
      onDropdownElementMutate,
      dataQk,
      leftIconName,
      ...wrapperProps
    }: SelectProps<TValue, TData, TSelectOptionInterface>,
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
    const { getOption } = useOption<TValue, TData, TSelectOptionInterface>({
      options,
    });

    const handleWrapperClick = (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
      if (disabled) {
        return;
      }
      toggleDropdown();
      onWrapperClick?.(e);
    };

    const handleOptionSelect = (
      option: TSelectOptionInterface | undefined,
      e: React.MouseEvent<HTMLLIElement>,
    ) => {
      closeDropdownOnSelected && closeDropdown();
      if (onOptionSelect && option) {
        onOptionSelect(option, e);
      }
      onChange?.(option?.value, option);
    };

    return (
      <BaseDisplay.Wrapper
        {...wrapperProps}
        ref={componentRef}
        onWrapperClick={handleWrapperClick}
        componentRef={selectRef}
        className={ComponentUtils.cn(
          'relative flex px-0',
          selectWrapperClassName,
        )}
        isActiveBorderWhenHover
        dataQk={`${dataQk}-select`}
      >
        <SelectCommon.LeftIcon
          iconName={leftIconName}
          selectRef={selectRef}
          displayType={displayType}
          disabled={disabled}
          isError={isError}
        />
        <input
          id={id}
          readOnly
          name={name}
          multiple={Array.isArray(value)}
          ref={(r) =>
            ComponentUtils.setRefs(r, selectRef, ref, focusingElementRef)
          }
          className={BaseDisplay.getComponentClassName(
            isError,
            displayType,
            ComponentUtils.cn(
              'flex h-0 appearance-none items-center truncate px-12',
              displayType === DisplayTypeEnum.UNDERLINED ? 'pr-36' : 'pr-40',
            ),
          )}
          value={value ?? ''}
          disabled={disabled}
          onChange={() => {}}
          onMouseDown={BaseDisplay.onMouseDown}
          data-qk={dataQk}
        />
        <SelectCommon.SelectedOptionContentWrapper
          className={selectOptionContentWrapperClassName}
          isError={isError}
          displayType={displayType}
          disabled={disabled}
          hasLeftIconName={!!leftIconName}
        >
          {renderSelectedOptionContent(
            placeholder,
            getOption(value as TValue) as TSelectOptionInterface,
            disabled,
            displayType,
            dataQk,
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
          {options.length > 0 && placeholder && (
            <SelectDropdown.ElementItemWrapper<
              TValue,
              TData,
              TSelectOptionInterface
            >
              option={
                {
                  value: undefined as TValue,
                  content: placeholder,
                } as TSelectOptionInterface
              }
              isSelected={value === undefined}
              onOptionSelect={handleOptionSelect}
              dataQk={`${dataQk}-option`}
            >
              {renderDropdownElementItem(
                undefined,
                !value,
                disabled,
                displayType,
                placeholder,
              )}
            </SelectDropdown.ElementItemWrapper>
          )}
          {options.length === 0 && (
            <SelectDropdown.Empty
              height={dropdownEmptyHeight}
              message={optionEmptyMessage}
            />
          )}
          {options.length > 0 &&
            options.map((option) => (
              <SelectDropdown.ElementItemWrapper<
                TValue,
                TData,
                TSelectOptionInterface
              >
                key={String(option.key || option.value)}
                onOptionSelect={handleOptionSelect}
                option={option}
                isSelected={value === option.value}
                disabled={disabled || option.disabled}
                dataQk={`${dataQk}-option`}
              >
                {renderDropdownElementItem(
                  option,
                  value === option.value,
                  disabled || option.disabled,
                  displayType,
                )}
              </SelectDropdown.ElementItemWrapper>
            ))}
        </SelectDropdown.Wrapper>
      </BaseDisplay.Wrapper>
    );
  },
);

Select.displayName = 'Select';

export default Select as <
  TValue extends SelectValueType = SelectValueType,
  TData = unknown,
  TSelectOptionInterface extends OptionInterface<TValue, TData> =
    SelectOptionInterface<TValue, TData>,
>(
  props: SelectProps<TValue, TData, TSelectOptionInterface> & {
    ref?: Ref<HTMLSelectElement>;
  },
) => JSX.Element;
