import {
  isAndroid,
  isIOS,
  isSamsungBrowser,
  isTablet as _isTablet,
  isDesktop,
  osName,
} from 'react-device-detect';
import { LocalStorageKeyEnum } from '@design-system/constants/storageKey.enum';
import { LocalStorage } from '@design-system/utils/localStorage';
import { DeployEnvEnum } from '@design-system/constants/deployEnvEnum';

const isMobile = () => isIOS || isAndroid || isSamsungBrowser;
const isServer = () => typeof window === 'undefined';
const isTablet = () => {
  const isSamsungTablet = isServer()
    ? false
    : isDesktop &&
      osName === 'Linux' &&
      window.navigator.platform === 'Linux armv81';
  return _isTablet || (!isDesktop && isAndroid) || isSamsungTablet;
};
const isDevMode = () =>
  !isServer() && LocalStorage.getItem(LocalStorageKeyEnum.DEV_MODE) === true;
const isQaMode = () =>
  !isServer() && LocalStorage.getItem(LocalStorageKeyEnum.QA_MODE) === true;
const isTestMode = () => process.env.TEST_MODE === 'true';
const isAllowDeployEnvs = (...deployEnvs: DeployEnvEnum[]) =>
  !!deployEnvs.find((deployEnv) => deployEnv === process.env.PLATFORM_ENV);
const isNeubilityApp = () =>
  isServer() ? undefined : navigator.userAgent.indexOf('neubility-app') > -1;

const EnvUtils = {
  isMobile,
  isServer,
  isTablet,
  isDevMode,
  isQaMode,
  isAllowDeployEnvs,
  isTestMode,
  isAndriod: () => isSamsungBrowser || isAndroid,
  isIOS: () => isIOS,
  isNeubilityApp,
  isDesktop,
};

export default EnvUtils;
