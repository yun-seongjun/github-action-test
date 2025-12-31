// TODO: 앱 버전을 어떻게 관리할 지 논의가 필요합니다.
import { NativeEventCallbackType } from '@design-system/utils/native-bridge/NativeBridgeEventManager';

export const AppVersion = '1';

/**
 * 300 ~ 499, 공통 에러
 * 500 ~ 699, App에서 발생한 에러
 * 700 ~ 899, Web에서 발생한 에러
 */
export enum Error {
  /**
   * 성공
   */
  success = '0',
  /**
   * 잘못된 Payload 형식입니다.
   */
  errorParsePayload = '300',
  /**
   * 타임아웃
   */
  errorTimeOut = '301',
  /**
   * 유효하지 않은 Action 입니다.
   */
  errorInvalidAction = '404',
  /**
   * 권한이 필요합니다.
   */
  errorPermissionDenied = '500',
  /**
   * 위치 설정이 꺼져있습니다.
   */
  errorGpsDisabled = '501',
  /**
   * 알 수 없는 오류입니다.
   */
  errorUnknown = '999',
}

/**
 * Native 에서 Web으로 전송하는 데이터는 Json 문자열화 된 데이터입니다.
 * 아래는 json.parse 후 반환 타입 입니다.
 */
export type NativeEventPayloadType<TData = Record<string, unknown>> = {
  /**
   * 성공 여부
   */
  isSuccess: boolean;
  /**
   * 오류 코드
   */
  errorCode: Error;
  /**
   * 오류 메시지
   */
  errorMessage: string;
  /**
   * BridgeInterface 버전
   */
  version: string;
  /**
   * App의 버전명
   */
  appVersion: string;
  /**
   * 데이터
   */
  data: TData;
};

export type EventManagerAddType = <
  TData extends Record<string, any> = Record<string, any>,
>(
  key: string,
  onNativeEvent: NativeEventCallbackType<TData>,
) => boolean;

export type CallbackEventManagerAddType = <
  TData extends Record<string, any> = Record<string, any>,
>(
  key: string,
) => Promise<NativeEventPayloadType<TData>> | undefined;
