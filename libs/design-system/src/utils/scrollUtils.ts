export enum ScrollToVisibleOptionEnum {
  /**
   * 항상 스크롤 이동
   */
  ALWAYS = 'ALWAYS',
  /**
   * Item의 일부가 안보이는 경우, 스크롤 이동
   */
  SOME_NOT_VISIBLE = 'SOME_NOT_VISIBLE',
  /**
   * Item이 전부 안보이는 경우, 스크롤 이동. 즉, 일부만 보이는 경우에는 스크롤 안함
   */
  ALL_NOT_VISIBLE = 'ALL_NOT_VISIBLE',
}

export enum ScrollBehaviorOptionEnum {
  SMOOTH = 'smooth',
  AUTO = 'auto',
}

/**
 * 스크롤 이동 옵션
 * @param visibleOption - 스크롤 이동 조건. @see {@link ScrollToVisibleOptionEnum}
 * @param behavior - 스크롤 이동 방식 @see {@link ScrollBehaviorOptionEnum}
 * @example
 *
 *               paddingTop(-인 경우)
 *          paddingScrollToTop(-인 경우)
 *  ┌────────────────Wrapper─────────────────┐
 *  │           paddingTop(+인 경우)           │
 *  │       paddingScrollToTop(+인 경우)       │
 *  │                                        │
 *  │       ┌────────────────────────┐       │
 *  │       │                        │       │
 *  │       │          Item          │       │
 *  │       │                        │       │
 *  │       └────────────────────────┘       │
 *  │                                        │
 *  │     paddingScrollToBottom(+인 경우)      │
 *  │          paddingBottom(+인 경우)         │
 *  └────────────────────────────────────────┘
 *             paddingBottom(-인 경우)
 *        paddingScrollToBottom(-인 경우)
 */
interface ScrollOptions {
  /**
   * 스크롤 이동 조건
   */
  visibleOption?: ScrollToVisibleOptionEnum;
  /**
   * 스크롤 이동 방식
   */
  behavior?: ScrollBehaviorOptionEnum;
  /**
   * Item이 Wrapper에 보여지는지 확인하기 위해 판단할 때 사용하는 상단 padding 값
   * 단위: px
   */
  paddingTop?: number;
  /**
   * Item이 Wrapper에 보여지는지 확인하기 위해 판단할 때 사용하는 하단 padding 값
   * 단위: px
   */
  paddingBottom?: number;
  /**
   * Item을 Wrapper의 상단으로 스크롤시 추가로 이동할 padding 값
   * 단위: px
   */
  paddingScrollToTop?: number;
  /**
   * Item을 Wrapper의 하단으로 스크롤시 추가로 이동할 padding 값
   * 단위: px
   */
  paddingScrollToBottom?: number;
}

/**
 * item을 wrapper의 상단에 위치하도록 스크롤 이동
 * @param wrapper item을 감싸고 있는 HTMLElement. 스크롤이 가능해야 함
 * @param item wrapper 내부에 위치하고 있는 HTMLElement
 * @param options @see {@link ScrollOptions}
 */
const scrollToTop = (
  wrapper: HTMLElement | undefined | null,
  item: HTMLElement | undefined | null,
  options?: ScrollOptions,
) => {
  if (!wrapper || !item) {
    return;
  }
  const {
    visibleOption = ScrollToVisibleOptionEnum.ALWAYS,
    behavior,
    paddingTop = 0,
    paddingBottom = 0,
    paddingScrollToTop = 0,
  } = options || {};

  const top = item.offsetTop - wrapper.offsetTop;
  const bottom = top + item.clientHeight;
  const isAllVisible =
    top - paddingTop >= wrapper.scrollTop &&
    bottom + paddingBottom <= wrapper.scrollTop + wrapper.clientHeight;

  if (
    (visibleOption === ScrollToVisibleOptionEnum.SOME_NOT_VISIBLE &&
      isAllVisible) ||
    (visibleOption === ScrollToVisibleOptionEnum.ALL_NOT_VISIBLE &&
      !isAllVisible)
  ) {
    return;
  }
  wrapper.scrollTo({ top: top - paddingScrollToTop, behavior: behavior });
};

/**
 * item을 wrapper의 하단에 위치하도록 스크롤 이동
 * @param wrapper item을 감싸고 있는 HTMLElement. 스크롤이 가능해야 함
 * @param item wrapper 내부에 위치하고 있는 HTMLElement
 * @param options @see {@link ScrollOptions}
 */
const scrollToBottom = (
  wrapper: HTMLElement | undefined | null,
  item: HTMLElement | undefined | null,
  options?: ScrollOptions,
) => {
  if (!wrapper || !item) {
    return;
  }
  const {
    visibleOption = ScrollToVisibleOptionEnum.ALWAYS,
    behavior,
    paddingTop = 0,
    paddingBottom = 0,
    paddingScrollToBottom = 0,
  } = options || {};

  const top = item.offsetTop - wrapper.offsetTop;
  const bottom = top + item.clientHeight;
  const isAllVisible =
    top - paddingTop >= wrapper.scrollTop &&
    bottom + paddingBottom <= wrapper.scrollTop + wrapper.clientHeight;

  if (
    (visibleOption === ScrollToVisibleOptionEnum.SOME_NOT_VISIBLE &&
      isAllVisible) ||
    (visibleOption === ScrollToVisibleOptionEnum.ALL_NOT_VISIBLE &&
      !isAllVisible)
  ) {
    return;
  }
  wrapper.scrollTo({
    top: bottom - wrapper.clientHeight + paddingScrollToBottom,
    behavior: behavior,
  });
};

export const ScrollUtils = {
  scrollToTop,
  scrollToBottom,
};
