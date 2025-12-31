import React, {
  PropsWithChildren,
  ReactNode,
  RefObject,
  useRef,
  useState,
} from 'react';
import {
  BaseDisplay,
  DisplayTypeEnum,
  WrapperProps,
} from '@design-system/components/BaseDisplay';
import CheckBox from '@design-system/components/checkbox/CheckBox';
import Icon from '@design-system/components/common/Icon';
import { IconNamesEnum } from '@design-system/constants/iconNames.enum';
import {
  OptionInterface,
  SelectValueType,
} from '@design-system/hooks/useOption';
import { DataQuery } from '@design-system/types/common.type';
import { TextColorType } from '@design-system/types/component.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';
import { ButtonSizeEnum, PortalTypeEnum } from '@design-system/root/src';
import IconButton from '@design-system/components/button/IconButton';
import TooltipTruncated from '@design-system/components/tooltip/TooltipTruncated';

/*******************************************
 *                    공통                  *
 *******************************************/

/**
 * disabled인 상태의 Text의 색상을 구하는 함수
 * @param displayType DisplayType
 */
const getDisabledTextColorType = (
  displayType: DisplayTypeEnum | undefined,
): TextColorType => {
  if (displayType === DisplayTypeEnum.FILLED) {
    return 'text-mono-200';
  }
  return 'text-mono-100';
};

export const DropdownElementItemClassNames = {
  default: 'cursor-default whitespace-pre-wrap break-all text-mono-800',
  getDisabledTextColorType,
  textColorDefault: 'text-mono-800' as TextColorType,
  textColorSelected: 'text-primary-500' as TextColorType,
};

/**
 * 상태에 따른 문자의 색상을 구하는 함수
 * @param disabled
 * @param isSelected
 * @param displayType
 * @param isError
 * @param isPlaceholder
 */
const getTextColor = (
  disabled: boolean | undefined,
  isSelected: boolean | undefined,
  displayType: DisplayTypeEnum | undefined,
  isError: boolean | undefined,
  isPlaceholder: boolean | undefined,
): TextColorType => {
  if (disabled) {
    if (displayType === DisplayTypeEnum.FILLED) {
      return 'text-mono-200';
    }
    return 'text-mono-100';
  }

  if (isPlaceholder) {
    return 'text-mono-300';
  }

  if (isError) {
    return 'text-error';
  }

  if (isSelected) {
    return DropdownElementItemClassNames.textColorSelected;
  }

  return DropdownElementItemClassNames.textColorDefault;
};

interface ChevronIconProps extends Pick<
  WrapperProps,
  'displayType' | 'disabled' | 'isError'
> {
  /**
   * ChevronIcon 선택 시, select에 focus를 주기 위해 전달 받는 ref
   */
  selectRef: RefObject<HTMLSelectElement>;
  /**
   * Dropdown이 열려있는지 여부
   */
  isDropdownOpen: boolean;
}

/**
 * Select 우측에 노출하는 Chevron
 */
const ChevronIcon = ({
  selectRef,
  isDropdownOpen,
  displayType,
  disabled,
  isError,
}: ChevronIconProps) => {
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isDropdownOpenPrev, setIsDropdownOpenPrev] = useState(isDropdownOpen);

  /**
   * useEffect는 실행시점이 DOM에 반영되고 나서 실행되기 때문에 useEffect 없이 렌더링 도중 상태변경을 통해 DOM에 업데이트 되게 전에 상태를 업데이트 하는 것이 낫습니다.
   * @docs https://react-ko.dev/learn/you-might-not-need-an-effect
   */
  if (isDropdownOpenPrev !== isDropdownOpen) {
    if (isDropdownOpen) {
      setIsFirstRender(false);
    }
    setIsDropdownOpenPrev(isDropdownOpen);
  }

  return (
    <BaseDisplay.RightElement
      componentRef={selectRef}
      className={ComponentUtils.cn(
        'pointer-events-none',
        displayType === DisplayTypeEnum.UNDERLINED ? 'pr-0' : 'pr-4',
      )}
    >
      <BaseDisplay.IconElement
        name={IconNamesEnum.ChevronDown}
        className={ComponentUtils.cn(
          getTextColor(disabled, false, displayType, isError, false),
          !isFirstRender &&
            (isDropdownOpen ? 'animate-rotate-180' : 'animate-rotate-180-to-0'),
        )}
      />
    </BaseDisplay.RightElement>
  );
};

interface LeftIconProps extends Omit<ChevronIconProps, 'isDropdownOpen'> {
  iconName?: IconNamesEnum;
}

const LeftIcon = ({
  selectRef,
  displayType,
  disabled,
  isError,
  iconName,
}: LeftIconProps) => {
  if (iconName) {
    return (
      <BaseDisplay.LeftElement
        componentRef={selectRef}
        className={'h-20 w-20 pl-12'}
      >
        <BaseDisplay.IconElement
          name={iconName}
          className={ComponentUtils.cn(
            getTextColor(disabled, false, displayType, isError, false),
            'h-20 w-20 p-0',
          )}
        />
      </BaseDisplay.LeftElement>
    );
  }

  return null;
};

export interface SelectedOptionContentWrapperProps extends Pick<
  WrapperProps,
  'isError' | 'displayType' | 'disabled'
> {
  className?: string;
  hasLeftIconName?: boolean;
}

/**
 * Select에 선택된 옵션들을 보여주는 컴포넌트의 Wrapper
 * @param className
 * @param isError
 * @param displayType
 * @param children
 * @param hasLeftIconName
 * @constructor
 */
const SelectedOptionContentWrapper = ({
  className,
  isError,
  displayType,
  children,
  hasLeftIconName,
}: PropsWithChildren<SelectedOptionContentWrapperProps>) => {
  return (
    <div
      className={BaseDisplay.getComponentClassName(
        isError,
        displayType,
        ComponentUtils.cn(
          'absolute flex h-full items-center truncate',
          displayType === DisplayTypeEnum.UNDERLINED ? 'pr-36' : 'pr-40',
          hasLeftIconName ? 'pl-44' : 'pl-12',
          className,
        ),
      )}
    >
      {children}
    </div>
  );
};

interface OptionContentTextProps extends DataQuery {
  content: ReactNode;
  disabled?: boolean;
  displayType?: DisplayTypeEnum;
  isPlaceholder?: boolean;
}

export const OptionContentText = ({
  content,
  disabled,
  displayType,
  isPlaceholder = false,
  dataQk,
}: OptionContentTextProps) => {
  const textRef = useRef<HTMLSpanElement>(null);

  return (
    <>
      <TooltipTruncated
        message={content as string}
        targetElementRef={textRef}
        portalType={PortalTypeEnum.MODAL}
      />
      <span
        className={ComponentUtils.cn(
          'cursor-default truncate',
          getTextColor(disabled, false, displayType, false, isPlaceholder),
        )}
        ref={textRef}
        data-qk={dataQk}
      >
        {content}
      </span>
    </>
  );
};

/**
 * DropDown의 옵션들을 랜더링하는 함수. 없는 경우 기본 랜더링 함수를 사용함
 * @param option 랜더링 해야 할 옵션
 * @param isSelected 선택 여부
 * @param disabled disabled 여부
 * @param displayType DisplayType
 * @param placeholder 플레이스홀더
 */
export type RenderDropdownElementItemType<
  TValue extends SelectValueType | unknown = SelectValueType,
  TData = unknown,
  TOptionInterface extends OptionInterface<TValue, TData> = OptionInterface<
    TValue,
    TData
  >,
> = (
  option: TOptionInterface | undefined,
  isSelected: boolean,
  disabled: WrapperProps['disabled'],
  displayType: WrapperProps['displayType'],
  placeholder?: ReactNode,
  dataQk?: DataQuery['dataQk'],
) => JSX.Element;

/*******************************************
 *                   Select                *
 *******************************************/

/**
 * Select의 OptionInterface
 */
export interface SelectOptionInterface<
  TValue = SelectValueType,
  TData = unknown,
> extends OptionInterface<TValue, TData> {
  /**
   * 좌측에 노출할 아이콘의 이름
   */
  leftIconName?: IconNamesEnum;
  /**
   * 우측에 아이콘 버튼을 노출할지 여부. 아이콘은 ChevronRight로 고정
   */
  hasRightIconButton?: boolean;
  /**
   * 우측에 노출하는 아이콘 버튼의 click event
   * 이벤트 버블링으로인해 아이콘 버튼을 클릭하면, Dropdown이 닫힘. stopPropagation()을 호출해야 Dropdown이 닫히지 않음
   * @param e React.MouseEvent
   */
  onRightIconButtonClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Select, Dropdown에 Option을 랜더링하는 함수
 * @see {RenderDropdownElementItemType}
 * @param option
 * @param isSelected
 * @param disabled
 * @param displayType
 * @param placeholder
 */
const renderSelectDropdownElementItemDefault = <
  TValue extends SelectValueType = SelectValueType,
  TData = unknown,
>(
  option: SelectOptionInterface<TValue, TData> | undefined,
  isSelected: boolean,
  disabled: WrapperProps['disabled'],
  displayType: WrapperProps['displayType'],
  placeholder?: ReactNode,
) => {
  const {
    leftIconName,
    hasRightIconButton,
    onRightIconButtonClick,
    content = placeholder,
  } = option || {};

  return (
    <div className="flex w-full items-center">
      {leftIconName && (
        <div className="pl-12">
          <Icon
            className={ComponentUtils.cn(
              'h-20 w-20',
              disabled &&
                DropdownElementItemClassNames.getDisabledTextColorType(
                  displayType,
                ),
              !disabled &&
                isSelected &&
                DropdownElementItemClassNames.textColorSelected,
            )}
            name={leftIconName}
          />
        </div>
      )}
      <span
        className={ComponentUtils.cn(
          DropdownElementItemClassNames.default,
          'flex-1 px-12 py-8',
          disabled && 'cursor-not-allowed',
          disabled &&
            DropdownElementItemClassNames.getDisabledTextColorType(displayType),
          !disabled &&
            isSelected &&
            DropdownElementItemClassNames.textColorSelected,
          hasRightIconButton && 'pr-8',
        )}
      >
        {content}
      </span>
      {hasRightIconButton && (
        <div className="pr-4">
          <IconButton
            iconName={IconNamesEnum.ChevronRight}
            size={ButtonSizeEnum.M}
            disabled={disabled}
            textColor={getTextColor(
              disabled,
              isSelected,
              displayType,
              false,
              false,
            )}
            onClick={(e) => {
              onRightIconButtonClick?.(e);
            }}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Select, 선택된 옵션의 값을 출력하는 랜더링하는 함수의 타입
 * @param option 랜더링 해야 할 옵션
 * @param disabled disabled 여부
 * @param displayType DisplayType
 */
export type RenderSelectedOptionContentType<
  TValue extends SelectValueType | unknown = SelectValueType,
  TData = unknown,
  TOptionInterface extends OptionInterface<TValue, TData> =
    SelectOptionInterface<TValue, TData>,
> = (
  placeholder: ReactNode | undefined,
  option: TOptionInterface,
  disabled: WrapperProps['disabled'],
  displayType: WrapperProps['displayType'],
  dataQk?: DataQuery['dataQk'],
  isPlaceholder?: OptionContentTextProps['isPlaceholder'],
) => JSX.Element;

/**
 * Select, RenderSelectedOptionContent의 기본 함수
 *
 * @param placeholder
 * @param option
 * @param disabled
 * @param displayType
 * @param isPlaceholder
 * @param dataQk
 */
const renderSelectSelectedOptionContentDefault = <
  TValue extends SelectValueType = SelectValueType,
  TData = unknown,
  TOptionInterface extends OptionInterface<TValue, TData> =
    SelectOptionInterface<TValue, TData>,
>(
  placeholder: ReactNode | undefined,
  option: TOptionInterface | undefined,
  disabled: WrapperProps['disabled'],
  displayType: WrapperProps['displayType'],
  dataQk?: DataQuery['dataQk'],
  isPlaceholder?: OptionContentTextProps['isPlaceholder'],
) => {
  if (!option) {
    return placeholder ? (
      <OptionContentText
        content={placeholder}
        disabled={disabled}
        displayType={displayType}
        isPlaceholder={isPlaceholder}
        dataQk={dataQk}
      />
    ) : (
      <></>
    );
  }

  if (typeof option.content === 'string') {
    return (
      <OptionContentText
        content={option.content}
        disabled={disabled}
        displayType={displayType}
        dataQk={`${dataQk}-selected`}
      />
    );
  }

  return option.content ?? <></>;
};

/*******************************************
 *               SelectMultiple            *
 *******************************************/

/**
 * SelectMultiple의 OptionInterface
 */
export interface SelectMultipleOptionInterface<
  TValue = SelectValueType,
  TData = unknown,
> extends OptionInterface<TValue, TData> {
  /**
   * 좌측에 CheckBox를 보여줄지 여부
   */
  showCheckBox?: boolean;
}

/**
 * SelectMultiple, Dropdown에 Option을 랜더링하는 함수
 * @see {RenderDropdownElementItemType}
 * @param option
 * @param isSelected
 * @param disabled
 * @param displayType
 * @param placeHolder
 */
const renderSelectMultipleDropdownElementItemDefault = <
  TValue extends SelectValueType = SelectValueType,
  TData = unknown,
>(
  option: SelectMultipleOptionInterface<TValue, TData> | undefined,
  isSelected: boolean,
  disabled: WrapperProps['disabled'],
  displayType: WrapperProps['displayType'],
  placeHolder?: ReactNode,
) => {
  if (!option) {
    return <></>;
  }
  const { showCheckBox = true, content } = option;

  return (
    <div
      className={ComponentUtils.cn(
        'flex w-full items-center',
        disabled && 'cursor-not-allowed',
      )}
    >
      <div className="flex-1 overflow-hidden px-16">
        {showCheckBox && (
          <CheckBox
            className="pointer-events-none"
            labelTextClassName={ComponentUtils.cn(
              'truncate',
              DropdownElementItemClassNames.textColorDefault,
              disabled && 'cursor-not-allowed',
              disabled &&
                DropdownElementItemClassNames.getDisabledTextColorType(
                  displayType,
                ),
              !disabled &&
                isSelected &&
                DropdownElementItemClassNames.textColorSelected,
            )}
            checked={isSelected}
            disabled={disabled}
          >
            <span
              className={ComponentUtils.cn(
                DropdownElementItemClassNames.default,
                'px-12 py-8',
                disabled && 'cursor-not-allowed',
                disabled &&
                  DropdownElementItemClassNames.getDisabledTextColorType(
                    displayType,
                  ),
                !disabled &&
                  isSelected &&
                  DropdownElementItemClassNames.textColorSelected,
              )}
            >
              {content}
            </span>
          </CheckBox>
        )}
        {!showCheckBox && (
          <div className="flex w-full items-center">
            <span
              className={ComponentUtils.cn(
                DropdownElementItemClassNames.default,
                'flex-1 py-8',
                disabled && 'cursor-not-allowed',
                disabled &&
                  DropdownElementItemClassNames.getDisabledTextColorType(
                    displayType,
                  ),
                !disabled &&
                  isSelected &&
                  DropdownElementItemClassNames.textColorSelected,
              )}
            >
              {option.content}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * SelectMultiple, 선택된 옵션들의 값을 출력하는 랜더링 함수의 타입
 * @param options 랜더링 해야 할 옵션들
 * @param disabled disabled 여부
 * @param displayType DisplayType
 */
export type RenderSelectedOptionsContentType<
  TValue extends SelectValueType = SelectValueType,
  TData = unknown,
  TOptionInterface extends OptionInterface<TValue, TData> =
    SelectMultipleOptionInterface<TValue, TData>,
> = (
  placeholder: string | undefined,
  options: TOptionInterface[],
  disabled: WrapperProps['disabled'],
  displayType: WrapperProps['displayType'],
) => JSX.Element;

/**
 * RenderSelectedOptionsContent의 기본 함수
 * @see {RenderSelectedOptionsContentType}
 * @param placeholder
 * @param options
 * @param disabled
 * @param displayType
 */
const renderSelectMultipleSelectedOptionsContentDefault = <
  TValue extends SelectValueType = SelectValueType,
  TData = unknown,
  TOptionInterface extends OptionInterface<TValue, TData> =
    SelectMultipleOptionInterface<TValue, TData>,
>(
  placeholder: string | undefined,
  options: TOptionInterface[],
  disabled: WrapperProps['disabled'],
  displayType: WrapperProps['displayType'],
) => {
  if (options.length === 0) {
    return placeholder ? (
      <OptionContentText
        content={placeholder}
        disabled={disabled}
        displayType={displayType}
      />
    ) : (
      <></>
    );
  }

  if (typeof options[0].content === 'string') {
    return (
      <OptionContentText
        content={options.map((o) => o.content).join(', ')}
        disabled={disabled}
        displayType={displayType}
      />
    );
  }

  return <>{options.map((o) => o.content)}</>;
};

export const SelectCommon = {
  SelectedOptionContentWrapper,
  ChevronIcon,
  LeftIcon,
  getDisabledTextColorType,
  getTextColor,
  renderSelectDropdownElementItemDefault,
  renderSelectSelectedOptionContentDefault,
  renderSelectMultipleDropdownElementItemDefault,
  renderSelectMultipleSelectedOptionsContentDefault,
};
