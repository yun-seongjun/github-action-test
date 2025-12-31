import { PropsWithChildren, ReactNode, RefObject, useRef } from 'react';
import IconButton from '@design-system/components/button/IconButton';
import NonModal, {
  NonModalProps,
} from '@design-system/components/modal/NonModal';
import { IconNamesEnum } from '@design-system/constants/iconNames.enum';
import useFlagAnimation from '@design-system/hooks/modal/useFlagAnimation';
import { HeightType, WidthType } from '@design-system/types/component.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';
import { ButtonSizeEnum } from '@design-system/root/src';

interface RightSideNonModalDrawerProps<TDrawerData> extends Pick<
  NonModalProps,
  'dataQk'
> {
  nonModalDrawerControls: NonModalProps<TDrawerData>['nonModalControls'];
  onClose?: () => void;
  title: ReactNode;
  width?: WidthType;
  height?: HeightType;
  rightSide?: ReactNode;
  className?: string;
  wrapperClassName?: string;
  portalId?: string;
  parentRef?: RefObject<HTMLDivElement>;
}
//Todo:: 플래그를 둬서 nonModalDrawer가 될지, ModalDrawer가 될지 선택이 가능해야함
//Todo:: Header 부분을 해당 컴포넌트의 확장 버전으로 만들어야 함, SideModal의 콘텐츠는 온전히 외부에서 들어와야합니다.
const RightSideNonModalDrawer = <TDrawerData,>({
  title,
  onClose,
  nonModalDrawerControls,
  children,
  width = 'w-284',
  height = 'h-screen',
  dataQk,
  portalId,
  rightSide = (
    <IconButton
      size={ButtonSizeEnum.M}
      iconName={IconNamesEnum.CloseSmall}
      textColor="text-mono-700"
      onClick={() => onClose?.()}
      dataQk={`${dataQk}-close-button`}
    />
  ),
  className,
  wrapperClassName,
  parentRef,
}: PropsWithChildren<RightSideNonModalDrawerProps<TDrawerData>>) => {
  return (
    <NonModal
      dataQk={dataQk}
      nonModalControls={nonModalDrawerControls}
      portalId={portalId}
      wrapperClassName={ComponentUtils.cn(
        'right-0 top-0',
        width,
        height,
        wrapperClassName,
      )}
    >
      <RightSideNonModalDrawerWrapper
        nonModalDrawerControls={nonModalDrawerControls}
      >
        <header className="border-b-1 border-b-mono-100 flex w-full items-center justify-between px-16 py-6">
          <span className="text-mono-900 font-size-16 min-w-fit font-medium">
            {title}
          </span>
          {rightSide}
        </header>
        <div
          className={ComponentUtils.cn(
            'h-full overflow-y-auto pb-16 pl-16 pr-24 pt-16',
            className,
          )}
          ref={parentRef}
        >
          {children}
        </div>
      </RightSideNonModalDrawerWrapper>
    </NonModal>
  );
};

interface RightSideNonModalDrawerWrapperProps<TDrawerData> extends Pick<
  RightSideNonModalDrawerProps<TDrawerData>,
  'nonModalDrawerControls'
> {}

const RightSideNonModalDrawerWrapper = <TDrawerData,>({
  children,
  nonModalDrawerControls,
}: PropsWithChildren<RightSideNonModalDrawerWrapperProps<TDrawerData>>) => {
  const {
    animationStartDuration,
    animationCloseDuration,
    isOpen,
    openedAfterCallback,
    closedAfterCallback,
  } = nonModalDrawerControls;
  const drawerRef = useRef<HTMLElement>(null);

  // Todo:: BottomSideDrawer 처럼 getDrawerWidth을 가져서 애니메이션이 동작해야합니다.
  useFlagAnimation({
    flag: isOpen,
    startAnimationCallback: () => {
      if (!drawerRef.current) return;
      drawerRef.current.style.opacity = '0.5';
      drawerRef.current
        .animate(
          [
            { opacity: 0.5, transform: 'translateX(500px)' },
            { opacity: 1, transform: 'translateX(0)' },
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
            { opacity: 1, transform: 'translateX(0)' },
            { opacity: 0.5, transform: 'translateX(500px)' },
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
    <aside
      ref={drawerRef}
      className="bg-mono-50 shadow-light-left-4 flex h-full flex-col"
    >
      {children}
    </aside>
  );
};

export default RightSideNonModalDrawer;
