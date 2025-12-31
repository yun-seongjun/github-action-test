export type ArrayOrElement<TArray> = TArray extends (infer TElement)[]
  ? TElement
  : TArray;

/**
 * T1과 T2의 교집합 타입
 */
export type IntersectionType<T1 extends object, T2 extends object> = Pick<
  T1 & T2,
  Extract<keyof T1, keyof T2>
>;

export type PrimitiveType =
  | number
  | string
  | boolean
  | null
  | undefined
  | bigint
  | symbol;

/**
 * @sample
 * interface Campaign {
 *   id: string
 *   attributeValues: {
 *     optionalAttributes: string[]
 *     mandatoryAttributes: string[]
 *     values?: { [key: string]: unknown }
 *   }
 * }
 *
 * type CampaignForm = ChangeFields<Campaign, {
 *   attributeValues: Omit<Campaign['attributeValues'], 'mandatoryAttributes'|'optionalAttributes'>
 * }>;
 *
 * const form: CampaignForm = {
 *   id: '123',
 *   attributeValues: {
 *     values: { '1': 1 }
 *   }
 * }
 */
export type ChangeFields<T, R> = Omit<T, keyof R> & R;

/**
 * XOR<T, U>는 T와 U 타입이 동시에 존재하지 않도록 만드는 유틸리티 타입입니다.
 *
 * @sample
 * interface UseGlobalPathPropsBase {
 *   layerId?: number
 *   nextGeoMapControl: NextGeoMapControl
 * }
 *
 * interface WithGeoJsonUrl extends UseGlobalPathPropsBase {
 *   geoJsonUrl: string | null | undefined
 *   injectedGeoJson?: never
 * }
 *
 * interface WithInjectedGeoJson extends UseGlobalPathPropsBase {
 *   geoJsonUrl?: never
 *   injectedGeoJson: FeatureCollection<Geometry, GeoJsonProperties>
 * }
 *
 * type UseGlobalPathProps = XOR<WithGeoJsonUrl, WithInjectedGeoJson>
 */
export type XOR<T, U> = T | U extends object
  ? (T extends U ? never : T) | (U extends T ? never : U)
  : T | U;

export type NullableProperties<T> = {
  [K in keyof T]: T[K] | null;
};

export type NullablePartial<T> = {
  [K in keyof T]?: T[K] | null;
};
