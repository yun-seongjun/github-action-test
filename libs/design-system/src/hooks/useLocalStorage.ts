import { useEffect } from 'react';
import { LocalStorageKeyEnum } from '@design-system/constants/storageKey.enum';
import DataUtils from '@design-system/utils/dataUtils';
import useStateRef from '@design-system/hooks/useStateRef';
import EnvUtils from '@design-system/utils/envUtils';
import { LocalStorage } from '@design-system/utils/localStorage';

export interface LocalStorageControlType<TData> extends ReturnType<
  typeof useLocalStorage<TData>
> {}
const useLocalStorage = <TData>(
  key: LocalStorageKeyEnum,
  initialValue?: TData,
) => {
  const defaultValue = EnvUtils.isServer()
    ? null
    : LocalStorage.getItem<TData>(key);
  const [data, _setData, getData] = useStateRef<TData | null>(
    initialValue ?? defaultValue,
  );

  const setData = (value: TData | null) => {
    LocalStorage.setItem(key, value);
    _setData(value);
  };

  const refreshData = () => {
    const _data = LocalStorage.getItem<TData>(key);
    if (!DataUtils.isEquals(data, _data)) {
      _setData(_data);
    }
  };

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea === localStorage) {
        refreshData();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const removeData = () => {
    LocalStorage.removeItem(key);
    _setData(null);
  };

  return {
    data,
    getData,
    setData,
    removeData,
  };
};

export default useLocalStorage;
