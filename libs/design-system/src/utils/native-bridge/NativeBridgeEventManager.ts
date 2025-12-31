import { NativeEventPayloadType } from '@design-system/utils/native-bridge/index';

/**
 * App -> Web
 */
export enum NativeEventEnum {
  BackKey = 'BackKey',
  Foreground = 'Foreground',
  PushToken = 'PushToken',
  PushNotification = 'PushNotification',
  PushClick = 'PushClick',
  SocialLogin = 'SocialLogin',
  Routing = 'Routing',
  DeepLink = 'DeepLink',
  WebViewLoaded = 'WebViewLoaded',
}

export type NativeEventCallbackType<
  TData extends Record<string, unknown> = Record<string, unknown>,
> = (message: NativeEventPayloadType<TData>) => boolean | undefined | void;

const NativeBridgeEventManager = (event?: NativeEventEnum) => {
  const map = new Map<string, NativeEventCallbackType<any>>();

  const add = <TData extends Record<string, unknown> = Record<string, unknown>>(
    key: string,
    onNativeEvent: NativeEventCallbackType<TData>,
  ): boolean => {
    console.log(`NativeBridgeEventManager[${event}]`, 'add, key', key);
    if (map.has(key)) {
      return false;
    }
    map.set(key, onNativeEvent);
    return true;
  };

  const remove = (key: string) => {
    map.delete(key);
  };

  const has = (key: string): boolean => {
    return map.has(key);
  };

  const getCallbackFnCount = (): number => {
    return map.size;
  };

  const handleNativeEvent = (messageJSON: string) => {
    console.log(
      `NativeBridgeEventManager[${event}], handleNativeEvent, messageJSON`,
      messageJSON,
    );
    try {
      let message;

      try {
        message = JSON.parse(messageJSON);
      } catch (paresError) {
        console.log('JSON.parse failed.', paresError);

        // messageJSON에 개행문자등 이스케이프 처리되지 않은 문자열이 포함되어 파싱 실패하는 경우가 존재하여 추가
        const escapedMessage = messageJSON.replaceAll(
          /[\r\n\t]/g,
          (matchedChar) => {
            switch (matchedChar) {
              case '\r':
                return '\\r';
              case '\n':
                return '\\n';
              case '\t':
                return '\\t';
              default:
                return matchedChar;
            }
          },
        );

        message = JSON.parse(escapedMessage);
      }

      console.log(
        `NativeBridgeEventManager[${event}], handleNativeEvent, message`,
        message,
      );
      const keys = Array.from(map.keys());
      /**
       * 가장 최근에 등록된 callback function부터 순차적으로 호출
       * callback function의 return 값이 true인 경우, 이전에 등록된 callback function들은 호출하지 않음
       * event bubbling과 같은 방식
       */
      for (let i = keys.length - 1; i >= 0; i--) {
        const callbackFn = map.get(keys[i]);
        if (callbackFn?.(message)) {
          break;
        }
      }
    } catch (e) {
      console.error('ERR:: 오류가 발생했습니다.', e);
    }
  };

  return {
    add,
    remove,
    has,
    getCallbackFnCount,
    handleNativeEvent,
  };
};

export default NativeBridgeEventManager;
