import { fontSizeBase } from '@design-system/root/tailwind.config';
import EnvUtils from '@design-system/utils/envUtils';
import { BridgeWindowType } from '@design-system/types';

const isLast = (arrLength: number, index: number) => {
  return arrLength === index + 1;
};

const isMainScrollDisabled = () => {
  if (EnvUtils.isServer()) {
    return false;
  }
  return document.body.style.overflow === 'hidden';
};

const disabledMainScroll = () => {
  if (EnvUtils.isServer()) {
    return;
  }
  const { body } = document;
  body.style.overflow = 'hidden';
};

const enableMainScroll = () => {
  if (EnvUtils.isServer()) {
    return;
  }
  const { body } = document;
  body.style.removeProperty('overflow');
};

export enum SafeAreaEnum {
  Top = '--safe-area-inset-top',
  Left = '--safe-area-inset-left',
  Right = '--safe-area-inset-right',
  Bottom = '--safe-area-inset-bottom',
}

export const getSafeArea = (type: SafeAreaEnum) =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue(type));

const disabledMouseDragSelect = () => {
  if (EnvUtils.isServer()) {
    return;
  }
  const bodyElement = document.querySelector('body');
  const originBodyStyle = {
    userSelect: '',
    outline: '',
    touchAction: '',
  };

  if (bodyElement) {
    originBodyStyle.userSelect = bodyElement.style.userSelect;
    originBodyStyle.outline = bodyElement.style.outline;
    originBodyStyle.touchAction = bodyElement.style.touchAction;

    bodyElement.style.userSelect = 'none';
    bodyElement.style.outline = 'none';
    bodyElement.style.touchAction = 'pan-x pan-y';
    return originBodyStyle;
  }
  return originBodyStyle;
};

const ableMouseDragSelect = (originBodyStyle: {
  userSelect: string;
  outline: string;
  touchAction: string;
}) => {
  if (EnvUtils.isServer()) {
    return;
  }
  const bodyElement = document.querySelector('body');
  if (bodyElement) {
    bodyElement.style.userSelect = originBodyStyle.userSelect;
    bodyElement.style.outline = originBodyStyle.outline;
    bodyElement.style.touchAction = originBodyStyle.touchAction;
  }
};

const pxToRem = (px: number) => {
  return `${px / fontSizeBase}rem`;
};

const injectSafeArea = () => {
  const _window = window as unknown as BridgeWindowType;
  const safeAreaInsets = {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  };
  // 뉴비오더 IOS: Native 앱에서 주입한 safeAreaInsets가 있습니다.
  if (_window.safeAreaInsets) {
    safeAreaInsets.top = _window.safeAreaInsets.top ?? 0;
    safeAreaInsets.left = _window.safeAreaInsets.left ?? 0;
    safeAreaInsets.bottom = _window.safeAreaInsets.bottom ?? 0;
    safeAreaInsets.right = _window.safeAreaInsets.right ?? 0;
  } else {
    // 모바일 웹, 카카오 인앱 등 웹 브라우저는 env(safe-area-inset-*) 값을 넣습니다.
    safeAreaInsets.top = getSafeArea(SafeAreaEnum.Top);
    safeAreaInsets.left = getSafeArea(SafeAreaEnum.Left);
    safeAreaInsets.bottom = getSafeArea(SafeAreaEnum.Bottom);
    safeAreaInsets.right = getSafeArea(SafeAreaEnum.Right);
  }
  document.documentElement.style.setProperty(
    '--safe-area-inset-top',
    safeAreaInsets.top + 'px',
  );
  document.documentElement.style.setProperty(
    '--safe-area-inset-left',
    safeAreaInsets.left + 'px',
  );
  document.documentElement.style.setProperty(
    '--safe-area-inset-bottom',
    safeAreaInsets.bottom + 'px',
  );
  document.documentElement.style.setProperty(
    '--safe-area-inset-right',
    safeAreaInsets.right + 'px',
  );
};

export const StyleUtils = {
  isMainScrollDisabled,
  enableMainScroll,
  disabledMainScroll,
  disabledMouseDragSelect,
  ableMouseDragSelect,
  getSafeArea,
  isLast,
  pxToRem,
  injectSafeArea,
};
