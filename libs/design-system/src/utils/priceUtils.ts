import { CurrencyEnum, CurrencyStrMap } from '@design-system/constants/i18n';
import { NumberUtils } from '@design-system/utils/numberUtils';

const toNumber = (value?: string | number) => {
  if (value === undefined) {
    return 0;
  }
  if (typeof value === 'string') {
    return Number(value);
  }
  return value;
};

const toUnitPriceByCurrency = (price = 0, currency: CurrencyEnum) => {
  const currencyStr = CurrencyStrMap.get(currency) || '';
  return `${NumberUtils.numberWithCommas(price)} ${currencyStr}`;
};

const toUnitPrice = (price = 0, currency: CurrencyEnum = CurrencyEnum.KRW) => {
  return `${NumberUtils.numberWithCommas(price)} ${CurrencyStrMap.get(currency)}`;
};

const toUnitPoint = (point = 0) => {
  return `${NumberUtils.numberWithCommas(point)} P`;
};

export const PriceUtils = {
  toUnitPrice,
  toNumber,
  toUnitPriceByCurrency,
  toUnitPoint,
};
