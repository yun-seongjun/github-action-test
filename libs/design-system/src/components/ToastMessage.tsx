import React, { ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import Portal from '@design-system/components/Portal';
import Icon from '@design-system/components/common/Icon';
import { IconNamesEnum } from '@design-system/constants/iconNames.enum';
import { PortalTypeEnum } from '@design-system/constants/portalType.enum';
import { ToastControlsType } from '@design-system/hooks/useToast';
import { DataQuery } from '@design-system/types/common.type';
import {
  BgColorType,
  OpacityType,
  TextColorType,
} from '@design-system/types/component.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';
import DataUtils from '@design-system/utils/dataUtils';

export type ToastDataType = {
  id: number;
  message: string | ReactNode;
  iconName?: IconNamesEnum;
  onButtonClick?: () => void;
  buttonLabel?: string | ReactNode;
  timerId?: NodeJS.Timeout;
  isPermanent?: boolean;
};

/**
 * 애니메이션 시작 위치_애니메이션 끝 위치_나타나는 위치
 * ex. RIGHT -> LEFT로 슬라이딩되는 동시에 화면 상단에서 나타나는 경우: RIGHT_TO_LEFT_TOP
 */
export enum ToastDirectionEnum {
  BOTTOM_UP_CENTER = 'BOTTOM_UP_CENTER',
  BOTTOM_RIGHT_TO_LEFT = 'BOTTOM_RIGHT_TO_LEFT',
  TOP_DOWN_CENTER = 'TOP_DOWN_CENTER',
  RIGHT_TO_LEFT_TOP = 'RIGHT_TO_LEFT_TOP',
}

interface ToastProps extends DataQuery {
  toastControl: ToastControlsType;
  direction: ToastDirectionEnum;
  className?: string;
  messageClassName?: string;
  bgColor?: BgColorType;
  textColor?: TextColorType;
  opacity?: OpacityType;
}

const wrapperVariants = cva(
  [
    'absolute z-toast flex flex-col gap-6 max-w-343 min-w-343 w-343 overflow-hidden transition-all',
  ],
  {
    variants: {
      direction: {
        [ToastDirectionEnum.BOTTOM_UP_CENTER]:
          'bottom-20 left-1/2 transform -translate-x-1/2',
        [ToastDirectionEnum.BOTTOM_RIGHT_TO_LEFT]:
          'bottom-20 right-16 flex-col-reverse',
        [ToastDirectionEnum.TOP_DOWN_CENTER]:
          'top-20 left-1/2 transform -translate-x-1/2 flex-col-reverse',
        [ToastDirectionEnum.RIGHT_TO_LEFT_TOP]:
          'top-8 right-16 flex-col-reverse',
      },
    },
  },
);

const bodyVariants = cva(
  ['flex items-center justify-between rounded-small px-12 py-14 text-white'],
  {
    variants: {
      direction: {
        [ToastDirectionEnum.BOTTOM_UP_CENTER]: 'animate-pop-in-bottom-up',
        [ToastDirectionEnum.BOTTOM_RIGHT_TO_LEFT]: 'animate-pop-in-from-right',
        [ToastDirectionEnum.TOP_DOWN_CENTER]: 'animate-pop-in-top-down',
        [ToastDirectionEnum.RIGHT_TO_LEFT_TOP]: 'animate-pop-in-from-right',
      },
    },
  },
);

const ToastMessage = ({
  toastControl,
  direction,
  className,
  messageClassName,
  textColor = 'text-mono-100',
  bgColor = 'bg-mono-900',
  opacity = 'opacity-80',
  dataQk = 'toast',
}: ToastProps) => {
  const { toastDataList, removeToastById } = toastControl;

  if (DataUtils.isEmpty(toastDataList)) {
    return null;
  }

  const handleRemoveClick = (toastData: ToastDataType) => {
    if (!toastData.isPermanent) {
      removeToastById(toastData.id);
    }
  };

  return (
    <Portal id={PortalTypeEnum.TOAST}>
      <ul
        className={ComponentUtils.cn(wrapperVariants({ direction }), className)}
      >
        {toastDataList.map((toastData) => (
          <li
            className="animate-grow-up"
            key={toastData.id}
            onClick={() => handleRemoveClick(toastData)}
            data-qk={dataQk}
          >
            <div
              className={ComponentUtils.cn(
                bodyVariants({ direction }),
                bgColor,
                opacity,
              )}
            >
              <div className="shrink-1 flex items-center gap-6">
                {toastData.iconName && (
                  <Icon
                    className="max-h-20 min-h-20 min-w-20 max-w-20"
                    name={toastData.iconName}
                  />
                )}
                {typeof toastData.message === 'string' ? (
                  <p
                    className={ComponentUtils.cn(
                      'font-size-14',
                      textColor,
                      messageClassName,
                    )}
                  >
                    {toastData.message}
                  </p>
                ) : (
                  toastData.message
                )}
              </div>
              {toastData.buttonLabel && (
                <button
                  className="text-primary-500 font-size-14 shrink-0 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    toastData.onButtonClick?.() ?? handleRemoveClick(toastData);
                  }}
                >
                  {toastData.buttonLabel}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Portal>
  );
};

export default ToastMessage;
