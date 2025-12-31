import ReactJsPagination from 'react-js-pagination';
import Icon from '@design-system/components/common/Icon';
import { IconNamesEnum } from '@design-system/constants/iconNames.enum';
import { DataQuery } from '@design-system/types//common.type';
import { ComponentUtils } from '@design-system/utils//componentUtils';

export interface PaginationProps extends DataQuery {
  totalCount?: number;
  countPerPage: number;
  pageNumber: number;
  onPageChange(pageNumber: number): void;
}

const Pagination = ({
  onPageChange,
  countPerPage,
  pageNumber,
  totalCount,
  dataQk,
}: PaginationProps) => {
  const notCurrentPageHoverStyle = 'hover:bg-mono-100 active:bg-mono-300';
  const currentPageHoverStyle = 'hover:!bg-mono-800 active:!bg-mono-800';
  const iconStyle = ComponentUtils.cn(
    'h-20 w-20 rounded-extra-small',
    notCurrentPageHoverStyle,
  );

  if (!totalCount) {
    return null;
  }

  return (
    <ReactJsPagination
      data-qk={dataQk}
      innerClass="h-36 w-auto flex justify-between items-center text-center font-size-12 font-bold gap-16"
      itemClass={ComponentUtils.cn(
        'flex justify-center items-center w-auto px-8 h-20 rounded-extra-small',
        notCurrentPageHoverStyle,
      )}
      activeClass={ComponentUtils.cn(
        'bg-mono-800 text-white',
        currentPageHoverStyle,
      )}
      disabledClass="text-mono-300 pointer-events-none"
      prevPageText={
        <Icon
          name={IconNamesEnum.ChevronLeft}
          className={iconStyle}
          dataQk={`${dataQk}-prev-move-button`}
        />
      }
      firstPageText={
        <Icon
          name={IconNamesEnum.ChevronLeftDouble}
          className={iconStyle}
          dataQk={`${dataQk}-first-move-button`}
        />
      }
      nextPageText={
        <Icon
          name={IconNamesEnum.ChevronRight}
          className={iconStyle}
          dataQk={`${dataQk}-next-move-button`}
        />
      }
      lastPageText={
        <Icon
          name={IconNamesEnum.ChevronRightDouble}
          className={iconStyle}
          dataQk={`${dataQk}-last-move-button`}
        />
      }
      itemsCountPerPage={countPerPage}
      pageRangeDisplayed={5}
      totalItemsCount={totalCount}
      onChange={onPageChange}
      activePage={pageNumber}
    />
  );
};

export default Pagination;
