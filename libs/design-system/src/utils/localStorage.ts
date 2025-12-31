import { LocalStorageKeyEnum } from '@design-system/constants/storageKey.enum';

export const localStorageRemoveAll = () => {
  Object.values(LocalStorageKeyEnum).forEach((key) => {
    localStorage.removeItem(key);
  });
};

// 로컬스토리지에 데이터 저장
const localStorageSetItem = <T>(key: LocalStorageKeyEnum, data: T) => {
  // 데이터를 문자열로 변환하고 암호화하여 저장
  window.localStorage.setItem(key, JSON.stringify(data));
};

// 로컬스토리지에서 데이터 가져오기
const localStorageGetItem = <T>(key: LocalStorageKeyEnum) => {
  // 데이터를 가져와 복호화하고 원래의 타입으로 변환
  const data = window.localStorage.getItem(key);

  // 복호화 실패시 local storage clear
  try {
    return data ? (JSON.parse(data) as T) : null;
  } catch (e) {
    window.localStorage.clear();
    return null;
  }
};

// 로컬스토리지에서 데이터 삭제
const localStorageRemoveItem = (key: LocalStorageKeyEnum) => {
  window.localStorage.removeItem(key);
};

export const LocalStorage = {
  getItem: localStorageGetItem,
  setItem: localStorageSetItem,
  removeItem: localStorageRemoveItem,
  initItem: localStorageRemoveAll,
};
