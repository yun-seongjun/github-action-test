/**
 * Element를 선택하기 위한 Query Interface
 */
export interface DataQuery {
  /**
   * Data Query Key
   */
  dataQk?: string;
}

export type Nullable<T> = T | null;
export type Nullish<T> = T | null | undefined;
