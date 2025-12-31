import {
  CSSProperties,
  forwardRef,
  HTMLAttributes,
  PropsWithChildren,
  Ref,
  useEffect,
  useRef,
  useState,
} from 'react';
import { theme } from '@design-system/root/tailwind.config';
import { DataQuery } from '@design-system/types/common.type';
import {
  HeightType,
  RoundedType,
  WidthType,
  ZIndexType,
} from '@design-system/types/component.type';
import { StyleUtils } from '@design-system/utils/StyleUtils';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export enum ScrollTypeEnum {
  X = 'X',
  Y = 'Y',
  ALL = 'ALL',
}

interface ScrollGradationWrapperProps
  extends HTMLAttributes<HTMLDivElement>, DataQuery {
  width?: WidthType;
  height?: HeightType;
  zIndex?: ZIndexType;
  // hex code를 넣어야 합니다.
  bgColor?: string;
  toSetParentHeight?: boolean;
  rounded?: RoundedType;
  scrollType?: ScrollTypeEnum;
  style?: CSSProperties;
  wrapperClassName?: string;
  gradationClassName?: string;
}

const ScrollGradationWrapper = forwardRef(
  (
    {
      width,
      height,
      zIndex,
      bgColor = theme.colors.white,
      className,
      style,
      scrollType = ScrollTypeEnum.ALL,
      children,
      toSetParentHeight = true,
      rounded,
      dataQk,
      wrapperClassName,
      gradationClassName,
      ...props
    }: PropsWithChildren<ScrollGradationWrapperProps>,
    ref: Ref<HTMLDivElement>,
  ) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const childrenElement = wrapperRef.current?.childNodes[0];
    const gradientXRef = useRef<HTMLDivElement>(null);
    const gradientYRef = useRef<HTMLDivElement>(null);
    const bgColorToRGBA = ComponentUtils.hexToRGBA(bgColor, 0);
    const bgGradientXInlineStyle = `linear-gradient(90deg, ${bgColorToRGBA} 0%, ${bgColor} 100%)`;
    const bgGradientYInlineStyle = `linear-gradient(180deg, ${bgColorToRGBA} 0%, ${bgColor} 100%)`;
    const [isHideScrollBar, setIsHideScrollBar] = useState(true);
    // 렌더 후 dom의 위치들이 모두 결정된 다음 scroll을 보여줄지 말지 결정합니다.
    const [lazyRenderScrollType, setLazyRenderScrollType] =
      useState<ScrollTypeEnum>();

    const checkIsScrollable = (element: HTMLDivElement) => {
      const isScrollableX = element.scrollWidth > element.clientWidth;
      const isScrollableY = element.scrollHeight > element.clientHeight;

      return {
        isScrollableX,
        isScrollableY,
      };
    };

    const checkEndScroll = (element: HTMLDivElement) => {
      const isEndScrollX =
        Math.abs(
          element.scrollLeft + element.clientWidth - element.scrollWidth,
        ) < 1;
      const isEndScrollY =
        Math.abs(
          element.scrollTop + element.clientHeight - element.scrollHeight,
        ) < 1;

      return {
        isEndScrollX,
        isEndScrollY,
      };
    };

    const setGradientStyle = (isSetX: boolean, isSetY: boolean) => {
      if (!wrapperRef.current) return;
      if (gradientXRef.current) {
        if (isSetX) {
          gradientXRef.current.style.background = bgGradientXInlineStyle;
        } else {
          gradientXRef.current.style.background = '';
        }
      }
      if (gradientYRef.current) {
        if (isSetY) {
          gradientYRef.current.style.background = bgGradientYInlineStyle;
        } else {
          gradientYRef.current.style.background = '';
        }
      }
    };

    const handleScrollChange = () => {
      if (!wrapperRef.current) return;
      const { isEndScrollX, isEndScrollY } = checkEndScroll(wrapperRef.current);
      setGradientStyle(!isEndScrollX, !isEndScrollY);
    };

    const setStyleByResize = () => {
      if (!gradientXRef.current || !gradientYRef.current || !wrapperRef.current)
        return;
      const { isScrollableX, isScrollableY } = checkIsScrollable(
        wrapperRef.current,
      );
      gradientXRef.current.style.height = StyleUtils.pxToRem(
        wrapperRef.current.scrollHeight,
      );
      gradientYRef.current.style.width = StyleUtils.pxToRem(
        wrapperRef.current.scrollWidth,
      );
      setGradientStyle(isScrollableX, isScrollableY);

      if (isScrollableX) {
        setIsHideScrollBar(isScrollableX);
      }

      setLazyRenderScrollType(scrollType);
    };

    useEffect(() => {
      const resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((enrty) => {
          setStyleByResize();
        });
      });

      if (wrapperRef.current && gradientXRef.current && gradientYRef.current) {
        resizeObserver.observe(wrapperRef.current);
        wrapperRef.current.addEventListener('scroll', handleScrollChange);
      }

      return () => {
        if (
          wrapperRef.current &&
          gradientXRef.current &&
          gradientYRef.current
        ) {
          resizeObserver.disconnect();
          wrapperRef.current.removeEventListener('scroll', handleScrollChange);
        }
      };
    }, []);

    useEffect(() => {
      setStyleByResize();
    }, [childrenElement]);

    return (
      <div
        className={ComponentUtils.cn(
          'relative w-full overflow-hidden',
          wrapperClassName,
          width,
          height,
        )}
        data-qk={dataQk}
      >
        <div
          className={ComponentUtils.cn(
            'h-full w-full overflow-auto',
            className,
            isHideScrollBar && 'scrollbar-hide',
          )}
          style={style}
          ref={(r) => ComponentUtils.setRefs(r, wrapperRef, ref)}
          {...props}
        >
          {children}
        </div>
        {lazyRenderScrollType !== ScrollTypeEnum.Y && (
          <div
            className={ComponentUtils.cn(
              'pointer-events-none absolute bottom-0 right-0 w-80',
              rounded,
              zIndex,
              gradationClassName,
            )}
            ref={gradientXRef}
          />
        )}
        {lazyRenderScrollType !== ScrollTypeEnum.X && (
          <div
            className={ComponentUtils.cn(
              'pointer-events-none absolute bottom-0 right-0 h-80',
              rounded,
              zIndex,
              gradationClassName,
            )}
            ref={gradientYRef}
          />
        )}
      </div>
    );
  },
);
ScrollGradationWrapper.displayName = 'ScrollGradationWrapper';

export default ScrollGradationWrapper;
