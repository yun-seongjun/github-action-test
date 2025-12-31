import { RefObject, createRef, useRef } from 'react';

const useRefMap = <TKey, TValueRef>(
  defaultValues?: [TKey, RefObject<TValueRef>][],
) => {
  const refMap = useRef<Map<TKey, RefObject<TValueRef>>>(
    new Map<TKey, RefObject<TValueRef>>(defaultValues),
  );

  const getRefMap = (): Map<TKey, RefObject<TValueRef>> => {
    return refMap.current;
  };

  const get = (key: TKey): RefObject<TValueRef> | undefined => {
    return refMap.current.get(key);
  };

  const getOrCreate = (key: TKey): RefObject<TValueRef> => {
    const value = refMap.current.get(key);

    if (value) {
      return value;
    }

    const valueNew = createRef<TValueRef>();
    refMap.current.set(key, valueNew);
    return valueNew;
  };

  const has = (key: TKey): boolean => {
    return refMap.current.has(key);
  };

  return {
    getRefMap,
    get,
    getOrCreate,
    has,
  };
};

export default useRefMap;
