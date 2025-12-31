import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { isAndroid, isIOS } from 'react-device-detect';
import {
  BridgeWindowType,
  DevicePushTokenReqRequest,
  LoginStatusEnum,
  SocialLoginTypeEnum,
  StatusEnum,
} from '@design-system/types';
import NativeBridgeCallbackEventManager from '@design-system/utils/native-bridge/NativeBridgeCallbackEventManager';
import NativeBridgeEventManager, {
  NativeEventEnum,
} from '@design-system/utils/native-bridge/NativeBridgeEventManager';
import NativeBridgeAction from '@design-system/utils/native-bridge/NativeBridgeAction';
import { NativeEventPayloadType } from '@design-system/utils/native-bridge';
import { StringUtils } from '@design-system/utils/stringUtils';
import { BrowserUtils, EnvUtils, StyleUtils } from '@design-system/utils';

export enum PushTypeEnum {
  AdminOrderAccept = 'ADMIN_ORDER_ACCEPT',
  AdminOrderCanceled = 'ADMIN_ORDER_CANCELED',
  OrderDeliveryStart = 'ORDER_DELIVERY_START',
  DeliveryArrived = 'DELIVERY_ARRIVED',
  CoverStillOpen = 'COVER_STILL_OPEN',
  OrderCanceled = 'ORDER_CANCELED',
  PaymentStatus = 'PAYMENT_STATUS',
  ReviewRequest = 'REVIEW_REQUEST',
}

export type PushDataType = Record<string, unknown> & {
  url: string;
  site: string;
  pushType: PushTypeEnum;
};

export type PushDataPaymentResultType = PushDataType & {
  /**
   * orderId를 문자열로 전송. Push 전송 시 모두 문자로 전송해야 하기 때문임. number로 변환하여 사용해야 함
   */
  orderId: string;
  status: StatusEnum;
};

export type SocialLoginDataType = Record<string, unknown> & {
  /**
   * SocialLoginType
   */
  socialLoginType: Extract<SocialLoginTypeEnum, 'GOOGLE' | 'APPLE'>;
  /**
   * Android: serverAuthCode
   * iOS: code
   */
  code: string;
  email?: string;
  // andriod google login시 받는 id
  id?: string;
  username?: string;
  // apple 로그인은 bundle id를 이용해서 유저 인증 코드를 인증합니다.
  clientId?: string;
};

export enum RoutingTypeEnum {
  Push = 'Push',
  Replace = 'Replace',
}

export type RoutingDataType = {
  url: string;
  routingType: RoutingTypeEnum;
};

/**
 * 딥링크를 구분
 */
export enum DeepLinkSub1Enum {
  OxagonPoc1Voucher = 'oxagon-poc1-voucher',
}

const deepLinkHomeMappingStr = '/home';

/**
 * 딥링크에서 전달 받은 데이터
 * https://support.appsflyer.com/hc/ko/articles/207447163
 * 확장 파라미터는 AppsFlayer에 설정하지 않음
 * AppsFlayer에서 생성한 딥링크에 query param을 추가로 설정하여 사용함
 * 딥링크에서만 전달됨. 즉, deferred 딥링크에서 전달 안됨
 */
export type DeepLinkDataType = {
  /**
   * AppsFlyer 사이트에서 설정한 '딥링크 값'
   * 라우팅을 하기 위한 URL
   * 값이 없는 경우(공백문자 또는 undefined) 라우팅 안함
   * /home을 / 로 판단함
   */
  deepLinkValue?: string;
  /**
   * AppsFlyer 사이트에서 설정한 '추가 딥링크 값'
   * 딥링크를 구분하기 위해 사용
   */
  deepLinkSub1?: DeepLinkSub1Enum;
  /**
   * 서브 파라미터1
   */
  afSub1?: string;
  /**
   * 서브 파라미터2
   */
  afSub2?: string;
  /**
   * 서브 파라미터3
   */
  afSub3?: string;
  /**
   * 서브 파라미터4
   */
  afSub4?: string;
  /**
   * 서브 파라미터5
   */
  afSub5?: string;
  campaignId?: string;
  matchType?: string;
  campaign?: string;
  /**
   * 딥링크 클릭 시각
   * 예: 2023-09-18T03:36:27.648
   */
  timestamp?: string;
  clickHttpReferrer?: string;
  mediaSource?: string;
  /**
   * deferred deep link 여부
   */
  isDeferred?: boolean;
  /**
   * 확장 파라미터1
   * deepLinkSub1에 따라 다름
   * DeepLinkSub1Enum.OXAGON_POC1_VOUCHER인 경우, vaoucher의 코드 값
   */
  ext1: string;
  /**
   * 확장 파라미터2
   */
  ext2: string;
  /**
   * 확장 파라미터3
   */
  ext3: string;
  /**
   * 확장 파라미터4
   */
  ext4: string;
  /**
   * 확장 파라미터5
   */
  ext5: string;
  /**
   * 확장 파라미터6
   */
  ext6: string;
  /**
   * 확장 파라미터7
   */
  ext7: string;
  /**
   * 확장 파라미터8
   */
  ext8: string;
  /**
   * 확장 파라미터9
   */
  ext9: string;
  /**
   * 확장 파라미터10
   */
  ext10: string;
};

export const nativeBridgeSetup = () => {
  const window = BrowserUtils.getWindow<BridgeWindowType>();
  const nativeCallbackEventManager = NativeBridgeCallbackEventManager();
  window.handleNativeCallbackEvent =
    nativeCallbackEventManager.handleNativeCallbackEvent;
  window.nativeCallbackEventManager = nativeCallbackEventManager;
  window.backKeyManager = NativeBridgeEventManager(NativeEventEnum.BackKey);
  window.foregroundManager = NativeBridgeEventManager(
    NativeEventEnum.Foreground,
  );
  window.pushTokenManager = NativeBridgeEventManager(NativeEventEnum.PushToken);
  window.pushNotificationManager = NativeBridgeEventManager(
    NativeEventEnum.PushNotification,
  );
  window.pushClickManager = NativeBridgeEventManager(NativeEventEnum.PushClick);
  window.socialLoginManager = NativeBridgeEventManager(
    NativeEventEnum.SocialLogin,
  );
  window.routingManager = NativeBridgeEventManager(NativeEventEnum.Routing);
  window.deepLinkManager = NativeBridgeEventManager(NativeEventEnum.DeepLink);
  window.webViewLoadedManager = NativeBridgeEventManager(
    NativeEventEnum.WebViewLoaded,
  );
};

const KEY_DEFAULT = 'key_default';

interface UseNativeBridgeType {
  updatePushToken: (pushToken: DevicePushTokenReqRequest) => void;
  loginStatus: LoginStatusEnum;
  loginSocial: (
    loginType: SocialLoginTypeEnum,
    code: string,
    clientId?: string,
  ) => void;
}

const useNativeBridge = ({
  updatePushToken,
  loginStatus,
  loginSocial,
}: UseNativeBridgeType) => {
  // const { loginStatus, loginSocialApple, loginSocialGoogle } = AuthContainer.useContainer()
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();
  const { push, replace } = useRouter();
  const [pushData, setPushData] = useState<PushDataType>();
  const [pushToken, setPushToken] = useState<DevicePushTokenReqRequest>();
  const [appVersion, setAppVersion] = useState<string>();
  const [deepLinkDataForAction, setDeepLinkDataForAction] =
    useState<DeepLinkDataType>();

  const clearDeepLinkDataForAction = () => {
    setDeepLinkDataForAction(undefined);
  };

  /**
   * isLogin true, pushToken이 있으면 토큰을 보내주면
   * 1. 앱 시작시 로그인 되면 pushToken 갱신
   * 2. 로그아웃 상태 -> 로그인 후 pushToken 갱신
   * 3. 로그인 상태에서 앱에서 pushToken이 갱신이 되면 pushToken 갱신 상황이 이뤄집니다.
   */
  useEffect(() => {
    if (loginStatus === LoginStatusEnum.Login && pushToken) {
      try {
        updatePushToken(pushToken);
      } catch (e) {
        console.log('ERR:: createPushToken', e);
      }
    }
  }, [loginStatus, pushToken]);

  /**
   * Android, backKey 핸들링을 App에서 하지 않고, Web에서 처리 함
   */
  const addBackKeyHandler = (
    key: string,
    onBackKeyPress: () => boolean | undefined,
  ) => {
    const window = BrowserUtils.getWindow<BridgeWindowType>();
    if (!window.backKeyManager) {
      return false;
    }

    const enableBackKeyHandlingByWeb =
      window.backKeyManager.getCallbackFnCount() === 0;
    console.log(
      `addBackKeyHandler, key: ${key}, getCallbackFnCount: ${window.backKeyManager.getCallbackFnCount()}`,
    );
    window.backKeyManager.add(key, onBackKeyPress);
    if (enableBackKeyHandlingByWeb) {
      NativeBridgeAction.changeBackKeyHandling({ enabled: false });
    }
  };

  /**
   * Android, backKey 핸들링을 App에서 처리 하도록 변경
   */
  const removeBackHandler = (key: string) => {
    const window = BrowserUtils.getWindow<BridgeWindowType>();
    if (!window.backKeyManager || !window.backKeyManager.has(key)) {
      return false;
    }

    const enableBackKeyHandlingByApp =
      window.backKeyManager.getCallbackFnCount() === 1;
    console.log(
      `removeBackHandler, key: ${key}, getCallbackFnCount: ${window.backKeyManager.getCallbackFnCount()}`,
    );
    if (enableBackKeyHandlingByApp) {
      NativeBridgeAction.changeBackKeyHandling({ enabled: true });
    }
    window.backKeyManager.remove(key);
  };

  const addPushClickHandler = (
    key: string,
    onPushMessageReceive: (
      payload: NativeEventPayloadType<PushDataType>,
    ) => void,
  ) => {
    const window = BrowserUtils.getWindow<BridgeWindowType>();
    window.pushClickManager?.add(key, onPushMessageReceive);
  };
  const removePushClickHandler = (key: string) => {
    const window = BrowserUtils.getWindow<BridgeWindowType>();
    window.pushClickManager?.remove(key);
  };

  const addPushNotificationHandler = (
    key: string,
    onPushMessageReceive: (
      payload: NativeEventPayloadType<PushDataType>,
    ) => void,
  ) => {
    const window = BrowserUtils.getWindow<BridgeWindowType>();
    window.pushNotificationManager?.add(key, onPushMessageReceive);
  };
  const removePushNotificationHandler = (key: string) => {
    const window = BrowserUtils.getWindow<BridgeWindowType>();
    window.pushNotificationManager?.remove(key);
  };

  const addRoutingHandler = (
    key: string,
    onPushMessageReceive: (
      payload: NativeEventPayloadType<RoutingDataType>,
    ) => void,
  ) => {
    const window = BrowserUtils.getWindow<BridgeWindowType>();
    window.routingManager?.add(key, onPushMessageReceive);
  };
  const removeRoutingHandler = (key: string) => {
    const window = BrowserUtils.getWindow<BridgeWindowType>();
    window.routingManager?.remove(key);
  };

  const addForegroundHandler = (
    key: string,
    onForegroundCallback: () => void,
  ) => {
    const window = BrowserUtils.getWindow<BridgeWindowType>();
    window.foregroundManager?.add(key, onForegroundCallback);
  };

  const removeForegroundHandler = (key: string) => {
    const window = BrowserUtils.getWindow<BridgeWindowType>();
    window.foregroundManager?.remove(key);
  };

  useEffect(() => {
    const window = BrowserUtils.getWindow<BridgeWindowType>();
    if (EnvUtils.isNeubilityApp()) {
      window.pushTokenManager.add(
        KEY_DEFAULT,
        (payload: NativeEventPayloadType<DevicePushTokenReqRequest>) =>
          setPushToken(payload.data),
      );
      window.pushNotificationManager.add(
        KEY_DEFAULT,
        (payload: NativeEventPayloadType<PushDataType>) => {
          console.log(payload, 'pushNotificationManager');
          setPushData(payload.data);
        },
      );
      window.pushClickManager.add(
        KEY_DEFAULT,
        (payload: NativeEventPayloadType<PushDataType>) => {
          console.log(payload, 'pushClickManager');
          payload.data.url && push(payload.data.url);
          setPushData(payload.data);
        },
      );
      window.socialLoginManager.add(
        KEY_DEFAULT,
        (payload: NativeEventPayloadType<SocialLoginDataType>) => {
          const {
            data: { socialLoginType, code, clientId },
          } = payload;

          console.log('socialLoginManager, payload', payload);

          if (socialLoginType === SocialLoginTypeEnum.APPLE && clientId) {
            loginSocial(SocialLoginTypeEnum.APPLE, code, clientId);
            return;
          }

          if (socialLoginType === SocialLoginTypeEnum.GOOGLE) {
            loginSocial(SocialLoginTypeEnum.GOOGLE, code);
            return;
          }
        },
      );
      window.routingManager.add(
        KEY_DEFAULT,
        (payload: NativeEventPayloadType<RoutingDataType>) => {
          console.log('routingManager, payload', payload);
          const {
            data: { routingType, url },
          } = payload;
          if (routingType === RoutingTypeEnum.Push) {
            if (!StringUtils.isPathnameEquals(window.location.pathname, url)) {
              push(url);
            }
            // Todo: andriod가 현재 push click을 누르면 routing event가 옵니다. 추후 andriod가 push click시 pushClick 이벤트를 보내주게 되면 삭제합니다.
            if (isAndroid) {
              setPushData(payload.data as unknown as PushDataType);
            }
            return;
          }

          if (routingType === RoutingTypeEnum.Replace) {
            replace(url);
            return;
          }
        },
      );
      window.deepLinkManager.add(
        KEY_DEFAULT,
        (payload: NativeEventPayloadType<DeepLinkDataType>) => {
          console.log('deepLinkManager, payload', payload);
          const data = payload.data;
          if (data.deepLinkValue === deepLinkHomeMappingStr) {
            data.deepLinkValue = '/';
          }
          switch (data.deepLinkSub1) {
            case DeepLinkSub1Enum.OxagonPoc1Voucher: {
              setDeepLinkDataForAction(data);
              if (
                data.deepLinkValue &&
                !StringUtils.isPathnameEquals(pathname, data.deepLinkValue)
              ) {
                push(data.deepLinkValue);
              }
              return;
            }
          }
        },
      );
      // ios에서 safeArea 데이터를 window 객체에 주입하는 타이밍을 보내줍니다. (webView가 다 로드되어야 스크립트 삽입가능)
      window.webViewLoadedManager.add(
        KEY_DEFAULT,
        (payload: NativeEventPayloadType) => {
          console.log('routingManager, payload', payload);
          StyleUtils.injectSafeArea();
        },
      );
      /**
       * init을 보낸 다음에 pushTokenManager를 통해서 토큰을 보냅니다.
       */
      NativeBridgeAction.init().then((data) => {
        data?.appVersion && setAppVersion(data?.appVersion);
        setIsInitialized(true);
      });
    }

    return () => {
      if (EnvUtils.isNeubilityApp()) {
        console.log('deinit');
        NativeBridgeAction.deinit();
        setIsInitialized(false);

        window.pushTokenManager?.remove(KEY_DEFAULT);
        window.pushNotificationManager?.remove(KEY_DEFAULT);
        window.pushClickManager?.remove(KEY_DEFAULT);
        window.socialLoginManager?.remove(KEY_DEFAULT);
        window.routingManager?.remove(KEY_DEFAULT);
        window.deepLinkManager?.remove(KEY_DEFAULT);
      }
    };
  }, []);

  /**
   * Todo: ios 앱에서 webView가 로드 되었을 때와 init 되었을때 WebViewLoaded 이벤트를 보내서 한군데서
   * safeAreaInsets를 적용하는 방식으로 개선되어야 합니다.
   *
   * 이밴트는 보내지 않으나 window 객체에 safeInset이 삽입됩니다.
   * 1. init 액션이 보다 webView 로드가 먼저 완료될 때
   *  -> webView 로드가 되면 window.safeAreaInsets가 들어있습니다. 나중에 init 이 끝나고 StyleUtils.injectSafeArea() 실행됩니다.
   * 2. init 액션이 webView 로드보다 먼저 완료 될 때
   * -> webViewLoaded 이벤트가 발생해서 StyleUtils.injectSafeArea()가 실행됩니다.
   */
  useEffect(() => {
    if (isInitialized && isIOS) {
      StyleUtils.injectSafeArea();
    }
  }, [isInitialized]);

  return {
    isInitialized,
    appVersion,
    pushNotificationData: pushData,
    addPushClickHandler,
    removePushClickHandler,
    addBackKeyHandler,
    removeBackHandler,
    addPushNotificationHandler,
    removePushNotificationHandler,
    addRoutingHandler,
    removeRoutingHandler,
    addForegroundHandler,
    removeForegroundHandler,
    pushToken,
    deepLinkDataForAction,
    clearDeepLinkDataForAction,
  };
};

export default useNativeBridge;
