import Router from 'next/router';
import { LocaleEnum } from '@design-system/root/src';

const isKorean = () => Router.locale === LocaleEnum.KOREAN;

const LocaleUtils = {
  isKorean,
};

export default LocaleUtils;
