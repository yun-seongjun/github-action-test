import { CSSProperties, RefObject, useEffect, useRef, useState } from 'react';
import { ComponentUtils } from '@design-system/utils/componentUtils';

const initialStyle: CSSProperties = { top: -100000, left: -1000000 };

export interface UseChildPositionProps<
  TParent extends HTMLElement = HTMLElement,
> {
  parentRef: RefObject<TParent> | undefined;
  distancePxWithComponent?: number;
}

const useChildPosition = <
  TParent extends HTMLElement = HTMLElement,
  TComponent extends HTMLElement = HTMLElement,
  TChild extends HTMLElement = HTMLElement,
>({
  parentRef,
  distancePxWithComponent = 0,
}: UseChildPositionProps<TParent>) => {
  const observerRef = useRef<IntersectionObserver>();
  const componentRef = useRef<TComponent | null>(null);
  const childRef = useRef<TChild | null>(null);
  const [childStyle, setChildStyle] = useState<CSSProperties | undefined>(
    initialStyle,
  );

  const calculatePosition = () => {
    const parentRect = parentRef?.current?.getBoundingClientRect();
    const componentRect = componentRef.current?.getBoundingClientRect();
    const childRect = childRef.current?.getBoundingClientRect();

    if (!parentRect || !componentRect || !childRect) {
      setChildStyle(undefined);
      return;
    }

    const heightBetweenComponentTopAndParentTop =
      componentRect.top - parentRect.y;
    const heightBetweenComponentBottomAndParentBottom =
      parentRect.y + parentRect.height - componentRect.bottom;

    if (
      heightBetweenComponentTopAndParentTop >
      heightBetweenComponentBottomAndParentBottom
    ) {
      setChildStyle({
        top: ComponentUtils.toRem(
          (childRect.height + distancePxWithComponent) * -1,
        ),
      });
      return;
    }

    const top = componentRect.height + distancePxWithComponent;
    setChildStyle({ top: ComponentUtils.toRem(top) });
  };

  useEffect(() => {
    if (parentRef?.current) {
      observerRef.current = new IntersectionObserver(
        () => {
          calculatePosition();
        },
        {
          root: parentRef?.current,
          threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        },
      );
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const startListeningParentScrollEvent = () => {
    calculatePosition();
    if (childRef.current) {
      observerRef.current?.observe(childRef.current);
    }
  };
  const stopListeningParentScrollEvent = () => {
    if (childRef.current) {
      observerRef.current?.unobserve(childRef.current);
    }
    setChildStyle(initialStyle);
  };

  return {
    startListeningParentScrollEvent,
    stopListeningParentScrollEvent,
    componentRef,
    childRef,
    childStyle,
  };
};

export default useChildPosition;
