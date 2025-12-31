import { NativeEventCallbackType } from '@design-system/utils/native-bridge/NativeBridgeEventManager';
import { NativeEventPayloadType } from '@design-system/utils/native-bridge/index';

const NativeBridgeCallbackEventManager = () => {
  const map = new Map<string, NativeEventCallbackType<any>>();

  const add = <TData extends Record<string, unknown> = Record<string, unknown>>(
    key: string,
  ): Promise<NativeEventPayloadType<TData>> | undefined => {
    if (map.has(key)) {
      return;
    }

    return new Promise<NativeEventPayloadType<TData>>((resolve) => {
      map.set(key, (response: NativeEventPayloadType<TData>) =>
        resolve(response),
      );
    });
  };

  const remove = (key: string) => {
    map.delete(key);
  };

  const handleNativeCallbackEvent = (key: string, responseJSON: string) => {
    console.log(
      'handleNativeCallbackEvent, key',
      key,
      'responseJSON',
      responseJSON,
    );
    if (!map.has(key)) {
      console.error('ERR:: 콜스텍에 없는 이벤트 입니다.', key);
      return;
    }

    try {
      const callbackFn = map.get(key);
      remove(key);

      const response = JSON.parse(responseJSON);
      callbackFn?.(response);
    } catch (e) {
      console.error('ERR:: 오류가 발생했습니다.', e);
    }
  };

  return {
    add,
    remove,
    handleNativeCallbackEvent,
  };
};

export default NativeBridgeCallbackEventManager;
