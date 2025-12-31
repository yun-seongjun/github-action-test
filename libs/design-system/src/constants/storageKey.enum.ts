export enum LocalStorageKeyEnum {
  // common
  DEV_MODE = 'DEV_MODE',
  QA_MODE = 'QA_MODE',
  SHOWING_DEV_TOOLS = 'ShowingDevTools',
  USER_TIME_ZONE = 'UserTimeZone',

  // neubie-go
  ACCESS_TOKEN_GO = 'AccessToken',
  PERSONAL_INFO_CONSENT_GO = 'PersonalInfoConsent',

  // neubie-order
  IS_SITE_SELECTED_ORDER = 'IS_SITE_SELECTED',
  SITE_SLUG_ORDER = 'SiteSlug',
  PROMISE_NODE_NUMBER_ORDER = 'PromiseNodeNumber',
  PROMISE_NODE_NUMBER_MAP_ORDER = 'PromiseNodeNumberMap',
  ADD_CART_COMPLETE_ORDER = 'AddCartComplete',
  ACCESS_TOKEN_ORDER = 'AccessToken',
  DIFFERENT_SHOP_ORDER = 'DifferentShop',
  HIDE_ONLY_TODAY_EVENT_ORDER = 'HideOnlyTodayEvent',
  SOCIAL_LOGIN_TYPE_ORDER = 'SocialLoginType',
  IS_IN_FORM_PERMISSIONS_ORDER = 'IsInformPermissions',
  SITE_BOTTOM_SHEET_HIDE_TODAY_ORDER = 'SiteBottomSheetHideToday',
  APARTMENT_INFO_ORDER = 'ApartmentInfo',
  // neubie-order admin
}
export enum SessionStorageKeyEnum {
  // common

  // neubie-go
  BEFORE_REDIRECT_URL_GO = 'BEFORE_REDIRECT_URL',
  HIDE_MOBILE_PATH_GUIDE_BANNER_GO = 'HIDE_MOBILE_PATH_GUIDE_BANNER',
  REMOTE_MULTIPLE_ROBOT_IDS_GO = 'REMOTE_MULTIPLE_ROBOT_IDS',
  HEARTBEAT_SUCCEEDED_TIMESTAMP_GO = 'HEARTBEAT_SUCCEEDED_TIMESTAMP',
  MONITORING_INTERVENE_INFO_GO = 'MONITORING_INTERVENE_INFO',
  USER_IDS = 'USER_IDS',

  // neubie-order
  BEFORE_REDIRECT_URL_ORDER = 'BeforeRedirectUrl',
  VIEW_SCROLL_ORDER = 'ViewScroll',
  IS_FIRST_RENDER_ROBOT_STATUS_SHEET_ORDER = 'IsFirstRenderRobotStatusSheet',
  REOPEN_VOUCHER_SHEET_ORDER = 'ReopenVoucherSheet',
  VOUCHER_CODE_ORDER = 'VoucherCode',
  IS_ENTRY_POINT_BANNER_ORDER = 'IsEntryPointBanner',
  SUCCESS_RECEIVE_POINT_ORDER = 'SuccessReceivePoint',
  BEFORE_HISTORY_LENGTH_ORDER = 'beforeHistoryLength',
  FAIL_MUTATE_REQUEST_CONFIG_LIST_ORDER = 'FailMutateRequestConfigList',
  DIFFERENT_SHOP_ORDER = 'DifferentShop',
  CREATE_ORDER_ORDER = 'CreatedOrder',
  ORDER_CREATED_TIME_ORDER = 'OrderCreatedTime',
  ORDER_USED_POINT_ORDER = 'OrderUsedPoint',

  // neubie-order admin
}

export type ApartmentInfoType = {
  apartmentBuildingNumberStr: string;
  apartmentDoorNumberStr: string;
  customerName: string;
};
