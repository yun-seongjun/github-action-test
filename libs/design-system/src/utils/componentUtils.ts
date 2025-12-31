import { MutableRefObject, Ref, RefObject } from 'react';
import { cx } from 'class-variance-authority';
import { ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import {
  HeightType,
  MaxHeightType,
  MaxWidthType,
  MinHeightType,
  MinWidthType,
  WidthType,
} from '@design-system/types/component.type';
import { TypeUtils } from '@design-system/utils/typeUtils';

/**
 * component를 여러개의 ref로 설정하는 함수
 * @param srcElement ref에 설정하려는 component
 * @param refs component를 설정할 ref 리스트
 */
const setRefs = <TElement extends HTMLElement>(
  srcElement: TElement | null,
  ...refs: (
    | Ref<TElement>
    | MutableRefObject<TElement | null>
    | RefObject<TElement>
    | null
    | undefined
  )[]
) => {
  if (!srcElement) {
    return;
  }

  refs.forEach((ref) => {
    if (typeof ref === 'function') {
      ref(srcElement);
    } else if (ref) {
      const refMutable = ref as MutableRefObject<TElement>;
      refMutable.current = srcElement;
    }
  });
};

/**
 * twMerge와 clsx를 같이 실행하는 함수. 뒤에 오는 값이 우선순위가 높음
 * @param classValues 클래스 이름들
 */
const cn = (...classValues: ClassValue[]) => {
  return customTwMerge(cx(classValues));
};

const NUMBER_1_TO_1000_STR = Array.from({ length: 1000 }, (_, i) => `${i + 1}`);
/**
 * 아래 링크의 첫글 처럼 twMerge의 병합한계로 twMerge를 확장하여 사용합니다.
 * @link https://github.com/dcastil/tailwind-merge/blob/v2.4.0/docs/configuration.md
 */
const customTwMerge = extendTailwindMerge({
  extend: {
    theme: {
      borderRadius: [
        ...NUMBER_1_TO_1000_STR,
        'none',
        'extra-small',
        'small',
        'medium',
        'large',
        'extra-large',
        'full',
      ],
      blur: [...NUMBER_1_TO_1000_STR],
      borderWidth: [...NUMBER_1_TO_1000_STR],
      padding: [...NUMBER_1_TO_1000_STR],
      margin: [...NUMBER_1_TO_1000_STR],
    },
  },
});

/**
 * 입력 받은 문자열에서 숫자를 추출하는 함수
 * @param str 입력 문자열
 */
const getNumberInString = (str: string | undefined | null) => {
  if (TypeUtils.isUndefinedOrNull(str)) {
    return undefined;
  }
  const num = Number(str.match(/\d+/g)?.[0]);
  return !Number.isNaN(num) && Number.isFinite(num) ? num : undefined;
};

/**
 * 입력받은 width에서 숫자 값을 추출하는 함수
 * @param width WidthType, MinWidthType, MaxWidthType 중 하나
 */
const getValueFromWidth = (
  width: WidthType | MinWidthType | MaxWidthType | undefined,
): number | undefined => {
  return getNumberInString(width);
};

/**
 * 입력받은 width에서 숫자 값을 추출하고, rem으로 변환하는 함수
 * @param width WidthType, MinWidthType, MaxWidthType 중 하나
 */
const getRemFromWidth = (
  width: WidthType | MinWidthType | MaxWidthType | undefined,
): string | undefined => {
  const value = getValueFromWidth(width);
  if (!value) {
    return undefined;
  }
  return toRem(value);
};

/**
 * 입력받은 height에서 숫자 값을 추출하는 함수
 * @param height HeightType, MinHeightType, MaxHeightType 중 하나
 */
const getValueFromHeight = (
  height: HeightType | MinHeightType | MaxHeightType | undefined,
): number | undefined => {
  return getNumberInString(height);
};

/**
 * 입력받은 height에서 숫자 값을 추출하고, rem으로 변환하는 함수
 * @param height HeightType, MinHeightType, MaxHeightType 중 하나
 */
const getRemFromHeight = (
  height: HeightType | MinHeightType | MaxHeightType | undefined,
): string | undefined => {
  const value = getValueFromHeight(height);
  if (!value) {
    return undefined;
  }
  return toRem(value);
};

/**
 * 입력받은 pixel 값을 rem으로 변환하는 함수
 * @param px pixel
 */
const toRem = (px: number) => {
  return `${px / 10}rem`;
};

/**
 * 테이블에서 표기할 index의 값을 구하는 함수
 * @param currentPage 현재 페이지(최소 값이 1)
 * @param rowIndex 현재 페이지에서의 index 값
 * @param totalCount 전체 개수
 * @param countPerPage 한 페이지에 나타내는 항목(row)의 개수
 */
const getRowCountIndex = (
  currentPage: number,
  rowIndex: number,
  totalCount = 0,
  countPerPage: number,
): number => {
  return totalCount - rowIndex - countPerPage * (currentPage - 1);
};

const hexToRGBA = (hex: string, opacity = 1) => {
  // HEX 색상 코드에서 '#' 문자 제거
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length == 4) {
    // 3자리 HEX 코드를 처리
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length == 7) {
    // 6자리 HEX 코드를 처리
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  // RGBA 문자열 형식으로 결과 반환
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const isTargetFocus = (target: Element | null) => {
  return document.activeElement === target;
};

export const ComponentUtils = {
  setRefs,
  cn,
  getValueFromWidth,
  getRemFromWidth,
  getValueFromHeight,
  getRemFromHeight,
  toRem,
  getRowCountIndex,
  hexToRGBA,
  isTargetFocus,
};

export default ComponentUtils;
