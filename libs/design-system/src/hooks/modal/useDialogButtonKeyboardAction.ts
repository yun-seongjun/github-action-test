import { UseKeyboardAction } from '@design-system/index';
import { useMemo, useRef, useEffect } from 'react';
import { useKeyboardAction } from '@design-system/hooks';

interface UseDialogButtonKeyboardActionProps extends Pick<
  UseKeyboardAction,
  'enabled' | 'enabledDelay'
> {
  closeDialog: () => void;
  isEnterEnabled?: boolean;
  ignoreEscWhenFocusedRef?: React.RefObject<HTMLElement | null>;
}

const useDialogButtonKeyboardAction = (
  props?: UseDialogButtonKeyboardActionProps,
) => {
  const {
    enabled,
    enabledDelay,
    closeDialog,
    isEnterEnabled,
    ignoreEscWhenFocusedRef,
  } = props || {};
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);
  const skipEscOnKeyupRef = useRef(false);

  /**
   * Todo::
   * - 버튼 클릭 - dialog open - keyborad 액션 - 클릭된 버튼이 foucs되어 있어 window에 걸어버린 키보드 액션이 동작 + active 된 버튼에 걸린 키보드 액션도 동작함
   * - 클릭시 남아있는 activeElement에 대해서 키보드 액션시 반영하지 않습니다.
   *   추후 overlayControls 에서 Ref를 내려서 직접 컨트롤 할 element에 셋하고
   *   useKeyboardAction 에 컨트롤 할 Ref를 내려서 foucs를 하고 키보드 이벤트를 붙여야 겠습니다.
   *   현재 급하게 수정할 건이 아니라고 판단되어 위와 같이 수정합니다.
   *   isEnterEnabled는 급하게 수정한것입니다. 근본적인 문제를 해결한건 아닙니다
   */
  const blurActiveElement = () => {
    const activeElement = document?.activeElement as HTMLDivElement | null;
    activeElement?.blur();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') {
        return;
      }
      const ignoreRef = ignoreEscWhenFocusedRef?.current;
      const activeEl = document.activeElement as Element | null;

      skipEscOnKeyupRef.current = !!(
        ignoreRef &&
        activeEl &&
        ignoreRef === activeEl
      );
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, []);

  const actionRecord = useMemo(() => {
    return {
      Enter: () => {
        blurActiveElement();
        isEnterEnabled && confirmButtonRef.current?.click();
      },
      Escape: () => {
        if (skipEscOnKeyupRef.current) {
          skipEscOnKeyupRef.current = false;
          return;
        }

        blurActiveElement();
        closeDialog?.();
      },
    };
  }, []);

  useKeyboardAction({
    actionRecord,
    enabled,
    enabledDelay,
  });

  return {
    confirmButtonRef,
  };
};

export default useDialogButtonKeyboardAction;
