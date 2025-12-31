import {
  DetailedHTMLProps,
  Dispatch,
  forwardRef,
  HTMLAttributes,
  PropsWithChildren,
  ReactNode,
  Ref,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { FieldValues, Path } from 'react-hook-form';
import LoadingFallback from '@design-system/components/LoadingFallback';
import Pagination, {
  PaginationProps,
} from '@design-system/components/Pagination';
import ScrollGradationWrapper from '@design-system/components/ScrollGradationWrapper';
import Tag, {
  BaseTagProps,
  ContainedProps,
  TagContentTypeEnum,
  TagTextOnlyProps,
  TagTypeEnum,
} from '@design-system/components/Tag';
import Form, { FormProps } from '@design-system/components/form/Form';
import FormTextInput from '@design-system/components/form/FormTextInput';
import LoadingSpinner, {
  LoadingSpinnerTypeEnum,
} from '@design-system/components/spinner/LoadingSpinner';
import SwitchAtom, {
  SwitchAtomProps,
  SwitchSizeEnum,
} from '@design-system/components/switch/SwitchAtom';
import { TooltipProps } from '@design-system/components/tooltip/Tooltip';
import TooltipTruncated from '@design-system/components/tooltip/TooltipTruncated';
import { IconNamesEnum } from '@design-system/constants/iconNames.enum';
import { PortalTypeEnum } from '@design-system/constants/portalType.enum';
import { UseFormMethods } from '@design-system/hooks/form/useForm';
import useRefMap from '@design-system/hooks/useRefMap';
import { theme } from '@design-system/root/tailwind.config';
import { QueryPageParams } from '@design-system/types/api.type';
import { DataQuery } from '@design-system/types/common.type';
import {
  BgColorType,
  MaxHeightType,
  MinWidthType,
  TextColorType,
  WidthType,
} from '@design-system/types/component.type';
import { ComponentUtils } from '@design-system/utils/componentUtils';
import {
  BoxButton,
  ButtonBaseProps,
  ButtonDisplayTypeEnum,
  ButtonSizeEnum,
  ContentTextType,
  DisplayOutlinedType,
  IconButtonProps,
  TextButton,
} from '@design-system/root/src';
import IconButton from '@design-system/components/button/IconButton';

export interface DataTableColumnType<
  TRowData extends FieldValues = FieldValues,
  TKeyName extends Path<TRowData> = Path<TRowData>,
> {
  key: TKeyName | string;
  title: string;
  render: (row: TRowData, rowIndex: number) => ReactNode;
  columnWidth?: WidthType;
  getBgColor?: (row: TRowData, rowIndex: number) => BgColorType | undefined;
  rightElement?: ReactNode;
  isTooltipTruncatedEnabled?: boolean;
}

/*================================================ DataTable ================================================*/
const DataTable = ({ children, dataQk }: PropsWithChildren<DataQuery>) => {
  return (
    <section className="flex w-full flex-col gap-12" data-qk={dataQk}>
      {children}
    </section>
  );
};

/*================================================ DataTable Content================================================*/
export interface DataTableContentProps<
  TRowData extends FieldValues = FieldValues,
>
  extends Pick<DataTableContentBodyProps, 'tooltipPortalType'>, DataQuery {
  dataSource?: TRowData[];
  isContentLoading: boolean;
  emptyContent: ReactNode;
  columns: DataTableColumnType<TRowData>[];
  fixedColumnIndex?: number;
  rowCountPerPage?: number;
  maxHeight?: MaxHeightType;
  minWidth?: MinWidthType;
  tdClassName?: string;
}

const defaultRowCountPerPage = 8;
const DataTableContent = <TRowData extends FieldValues = FieldValues>({
  dataSource,
  columns,
  fixedColumnIndex = 0,
  isContentLoading,
  emptyContent,
  rowCountPerPage = defaultRowCountPerPage,
  maxHeight,
  minWidth = 'min-w-1180',
  tooltipPortalType = PortalTypeEnum.TIP_POP_UP,
  dataQk,
  tdClassName,
}: DataTableContentProps<TRowData>) => {
  const [columnWidths, setColumnWidths] = useState<number[]>([]);
  const [isScrolledColumn, setIsScrolledColumn] = useState(false);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const { getOrCreate: getTableColRef } = useRefMap<
    number,
    HTMLTableCellElement
  >();
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number>();

  // 각 column 너비 계산
  useEffect(() => {
    setTimeout(() => {
      const widths = Array.from({ length: fixedColumnIndex }).map(
        (_, index) => getTableColRef(index).current?.offsetWidth ?? 0,
      );
      setColumnWidths(widths);
    }, 10);
  }, [columns]);

  // sticky handler 부착
  useEffect(() => {
    const handleScroll = () => {
      if (!tableWrapperRef.current) return;
      // 스크롤 위치에 따라 isSticky 상태 변경
      setIsScrolledColumn(tableWrapperRef.current.scrollLeft > 0);
    };
    tableWrapperRef.current?.addEventListener('scroll', handleScroll);
    return () => {
      tableWrapperRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const makeDataTableCellProps = (currentColumIndex: number) => {
    const isStickyColumn = currentColumIndex < fixedColumnIndex;
    const isStickyColumnShadow =
      currentColumIndex === fixedColumnIndex - 1 && isScrolledColumn;
    const leftPosition = columnWidths.reduce((acc, currentWidth, index) => {
      return index < currentColumIndex ? acc + currentWidth : acc;
    }, 0);

    return { isStickyColumn, isStickyColumnShadow, leftPosition };
  };

  return (
    <div className="rounded-small w-full overflow-hidden" data-qk={dataQk}>
      <ScrollGradationWrapper
        zIndex="z-table-header"
        height="h-full"
        width="w-full"
        className={ComponentUtils.cn('flex', maxHeight)}
        toSetParentHeight={rowCountPerPage === dataSource?.length}
        ref={tableWrapperRef}
      >
        <LoadingFallback
          isLoading={isContentLoading}
          fallback={
            <DataTableReplaceContent rowCountPerPage={rowCountPerPage}>
              <LoadingSpinner type={LoadingSpinnerTypeEnum.Only} />
            </DataTableReplaceContent>
          }
        >
          {dataSource?.length ? (
            <table
              className={ComponentUtils.cn(
                'rounded-small w-full table-fixed',
                minWidth,
              )}
            >
              {/* fixedColumnIndex > 0 && 'z-table-header' 코드는 LIT 시연때문에 급하게 수정된 코드입니다.
                LIT 사이트 설정 모달이 뜬후 리사이징을 하면 뒤에 있떤 데이터 테이블의 헤더가 z-index로 인해 표시 되는 현상
                https://neubilityhq.slack.com/archives/C04JL5WD97Y/p1727246603692609
               */}
              <thead
                className={ComponentUtils.cn(
                  'border-b-1 border-b-mono-100 sticky top-0 w-full',
                  fixedColumnIndex > 0 && 'z-table-header',
                )}
              >
                <tr className="w-full">
                  {columns?.map((column, columnIndex) => {
                    return (
                      <DataTableContentTitle
                        width={column.columnWidth}
                        key={column.key}
                        text={column.title}
                        ref={getTableColRef(columnIndex)}
                        rightElement={column.rightElement}
                        {...makeDataTableCellProps(columnIndex)}
                      />
                    );
                  })}
                </tr>
              </thead>
              <tbody
                className="w-full"
                onMouseOut={() => setHoveredRowIndex(undefined)}
              >
                {dataSource?.map((data, rowIndex) => {
                  return (
                    <tr
                      key={rowIndex}
                      className="border-b-1 border-b-mono-50 last:border-none"
                    >
                      {columns?.map((column, columnIndex) => {
                        return (
                          <DataTableContentBodyWrapper
                            key={column.key}
                            width={column.columnWidth}
                            isTooltipTruncatedEnabled={
                              column.isTooltipTruncatedEnabled
                            }
                            hoveredRowIndex={hoveredRowIndex}
                            currentRowIndex={rowIndex}
                            setHoveredRowIndex={setHoveredRowIndex}
                            tooltipPortalType={tooltipPortalType}
                            {...makeDataTableCellProps(columnIndex)}
                            bgColor={column.getBgColor?.(data, rowIndex)}
                            tdClassName={tdClassName}
                          >
                            {column.render(data, rowIndex)}
                          </DataTableContentBodyWrapper>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <DataTableReplaceContent rowCountPerPage={rowCountPerPage}>
              {typeof emptyContent === 'string' ? (
                <span className="text-14 text-mono-400 font-medium">
                  {emptyContent}
                </span>
              ) : (
                emptyContent
              )}
            </DataTableReplaceContent>
          )}
        </LoadingFallback>
      </ScrollGradationWrapper>
    </div>
  );
};

/*================================================ DataTable Title ================================================*/
interface DataTableContentCellProps {
  leftPosition: number;
  isStickyColumn: boolean;
  isStickyColumnShadow: boolean;
  width?: WidthType;
  rightElement?: ReactNode;
}
interface DataTableContentTitleProps extends DataTableContentCellProps {
  text: string;
  index?: number;
}

const dataTableContentCellStyle = 'h-52 min-w-80 bg-white px-16';
const dataTableHeaderCellStyle = `truncate ${dataTableContentCellStyle}`;
const DataTableContentTitle = forwardRef(
  (
    {
      text,
      isStickyColumn,
      isStickyColumnShadow,
      leftPosition,
      width,
      rightElement,
    }: DataTableContentTitleProps,
    ref: Ref<HTMLTableCellElement>,
  ) => {
    const cellRef = useRef<HTMLTableCellElement>(null);
    return (
      <>
        <TooltipTruncated
          targetElementRef={cellRef}
          message={cellRef?.current?.textContent || ''}
          portalType={PortalTypeEnum.MODAL}
        />
        <th
          ref={(r) => ComponentUtils.setRefs(r, ref, cellRef)}
          className={ComponentUtils.cn(
            dataTableHeaderCellStyle,
            'whitespace-nowrap text-left',
            isStickyColumnShadow && 'sticky-column-shadow',
            width,
          )}
          scope="col"
          style={
            isStickyColumn
              ? { position: 'sticky', left: `${leftPosition / 10}rem` }
              : {}
          }
        >
          {rightElement ? (
            <div className="flex items-center gap-4">
              <span className="text-14 text-mono-800 font-medium">{text}</span>
              {rightElement}
            </div>
          ) : (
            <span className="text-14 text-mono-800 font-medium">{text}</span>
          )}
        </th>
      </>
    );
  },
);
DataTableContentTitle.displayName = 'DataTableContentTitle';
/*================================================ DataTable ContentBody Wrapper ================================================*/
interface DataTableContentBodyProps extends DataTableContentCellProps {
  hoveredRowIndex?: number;
  currentRowIndex: number;
  setHoveredRowIndex: Dispatch<SetStateAction<number | undefined>>;
  tooltipPortalType?: TooltipProps['portalType'];
  bgColor?: BgColorType;
  isTooltipTruncatedEnabled?: boolean;
  tdClassName?: string;
}

const DataTableContentBodyWrapper = ({
  children,
  tooltipPortalType,
  isStickyColumnShadow,
  isStickyColumn,
  leftPosition,
  hoveredRowIndex,
  currentRowIndex,
  setHoveredRowIndex,
  width,
  bgColor,
  isTooltipTruncatedEnabled = true,
  tdClassName,
}: PropsWithChildren<DataTableContentBodyProps>) => {
  const cellRef = useRef<HTMLTableCellElement>(null);
  return (
    <>
      {isTooltipTruncatedEnabled && (
        <TooltipTruncated
          targetElementRef={cellRef}
          message={cellRef?.current?.textContent || ''}
          portalType={tooltipPortalType}
        />
      )}
      <td
        ref={cellRef}
        className={ComponentUtils.cn(
          dataTableContentCellStyle,
          'text-14 font-light',
          isStickyColumnShadow && 'sticky-column-shadow',
          hoveredRowIndex === currentRowIndex && 'bg-mono-100',
          width,
          bgColor,
          tdClassName,
          isTooltipTruncatedEnabled && 'truncate',
        )}
        style={
          isStickyColumn
            ? {
                position: 'sticky',
                left: `${leftPosition / 10}rem`,
                zIndex: theme.zIndex['table-content'],
              }
            : {}
        }
        onMouseOver={() => setHoveredRowIndex(currentRowIndex)}
      >
        {children}
      </td>
    </>
  );
};
/*================================================ DataTable ContentBody TextOnly ================================================*/
interface DataTableContentBodyTextProps
  extends
    DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>,
    DataQuery {
  text: string;
}
export const DataTableContentBodyText = forwardRef<
  HTMLSpanElement,
  DataTableContentBodyTextProps
>(({ text, dataQk, className, ...props }, ref) => {
  return (
    <span
      {...props}
      className={ComponentUtils.cn(
        'text-mono-700 font-size-14 whitespace-nowrap font-light',
        className,
      )}
      ref={ref}
      data-qk={dataQk}
    >
      {text}
    </span>
  );
});
DataTableContentBodyText.displayName = 'DataTableContentBodyText';
interface DataTableContentBodyTagProps extends Omit<
  BaseTagProps & TagTextOnlyProps & ContainedProps,
  'textColor' | 'contentType' | 'fontSize' | 'tagType' | 'bgColor'
> {}
export const DataTableContentBodyTag = forwardRef<
  HTMLDivElement,
  DataTableContentBodyTagProps
>(({ ...props }, ref) => {
  return (
    <Tag
      {...props}
      ref={ref}
      textColor="text-white"
      contentType={TagContentTypeEnum.TEXT_ONLY}
      fontSize="font-size-12"
      tagType={TagTypeEnum.CONTAINED}
      bgColor="bg-primary-500"
    />
  );
});
DataTableContentBodyTag.displayName = 'DataTableContentBodyTag';
/*================================================ DataTable ContentBody BoxButton ================================================*/
type DataTableContentBodyBoxButtonProps = Omit<
  ButtonBaseProps & DisplayOutlinedType & ContentTextType,
  'size' | 'textColor' | 'borderColor' | 'displayType'
>;

const DataTableContentBodyBoxButton = forwardRef<
  HTMLButtonElement,
  DataTableContentBodyBoxButtonProps
>(({ ...props }, ref) => {
  return (
    <BoxButton
      {...props}
      ref={ref}
      displayType={ButtonDisplayTypeEnum.OUTLINED}
      width="w-fit"
      size={ButtonSizeEnum.M}
      textColor="text-mono-800"
      borderColor="border-mono-300"
    />
  );
});
DataTableContentBodyBoxButton.displayName = 'DataTableContentBodyBoxButton';
/*================================================ DataTable ContentBody TextButton ================================================*/
interface DataTableContentBodyTextButtonProps extends Omit<
  ButtonBaseProps & {
    textColor?: TextColorType;
    contentWrapperClassName?: string;
    contentClassName?: string;
  } & ContentTextType,
  'size' | 'contentType'
> {}

const DataTableContentBodyTextButton = forwardRef<
  HTMLButtonElement,
  DataTableContentBodyTextButtonProps
>(({ dataQk, ...props }, ref) => {
  return (
    <TextButton {...props} ref={ref} size={ButtonSizeEnum.M} dataQk={dataQk} />
  );
});
DataTableContentBodyTextButton.displayName = 'DataTableContentBodyTextButton';
/*================================================ DataTable ContentBody IconButton ================================================*/
type DataTableContentBodyIconButtonProps = Omit<
  IconButtonProps,
  'size' | 'textColor'
>;

const DataTableContentBodyIconButton = forwardRef<
  HTMLButtonElement,
  DataTableContentBodyIconButtonProps
>(({ ...props }, ref) => {
  return (
    <IconButton
      {...props}
      ref={ref}
      size={ButtonSizeEnum.M}
      textColor="text-mono-700"
    />
  );
});
DataTableContentBodyIconButton.displayName = 'DataTableContentBodyIconButton';
/*================================================ DataTable ContentBody Switch ================================================*/
type DataTableContentBodySwitchProps = Omit<SwitchAtomProps, 'size'>;
const DataTableContentBodySwitch = forwardRef<
  HTMLInputElement,
  DataTableContentBodySwitchProps
>(({ ...props }, ref) => {
  return <SwitchAtom {...props} ref={ref} size={SwitchSizeEnum.L} />;
});
DataTableContentBodySwitch.displayName = 'DataTableContentBodySwitch';
/*================================================ DataTable Pagination ================================================*/
const DataTablePagination = ({ dataQk, ...props }: PaginationProps) => {
  return (
    <div className="flex w-full justify-center" data-qk={dataQk}>
      <Pagination {...props} dataQk={dataQk} />
    </div>
  );
};

/*================================================ DataTable Search ================================================*/
interface DataTableSearchProps<
  TFieldValues extends QueryPageParams = QueryPageParams,
>
  extends Omit<FormProps<TFieldValues>, 'formControl'>, DataQuery {
  formMethods: UseFormMethods<TFieldValues>;
  listSearchButtonText: string;
}

const DataTableSearch = <TQueryParams extends QueryPageParams>({
  formMethods,
  children,
  dataQk,
  listSearchButtonText,
  ...formProps
}: PropsWithChildren<DataTableSearchProps<TQueryParams>>) => {
  const {
    registers: { regi },
  } = formMethods;

  return (
    <Form<TQueryParams>
      formControl={formMethods}
      {...formProps}
      dataQk={dataQk}
    >
      <div className="rounded-small flex w-full flex-col gap-12 bg-white p-16">
        <FormTextInput
          {...regi('offset' as Path<TQueryParams>)}
          wrapperClassName="hidden"
        />
        <FormTextInput
          {...regi('limit' as Path<TQueryParams>)}
          wrapperClassName="hidden"
        />
        <div className="flex w-full flex-wrap gap-24">{children}</div>
        <div className="h-46 flex w-full items-end justify-start">
          <BoxButton
            type="submit"
            displayType={ButtonDisplayTypeEnum.CONTAINED}
            size={ButtonSizeEnum.L}
            textColor="text-white"
            bgColor="bg-mono-800"
            text={listSearchButtonText}
            iconNameLeft={IconNamesEnum.Search}
            dataQk={`${dataQk}-submit-button`}
          />
        </div>
      </div>
    </Form>
  );
};

/*================================================ DataTable Replace ================================================*/
interface DataTableReplaceContentProps {
  rowCountPerPage: number;
}

const DataTableReplaceContent = ({
  rowCountPerPage,
  children,
}: PropsWithChildren<DataTableReplaceContentProps>) => {
  return (
    <div
      className="flex w-full items-center justify-center bg-white"
      style={{ height: `${((rowCountPerPage + 1) * 52) / 10}rem` }}
    >
      {children}
    </div>
  );
};

DataTable.Content = DataTableContent;
DataTable.ContentBodyText = DataTableContentBodyText;
DataTable.ContentBodyTag = DataTableContentBodyTag;
DataTable.ContentBodyBoxButton = DataTableContentBodyBoxButton;
DataTable.ContentBodyTextButton = DataTableContentBodyTextButton;
DataTable.ContentBodyIconButton = DataTableContentBodyIconButton;
DataTable.ContentBodySwitch = DataTableContentBodySwitch;
DataTable.Pagination = DataTablePagination;
DataTable.Search = DataTableSearch;

export default DataTable;
