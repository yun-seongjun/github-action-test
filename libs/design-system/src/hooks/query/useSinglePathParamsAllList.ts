import { QueryKey, UseQueryResult } from '@tanstack/react-query';
import { FieldValues } from 'react-hook-form';
import { PaginatedResDataType, QueryPageParams } from '@design-system/types';

export interface UseSinglePathParamsAllListProps<
  TResElement extends FieldValues,
  TQueryParams extends QueryPageParams = QueryPageParams,
  TPathParams extends number = number,
> {
  pathParamId: TPathParams;
  queryFn: (
    pathParamId: TPathParams,
    queryParams: TQueryParams,
    options?: { query: { enabled?: boolean } } | undefined,
  ) => UseQueryResult<
    PaginatedResDataType<TResElement> | undefined,
    unknown
  > & { queryKey: QueryKey };
  queryParams?: TQueryParams;
  enabled?: boolean;
}

const useSinglePathParamsAllList = <
  TResElement extends FieldValues,
  TQueryParams extends QueryPageParams = QueryPageParams,
  TPathParams extends number = number,
>({
  queryFn,
  pathParamId,
  queryParams,
  enabled,
}: UseSinglePathParamsAllListProps<TResElement, TQueryParams, TPathParams>) => {
  const { data, ...response } = queryFn(
    pathParamId,
    { offset: 0, limit: 99999, ...(queryParams ?? {}) } as TQueryParams,
    {
      query: { enabled },
    },
  );

  return {
    list: data?.results || [],
    count: data?.count || 0,
    ...response,
  };
};

export default useSinglePathParamsAllList;
