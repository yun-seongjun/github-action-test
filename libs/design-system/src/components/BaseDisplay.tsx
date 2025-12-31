import {
  ForwardedRef,
  forwardRef,
  MutableRefObject,
  PropsWithChildren,
  ReactElement,
  RefObject,
} from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import Icon, { IconProps } from '@design-system/components/common/Icon';
import { HeightType, WidthType } from '@design-system/types/component.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';
import { DataQuery } from '@design-system/types/common.type';

/**
 * 화면에 보여주는 타입
 */
export enum DisplayTypeEnum {
  UNDERLINED = 'UNDERLINED',
  OUTLINED = 'OUTLINED',
  FILLED = 'FILLED',
}

export const displayTypeDefault = DisplayTypeEnum.FILLED;

const errorClassName = {
  wrapper: 'border-error focus-within:border-error',
  input: 'caret-error',
};
const disabledClassName = {
  wrapper: 'border-mono-100',
  input: '',
};
const hoverClassName = {
  wrapper: 'hover:border-mono-800',
  input: '',
};
const wrapperWidthDefault: WidthType = 'w-200';
const wrapperHeightDefault: HeightType = 'h-38';
export const WrapperVariants = cva(
  `${wrapperWidthDefault} ${wrapperHeightDefault} font-size-14 font-medium flex items-center border-mono-200 pl-12 pr-4 bg-white`,
  {
    variants: {
      /**
       * 화면에 출력하는 타입. underlined / outlined / filled 중 하나. 기본값은 underlined
       */
      displayType: {
        [DisplayTypeEnum.UNDERLINED]:
          'border-b-1 rounded-0 focus-within:border-mono-800 border-solid px-0',
        [DisplayTypeEnum.OUTLINED]:
          'border-1 rounded-small focus-within:border-mono-800 px-12',
        [DisplayTypeEnum.FILLED]:
          'border-1 border-transparent focus-within:border-mono-800 rounded-small bg-mono-50',
      },
    },
    defaultVariants: {
      displayType: displayTypeDefault,
    },
  },
);

const getDisabledPlaceholderColor = (
  displayType: DisplayTypeEnum = displayTypeDefault,
) => {
  return displayType === DisplayTypeEnum.UNDERLINED
    ? 'placeholder:disabled:text-mono-100'
    : 'placeholder:disabled:text-mono-200';
};

const componentClassNameDefault =
  'w-full text-mono-800 outline-none placeholder:text-mono-300 placeholder:font-light disabled:bg-transparent disabled:text-mono-100 bg-transparent';

/**
 * 최상위 div 또는 내부 element들(leftElement, rightElement 등)을 선택한 경우
 * input의 focus가 사라지는 문제를 해결하기 위해서 추가함
 */
const keepGoingFocus = <TRef extends HTMLElement = HTMLElement>(
  ref: RefObject<TRef> | MutableRefObject<TRef> | null,
  e: React.MouseEvent,
) => {
  e.preventDefault();
  ref?.current?.focus();
};

export interface WrapperProps<TRef extends HTMLElement = HTMLElement>
  extends VariantProps<typeof WrapperVariants>, DataQuery {
  /**
   * className
   */
  className?: string;
  /**
   * 화면에 출력하는
   */
  displayType?: DisplayTypeEnum;
  /**
   * disabled
   */
  disabled?: boolean;
  /**
   * width
   */
  width?: WidthType;
  /**
   * height
   */
  height?: HeightType;
  /**
   * 오류 여부
   */
  isError?: boolean;
  /**
   * hover 인 경우 선택한 것 처럼 테두리를 보여줄지 여부
   */
  isActiveBorderWhenHover?: boolean;
  /**
   * input을 감싸고 있는 div의 click 이벤트
   */
  onWrapperClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  /**
   * input을 감싸고 있는 div의 mouseDown 이벤트
   */
  onWrapperMouseDown?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => void;
  /**
   * ref. 예를 들면 input의 ref 등
   */
  componentRef?: RefObject<TRef> | MutableRefObject<TRef>;
}

const Wrapper = forwardRef(
  <TRef extends HTMLElement = HTMLElement>(
    {
      className,
      displayType = DisplayTypeEnum.FILLED,
      disabled,
      width,
      height,
      isError,
      isActiveBorderWhenHover,
      onWrapperClick,
      onWrapperMouseDown,
      children,
      componentRef,
      dataQk,
    }: PropsWithChildren<WrapperProps<TRef>>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const wrapperClassName = ComponentUtils.cn(
      WrapperVariants({ displayType }),
      isError && errorClassName.wrapper,
      disabled && disabledClassName.wrapper,
      isActiveBorderWhenHover &&
        !isError &&
        !disabled &&
        hoverClassName.wrapper,
      className,
      width,
      height,
    );

    return (
      <div
        ref={ref}
        className={wrapperClassName}
        onMouseDown={(e) => {
          componentRef && keepGoingFocus(componentRef, e);
          onWrapperMouseDown?.(e);
        }}
        onClick={(e) => {
          onWrapperClick?.(e);
        }}
        data-qk={`${dataQk}-wrapper`}
      >
        {children}
      </div>
    );
  },
);

Wrapper.displayName = 'BaseDisplay.Wrapper';

interface SideElementProps<TRef extends HTMLElement = HTMLElement> {
  /**
   * className
   */
  className?: string;
  /**
   * children
   */
  children?: ReactElement;
  /**
   * children을 눌른 경우, componentRef에 focus를 주기 위해 전달 받는 ref
   */
  componentRef: RefObject<TRef> | MutableRefObject<TRef>;
}

const SideElement = <TRef extends HTMLElement = HTMLElement>({
  className,
  children,
  componentRef,
}: SideElementProps<TRef>) => {
  if (!children) {
    return null;
  }

  return (
    <div
      className={className}
      onMouseDown={(e) => keepGoingFocus(componentRef, e)}
    >
      {children}
    </div>
  );
};

type LeftElementProps<TRef extends HTMLElement = HTMLElement> =
  SideElementProps<TRef>;

const LeftElement = <TRef extends HTMLElement = HTMLElement>({
  className,
  ...props
}: LeftElementProps<TRef>) => {
  return (
    <SideElement<TRef>
      className={ComponentUtils.cn('pr-4', className)}
      {...props}
    />
  );
};

type RightElementProps<TRef extends HTMLElement = HTMLElement> =
  SideElementProps<TRef>;

const RightElement = <TRef extends HTMLElement = HTMLElement>({
  className,
  ...props
}: RightElementProps<TRef>) => {
  return (
    <SideElement<TRef>
      className={ComponentUtils.cn('pl-4', className)}
      {...props}
    />
  );
};

interface IconElementProps extends IconProps {
  disabled?: boolean;
}

const IconElement = ({
  name,
  className,
  onClick,
  disabled,
}: IconElementProps) => {
  return (
    <Icon
      className={ComponentUtils.cn(
        'h-32 w-32 p-8',
        disabled ? 'text-mono-200' : 'text-mono-400',
        className,
      )}
      name={name}
      onClick={() => !disabled && onClick?.()}
    />
  );
};

/**
 * 내부 컴포넌트의 className을 구하는 함수
 * @param isError 에러 여부
 * @param displayType DisplayTypeEnum
 * @param className 병합할 className
 */
const getComponentClassName = (
  isError: boolean | undefined,
  displayType?: DisplayTypeEnum,
  className?: string,
) => {
  return ComponentUtils.cn(
    componentClassNameDefault,
    getDisabledPlaceholderColor(displayType),
    isError && errorClassName.input,
    className,
  );
};

/**
 * 내부 컴포넌트의 onMouseDown에서 꼭 호출해야 함. 호출하지 않으면 마우스 이벤트(드래그, 더블클릭 등)가 동작 안함
 * keepGoingFocus()의 로직으로 인해 input에 대한 마우스 이벤트(텍스트 드래그, 캐럿 위치 변경 등)이
 * 동작하지 않는 문제가 발생했고, 이를 해결하기 위해서 추가함
 */
const onMouseDown = (e: React.MouseEvent) => {
  e.stopPropagation();
};

export const BaseDisplay = {
  Wrapper,
  LeftElement,
  RightElement,
  IconElement,
  getComponentClassName,
  onMouseDown,
  wrapperWidthDefault,
  wrapperHeightDefault,
};
