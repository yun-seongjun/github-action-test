import React, {
  CSSProperties,
  HTMLAttributes,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cva } from 'class-variance-authority';
import TipPopBody from '@design-system/components/tippop/TipPopBody';
import TipPopTail, {
  BindingPositionEnum,
  TAIL_HEIGHT,
  TAIL_WIDTH,
} from '@design-system/components/tippop/TipPopTail';
import { PortalTypeEnum } from '@design-system/constants/portalType.enum';
import { DataQuery } from '@design-system/types/common.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';

export enum TipPopOverlayEnum {
  UNDER_MODAL = 'UNDER_MODAL',
  OVER_MODAL = 'OVER_MODAL',
}

export enum TipPopDirectionEnum {
  TOP_LEFT = 'TOP_LEFT',
  TOP_MIDDLE = 'TOP_MIDDLE',
  TOP_RIGHT = 'TOP_RIGHT',
  LEFT_TOP = 'LEFT_TOP',
  LEFT_MIDDLE = 'LEFT_MIDDLE',
  LEFT_BOTTOM = 'LEFT_BOTTOM',
  RIGHT_TOP = 'RIGHT_TOP',
  RIGHT_MIDDLE = 'RIGHT_MIDDLE',
  RIGHT_BOTTOM = 'RIGHT_BOTTOM',
  BOTTOM_LEFT = 'BOTTOM_LEFT',
  BOTTOM_MIDDLE = 'BOTTOM_MIDDLE',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT',
}

export const PortalTipPopUnderModalId = 'tipPopUnderModal';
export const PortalTipPopOverModalId = 'tipPopOverModal';

const MARGIN_LEFT_OR_RIGHT = 16;

const tipPopVariants = cva(['absolute max-w-280 w-fit'], {
  variants: {
    bindingPosition: {
      [BindingPositionEnum.BOTTOM_CENTER]: 'transform -translate-x-1/2',
      [BindingPositionEnum.BOTTOM_LEFT]: '',
      [BindingPositionEnum.BOTTOM_RIGHT]: 'transform -translate-x-full',
      [BindingPositionEnum.TOP_CENTER]:
        'flex flex-col flex-col-reverse transform -translate-x-1/2',
      [BindingPositionEnum.TOP_LEFT]: 'flex flex-col flex-col-reverse',
      [BindingPositionEnum.TOP_RIGHT]:
        'flex flex-col flex-col-reverse transform -translate-x-full',
      [BindingPositionEnum.LEFT_CENTER]: 'flex flex-row-reverse',
      [BindingPositionEnum.LEFT_TOP]: 'flex flex-row-reverse',
      [BindingPositionEnum.LEFT_BOTTOM]: 'flex flex-row-reverse',
      [BindingPositionEnum.RIGHT_CENTER]: 'flex',
      [BindingPositionEnum.RIGHT_TOP]: 'flex',
      [BindingPositionEnum.RIGHT_BOTTOM]: 'flex',
    },
  },
});

/**
 *
 * @param targetRect 위치 정보를 알아낼 타겟 엘리먼트의 DOMRect
 * @returns 중심점 x, y, top, bottom, left, right 좌표 반환(단, document를 기준으로 한 절대적 위치)
 */
const getRectPoint = (targetRect: DOMRect) => {
  const targetCenterX = targetRect.left + targetRect.width / 2 + window.scrollX;
  const targetCenterY = targetRect.top + targetRect.height / 2 + window.scrollY;
  const targetTop = targetRect.top + window.scrollY;
  const targetBottom = targetRect.bottom + window.scrollY;
  const targetLeft = targetRect.left + window.scrollX;
  const targetRight = targetRect.right + window.scrollX;
  return {
    targetCenterX,
    targetCenterY,
    targetTop,
    targetBottom,
    targetLeft,
    targetRight,
  };
};

/**
 * 타겟의 위치 정보, 크기 정보와 TipPopCommon의 너비, 높이를 통해 결합 위치를 반환하는 함수
 * @param targetRect TipPopCommon이 띄워질 타겟 엘리먼트의 DOM Rect
 * @param tipPopWidth Tooptip의 너비
 * @param tipPopHeight TipPopCommon의 높이
 * @param preDefinedBindingPosition 미리 정의된 bindingPosition
 * @returns TipPopBody와 TipPopTail의 결합 위치 반환
 */
const getBindingPosition = (
  targetRect: DOMRect,
  tipPopWidth: number,
  tipPopHeight: number,
  preDefinedBindingPosition?: BindingPositionEnum,
): BindingPositionEnum | undefined => {
  const bindingPositions: BindingPositionEnum[] = [];
  /**
   * (viewport 기준) 타겟 엘리먼트의 중심 x 좌표값
   */
  const viewportTargetCenterX = targetRect.left + targetRect.width / 2;
  /**
   * (viewport 기준) 타겟 엘리먼트의 중심 y 좌표값
   */
  const viewportTargetCenterY = targetRect.top + targetRect.height / 2;
  /**
   * (viewport 기준) 타겟 엘리먼트의 top 값
   */
  const viewportTargetTop = targetRect.top;
  /**
   * (viewport 기준) 타겟 엘리먼트의 bottom 값
   */
  const viewportTargetBottom = targetRect.bottom;
  /**
   * (viewport 기준) 타겟 엘리먼트의 left 값
   */
  const viewportTargetLeft = targetRect.left;
  /**
   * (viewport 기준) 타겟 엘리먼트의 right 값
   */
  const viewportTargetRight = targetRect.right;

  const viewPortWidth = document.documentElement.clientWidth;
  const viewPortHeight = document.documentElement.clientHeight;

  const isTopCollide = viewportTargetTop < tipPopHeight;
  const isBottomCollide = viewPortHeight - viewportTargetBottom < tipPopHeight;

  const isCenterHalfCollide =
    viewportTargetCenterY < tipPopHeight / 2 ||
    viewPortHeight - viewportTargetCenterY < tipPopHeight / 2;
  const isCenterTopLittleCollide = viewportTargetCenterY < MARGIN_LEFT_OR_RIGHT;
  const isCenterTopBigCollide =
    viewportTargetCenterY < tipPopHeight - MARGIN_LEFT_OR_RIGHT;
  const isCenterBottomLittleCollide =
    viewPortHeight - viewportTargetCenterY < MARGIN_LEFT_OR_RIGHT;
  const isCenterBottomBigCollide =
    viewPortHeight - viewportTargetCenterY <
    tipPopHeight - MARGIN_LEFT_OR_RIGHT;

  const isLeftCollide = viewportTargetLeft < tipPopWidth + TAIL_HEIGHT;
  const isLeftLittleCollide =
    viewportTargetCenterX < MARGIN_LEFT_OR_RIGHT + TAIL_WIDTH / 2;
  const isLeftHalfCollide = viewportTargetCenterX < tipPopWidth / 2;
  const isLeftBigCollide =
    viewportTargetCenterX <
    tipPopWidth - (MARGIN_LEFT_OR_RIGHT + TAIL_WIDTH / 2);

  const isRightCollide =
    viewPortWidth - viewportTargetRight < tipPopWidth + TAIL_HEIGHT;
  const isRightLittleCollide =
    viewPortWidth - viewportTargetCenterX <
    MARGIN_LEFT_OR_RIGHT + TAIL_WIDTH / 2;
  const isRightHalfCollide =
    viewPortWidth - viewportTargetCenterX < tipPopWidth / 2;
  const isRightBigCollide =
    viewPortWidth - viewportTargetCenterX <
    tipPopWidth - (MARGIN_LEFT_OR_RIGHT + TAIL_WIDTH / 2);

  // (TipPopBody 기준) 하단 결합
  if (!isTopCollide && !isLeftHalfCollide && !isRightHalfCollide) {
    bindingPositions.push(BindingPositionEnum.BOTTOM_CENTER);
  }
  if (!isTopCollide && !isLeftLittleCollide && !isRightBigCollide) {
    bindingPositions.push(BindingPositionEnum.BOTTOM_LEFT);
  }
  if (!isTopCollide && !isLeftBigCollide && !isRightLittleCollide) {
    bindingPositions.push(BindingPositionEnum.BOTTOM_RIGHT);
  }

  // (TipPopBody 기준) 상부 결합
  if (!isBottomCollide && !isLeftHalfCollide && !isRightHalfCollide) {
    bindingPositions.push(BindingPositionEnum.TOP_CENTER);
  }
  if (!isBottomCollide && !isLeftLittleCollide && !isRightBigCollide) {
    bindingPositions.push(BindingPositionEnum.TOP_LEFT);
  }
  if (!isBottomCollide && !isLeftBigCollide && !isRightLittleCollide) {
    bindingPositions.push(BindingPositionEnum.TOP_RIGHT);
  }

  // (TipPopBody 기준) 좌우 결합
  if (!isCenterHalfCollide && !isRightCollide) {
    bindingPositions.push(BindingPositionEnum.LEFT_CENTER);
  }
  if (
    !isCenterTopLittleCollide &&
    !isCenterBottomBigCollide &&
    !isRightCollide
  ) {
    bindingPositions.push(BindingPositionEnum.LEFT_TOP);
  }
  if (
    !isCenterTopBigCollide &&
    !isCenterBottomLittleCollide &&
    !isRightCollide
  ) {
    bindingPositions.push(BindingPositionEnum.LEFT_BOTTOM);
  }
  if (!isCenterHalfCollide && !isLeftCollide) {
    bindingPositions.push(BindingPositionEnum.RIGHT_CENTER);
  }
  if (
    !isCenterTopLittleCollide &&
    !isCenterBottomBigCollide &&
    !isLeftCollide
  ) {
    bindingPositions.push(BindingPositionEnum.RIGHT_TOP);
  }
  if (
    !isCenterTopBigCollide &&
    !isCenterBottomLittleCollide &&
    !isLeftCollide
  ) {
    bindingPositions.push(BindingPositionEnum.RIGHT_BOTTOM);
  }

  if (
    preDefinedBindingPosition &&
    bindingPositions.includes(preDefinedBindingPosition)
  ) {
    return preDefinedBindingPosition;
  }

  return bindingPositions[0];
};

/**
 * TipPopCommon 팝업 지점이 타겟 엘리먼트의 중심점이 되도록 left, right 변위 값을 반환하는 함수
 * @param targetRect TipPopCommon이 띄워질 타겟 엘리먼트의 DOM Rect
 * @param tipPopWidth TipPopCommon의 너비
 * @param tipPopHeight TipPopCommon의 높이
 * @param bindingPosition TipPopBody와 TipPopTail의 결합 위치
 * @returns
 */
const getTipPopCommonAbsolutePositionStyle = (
  targetRect: DOMRect,
  tipPopWidth: number,
  tipPopHeight: number,
  bindingPosition: BindingPositionEnum | undefined,
) => {
  const {
    targetCenterX,
    targetCenterY,
    targetTop,
    targetBottom,
    targetLeft,
    targetRight,
  } = getRectPoint(targetRect);
  switch (bindingPosition) {
    case BindingPositionEnum.BOTTOM_CENTER:
      return {
        left: targetCenterX,
        top: targetTop - tipPopHeight,
      };
    case BindingPositionEnum.BOTTOM_LEFT:
      return {
        left: targetCenterX - (MARGIN_LEFT_OR_RIGHT + TAIL_WIDTH / 2),
        top: targetTop - tipPopHeight,
      };
    case BindingPositionEnum.BOTTOM_RIGHT:
      return {
        left: targetCenterX + (MARGIN_LEFT_OR_RIGHT + TAIL_WIDTH / 2),
        top: targetTop - tipPopHeight,
      };
    case BindingPositionEnum.LEFT_CENTER:
      return {
        left: targetRight,
        top: targetCenterY - tipPopHeight / 2,
      };
    case BindingPositionEnum.LEFT_TOP:
      return {
        left: targetRight,
        top:
          targetCenterY -
          tipPopHeight / 2 +
          MARGIN_LEFT_OR_RIGHT +
          TAIL_WIDTH / 2,
      };
    case BindingPositionEnum.LEFT_BOTTOM:
      return {
        left: targetRight,
        top:
          targetCenterY -
          tipPopHeight / 2 -
          MARGIN_LEFT_OR_RIGHT -
          TAIL_WIDTH / 2,
      };
    case BindingPositionEnum.RIGHT_CENTER:
      return {
        left: targetLeft - tipPopWidth,
        top: targetCenterY - tipPopHeight / 2,
      };
    case BindingPositionEnum.RIGHT_TOP:
      return {
        left: targetLeft - tipPopWidth,
        top:
          targetCenterY -
          tipPopHeight / 2 +
          MARGIN_LEFT_OR_RIGHT +
          TAIL_WIDTH / 2,
      };
    case BindingPositionEnum.RIGHT_BOTTOM:
      return {
        left: targetLeft - tipPopWidth,
        top:
          targetCenterY -
          tipPopHeight / 2 -
          MARGIN_LEFT_OR_RIGHT -
          TAIL_WIDTH / 2,
      };
    case BindingPositionEnum.TOP_CENTER:
      return {
        left: targetCenterX,
        top: targetBottom,
      };
    case BindingPositionEnum.TOP_LEFT:
      return {
        left: targetCenterX - (MARGIN_LEFT_OR_RIGHT + TAIL_WIDTH / 2),
        top: targetBottom,
      };
    case BindingPositionEnum.TOP_RIGHT:
      return {
        left: targetCenterX + (MARGIN_LEFT_OR_RIGHT + TAIL_WIDTH / 2),
        top: targetBottom,
      };
    default:
      return undefined;
  }
};

const getBindingPositionFromDirection = (
  direction: TipPopDirectionEnum,
): BindingPositionEnum => {
  switch (direction) {
    case TipPopDirectionEnum.TOP_LEFT:
      return BindingPositionEnum.BOTTOM_LEFT;
    case TipPopDirectionEnum.TOP_MIDDLE:
      return BindingPositionEnum.BOTTOM_CENTER;
    case TipPopDirectionEnum.TOP_RIGHT:
      return BindingPositionEnum.BOTTOM_RIGHT;
    case TipPopDirectionEnum.LEFT_TOP:
      return BindingPositionEnum.RIGHT_TOP;
    case TipPopDirectionEnum.LEFT_MIDDLE:
      return BindingPositionEnum.RIGHT_CENTER;
    case TipPopDirectionEnum.LEFT_BOTTOM:
      return BindingPositionEnum.RIGHT_BOTTOM;
    case TipPopDirectionEnum.RIGHT_TOP:
      return BindingPositionEnum.LEFT_TOP;
    case TipPopDirectionEnum.RIGHT_MIDDLE:
      return BindingPositionEnum.LEFT_CENTER;
    case TipPopDirectionEnum.RIGHT_BOTTOM:
      return BindingPositionEnum.LEFT_BOTTOM;
    case TipPopDirectionEnum.BOTTOM_LEFT:
      return BindingPositionEnum.TOP_LEFT;
    case TipPopDirectionEnum.BOTTOM_MIDDLE:
      return BindingPositionEnum.TOP_CENTER;
    case TipPopDirectionEnum.BOTTOM_RIGHT:
      return BindingPositionEnum.TOP_RIGHT;
  }
};

export interface TipPopCommonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'className'>, DataQuery {
  /**
   * TipPopCommon이 띄워질 타겟 엘리먼트
   */
  targetElement: HTMLElement;
  /**
   * 팝업 방향
   */
  direction?: TipPopDirectionEnum;
  /**
   * TipPopCommon의 팝업 여부
   */
  isOpen: boolean;
  /**
   * TipPop 컴포넌트의 className
   */
  tipPopClassName?: string;
  /**
   * TipPopBody의 className
   */
  tipPopBodyClassName?: string;
  /**
   * tipPopTail의 className
   */
  tipPopTailClassName?: string;
  /**
   * Popover가 띄워질 타겟 엘리먼트. ref로 참조할 수 있는 엘리먼트로 제한됩니다
   */
  portalType?: PortalTypeEnum;
}

const TipPopCommon = ({
  targetElement,
  direction,
  isOpen,
  tipPopClassName,
  tipPopBodyClassName,
  tipPopTailClassName,
  children,
  dataQk,
  ...props
}: PropsWithChildren<TipPopCommonProps>) => {
  const tipPopWrapperRef = useRef<HTMLDivElement>(null);
  const [bindingPosition, setBindingPosition] = useState<BindingPositionEnum>();
  const [absolutePositionStyle, setAbsolutePositionStyle] =
    useState<CSSProperties>();

  useEffect(() => {
    if (isOpen && tipPopWrapperRef.current) {
      const tipPopElement = tipPopWrapperRef.current;
      const tipPopWidth = tipPopElement.clientWidth;
      const tipPopHeight = tipPopElement.clientHeight;
      const targetRect = targetElement.getBoundingClientRect();

      const preDefinedBindingPostion =
        direction && getBindingPositionFromDirection(direction);
      const bindingPosition = getBindingPosition(
        targetRect,
        tipPopWidth,
        tipPopHeight,
        preDefinedBindingPostion,
      );
      const tipPopAbsolutePositionStyle = getTipPopCommonAbsolutePositionStyle(
        targetRect,
        tipPopWidth,
        tipPopHeight,
        bindingPosition,
      );

      setBindingPosition(bindingPosition);
      setAbsolutePositionStyle({
        ...tipPopAbsolutePositionStyle,
        minWidth: tipPopWidth,
        minHeight: tipPopHeight,
      });
    }
  }, [isOpen, targetElement]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={ComponentUtils.cn(
        tipPopVariants({ bindingPosition }),
        tipPopClassName,
      )}
      style={absolutePositionStyle}
      ref={tipPopWrapperRef}
      data-qk={dataQk}
      {...props}
    >
      <TipPopBody node={children} className={tipPopBodyClassName} />
      <TipPopTail
        bindingPosition={bindingPosition}
        className={tipPopTailClassName}
      />
    </div>
  );
};

export default TipPopCommon;
