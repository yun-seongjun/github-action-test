// https://github.com/i18next/next-i18next
// https://www.i18next.com/translation-function/interpolation
const path = require('path');
module.exports = {
  i18n: {
    locales: ['default', 'ko', 'en', 'ar-SA'],
    defaultLocale: 'default',
    localeDetection: false,
  },
  localeExtension: 'yml',
  localePath: path.join(process.cwd(), 'public', 'locales'),
};
