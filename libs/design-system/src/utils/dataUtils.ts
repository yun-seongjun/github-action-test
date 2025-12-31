import cloneDeep from 'clone-deep';
import { PrimitiveType } from '@design-system/types/generic.type';

/**
 * a와 b가 같은지 비교
 * @param a
 * @param b
 */
const isEquals = (a: any, b: any): boolean => {
  if (a === b) {
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (typeof a !== 'object' || a === null || b === null) {
    return a === b;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!isEquals(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  const aKeys = Object.keys(a as object);
  const bKeys = Object.keys(b as object);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  for (const key of aKeys) {
    if (!isEquals((a as any)[key], (b as any)[key])) {
      return false;
    }
  }
  return true;
};

const isEmpty = <T>(value: T | undefined): value is undefined => {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'undefined' ||
    typeof value === 'boolean' ||
    value === null
  ) {
    return _isEmptyPrimitive(value);
  }

  if (Array.isArray(value)) {
    return _isEmptyArray(value);
  }

  return typeof value === 'object' && Object.keys(value).length === 0;
};

const _isEmptyArray = <T>(arr: T) => {
  return Array.isArray(arr) && arr.length === 0;
};

const _isEmptyPrimitive = <T>(value: T) => {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    value === 0 ||
    value === false
  );
};

const excludeEmptyProperty = (input: Record<string, any>) => {
  const updatedObject: Record<string, any> = {};

  for (const key in input) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      if (!isEmpty(input[key])) {
        updatedObject[key] = input[key];
      }
    }
  }

  return updatedObject;
};

const excludeNullProperty = (input: Record<string, any>) => {
  const updatedObject: Record<string, any> = {};

  for (const key in input) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      if (input[key] !== null) {
        updatedObject[key] = input[key];
      }
    }
  }

  return updatedObject;
};

const excludeNullOrUndefinedProperty = (input: Record<string, any>) => {
  const updatedObject: Record<string, any> = {};

  for (const key in input) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      const val = input[key];
      if (val !== null && val !== undefined) {
        updatedObject[key] = input[key];
      }
    }
  }

  return updatedObject;
};

const excludeNullOrUndefinedOrEmptyStringOrArrayProperty = (
  input: Record<string, any>,
) => {
  const updatedObject: Record<string, any> = {};

  for (const key in input) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      const val = input[key];
      if (
        val !== null &&
        val !== undefined &&
        val !== '' &&
        !_isEmptyArray(val)
      ) {
        updatedObject[key] = input[key];
      }
    }
  }

  return updatedObject;
};

const isValidateNumber = (value: string | number | undefined) => {
  const isNumeric = (value: string | number | undefined | null) => {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return false;
    return !isNaN(value);
  };
  // 숫자로 변환될수 없는 값이면 false
  if (!isNumeric(value)) return false;
  return Number(value) !== 0;
};

const convertToNumber = (value?: string | number): number | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const result = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(result) ? undefined : result;
};

/**
 * object에서 value로 key를 찾아 리턴
 * @param object
 * @param value
 * @returns string | undefined
 */
const getKeyByValue = (object: { [key: string]: string }, value: string) => {
  return Object.keys(object).find((key) => object[key] === value);
};

const isIncludeValue = (
  value: PrimitiveType,
  obj: Record<string, PrimitiveType>,
) => {
  return Object.values(obj).includes(value);
};

const isNullOrUndefined = (value?: unknown): value is null | undefined => {
  return value === null || value === undefined;
};

const deduplication = <T>(array: T[]) => {
  return Array.from(new Set(array));
};

/**
 * key에 해당하는 values의 값들이 모두 비어있는 경우 true
 * @example
 * case1
 * obj: {
 *     a: 0,
 *     b: ""
 * }
 * DataUtils.isEmpty(obj) // true
 * obj: {
 * }
 * DataUtils.isEmpty(obj) // true
 *
 * case2
 * obj: {}
 * DataUtils.isEmpty(obj) // true
 *
 * case3
 * obj: {
 *     a: 0,
 *     b: "aaa"
 * }
 * DataUtils.isEmpty(obj) // false
 */
const isEmptyObjValues = (obj: Record<string, any>) => {
  return Object.values(obj).some((value) => DataUtils.isEmpty(value));
};

const mergeLists = <TValue>(listOne: TValue[], listTwo: TValue[]) => {
  return Array.from(new Set([...listOne, ...listTwo]));
};

const DataUtils = {
  isEquals,
  isEmptyObjValues,
  deduplication,
  isEmpty,
  excludeEmptyProperty,
  excludeNullProperty,
  excludeNullOrUndefinedProperty,
  excludeNullOrUndefinedOrEmptyStringProperty:
    excludeNullOrUndefinedOrEmptyStringOrArrayProperty,
  isValidateNumber,
  convertToNumber,
  getKeyByValue,
  isIncludeValue,
  isNullOrUndefined,
  deepCopy: cloneDeep,
  mergeLists,
};

export default DataUtils;
