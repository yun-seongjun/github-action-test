import { PropsWithChildren, useRef, ReactNode } from 'react';
import NonModal, {
  NonModalProps,
} from '@design-system/components/modal/NonModal';
import useFlagAnimation from '@design-system/hooks/modal/useFlagAnimation';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export interface BottomSideNonModalDrawerProps<TDrawerData> {
  topSide?: ReactNode;
  nonModalDrawerControls: NonModalProps<TDrawerData>['nonModalControls'];
}

//Todo:: 플래그를 둬서 nonModalDrawer가 될지, ModalDrawer가 될지 선택이 가능해야함
const BottomSideNonModalDrawer = <TDrawerData,>({
  topSide,
  nonModalDrawerControls,
  children,
}: PropsWithChildren<BottomSideNonModalDrawerProps<TDrawerData>>) => {
  return (
    <NonModal
      nonModalControls={nonModalDrawerControls}
      wrapperClassName={ComponentUtils.cn('right-0 bottom-0 w-full')}
    >
      <BottomSideNonModalDrawerWrapper
        topSide={topSide}
        nonModalDrawerControls={nonModalDrawerControls}
      >
        {children}
      </BottomSideNonModalDrawerWrapper>
    </NonModal>
  );
};

interface BottomSideNonModalDrawerWrapperProps<TDrawerData> extends Pick<
  BottomSideNonModalDrawerProps<TDrawerData>,
  'nonModalDrawerControls' | 'topSide'
> {}

const BottomSideNonModalDrawerWrapper = <TDrawerData,>({
  topSide,
  children,
  nonModalDrawerControls,
}: PropsWithChildren<BottomSideNonModalDrawerWrapperProps<TDrawerData>>) => {
  const {
    animationStartDuration,
    animationCloseDuration,
    isOpen,
    openedAfterCallback,
    closedAfterCallback,
  } = nonModalDrawerControls;
  const drawerRef = useRef<HTMLDivElement>(null);
  const getDrawerHeight = () => (drawerRef.current?.clientHeight ?? 0) + 'px';

  useFlagAnimation({
    flag: isOpen,
    startAnimationCallback: () => {
      if (!drawerRef.current) return;
      drawerRef.current.style.opacity = '0.5';
      drawerRef.current
        .animate(
          [
            { opacity: 0.5, transform: `translateY(${getDrawerHeight()})` },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          {
            duration: animationStartDuration, // 지속 시간 (밀리초)
            easing: 'cubic-bezier(0.78, 0.14, 0.15, 0.86)',
            fill: 'forwards', // 애니메이션이 끝난 후 종료 상태 유지
          },
        )
        .addEventListener('finish', openedAfterCallback);
    },
    closeAnimationCallback: () => {
      if (!drawerRef.current) return;
      drawerRef.current
        .animate(
          [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0.5, transform: `translateY(${getDrawerHeight()})` },
          ],
          {
            duration: animationCloseDuration, // 지속 시간 (밀리초)
            easing: 'cubic-bezier(0.78, 0.14, 0.15, 0.86)',
            fill: 'forwards', // 애니메이션이 끝난 후 종료 상태 유지
          },
        )
        .addEventListener('finish', closedAfterCallback);
    },
  });

  return (
    <div ref={drawerRef} className="flex h-full flex-col">
      {topSide}
      <aside className="flex h-full flex-col">{children}</aside>
    </div>
  );
};

export default BottomSideNonModalDrawer;
