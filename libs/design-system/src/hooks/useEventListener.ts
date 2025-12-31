import { useRef } from 'react';

interface UseEventListenerProps<
  TCallbackArgs extends (...args: any[]) => ReturnType<TCallbackArgs>,
> {
  eventName?: string;
}

// TODO: EventListenerManager를 이용하여 useEventListener를 구현하도록 수정 필요. EventListenerManager를 좀더 pure하게 수정해야 함
const useEventListener = <
  TCallbackArgs extends (...args: any[]) => ReturnType<TCallbackArgs>,
>(
  props?: UseEventListenerProps<TCallbackArgs>,
) => {
  const { eventName = 'Event' } = props || {};
  const keyRef = useRef<number>(0);
  const eventListenerMapRef = useRef<Map<string, TCallbackArgs>>(new Map());

  /**
   * 이벤트 리스너를 추가합니다.
   * @param listener
   * @returns key 리스너를 식별할 수 있는 키. 이벤트 리스너 제거 시 사용합니다.
   */
  const addEventListener = (listener: TCallbackArgs): string => {
    const key = `${eventName}-${keyRef.current}`;
    keyRef.current += 1;
    eventListenerMapRef.current.set(key, listener);
    return key;
  };

  /**
   * 이벤트 리스너를 제거합니다.
   * @param key addEventListener에서 반환받은 키
   */
  const removeEventListener = (key: string): boolean => {
    return eventListenerMapRef.current.delete(key);
  };

  /**
   * 이벤트 리스너들을 호출합니다.
   * @param args
   */
  const invokeEventListeners = (...args: Parameters<TCallbackArgs>) => {
    return Array.from(eventListenerMapRef.current.values()).map((listener) => {
      return listener(...args);
    });
  };

  /**
   * 이벤트 리스너가 등록되어 있는지 확인합니다.
   * @param key addEventListener에서 반환받은 키
   */
  const isEventListening = (key: string): boolean => {
    return eventListenerMapRef.current.has(key);
  };

  /**
   * 이벤트 리스너를 모두 제거합니다.
   */
  const clear = () => {
    eventListenerMapRef.current.clear();
  };

  return {
    addEventListener,
    removeEventListener,
    invokeEventListeners,
    isEventListening,
    clear,
  };
};

export default useEventListener;
