import { useCallback, useEffect, useState } from 'react';
import {
  QueryKey,
  type UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { FieldValues, Path, PathValue } from 'react-hook-form';
import {
  CustomInstanceType,
  PaginatedResDataType,
  QueryPageParams,
} from '@design-system/types';
import { COUNT_PER_PAGE_DEFAULT } from '@design-system/constants';
import useForm from '@design-system/hooks/form/useForm';
import useStateRef from '@design-system/hooks/useStateRef';
import DataUtils from '@design-system/utils/dataUtils';

const SEARCH_PARAMS_KEY = 'search-params';

export type GetRowCountIndexType = (rowIndex: number) => number;

export enum DataTableOrderTypeEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

enum ParamsTypeEnum {
  QUERY = 'query',
  SUB = 'sub',
}

export enum SubParamsTypeEnum {
  IS_SUBMITTED = 'isSubmitted',
}

const calculateOffset = (pageIndex: number, countPerPage: number): number => {
  return pageIndex * countPerPage;
};

type SecondParameter<T extends (...args: any) => any> = Parameters<T>[1];

type FetchOptionsType<TDataSourceElement> =
  | {
      query?:
        | UseQueryOptions<PaginatedResDataType<TDataSourceElement>>
        | undefined;
      request?: SecondParameter<CustomInstanceType>;
    }
  | undefined;

type SubParamsTypeEnumValueType =
  (typeof SubParamsTypeEnum)[keyof typeof SubParamsTypeEnum];

interface UseDataTableProps<
  TDataSourceElement extends FieldValues,
  TQueryParams extends QueryPageParams = QueryPageParams,
  TSubParams extends Record<string | SubParamsTypeEnumValueType, any> = Record<
    string | SubParamsTypeEnumValueType,
    any
  >,
> {
  queryFn: (
    queryParams: TQueryParams,
    options?: FetchOptionsType<TDataSourceElement>,
  ) => UseQueryResult<
    PaginatedResDataType<TDataSourceElement> | undefined,
    unknown
  > & { queryKey: QueryKey };
  isQueryPageParamsEnabled?: boolean;
  queryPageParamsDefaultValues?: TQueryParams;
  countPerPageDefault?: number;
  pageNumberDefault?: number;
  orderType?: DataTableOrderTypeEnum;
  options?: FetchOptionsType<TDataSourceElement>;
  subParamsDefault?: TSubParams;
}

/**
 * DataTable
 * @param queryFn 데이터를 요청하기 위한 함수. 예: useUsersList
 * @param queryDefaultValues query page params의 기본값
 * @param countPerPageDefault 한 페이지에 보여줄 row의 개수
 * @param pageNumberDefault 페이지의 기본 값. 1베이스
 * @param orderType 정렬 방법
 */
const useDataTable = <
  TDataSourceElement extends FieldValues,
  TQueryPageParams extends QueryPageParams = QueryPageParams,
  TSubParams extends Record<string | SubParamsTypeEnumValueType, any> = Record<
    string | SubParamsTypeEnumValueType,
    any
  >,
>({
  queryFn,
  isQueryPageParamsEnabled = true,
  queryPageParamsDefaultValues,
  countPerPageDefault = COUNT_PER_PAGE_DEFAULT,
  pageNumberDefault = 1,
  orderType = DataTableOrderTypeEnum.DESC,
  options,
  subParamsDefault,
}: UseDataTableProps<TDataSourceElement, TQueryPageParams>) => {
  const formMethods = useForm<TQueryPageParams>();
  const { reset, getValues, setValue, watch } = formMethods;
  const [queryParams, setQueryParams] = useState<TQueryPageParams>();
  const [subParams, setSubParams, getSubParamsValue] =
    useStateRef<TSubParams>();
  const countPerPage = Number(watch('limit' as Path<TQueryPageParams>));
  const pageIndex =
    Number(watch('offset' as Path<TQueryPageParams>)) / countPerPage;
  const pageNumber = pageIndex + 1;
  const response = queryFn(queryParams || ({} as TQueryPageParams), {
    ...options,
    query: { enabled: options?.query?.enabled !== false && !!queryParams },
  });
  const { data, isLoading } = response;
  const [dataCountLatest, setDataCountLatest] = useState<number>(0);
  const queryResultList = data?.results ?? ([] as TDataSourceElement[]);
  const { isReady, replace, pathname, query } = useRouter();
  // 페이지 진입 후 1회 이상 검색을 했는지 여부(새로고침 후에도 유지)
  const isSubmitted = !!subParams?.[SubParamsTypeEnum.IS_SUBMITTED];

  const updateQueryParams = (
    queryParamsNew: TQueryPageParams,
    subParamsNew: TSubParams | undefined,
  ) => {
    const _queryParamsNew =
      DataUtils.excludeNullOrUndefinedOrEmptyStringProperty(
        queryParamsNew,
      ) as TQueryPageParams;
    setQueryParams(_queryParamsNew);
    const _subParamsNew = subParamsNew
      ? (DataUtils.excludeNullOrUndefinedOrEmptyStringProperty(
          subParamsNew,
        ) as TSubParams)
      : undefined;
    setSubParams(subParamsNew);
    if (isQueryPageParamsEnabled) {
      const queryParamsJsonString = JSON.stringify({
        [ParamsTypeEnum.QUERY]: _queryParamsNew,
        [ParamsTypeEnum.SUB]: _subParamsNew,
      });
      replace(
        {
          pathname,
          query: { ...query, [SEARCH_PARAMS_KEY]: queryParamsJsonString },
        },
        undefined,
        {
          shallow: true,
        },
      );
    }
  };

  type ParamsType = {
    [ParamsTypeEnum.QUERY]: TQueryPageParams;
    [ParamsTypeEnum.SUB]: TSubParams;
  };

  useEffect(() => {
    if (!isLoading) {
      setDataCountLatest(data?.count ?? 0);
    }
  }, [data?.count, isLoading]);
  const totalCount = data?.count ?? dataCountLatest;

  useEffect(() => {
    if (isReady) {
      const getParams = (): ParamsType => {
        try {
          const queryString = query[SEARCH_PARAMS_KEY];
          const searchParams = queryString ? String(queryString) : undefined;
          if (searchParams) {
            return JSON.parse(searchParams) as ParamsType;
          }
        } catch (e) {
          console.error('useTable, getQueryParams', e);
        }
        return {
          [ParamsTypeEnum.QUERY]: {
            limit: countPerPageDefault,
            offset: calculateOffset(pageNumberDefault - 1, countPerPageDefault),
            ...(queryPageParamsDefaultValues ?? ({} as TQueryPageParams)),
          } as TQueryPageParams,
          [ParamsTypeEnum.SUB]: subParamsDefault as TSubParams,
        };
      };

      const { query: _queryParams, sub: _subParams } = getParams();
      reset(_queryParams);
      updateQueryParams(_queryParams, _subParams);
    }
  }, [isReady]);

  const _setPageIndex = useCallback(
    (pageIndexNew: number) => {
      const offset = calculateOffset(
        pageIndexNew,
        countPerPage || countPerPageDefault,
      );
      setValue(
        'offset' as Path<TQueryPageParams>,
        offset as PathValue<TQueryPageParams, Path<TQueryPageParams>>,
      );
      return offset;
    },
    [countPerPage, setValue, getValues],
  );

  const fetchQuery = useCallback(
    (params: TQueryPageParams, isFetchFirstPage = true) => {
      let paramsNew = params;
      if (isFetchFirstPage) {
        const offset = _setPageIndex(0);
        paramsNew = { ...paramsNew, offset };
      }
      const subParamsValue: TSubParams =
        getSubParamsValue() || ({} as TSubParams);
      if (!(SubParamsTypeEnum.IS_SUBMITTED in subParamsValue)) {
        subParamsValue[SubParamsTypeEnum.IS_SUBMITTED as keyof TSubParams] =
          true as TSubParams[keyof TSubParams];
      }

      updateQueryParams(paramsNew, subParamsValue);
    },
    [_setPageIndex],
  );

  const setPageIndex = useCallback(
    (pageIndexNew: number, doFetchQuery = true) => {
      _setPageIndex(pageIndexNew);
      doFetchQuery && fetchQuery(getValues(), false);
    },
    [_setPageIndex, getValues, fetchQuery],
  );

  const setPageNumber = useCallback(
    (pageNumberNew: number, doRequestQuery = true) => {
      setPageIndex(pageNumberNew - 1, doRequestQuery);
    },
    [setPageIndex],
  );

  const setCountPerPage = useCallback(
    (countPerPageNew: number, doFetchQuery = true) => {
      setValue(
        'limit' as Path<TQueryPageParams>,
        countPerPageNew as PathValue<TQueryPageParams, Path<TQueryPageParams>>,
      );
      doFetchQuery && fetchQuery(getValues(), false);
    },
    [setValue, getValues, fetchQuery],
  );

  const setFormValue = useCallback(
    (
      name: Path<TQueryPageParams>,
      value: PathValue<TQueryPageParams, Path<TQueryPageParams>>,
      doFetchQuery = true,
    ) => {
      setValue(name, value);
      doFetchQuery && fetchQuery(getValues(), false);
    },
    [setValue, fetchQuery],
  );

  const getRowCountIndex: GetRowCountIndexType = (rowIndex: number) => {
    const indexStart = countPerPage * pageIndex;
    switch (orderType) {
      case DataTableOrderTypeEnum.ASC:
        return indexStart + rowIndex + 1;
      case DataTableOrderTypeEnum.DESC:
        return totalCount - indexStart - rowIndex;
    }
  };

  return {
    ...response,
    fetchQuery,
    formMethods,
    countPerPage,
    pageIndex,
    setPageIndex,
    pageNumber,
    setPageNumber,
    setCountPerPage,
    setFormValue,
    queryResultList,
    totalCount,
    getRowCountIndex,
    queryParams,
    subParams,
    setSubParams,
    isSubmitted,
  };
};

export default useDataTable;
