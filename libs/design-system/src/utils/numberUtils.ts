import DataUtils from '@design-system/utils/dataUtils';

const numberWithCommas = (num = 0): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const getLeftZeroPaddingLength = (value: string) => {
  if (value === '0' || /^0\./.test(value)) {
    return -1;
  }
  const length = value.match(/^0(0)*/)?.[0].length;
  if (length === undefined) {
    return -1;
  }
  if (value.charAt(length) === '.') {
    return length - 1;
  }
  return length;
};

const isNumber = (value: number | null | undefined): value is number => {
  return !(value === null || value === undefined || Number.isNaN(value));
};

/**
 * 문자열을 숫자로 변환합니다.
 * @param value
 */
const stringToNumber = (value: string) => {
  const num = Number(value);
  return isNumber(num) ? num : undefined;
};

/**
 * 문자열 배열을 숫자 배열로 변환합니다.
 * @param value
 */
const toNumberArray = (value: string | string[] | undefined | null) => {
  if (value === undefined || value === null) {
    return [];
  }

  if (typeof value === 'string') {
    const valueNew = stringToNumber(value);
    return valueNew ? [valueNew] : [];
  }

  return value.reduce((result, val) => {
    const valNew = stringToNumber(val);
    if (valNew !== undefined) {
      result.push(valNew);
    }
    return result;
  }, [] as number[]);
};

/**
 * 입력된 숫자(num)를 주어진 소수점 자릿수(decimalPlaces)로 잘라내고 반환합니다.
 * @param num 입력되는 수(실수)
 * @param decimalPlaces 잘라낼 소수점 자릿수
 */
const truncateDecimalPlaces = (num: number, decimalPlaces: number): number => {
  const truncatedNumString = num.toFixed(decimalPlaces);
  return parseFloat(truncatedNumString);
};

const isValidNumberAndNotZero = (
  value: number | null | undefined,
): value is number => {
  return isNumber(value) && !DataUtils.isEmpty(value);
};

/**
 * 소수점 계산 시 부동소수점 문제를 해결하여 반환합니다.
 * @param value 부동소수점 상태 값
 */
const getRoundToOneDecimal = (value: number) => {
  return Math.round(value * 10) / 10;
};

export const NumberUtils = {
  isNumber,
  numberWithCommas,
  getLeftZeroPaddingLength,
  stringToNumber,
  toNumberArray,
  truncateDecimalPlaces,
  isValidNumberAndNotZero,
  getRoundToOneDecimal,
};
