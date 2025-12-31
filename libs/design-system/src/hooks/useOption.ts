import {
  ReactElement,
  ReactNode,
  SelectHTMLAttributes,
  useEffect,
  useState,
} from 'react';

export type ValueType = SelectHTMLAttributes<HTMLSelectElement>['value'];
export type SelectValueType = SelectHTMLAttributes<HTMLSelectElement>['value'];

/**
 * radio, select 등에서 사용하기 위한 option의 interface
 * useOption와 함께 사용함
 * @see useOption
 */
export interface OptionInterface<TValue = SelectValueType, TData = unknown> {
  /**
   * 옵션의 key. 없는 경우 value를 사용해야 함
   */
  key?: string;
  /**
   * value
   */
  value: TValue;
  /**
   * 화면에 출력할 내용
   */
  content: string | ReactElement;
  /**
   * onSelect, onChange 등의 interface에 추가적으로 전달할 data
   */
  data?: TData;
  /**
   * disabled
   */
  disabled?: boolean;
}

export type OptionSelectEventType<
  TValue extends SelectValueType | unknown = SelectValueType,
  TData = unknown,
  TElement extends HTMLElement = HTMLElement,
  TOptionInterface extends OptionInterface<TValue, TData> = OptionInterface<
    TValue,
    TData
  >,
> = (option: TOptionInterface, e: React.MouseEvent<TElement>) => void;

interface UseOptionProps<
  TValue = SelectValueType,
  TData = unknown,
  TOptionInterface extends OptionInterface<TValue, TData> = OptionInterface<
    TValue,
    TData
  >,
> {
  options: TOptionInterface[];
}

const useOption = <
  TValue = SelectValueType,
  TData = unknown,
  TOptionInterface extends OptionInterface<TValue, TData> = OptionInterface<
    TValue,
    TData
  >,
>({
  options,
}: UseOptionProps<TValue, TData, TOptionInterface>) => {
  const [optionsMap, setOptionsMap] = useState(
    new Map<string, TOptionInterface>(options.map((o) => [String(o.value), o])),
  );

  useEffect(() => {
    setOptionsMap(() => {
      const mapNew = new Map<string, TOptionInterface>();
      options.forEach((o) => {
        mapNew.set(String(o.value), o);
      });
      return mapNew;
    });
  }, [JSON.stringify(options)]);

  /**
   * Option을 구하는 함수
   * @param optionValue option의 값
   */
  const getOption = (optionValue: TValue): TOptionInterface | undefined => {
    return optionsMap.get(String(optionValue));
  };

  const getOptions = (optionValues: TValue[]): TOptionInterface[] => {
    return optionValues.reduce((result, optionValue) => {
      const option = getOption(optionValue);
      if (option) {
        result.push(option);
      }
      return result;
    }, [] as TOptionInterface[]);
  };

  const getOptionsContent = (optionValues: TValue[] | undefined) => {
    return optionValues?.reduce(
      (result, value) => {
        const option = getOption(value);
        if (option) {
          result.push(option.content);
        }
        return result;
      },
      [] as (string | ReactNode)[],
    );
  };

  const getOptionsData = (optionValues: TValue[] | undefined) => {
    return optionValues?.reduce(
      (result, value) => {
        const option = getOption(value);
        if (option) {
          result.push(option.data);
        }
        return result;
      },
      [] as (TData | undefined)[],
    );
  };

  return {
    getOption,
    getOptions,
    getOptionsContent,
    getOptionsData,
  };
};

export default useOption;
