import { MutableRefObject, useEffect, useRef, useState } from 'react';
import useChildPosition, {
  UseChildPositionProps,
} from '@design-system/hooks/useChildPosition';
import useStateRef from '@design-system/hooks/useStateRef';
import { EnvUtils } from '@design-system/utils';

export interface UseDropdownProps<
  TParent extends HTMLElement = HTMLElement,
> extends UseChildPositionProps<TParent> {
  onDropDownOpenChange?: (isOpen: boolean) => void;
}

const useDropdown = <
  TParent extends HTMLElement = HTMLElement,
  TComponent extends HTMLElement = HTMLElement,
  TChild extends HTMLElement = HTMLElement,
>({
  onDropDownOpenChange,
  ...childPositionProps
}: UseDropdownProps<TParent>) => {
  const {
    startListeningParentScrollEvent,
    stopListeningParentScrollEvent,
    componentRef,
    childRef,
    childStyle,
  } = useChildPosition<TParent, TComponent, TChild>({ ...childPositionProps });
  const { isPreventDropDownClose, getIsPreventDropDownClose } =
    usePreventDropDownClose({ componentRef });
  /**
   * focusing을 잃어 버리면(blur 발생) dropDown을 닫기 위함
   */
  const focusingElementRef = useRef<HTMLElement | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    focusingElementRef.current?.addEventListener('blur', closeDropdown);
    return () => {
      focusingElementRef.current?.removeEventListener('blur', closeDropdown);
    };
  }, []);

  useEffect(() => {
    if (isDropdownOpen) {
      startListeningParentScrollEvent();
    }
  }, [isDropdownOpen]);

  const openDropdown = () => {
    setIsDropdownOpen(true);
    onDropDownOpenChange?.(true);
  };

  const closeDropdown = () => {
    if (getIsPreventDropDownClose()) return;
    stopListeningParentScrollEvent();
    setIsDropdownOpen(false);
    onDropDownOpenChange?.(false);
  };

  const toggleDropdown = () => {
    if (isDropdownOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  return {
    isPreventDropDownClose,
    isDropdownOpen,
    openDropdown,
    closeDropdown,
    toggleDropdown,
    focusingElementRef,
    componentRef,
    childRef,
    childStyle,
    startListeningParentScrollEvent,
  };
};

export default useDropdown;

/**
 * prod가 아닌 환경에서 select 박스를 더블클릭하면 dropdown이 고정되며 다시 더블클릭하면 dropdown이 닫을 수 있게 됩니다.
 * select 안의 option들의 값을 개발자 툴로 쉽게 보기 위해서 해당 트릭을 만들었습니다.
 * @param componentRef
 */
const usePreventDropDownClose = <TComponent extends HTMLElement>({
  componentRef,
}: {
  componentRef: MutableRefObject<TComponent | null>;
}) => {
  const [
    isPreventDropDownClose,
    setIsPreventDropDownClose,
    getIsPreventDropDownClose,
  ] = useStateRef(false);
  useEffect(() => {
    const handlePreventClose = () =>
      setIsPreventDropDownClose(!getIsPreventDropDownClose());
    if (EnvUtils.isQaMode()) {
      componentRef.current?.addEventListener('dblclick', handlePreventClose);
    }
    return () => {
      if (EnvUtils.isQaMode()) {
        componentRef.current?.removeEventListener(
          'dblclick',
          handlePreventClose,
        );
      }
    };
  }, []);

  useEffect(() => {
    const node = document.createElement('div');
    node.style.width = '10px';
    node.style.height = '10px';
    node.style.position = 'absolute';
    node.style.bottom = '0px';
    node.style.left = '0px';
    node.style.background = 'blue';
    node.id = 'tag';

    if (isPreventDropDownClose) {
      componentRef.current?.appendChild(node);
    } else {
      const tagElement = componentRef.current?.querySelector('#tag');
      if (tagElement) {
        componentRef.current?.removeChild(tagElement);
      }
    }
  }, [isPreventDropDownClose]);

  return {
    isPreventDropDownClose,
    getIsPreventDropDownClose,
  };
};
