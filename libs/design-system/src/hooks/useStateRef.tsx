import { useRef, useState } from 'react';

// useStateRef의 반환 타입 정의
export type UseStateRefType<TValue> =
  | ValueUseStateRefType<TValue>
  | UndefinedUseStateRefType<TValue>;
type ValueUseStateRefType<TValue> = Readonly<
  [
    TValue,
    (value: TValue | ((prevState: TValue) => TValue)) => void,
    () => TValue,
    (value: TValue) => void,
    () => void,
  ]
>;

type UndefinedUseStateRefType<TValue = undefined> = Readonly<
  [
    TValue | undefined,
    (
      value: TValue | undefined | ((prevState: TValue | undefined) => TValue),
    ) => void,
    () => TValue | undefined,
    (value: TValue) => void,
    () => void,
  ]
>;

function useStateRef<TValue>(
  initValue: TValue,
): [
  TValue,
  (value: TValue | ((prevState: TValue) => TValue)) => void,
  () => TValue,
  (value: TValue) => void,
  () => void,
];
function useStateRef<TValue = undefined>(): [
  TValue | undefined,
  (
    value: TValue | undefined | ((prevState: TValue | undefined) => TValue),
  ) => void,
  () => TValue | undefined,
  (value: TValue) => void,
  () => void,
];

// arrow function은 initial Value 값에 따라 함수 오버로딩이 되지 않습니다.
/**
 * useState와 useRef를 합친 Hook입니다.
 * @param initValue
 * @returns [state, setStateRef, getValue, setValue, syncValueToState]
 */
function useStateRef<TValue>(initValue?: TValue) {
  const [state, setState] = useState(initValue);
  const ref = useRef(state);

  /**
   * state와 ref를 동시에 업데이트합니다.
   * @param value
   */
  const setStateRef = (value: TValue | ((prevState: TValue) => TValue)) => {
    if (typeof value === 'function') {
      ref.current = (value as (prevState: TValue | undefined) => TValue)(
        ref.current,
      );
      setState((prevState) => {
        return (value as (prevState: TValue | undefined) => TValue)(prevState);
      });
      return;
    }
    ref.current = value;
    setState(value);
  };

  /**
   * ref의 값을 반환합니다.
   */
  const getValue = () => {
    return ref.current;
  };

  /**
   * ref의 값을 설정합니다.
   * @param value
   */
  const setValue = (value: TValue) => {
    ref.current = value;
  };

  /**
   * ref의 값을 state에 동기화합니다.
   */
  const syncValueToState = () => {
    setState(ref.current);
  };

  return [state, setStateRef, getValue, setValue, syncValueToState] as const;
}

export default useStateRef;
