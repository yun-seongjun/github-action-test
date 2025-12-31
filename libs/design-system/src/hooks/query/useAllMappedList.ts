import { useEffect, useState } from 'react';
import { QueryKey, UseQueryResult } from '@tanstack/react-query';
import { FieldValues, Path } from 'react-hook-form';
import {
  PaginatedResDataType,
  QueryPageParams,
} from '@design-system/types/api.type';

export interface UseAllArrayListProps<
  TResElement extends FieldValues,
  TQueryParams extends QueryPageParams = QueryPageParams,
> {
  queryFn: (
    queryParams: TQueryParams,
    options?: { query: { enabled?: boolean } } | undefined,
  ) => UseQueryResult<
    PaginatedResDataType<TResElement> | undefined,
    unknown
  > & { queryKey: QueryKey };
  queryParams?: TQueryParams;
  enabled?: boolean;
  key: Path<TResElement>;
}

const useAllMappedList = <
  TResElement extends FieldValues,
  TQueryParams extends QueryPageParams = QueryPageParams,
>({
  queryFn,
  queryParams,
  enabled,
  key,
}: UseAllArrayListProps<TResElement, TQueryParams>) => {
  const { data, ...response } = queryFn(
    { offset: 0, limit: 99999, ...(queryParams ?? {}) } as TQueryParams,
    {
      query: { enabled },
    },
  );

  const [dataMap, setDataMap] = useState<
    Map<TResElement[keyof TResElement], TResElement[]>
  >(new Map());

  useEffect(() => {
    if (data?.results) {
      const newMap = new Map();

      data.results.forEach((item) => {
        const keyValue = item[key];
        const currentItem = newMap.get(keyValue) ?? [];
        newMap.set(keyValue, [...currentItem, item]);
      });
      setDataMap(newMap);
    }
  }, [data?.results]);

  const getValue = (
    keyName: TResElement[keyof TResElement],
  ): TResElement[] | null => {
    const value = dataMap.get(keyName);
    return value ? value : null;
  };

  return {
    data,
    getValue,
    ...response,
  };
};

export default useAllMappedList;
