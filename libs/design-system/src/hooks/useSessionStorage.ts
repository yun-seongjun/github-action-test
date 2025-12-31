import { useEffect } from 'react';
import { SessionStorageKeyEnum } from '@design-system/constants/storageKey.enum';
import DataUtils from '@design-system/utils/dataUtils';
import useStateRef from '@design-system/hooks/useStateRef';
import EnvUtils from '@design-system/utils/envUtils';
import { SessionStorage } from '@design-system/utils/sessionStorage';

export interface SessionStorageControlType<TData> extends ReturnType<
  typeof useSessionStorage<TData>
> {}
const useSessionStorage = <TData>(
  key: SessionStorageKeyEnum,
  initialValue?: TData,
) => {
  const defaultValue = EnvUtils.isServer()
    ? null
    : SessionStorage.getItem<TData>(key);
  const [data, _setData, getData] = useStateRef<TData | null>(
    initialValue ?? defaultValue,
  );

  const setData = (value: TData) => {
    SessionStorage.setItem(key, value);
    _setData(value);
  };

  const refreshData = () => {
    const _data = SessionStorage.getItem<TData>(key);
    if (!DataUtils.isEquals(data, _data)) {
      _setData(_data);
    }
  };

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea === sessionStorage) {
        refreshData();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const removeData = () => {
    SessionStorage.removeItem(key);
    _setData(null);
  };

  return {
    data,
    getData,
    setData,
    removeData,
  };
};

export default useSessionStorage;
