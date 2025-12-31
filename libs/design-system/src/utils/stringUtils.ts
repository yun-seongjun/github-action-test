export const whiteSpaceChar = '\u00A0';

/**
 * 입력받은 값에서 pathname을 구하는 함수
 * @param v url 또는 pathname, pathname with query params
 */
const getPathnameWithoutTrailingSlash = (
  v: string | null | undefined,
): string | undefined => {
  if (!v) {
    return undefined;
  }

  try {
    // 도메인이 없는 경우, URL 파싱을 위해 더미 도메인(https://neubility.co.kr)을 추가함
    const u = new URL(v.startsWith('http') ? v : `https://neubility.co.kr${v}`);
    if (u.pathname.length > 0 && u.pathname[u.pathname.length - 1] === '/') {
      return u.pathname.substring(0, u.pathname.length - 1);
    }
    return u.pathname;
  } catch (e) {
    console.error('ERROR::getPathnameWithoutTrailingSlash', e);
  }

  return undefined;
};

/*
 * 입력 받은 두 값의 pathname이 동일한지를 구하는 함수
 * @param v1 url or pathname or pathname with search params
 * @param v2 url or pathname or pathname with search params
 */
const isPathnameEquals = (
  v1: string | null | undefined,
  v2: string | null | undefined,
): boolean => {
  const pathname1 = getPathnameWithoutTrailingSlash(v1);
  const pathname2 = getPathnameWithoutTrailingSlash(v2);
  return !!pathname1 && pathname1 === pathname2;
};

/**
 * 입력 받은 문자열 리스트들을 중복된 값을 제거하며 병합
 */
const mergeList = (...lists: string[][]): string[] => {
  return Array.from<string>(new Set(lists.flat()));
};

export const StringUtils = {
  getPathnameWithoutTrailingSlash,
  isPathnameEquals,
  mergeList,
  whiteSpaceChar,
};
