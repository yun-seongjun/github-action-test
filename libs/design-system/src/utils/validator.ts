import DataUtils from '@design-system/utils/dataUtils';
import { NumberUtils } from '@design-system/utils/numberUtils';

const PASSWORD_POLICY_ALLOWED_SPECIAL_CHARACTERS = [
  '!',
  '"',
  '#',
  '$',
  '%',
  '&',
  "'",
  '(',
  ')',
  '*',
  '+',
  ',',
  '-',
  '.',
  '/',
  ':',
  ';',
  '<',
  '=',
  '>',
  '?',
  '@',
  '[',
  '₩',
  ']',
  '^',
  '_',
  '`',
  '{',
  '|',
  '}',
  '~',
];

const specialCharacters = PASSWORD_POLICY_ALLOWED_SPECIAL_CHARACTERS.map(
  (char) => `\\${char}`,
).join('');

export const Regex = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  mobileNumber: /^01([016789])-?(\d{3,4})-?(\d{4})$/,
  coordinate: /^(-)?(\d{0,3})(.\d{1, 8})?/,
  fileName: /[<>:*"/\\?|]/,
  password: new RegExp(
    `^(?=.{8,})(?:(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)|(?=.*[a-z])(?=.*[A-Z])(?=.*[${specialCharacters}])|(?=.*[a-z])(?=.*\\d)(?=.*[${specialCharacters}])|(?=.*[A-Z])(?=.*\\d)(?=.*[${specialCharacters}])).*$`,
  ),
  emoji: new RegExp(
    '[' +
      '\u{1F1E0}-\u{1F1FF}' + // flags (iOS)
      '\u{1F300}-\u{1F5FF}' + // symbols & pictographs
      '\u{1F600}-\u{1F64F}' + // emoticons
      '\u{1F680}-\u{1F6FF}' + // transport & map symbols
      '\u{1F700}-\u{1F77F}' + // alchemical symbols
      '\u{1F780}-\u{1F7FF}' + // Geometric Shapes Extended
      '\u{1F800}-\u{1F8FF}' + // Supplemental Arrows-C
      '\u{1F900}-\u{1F9FF}' + // Supplemental Symbols and Pictographs
      '\u{1FA00}-\u{1FA6F}' + // Chess Symbols
      '\u{1FA70}-\u{1FAFF}' + // Symbols and Pictographs Extended-A
      '\u{2702}-\u{27B0}' + // Dingbats
      ']+',
    'u',
  ),
} as const;

const validateEmail = (value: string, errorText: string) => {
  return Regex.email.test(value) ? true : errorText;
};

const validatePassword = (value: string, errorText: string | false = false) => {
  return Regex.password.test(value) ? true : errorText;
};

const validateMobileNumber = (value: string, errorText: string) => {
  return Regex.mobileNumber.test(value) ? true : errorText;
};

const validateIsEmpty = (value: any, errorText: string | false = false) => {
  return DataUtils.isEmpty(value) ? errorText : true;
};

const validateMaxLength = (
  value: string,
  maxLength: number,
  errorText: string | false = false,
) => {
  return value.length > maxLength ? errorText : true;
};

const validateMinLength = (
  value: string,
  minLength: number,
  errorText: string | false = false,
) => {
  return value.length < minLength ? errorText : true;
};

const validateFileName = (value: string, errorText: string | false = false) => {
  return Regex.fileName.test(value) || Regex.emoji.test(value)
    ? errorText
    : true;
};

const validateCoordinate = (
  value: number | undefined | null,
  integerPartMin: number,
  integerPartMax: number,
  decimalPartLengthMin: number,
  decimalPartLengthMax: number,
  errorText: string | false = false,
) => {
  const valueStr = String(value);
  if (
    value === undefined ||
    value === null ||
    !Regex.coordinate.test(valueStr)
  ) {
    return errorText;
  }
  const integerPart = Math.trunc(value);
  if (
    !NumberUtils.isNumber(integerPart) ||
    integerPart < integerPartMin ||
    integerPart > integerPartMax
  ) {
    return errorText;
  }
  const indexOfDot = valueStr.indexOf('.');
  if (indexOfDot > 0) {
    const decimalPart = valueStr.slice(indexOfDot + 1);
    if (
      !NumberUtils.isNumber(Number(decimalPart)) ||
      decimalPart.length < decimalPartLengthMin ||
      decimalPart.length > decimalPartLengthMax
    ) {
      return errorText;
    }
  }
  return true;
};

/**
 * 두 값 중 하나는 비어 있고 다른 하나는 비어 있지 않은지를 검증합니다.
 *
 * 두 값의 빈 상태가 불일치할 경우 에러 메시지를 반환합니다.
 */
const validateEmptyMismatch = (
  firstValue: any,
  secondValue: any,
  errorText: string,
) => {
  const isEmptyFirstValue =
    firstValue === undefined || firstValue === null || firstValue === '';
  const isEmptySecondValue =
    secondValue === undefined || secondValue === null || secondValue === '';

  return isEmptyFirstValue !== isEmptySecondValue ? errorText : true;
};

const validateLatitude = (
  value: number | undefined | null,
  errorText: string | false = false,
) => {
  return validateCoordinate(value, -90, 90, 0, 8, errorText);
};

const validateLongitude = (
  value: number | undefined | null,
  errorText: string | false = false,
) => {
  return validateCoordinate(value, -180, 180, 0, 8, errorText);
};

const validateRange = (
  value: number,
  min: number,
  max: number,
  errorText: string,
) => {
  return min <= value && value <= max ? true : errorText;
};

const validateNumberString = (
  value: string,
  errorText: string | false = false,
) => {
  return /^\d+$/.test(value) ? true : errorText;
};

const validateNumber = (
  value: string | number | undefined | null,
  errorText: string | false = false,
) => {
  const isNumeric = (value: string | number | undefined | null) => {
    if (value === undefined || value === null) return errorText;
    if (typeof value === 'string') return errorText;
    return !isNaN(value);
  };
  // 숫자로 변환될수 없는 값이면 false
  if (!isNumeric(value)) return errorText;
  return Number(value) !== 0;
};

const validateUnitCount = (
  value: number | undefined | null | string,
): value is number | string => {
  const newValue = Number(value);
  if (newValue === 0) return true;
  if (!validateNumber(newValue)) return false;
  if (newValue !== 0 && newValue < 1) return false;
  return true;
};

const validateImageWidthHeight = (
  file: Blob,
  maxWidth: number,
  maxHeight: number,
  errorText: string | false = false,
) => {
  return new Promise<boolean | string>((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      if (img.width > maxWidth || img.height > maxHeight) {
        resolve(errorText);
      } else {
        resolve(true);
      }
    };
  });
};

const validateFileSize = (
  file: File | Blob,
  size: number,
  errorText: string | false = false,
) => {
  return file.size <= size ? true : errorText;
};

const validateFileType = (
  file: File | Blob | undefined,
  accepts: string,
  errorText: string | false = false,
) => {
  return !!file && accepts.replaceAll(' ', '').split(',').includes(file.type)
    ? true
    : errorText;
};

const validateIsSameValue = (
  firstValue: any,
  secondValue: any,
  errorText: string | false = false,
) => {
  return firstValue === secondValue ? errorText : true;
};

export const Validator = {
  validateFileName,
  validateEmail,
  validatePassword,
  validateMobileNumber,
  validateIsEmpty,
  validateMaxLength,
  validateMinLength,
  validateLatitude,
  validateLongitude,
  validateRange,
  validateEmptyMismatch,
  validateNumberString,
  validateFileType,
  validateFileSize,
  validateImageWidthHeight,
  validateUnitCount,
  validateIsSameValue,
};
