declare module 'react-js-pagination' {
  import { Component, ReactNode } from 'react';

  interface ReactJsPaginationProps {
    totalItemsCount: number;
    onChange: (pageNumber: number) => void;
    activePage: number;
    itemsCountPerPage?: number;
    pageRangeDisplayed?: number;
    prevPageText?: ReactNode;
    nextPageText?: ReactNode;
    firstPageText?: ReactNode;
    lastPageText?: ReactNode;
    innerClass?: string;
    itemClass?: string;
    activeClass?: string;
    disabledClass?: string;
    linkClass?: string;
    activeLinkClass?: string;
    hideDisabled?: boolean;
    hideNavigation?: boolean;
    hideFirstLastPages?: boolean;
    linkClassFirst?: string;
    linkClassPrev?: string;
    linkClassNext?: string;
    linkClassLast?: string;
    itemClassFirst?: string;
    itemClassPrev?: string;
    itemClassNext?: string;
    itemClassLast?: string;
    getPageUrl?: (pageNumber: number) => string;
    [key: string]: unknown;
  }

  export default class Pagination extends Component<ReactJsPaginationProps> {}
}