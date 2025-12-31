import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;
export const supportedLanguages = ['ko', 'en', 'ar-SA'];

export async function i18nMiddleware(req: NextRequest) {
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('/api/') ||
    PUBLIC_FILE.test(req.nextUrl.pathname)
  ) {
    return;
  }

  const currentLocale = req.nextUrl.locale;
  let matchLanguage;

  const acceptLanguage = req.headers.get('accept-language');

  if (acceptLanguage && currentLocale === 'default') {
    const languages = acceptLanguage.split(',');
    const languageCodes = [
      ...new Set(
        languages
          .map((lang) => {
            const code = lang.split(';')[0].trim();
            return code.includes('-') ? [code, code.split('-')[0]] : [code];
          })
          .flat(),
      ),
    ];

    for (const lang of languageCodes) {
      if (supportedLanguages.includes(lang)) {
        matchLanguage = lang;
        break;
      }
    }

    if (!matchLanguage) {
      matchLanguage = 'ko';
    }

    if (currentLocale === matchLanguage) {
      return;
    }

    return NextResponse.redirect(
      new URL(
        `/${matchLanguage}${req.nextUrl.pathname}${req.nextUrl.search}`,
        req.url,
      ),
    );
  }

  const urlObj = new URL(req.nextUrl.href);
  const pathSegments = urlObj.pathname.split('/').filter((segment) => segment);

  if (supportedLanguages.includes(pathSegments[0])) {
    const intendedLocale = pathSegments[0] === 'ar-SA' ? 'en' : pathSegments[0];
    if (intendedLocale === currentLocale) {
      return;
    } else {
      return NextResponse.redirect(
        new URL(
          `/${intendedLocale}${req.nextUrl.pathname}${req.nextUrl.search}`,
          req.url,
        ),
      );
    }
  }
}
