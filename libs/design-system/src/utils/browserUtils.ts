import { GeoLatLngType } from '@design-system/types';

const queryBrowserApiAuth = async (permission: PermissionDescriptor) => {
  try {
    const micAuthInfo = await navigator.permissions.query(permission);
    return micAuthInfo.state === 'granted';
  } catch (error) {
    console.error('Err:: 마이크 권한 상태를 확인하는 데 실패했습니다.', error);
    return false;
  }
};

const isAvailableMic = async () => {
  const hasMicAuth = await queryBrowserApiAuth({
    name: 'microphone',
  } as unknown as PermissionDescriptor);
  if (!hasMicAuth) {
    return false;
  }
  try {
    const media = await navigator?.mediaDevices?.getUserMedia({ audio: true });
    return media.getAudioTracks().length !== 0;
  } catch (e) {
    console.error('Err::', e);
    return false;
  }
};

const copyClipBoard = async (text: string) => {
  return await navigator.clipboard.writeText(text);
};

const getCurrentLocation = (): Promise<GeoLatLngType> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
    );
  });
};

const getWindow = <T>() => window as Window & typeof globalThis & T;

export const BrowserUtils = {
  copyClipBoard,
  queryBrowserApiAuth,
  isAvailableMic,
  getCurrentLocation,
  getWindow,
};
