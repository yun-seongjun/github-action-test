import {
  CSSProperties,
  forwardRef,
  PropsWithChildren,
  ReactElement,
  Ref,
  useEffect,
  useRef,
} from 'react';
import ScrollGradationWrapper from '@design-system/components/ScrollGradationWrapper';
import useDropdown from '@design-system/hooks/useDropdown';
import {
  OptionInterface,
  OptionSelectEventType,
  SelectValueType,
} from '@design-system/hooks/useOption';
import { DataQuery } from '@design-system/types/common.type';
import {
  HeightType,
  MaxHeightType,
  WidthType,
} from '@design-system/types/component.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export interface DropdownWrapperProps
  extends Pick<ReturnType<typeof useDropdown>, 'isDropdownOpen'>, DataQuery {
  wrapperClassName?: string;
  listClassName?: string;
  maxHeight?: MaxHeightType;
  width?: WidthType;
  parentHeight: HeightType;
  footWrapperClassName?: string;
  footer?: ReactElement | null;
  style?: CSSProperties;
  hasZIndex?: boolean;
  /**
   * Dropdown Wrapper의 Element의 attribute(예: position)가 변경될 때 호출되는 함수
   * @param element Element. undefined일 경우 Dropdown이 닫힌 상태
   */
  onWrapperElementMutate?: (element: HTMLDivElement | undefined) => void;
}

const DropdownWrapper = forwardRef<
  HTMLDivElement,
  PropsWithChildren<DropdownWrapperProps>
>(
  (
    {
      wrapperClassName,
      listClassName,
      isDropdownOpen,
      maxHeight = 'max-h-244',
      width,
      parentHeight,
      children,
      footWrapperClassName,
      footer,
      style,
      dataQk,
      hasZIndex = true,
      onWrapperElementMutate,
    }: PropsWithChildren<DropdownWrapperProps>,
    ref: Ref<HTMLDivElement>,
  ) => {
    const dropdownWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.target === dropdownWrapperRef.current) {
            onWrapperElementMutate?.(dropdownWrapperRef.current);
          }
        });
      });
      if (isDropdownOpen) {
        if (dropdownWrapperRef.current) {
          dropdownWrapperRef.current.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 300, // 지속 시간 (밀리초)
            easing: 'cubic-bezier(0.78, 0.14, 0.15, 0.86)',
            fill: 'forwards',
          });
          mutationObserver.observe(dropdownWrapperRef.current, {
            attributes: true,
          });
        }
      } else {
        onWrapperElementMutate?.(undefined);
      }

      return () => {
        mutationObserver.disconnect();
      };
    }, [isDropdownOpen]);

    if (!isDropdownOpen) {
      return null;
    }

    return (
      <div
        ref={(r) => ComponentUtils.setRefs(r, ref, dropdownWrapperRef)}
        className={ComponentUtils.cn(
          `rounded-small border-1 border-mono-800 absolute overflow-hidden bg-white ${width}`,
          hasZIndex && 'z-ol',
          wrapperClassName,
        )}
        style={
          style ?? {
            top: ComponentUtils.toRem(
              (ComponentUtils.getValueFromHeight(parentHeight) || 0) + 8,
            ),
          }
        }
        onClick={(e) => e.stopPropagation()}
        data-qk={`${dataQk}-dropdown-wrapper`}
      >
        <ScrollGradationWrapper
          zIndex={hasZIndex ? 'z-ol' : undefined}
          toSetParentHeight={false}
          className={ComponentUtils.cn(
            `overflow-y-auto p-8 ${width}`,
            maxHeight,
            listClassName,
          )}
        >
          <ul>{children}</ul>
        </ScrollGradationWrapper>
        {footer && (
          <div
            className={ComponentUtils.cn(
              'border-t-1 border-t-mono-900 p-8',
              footWrapperClassName,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {footer}
          </div>
        )}
      </div>
    );
  },
);

DropdownWrapper.displayName = 'DropdownWrapper';

export interface DropdownElementItemWrapperProps<
  TValue extends SelectValueType = SelectValueType,
  TData = unknown,
  TOptionInterface extends OptionInterface<TValue, TData> = OptionInterface<
    TValue,
    TData
  >,
> extends DataQuery {
  option: TOptionInterface;
  onOptionSelect?: OptionSelectEventType<
    TValue,
    TData,
    HTMLLIElement,
    TOptionInterface
  >;
  onMouseMove?: (index: number) => void;
  isSelected?: boolean;
  disabled?: boolean;
  index?: number;
}

const DropdownElementItemWrapper = <
  TValue extends SelectValueType = SelectValueType,
  TData = unknown,
  TOptionInterface extends OptionInterface<TValue, TData> = OptionInterface<
    TValue,
    TData
  >,
>({
  option,
  onOptionSelect,
  onMouseMove,
  isSelected,
  disabled,
  children,
  index,
  dataQk,
}: PropsWithChildren<
  DropdownElementItemWrapperProps<TValue, TData, TOptionInterface>
>) => {
  const itemRef = useRef<HTMLLIElement | null>(null);

  const handleMouseMove = () => {
    onMouseMove?.(index ?? -1);
  };

  useEffect(() => {
    const scrollGradationWrapperElement =
      itemRef.current?.parentElement?.parentElement;
    if (isSelected && itemRef.current && scrollGradationWrapperElement) {
      const isScrollable =
        scrollGradationWrapperElement.scrollHeight >
        scrollGradationWrapperElement.clientHeight;
      if (isScrollable) {
        // 수동 스크롤 계산으로 부모 요소 스크롤에 영향 주지 않음
        const itemRect = itemRef.current.getBoundingClientRect();
        const containerRect =
          scrollGradationWrapperElement.getBoundingClientRect();

        // 아이템이 컨테이너 밖에 있는지 확인
        if (
          itemRect.top < containerRect.top ||
          itemRect.bottom > containerRect.bottom
        ) {
          // 선택된 아이템을 컨테이너 가운데에 위치시키기 위한 스크롤 계산
          const itemOffsetTop = itemRef.current.offsetTop;
          const containerHeight = scrollGradationWrapperElement.offsetHeight;
          const itemHeight = itemRef.current.offsetHeight;

          // 아이템을 컨테이너 가운데에 위치시키는 스크롤 위치
          const scrollTop =
            itemOffsetTop - containerHeight / 2 + itemHeight / 2;

          scrollGradationWrapperElement.scrollTop = scrollTop;
        }
      }
    }
  }, [isSelected]);

  return (
    <li
      ref={itemRef}
      className={ComponentUtils.cn(
        'rounded-small flex h-fit cursor-default items-center truncate',
        disabled
          ? 'cursor-not-allowed'
          : 'hover:bg-mono-900 active:bg-mono-900 hover:bg-opacity-5 active:bg-opacity-20',
        !disabled && isSelected ? 'bg-primary-50' : 'bg-white',
      )}
      onClick={(e) => {
        if (disabled) {
          e.stopPropagation();
          return;
        }
        onOptionSelect?.(option, e);
      }}
      data-qk={dataQk}
      data-select-option={`select-option-${index}`}
      onMouseMove={handleMouseMove}
    >
      {children}
    </li>
  );
};

export interface DropdownEmptyProps {
  className?: string;
  messageClassName?: string;
  message: string;
  height?: HeightType;
}

const DropdownEmpty = ({
  className,
  messageClassName,
  message,
  height = 'h-218',
}: DropdownEmptyProps) => {
  return (
    <div
      className={ComponentUtils.cn(
        'flex items-center justify-center bg-white',
        height,
        className,
      )}
    >
      <span
        className={ComponentUtils.cn(
          'text-mono-300 font-size-14 font-medium',
          messageClassName,
        )}
      >
        {message}
      </span>
    </div>
  );
};

export const SelectDropdown = {
  Wrapper: DropdownWrapper,
  ElementItemWrapper: DropdownElementItemWrapper,
  Empty: DropdownEmpty,
};
