import { enUS, ko } from 'date-fns/locale';
import { LocaleDateFormatMap, LocaleEnum } from '@design-system/constants/i18n';
import { DateUtils } from '@design-system/utils/dateUtils';
import { useRouter } from 'next/router';

export const toDateFnsLocale = (locale: LocaleEnum) => {
  switch (locale) {
    case LocaleEnum.ENGLISH:
      return enUS;
    case LocaleEnum.KOREAN:
      return ko;
  }
};

const useLocale = () => {
  const { locale } = useRouter();
  const localeCurrent = (locale || LocaleEnum.KOREAN) as LocaleEnum;

  /**
   * @link DateUtils.formatMinSec
   * @param seconds
   */
  const formatMinSec = (seconds: number) => {
    return DateUtils.formatMinSec(seconds, localeCurrent);
  };

  /**
   * @link DateUtils.formatDate
   */
  const formatDate = (date: string, format: string) => {
    return DateUtils.formatDate(date, format, localeCurrent);
  };

  /**
   * @link DateUtils.formatHourMin
   */
  const formatHourMin = (timeStr: string) => {
    return DateUtils.formatHourMin(timeStr, localeCurrent);
  };

  const getLocaleOfDateFns = () => {
    return toDateFnsLocale(localeCurrent);
  };

  const toMonthName = (month: number) => {
    const formatter = new Intl.DateTimeFormat(
      LocaleDateFormatMap.get(localeCurrent),
      { month: 'long' },
    );
    return formatter.format(new Date().setMonth(month - 1));
  };

  return {
    locale: localeCurrent,
    formatMinSec,
    formatDate,
    formatHourMin,
    getLocaleOfDateFns,
    toMonthName,
  };
};

export default useLocale;
