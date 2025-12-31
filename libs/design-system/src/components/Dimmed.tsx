import { useRef } from 'react';
import { OverlayControlsType } from '@design-system/hooks/modal/useOverlay';
import useFlagAnimation from '@design-system/hooks/modal/useFlagAnimation';
import { DataQuery } from '@design-system/types/common.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

interface DimmedProps extends Pick<OverlayControlsType, 'isOpen'>, DataQuery {
  className?: string;
  onClick?(): void;
}

const dimDurationTime = 300;

const Dimmed = ({ onClick, isOpen, className, dataQk }: DimmedProps) => {
  const dimmdRef = useRef<HTMLDivElement>(null);

  useFlagAnimation({
    flag: isOpen,
    startAnimationCallback: () => {
      dimmdRef.current?.animate(
        [
          { opacity: 0 }, // 시작 상태
          { opacity: 1 }, // 종료 상태
        ],
        {
          duration: dimDurationTime, // 지속 시간 (밀리초)
          fill: 'forwards', // 애니메이션이 끝난 후 종료 상태 유지
        },
      );
    },
    closeAnimationCallback: () => {
      dimmdRef.current?.animate(
        [
          { opacity: 1 }, // 시작 상태
          { opacity: 0 }, // 종료 상태
        ],
        {
          duration: dimDurationTime, // 지속 시간 (밀리초)
          fill: 'forwards', // 애니메이션이 끝난 후 종료 상태 유지
        },
      );
    },
  });

  return (
    <div
      ref={dimmdRef}
      className={ComponentUtils.cn(
        'bg-mono-900/30 fixed left-0 top-0 flex h-screen w-screen',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      data-qk={dataQk}
    />
  );
};

export default Dimmed;
