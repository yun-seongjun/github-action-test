export type SocialLoginTypeEnum =
  (typeof SocialLoginTypeEnum)[keyof typeof SocialLoginTypeEnum];
export const SocialLoginTypeEnum = {
  APPLE: 'APPLE',
  GOOGLE: 'GOOGLE',
  KAKAO: 'KAKAO',
  NAVER: 'NAVER',
} as const;

export type StatusEnum = (typeof StatusEnum)[keyof typeof StatusEnum];
export const StatusEnum = {
  READY: 'READY',
  PAID: 'PAID',
  FAILED: 'FAILED',
} as const;

export type DeviceTypeEnum =
  (typeof DeviceTypeEnum)[keyof typeof DeviceTypeEnum];
export const DeviceTypeEnum = {
  IOS: 'IOS',
  ANDROID: 'ANDROID',
} as const;

export interface DevicePushTokenReqRequest {
  /**
   * 앱 버전
   * @maxLength 32
   * @nullable
   */
  appVersion?: string | null;
  /**
   * 기기 고유 번호
   * @minLength 1
   * @maxLength 254
   */
  deviceNumber: string;
  /** 기기 종류, IOS(iOS), ANDROID(안드로이드)

   * `IOS` - iOS
   * `ANDROID` - ANDROID */
  deviceType?: DeviceTypeEnum;
  /**
   * 푸쉬 토큰
   * @minLength 1
   */
  pushToken: string;
}

export enum LoginStatusEnum {
  Login = 'Login',
  Logout = 'Logout',
  Loading = 'Loading',
  Init = 'Init',
}
