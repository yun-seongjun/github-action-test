import {
  CallbackEventManagerAddType,
  EventManagerAddType,
} from '@design-system/utils/native-bridge';

export interface GeoMapWindowType {
  onLoadGeoMap: () => void;
}

export interface BridgeWindowType {
  safeAreaInsets?: {
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
  };
  webkit: {
    messageHandlers: {
      jsToNative: {
        postMessage: (params: {
          action: string;
          version: string;
          message: string;
          callbackFnName: string;
        }) => void;
      };
    };
  };
  bridgeHandler: {
    requestMessage: (
      action: string,
      version: string,
      message: string,
      callbackFnName: string,
    ) => void;
  };
  // NativeBridgeEventManager
  foregroundManager: {
    add: EventManagerAddType;
    remove: (key: string) => void;
    has: (key: string) => boolean;
    getCallbackFnCount: () => number;
  };
  // NativeBridgeEventManager
  pushTokenManager: {
    add: EventManagerAddType;
    remove: (key: string) => void;
    has: (key: string) => boolean;
    getCallbackFnCount: () => number;
  };
  // NativeBridgeEventManager
  backKeyManager: {
    add: EventManagerAddType;
    remove: (key: string) => void;
    has: (key: string) => boolean;
    getCallbackFnCount: () => number;
  };
  // NativeBridgeEventManager
  pushNotificationManager: {
    add: EventManagerAddType;
    remove: (key: string) => void;
    has: (key: string) => boolean;
    getCallbackFnCount: () => number;
  };
  // NativeBridgeEventManager
  pushClickManager: {
    add: EventManagerAddType;
    remove: (key: string) => void;
    has: (key: string) => boolean;
    getCallbackFnCount: () => number;
  };
  // NativeBridgeEventManager
  socialLoginManager: {
    add: EventManagerAddType;
    remove: (key: string) => void;
  };
  // NativeBridgeEventManager
  routingManager: {
    add: EventManagerAddType;
    remove: (key: string) => void;
  };
  // NativeBridgeEventManager
  deepLinkManager: {
    add: EventManagerAddType;
    remove: (key: string) => void;
  };
  // NativeBridgeEventManager
  webViewLoadedManager: {
    add: EventManagerAddType;
    remove: (key: string) => void;
  };

  // handleNativeCallbackEvent
  nativeCallbackEventManager: {
    add: CallbackEventManagerAddType;
    remove: (key: string) => void;
  };

  handleNativeCallbackEvent(key: string, responseJSON: string): void;
}
