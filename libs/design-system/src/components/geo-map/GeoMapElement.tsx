import {
  ComponentUtils,
  GeoMapControl,
  TagClassValueEnum,
} from '@design-system/index';
import {
  forwardRef,
  PropsWithChildren,
  Ref,
  RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import { HeightType, WidthType } from '@design-system/types';
import useTimer from '@design-system/hooks/useTimer';
import SignByTagEvent from '@design-system/components/SignByTagEvent';

const EVENT_DURATION_TIME = 3000;
interface GeoMapElementProps {
  geoMapControl: GeoMapControl;
  width: WidthType;
  height: HeightType;
  className?: string;
  currentEventTag?: TagClassValueEnum | undefined;
  signClassName?: string;
}

const getBorderClassName = (isEventOn: boolean, tag?: TagClassValueEnum) => {
  switch (tag) {
    case TagClassValueEnum.ACCIDENT_ZONE: {
      if (isEventOn) {
        return { animation: 'blink-border-red 1s ease-in-out infinite' };
      }
      break;
    }
    default:
      return null;
  }
};

const GeoMapElement = forwardRef(
  (
    {
      geoMapControl,
      width,
      height,
      className,
      children,
      currentEventTag,
      signClassName,
    }: PropsWithChildren<GeoMapElementProps>,
    ref: Ref<HTMLDivElement>,
  ) => {
    const { geoMapElementRef, geoMapWrapperRef } = geoMapControl;
    const mapElementRef = useRef<HTMLDivElement>(null);
    usePreventFulltoRefreshByTouchMove({ ref: geoMapElementRef });
    const { startTimer, stopTimer } = useTimer();

    const [isEventOn, setIsEventOn] = useState(false);
    const wrapperBorderClassName = getBorderClassName(
      isEventOn,
      currentEventTag,
    );

    useEffect(() => {
      if (currentEventTag) {
        setIsEventOn(true);
        startTimer(() => {
          setIsEventOn(false);
        }, EVENT_DURATION_TIME);
      } else {
        setIsEventOn(false);
        stopTimer();
      }
    }, [currentEventTag]);

    // TODO wdj className으로 animation 및 background가 적용되지 않음. 추후에 원인 파악해서 style => className 으로 수정 필요
    return (
      <div
        className={ComponentUtils.cn(
          width,
          height,
          className,
          wrapperBorderClassName,
          'relative overflow-hidden',
        )}
        style={{ ...wrapperBorderClassName }}
        ref={(r) =>
          ComponentUtils.setRefs(r, ref, geoMapWrapperRef, mapElementRef)
        }
      >
        <div
          ref={geoMapElementRef}
          id="map"
          className="relative h-full w-full"
        />
        {/* google logo 클릭안되도록 하는 element 입니다. */}
        <div className="h-25 w-90 absolute bottom-0 left-0" />
        {children}
        <SignByTagEvent
          currentEventTag={currentEventTag}
          className={signClassName}
        />
        {currentEventTag === TagClassValueEnum.ACCIDENT_ZONE && isEventOn && (
          <div
            className={
              'pointer-events-none absolute left-0 top-0 h-full w-full'
            }
            style={{
              animation: 'blink-bg-red 1s ease-in-out infinite',
              background: 'rgba(255, 179, 172, 0.1)',
            }}
          />
        )}
        {/* MapToolBar 영역 */}
      </div>
    );
  },
);

GeoMapElement.displayName = 'GeoMapElement';
export default GeoMapElement;

interface usePreventFulltoRefreshByTouchMoveProps {
  ref: RefObject<HTMLDivElement>;
}

const usePreventFulltoRefreshByTouchMove = ({
  ref,
}: usePreventFulltoRefreshByTouchMoveProps) => {
  const isEventListenerAddedRef = useRef<boolean>(false);
  useEffect(() => {
    const handleTouchMove = (event: Event) => event.preventDefault();

    let timeoutId: NodeJS.Timeout;
    const addEventListenerUntilSuccessful = () => {
      timeoutId = setTimeout(() => {
        if (isEventListenerAddedRef.current) {
          return;
        }
        if (ref.current) {
          ref.current?.addEventListener('touchmove', handleTouchMove);
          isEventListenerAddedRef.current = true;
          return;
        }
        addEventListenerUntilSuccessful();
      }, 100);
    };

    addEventListenerUntilSuccessful();

    return () => {
      clearTimeout(timeoutId);
      ref.current?.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
  return;
};
