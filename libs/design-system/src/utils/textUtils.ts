import { InputHTMLAttributes } from 'react';
import ExceedMaxLengthError from '@design-system/error/ExceedMaxLengthError';
import InvalidValueError from '@design-system/error/InvalidValueError';
import { TypeUtils } from '@design-system/utils/typeUtils';

/**
 * inputType이 number이고 inputMode가 없는 경우에 대한 inputMode의 값.
 * 이 경우 numeric임
 */
const getInputMode = (
  inputType: InputHTMLAttributes<HTMLInputElement>['type'],
  inputMode: InputHTMLAttributes<HTMLInputElement>['inputMode'] | undefined,
) => {
  return inputMode ?? (inputType === 'number' ? 'numeric' : undefined);
};

/**
 * 입력받은 문자열을 숫자로 변경.
 * min 이하인 경우, min값을 리턴
 * max 이상인 경우, max값을 리턴
 * maxLength 초과인 경우, exception 발생
 * @param val 입력 문자열
 * @param min 최소값
 * @param max 최대값
 * @param maxLength 최대길이
 * @throws {ExceedMaxLengthError} 입력 문자열의 길이가 maxLength 보다 큰 경우
 * @throws {InvalidValueError} 입력 문자열을 number로 변경한 값이 number의 최대값 보다 크거나 NaN인 경우
 */
const toNumber = (
  val: string,
  min: InputHTMLAttributes<HTMLInputElement>['min'],
  max: InputHTMLAttributes<HTMLInputElement>['max'],
  maxLength: InputHTMLAttributes<HTMLInputElement>['maxLength'],
): number | undefined | '' => {
  if (val === '' || val === '-') {
    return '';
  }

  let valueNewAsNumber: number | null = null;

  // 새로운 값의 길이가 maxLength보다 크면, exception 발생
  // 음수 부호(-)는 제외 후 길이 확인
  const currentLength = val.replace(/^-/, '').length;
  if (maxLength && currentLength > maxLength) {
    throw new ExceedMaxLengthError(currentLength, maxLength);
  }

  valueNewAsNumber = Number(val);
  const minNum = Number(min);
  // 새로운 값이 최소값 보다 작은 경우, 새로운 값을 최소값으로 변경
  if (!Number.isNaN(minNum) && valueNewAsNumber < minNum) {
    valueNewAsNumber = minNum;
  }
  const maxNum = Number(max);
  // 새로운 값이 최대값 보다 큰 경우, 새로운 값을 최대값으로 변경
  if (!Number.isNaN(maxNum) && valueNewAsNumber > maxNum) {
    valueNewAsNumber = maxNum;
  }

  // 새로운 값이 유요한 값의 범위가 아닌 경우, 리턴
  if (
    !Number.isFinite(valueNewAsNumber) ||
    valueNewAsNumber > Number.MAX_SAFE_INTEGER
  ) {
    throw new InvalidValueError(val);
  }
  return valueNewAsNumber;
};

/**
 * 입력 문자열을 최대길이로 자른 숫자를 구함
 * @param value 입력 문자열
 * @param maxLength
 */
const sliceToMaxLength = (
  value: string,
  maxLength: InputHTMLAttributes<HTMLInputElement>['maxLength'],
) => {
  return Number(value.slice(0, maxLength));
};

/**
 * inputType에 따라서 최소값, 최대값, 최대길이 등을 반영하여 값을 구함.
 * @param value 입력 문자열
 * @param inputType
 * @param min 최소값
 * @param max 최대값
 * @param maxLength 최대길이
 * @throws ExceedMaxLengthError
 * @throws InvalidValueError
 */
const refineValue = (
  value: string,
  inputType: InputHTMLAttributes<HTMLInputElement>['type'],
  min: InputHTMLAttributes<HTMLInputElement>['min'],
  max: InputHTMLAttributes<HTMLInputElement>['max'],
  maxLength: InputHTMLAttributes<HTMLInputElement>['maxLength'],
) => {
  if (inputType === 'number') {
    return toNumber(value, min, max, maxLength);
  }

  return value;
};

/**
 * 입력 받은 문자열 배열을 비교 연산자(>, <)로 비교하여, 가장 작은 값을 구함
 * @param values 문자열 배열
 */
const getMin = (...values: (string | number | undefined | null)[]) => {
  let min: string | undefined = undefined;
  values.forEach((v) => {
    const valueString = TypeUtils.isUndefinedOrNull(v) ? undefined : String(v);
    if (min === undefined || (!!valueString && min > valueString)) {
      min = valueString;
    }
  });

  return min;
};

/**
 * 입력 받은 문자열 배열을 비교 연산자(>, <)로 비교하여, 가장 큰 값을 구함
 * @param values 문자열 배열
 */
const getMax = (...values: (string | number | undefined | null)[]) => {
  let max: string | undefined = undefined;
  values.forEach((v) => {
    const valueString = TypeUtils.isUndefinedOrNull(v) ? undefined : String(v);
    if (max === undefined || (!!valueString && max < valueString)) {
      max = valueString;
    }
  });
  return max;
};

const joinListToString = (
  list: (string | undefined | null)[],
  joinString: string,
) => {
  const result = list.reduce((acc, value, index, arr) => {
    if (arr.length === 0) {
      return value;
    }

    if (TypeUtils.isUndefinedOrNull(value)) {
      return acc;
    }

    if (index === arr.length - 1) {
      return acc + value;
    }

    return acc + value + joinString;
  }, '');

  return TypeUtils.isUndefinedOrNull(result) ? '' : result;
};

const splitByHighLightText = (text: string, highLightTextArr: string[]) => {
  const regex = new RegExp(
    `(${highLightTextArr.map((text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi',
  );
  return text.split(regex);
};

const parseNumberFromStr = (str: string) => {
  return Number(str.replace(/[^0-9]/g, ''));
};

export const TextUtils = {
  refineValue,
  getInputMode,
  sliceToMaxLength,
  getMin,
  getMax,
  joinListToString,
  splitByHighLightText,
  parseNumberFromStr,
};
