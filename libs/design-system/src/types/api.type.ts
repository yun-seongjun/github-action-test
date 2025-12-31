import { FieldValues } from 'react-hook-form';
import { AxiosRequestConfig } from 'axios';

export interface PaginatedResDataType<TDataSourceElement> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: TDataSourceElement[];
}

export interface QueryPageParams extends FieldValues {
  limit?: number;
  offset?: number;
}

export type CustomInstanceType = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
) => Promise<T>;
