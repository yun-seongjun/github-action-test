import {
  forwardRef,
  InputHTMLAttributes,
  Ref,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ComponentUtils } from '@design-system/utils';
import {
  BaseDisplay,
  ButtonSizeEnum,
  IconNamesEnum,
  OptionInterface,
  SelectCommon,
  SelectDropdown,
  SelectOptionInterface,
  SelectProps,
  ValueType,
} from '@design-system/root/src';
import { useDropdown, useOption } from '@design-system/hooks';
import DataUtils from '@design-system/utils/dataUtils';
import { useTranslation } from 'next-i18next';
import IconButton from '@design-system/components/button/IconButton';

export interface AutocompleteProps<
  TValue extends ValueType | unknown = ValueType,
  TData = unknown,
  TSelectOptionInterface extends OptionInterface<TValue, TData> =
    SelectOptionInterface<TValue, TData>,
> extends SelectProps<TValue, TData, TSelectOptionInterface> {
  onSearchKeywordChange?: (
    searchKeyword: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  optionFilter?: (
    option: TSelectOptionInterface,
    searchKeyword: string,
  ) => boolean;
  getSearchKeywordPlaceholder?: (
    optionSelected: TSelectOptionInterface,
  ) => string;
  onClearButtonClick?: () => void;
  showClearButton?: boolean;
  footWrapperClassName?: string;
}

enum ReasonEnum {
  MOUSE = 'mouse',
  KEYBOARD = 'keyboard',
}

const isValueEqual = (
  firstValue: OptionInterface['value'],
  secondValue: OptionInterface['value'],
) => {
  if (Array.isArray(firstValue) && Array.isArray(secondValue)) {
    return JSON.stringify(firstValue) === JSON.stringify(secondValue);
  }
  return firstValue === secondValue;
};

const isValueEmpty = (
  value: InputHTMLAttributes<HTMLInputElement>['value'],
): boolean => {
  return Array.isArray(value)
    ? !(value.length > 0)
    : value === undefined || value === null || String(value).length === 0;
};

const Autocomplete = forwardRef(
  <
    TValue extends ValueType = ValueType,
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
      showClearButton = true,
      options: _options,
      optionEmptyMessage,
      onOptionSelect,
      onClearButtonClick,
      closeDropdownOnSelected = true,
      onChange,
      parentRef,
      renderDropdownFooter,
      renderDropdownElementItem = SelectCommon.renderSelectDropdownElementItemDefault,
      renderSelectedOptionContent = SelectCommon.renderSelectSelectedOptionContentDefault,
      dropdownMaxHeight,
      dropdownEmptyHeight = 'h-38',
      onDropDownOpenChange,
      onSearchKeywordChange,
      optionFilter,
      dropdownRef,
      getSearchKeywordPlaceholder,
      dataQk,
      footWrapperClassName,
      ...wrapperProps
    }: AutocompleteProps<TValue, TData, TSelectOptionInterface>,
    ref: Ref<HTMLSelectElement>,
  ) => {
    const { t } = useTranslation();

    const {
      isError,
      disabled,
      displayType,
      width,
      height,
      onWrapperClick,
      dropdownWrapperClassName,
    } = wrapperProps;
    const autocompleteRef = useRef<HTMLSelectElement>(null);
    const {
      focusingElementRef,
      isDropdownOpen,
      closeDropdown,
      toggleDropdown,
      componentRef,
      childRef,
      childStyle,
      startListeningParentScrollEvent,
    } = useDropdown<HTMLElement, HTMLDivElement, HTMLDivElement>({
      parentRef,
      distancePxWithComponent: 8,
      onDropDownOpenChange,
    });
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [searchKeyword, setSearchKeyword] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const options =
      isDropdownOpen && optionFilter
        ? _options.filter((option) => optionFilter(option, searchKeyword))
        : _options;
    const { getOption } = useOption<TValue, TData, TSelectOptionInterface>({
      options,
    });
    const optionSelected = _options.find((option) =>
      isValueEqual(option.value, value),
    );

    const searchKeywordPlaceholder =
      (optionSelected && getSearchKeywordPlaceholder?.(optionSelected)) ||
      (typeof placeholder === 'string' && placeholder) ||
      '';

    const currentValueIndex = options.findIndex((option) =>
      isValueEqual(value, option.value),
    );

    useEffect(() => {
      if (isDropdownOpen) {
        autocompleteRef.current?.focus();
        startListeningParentScrollEvent();

        if (currentValueIndex !== -1) {
          setHighlightedIndex(currentValueIndex, ReasonEnum.KEYBOARD);
        }
      } else {
        setSearchKeyword('');
        setSelectedIndex(-1);
      }
    }, [isDropdownOpen]);

    useEffect(() => {
      setHighlightedIndex(-1, ReasonEnum.KEYBOARD);
      setSelectedIndex(-1);
      startListeningParentScrollEvent();
    }, [options.length]);

    const handleWrapperClick = (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
      if (disabled) {
        return;
      }
      toggleDropdown();
      onWrapperClick?.(e);
    };

    const handleSearchKeywordChange = (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const searchKeywordNew = e.target.value;
      setSearchKeyword(searchKeywordNew);
      onSearchKeywordChange?.(searchKeywordNew, e);
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

    const changeHighlightedIndex = (diff: -1 | 1) => {
      if (!isDropdownOpen) {
        return;
      }

      const getNextIndex = () => {
        const maxIndex = options.length - 1;

        const newIndex = selectedIndex + diff;
        if (newIndex < 0) {
          return maxIndex;
        }

        if (newIndex > maxIndex) {
          if (newIndex === maxIndex + 1) {
            return 0;
          }
          if (Math.abs(diff) > 1) {
            return maxIndex;
          }
          return 0;
        }
        return newIndex;
      };

      const nextIndex = getNextIndex();
      setHighlightedIndex(nextIndex, ReasonEnum.KEYBOARD);

      /**
       * ul 감싸고 있는 div
       */
      const wrapperElement = childRef?.current?.children?.[0]
        ?.children?.[0] as HTMLElement;

      if (wrapperElement) {
        const isScrollable =
          wrapperElement?.scrollHeight > wrapperElement?.clientHeight;
        if (isScrollable) {
          const containerRect = wrapperElement.getBoundingClientRect();
          const itemElem = document.querySelector(
            `[data-select-option="select-option-${nextIndex}"]`,
          ) as HTMLElement;
          const itemRect = itemElem?.getBoundingClientRect();
          if (
            itemElem &&
            itemRect &&
            (itemRect.top < containerRect.top ||
              itemRect.bottom > containerRect.bottom)
          ) {
            const itemOffsetTop = itemElem.offsetTop;
            const containerHeight = wrapperElement.offsetHeight;
            const itemHeight = itemElem.offsetHeight;

            // 위로 올라갈 때는 아이템이 맨 위에 오도록, 아래로 내려갈 때는 다음 아이템이 맨 위에 오도록
            let scrollTop: number;
            const containerPaddingTop =
              parseFloat(getComputedStyle(wrapperElement).paddingTop) || 0;
            const containerPaddingBottom =
              parseFloat(getComputedStyle(wrapperElement).paddingBottom) || 0;

            if (itemRect.top < containerRect.top) {
              // 위로 올라갈 때: 아이템이 맨 위에 오도록
              scrollTop = itemOffsetTop - containerPaddingTop;
            } else {
              scrollTop =
                itemOffsetTop +
                itemHeight -
                containerHeight +
                containerPaddingBottom;
            }

            wrapperElement.scrollTop = scrollTop;
          }
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isDropdownOpen || options.length === 0) {
        if (e.key === 'Escape') {
          closeDropdown();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          changeHighlightedIndex(1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeHighlightedIndex(-1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < options.length) {
            const selectedOption = options[selectedIndex];
            handleOptionSelect(selectedOption, e as any);
          }
          break;
        case 'Escape':
          e.preventDefault();
          closeDropdown();
          break;
      }
    };

    const handleOptionMouseMove = (index: number | undefined) => {
      if (!DataUtils.isNullOrUndefined(index) && selectedIndex !== index) {
        setHighlightedIndex(index, ReasonEnum.MOUSE);
      }
    };

    const removeBgColorClass = (element: Element) => {
      element.classList.remove(
        'bg-select',
        'bg-mono-900/20',
        'bg-white',
        'bg-mono-900/5',
      );
    };

    const setHighlightedIndex = (index: number, reason: ReasonEnum) => {
      if (index === -1) {
        const optionNodes = document.querySelectorAll(
          `[data-select-option^="select-option-"]`,
        );
        optionNodes.forEach((node) => {
          removeBgColorClass(node);
        });
      }

      if (selectedIndex === index) {
        return;
      }

      const prevElement = document.querySelector(
        `[data-select-option="select-option-${selectedIndex}"]`,
      );
      const currentElement = document.querySelector(
        `[data-select-option="select-option-${index}"]`,
      );

      if (prevElement) {
        removeBgColorClass(prevElement);
        if (reason === ReasonEnum.KEYBOARD) {
          prevElement.classList.remove(
            'hover:bg-mono-900',
            'hover:bg-opacity-5',
          );
        }
        const isSelected = isValueEqual(value, options[selectedIndex]?.value);

        if (isSelected) {
          prevElement.classList.add('bg-primary-50');
        } else {
          prevElement.classList.add('bg-white');
        }
      }

      if (currentElement) {
        const isSelected = isValueEqual(value, options[index]?.value);

        removeBgColorClass(currentElement);
        if (isSelected) {
          currentElement.classList.add('bg-select', 'text-primary-500');
          currentElement.classList.remove(
            'hover:bg-mono-900',
            'hover:bg-opacity-5',
          );
        } else {
          if (reason === ReasonEnum.KEYBOARD) {
            currentElement.classList.add('bg-mono-900/20');
          } else {
            currentElement.classList.add(
              'hover:bg-mono-900',
              'hover:bg-opacity-5',
            );
          }
        }
      }

      setSelectedIndex(index);
    };

    const handleClearButtonClick = () => {
      setSelectedIndex(-1);
      setSearchKeyword('');
      onClearButtonClick?.();
    };

    return (
      <BaseDisplay.Wrapper
        {...wrapperProps}
        ref={(r) => ComponentUtils.setRefs(r, componentRef, wrapperRef)}
        onWrapperClick={handleWrapperClick}
        componentRef={autocompleteRef}
        className={ComponentUtils.cn(
          'group relative flex px-0',
          selectWrapperClassName,
        )}
        isActiveBorderWhenHover
        dataQk={dataQk}
      >
        {/* 기존 Select와 비슷한 구조를 유지하기 위해서 w-full인 div를 추가함 */}
        <div className="w-full" />
        <SelectCommon.SelectedOptionContentWrapper
          className={ComponentUtils.cn(
            selectOptionContentWrapperClassName,
            showClearButton ? 'group-hover:pr-72' : '',
          )}
          isError={isError}
          displayType={displayType}
          disabled={disabled}
        >
          {isDropdownOpen ? (
            <input
              autoComplete={'off'}
              id={id}
              name={name}
              ref={(r) =>
                ComponentUtils.setRefs(
                  r,
                  autocompleteRef,
                  ref,
                  focusingElementRef,
                )
              }
              className={BaseDisplay.getComponentClassName(
                isError,
                displayType,
                ComponentUtils.cn(
                  'flex appearance-none items-center truncate focus-within:appearance-auto',
                  showClearButton ? 'pr-32 group-hover:pr-0' : '',
                ),
              )}
              value={searchKeyword}
              placeholder={searchKeywordPlaceholder}
              disabled={disabled}
              onChange={handleSearchKeywordChange}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onBlur={closeDropdown}
              onKeyDown={handleKeyDown}
              onMouseDown={BaseDisplay.onMouseDown}
              data-qk={`${dataQk}-input`}
            />
          ) : (
            renderSelectedOptionContent(
              placeholder,
              getOption(value as TValue) as TSelectOptionInterface,
              disabled,
              displayType,
              dataQk,
              !!placeholder,
            )
          )}
        </SelectCommon.SelectedOptionContentWrapper>
        {showClearButton && (
          <IconButton
            type="button"
            iconName={IconNamesEnum.Delete}
            size={ButtonSizeEnum.S}
            textColor={'text-mono-400'}
            onClick={(e) => {
              e.stopPropagation();
              handleClearButtonClick();
            }}
            disabled={disabled}
            className={`hidden ${((searchKeyword.length > 0 || !isValueEmpty(value)) && isDropdownOpen && 'block') || ((searchKeyword.length > 0 || !isValueEmpty(value)) && 'group-hover:block')}`}
          />
        )}
        <SelectCommon.ChevronIcon
          selectRef={autocompleteRef}
          isDropdownOpen={isDropdownOpen}
          displayType={displayType}
          disabled={disabled}
          isError={isError}
        />
        <SelectDropdown.Wrapper
          wrapperClassName={dropdownWrapperClassName}
          ref={(r) => ComponentUtils.setRefs(r, childRef, dropdownRef)}
          style={childStyle}
          maxHeight={dropdownMaxHeight}
          isDropdownOpen={isDropdownOpen}
          width={width || BaseDisplay.wrapperWidthDefault}
          parentHeight={height || BaseDisplay.wrapperHeightDefault}
          footer={renderDropdownFooter?.(closeDropdown)}
          footWrapperClassName={footWrapperClassName}
          dataQk={dataQk}
        >
          {options.length === 0 && (
            <SelectDropdown.Empty
              height={dropdownEmptyHeight}
              message={optionEmptyMessage ?? t('common:search.empty')}
              className={'justify-normal whitespace-pre-wrap px-12 py-9'}
            />
          )}
          {options.length > 0 &&
            options.map((option, index) => {
              return (
                <SelectDropdown.ElementItemWrapper<
                  TValue,
                  TData,
                  TSelectOptionInterface
                >
                  key={String(option.key || option.value)}
                  onOptionSelect={handleOptionSelect}
                  option={option}
                  isSelected={isValueEqual(value, option.value)}
                  disabled={disabled || option.disabled}
                  dataQk={`${dataQk}-option`}
                  index={index}
                  onMouseMove={handleOptionMouseMove}
                >
                  {renderDropdownElementItem(
                    option,
                    isValueEqual(value, option.value),
                    disabled || option.disabled,
                    displayType,
                    undefined,
                    dataQk,
                  )}
                </SelectDropdown.ElementItemWrapper>
              );
            })}
        </SelectDropdown.Wrapper>
      </BaseDisplay.Wrapper>
    );
  },
);

Autocomplete.displayName = 'Autocomplete';

export default Autocomplete as <
  TValue extends ValueType = ValueType,
  TData = unknown,
  TSelectOptionInterface extends OptionInterface<TValue, TData> =
    SelectOptionInterface<TValue, TData>,
>(
  props: AutocompleteProps<TValue, TData, TSelectOptionInterface> & {
    ref?: Ref<HTMLSelectElement>;
  },
) => JSX.Element;
