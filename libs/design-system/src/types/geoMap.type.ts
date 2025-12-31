import { PrimitiveType } from '@design-system/root/src';
export type GoogleLatLngType =
  | google.maps.LatLng
  | google.maps.LatLngLiteral
  | google.maps.LatLngAltitudeLiteral;
export type GeoLatLngType = {
  lat: number;
  lng: number;
};
export type GeoFeatureTagsType = Record<string, PrimitiveType>;
export type GeoFeaturePointPropertyType = {
  id: number;
  type: 'node';
  tags?: GeoFeatureTagsType;
};
export type GeoFeatureLineStringPropertyType = {
  id: number;
  type: 'way';
  nodes: number[];
  tags?: GeoFeatureTagsType;
};

export const GeoMapZoomLevel = {
  // 맵 최소 zoom
  MIN: 6,
  // 일반 사이트 zoom
  NORMAL: 16,
  // vworld 권장 최대 zoom
  TILE_256_IMG_MAX: 19,
  // vworld 확대 최대 zoom
  TILE_256_MAX: 19.5,
  // Tile 사이즈를 512로 바꾼 Vworld 최소 줌
  TILE_512_MIN: 20,
  // Tile 사이즈를 512로 바꾼 Vworld 확대 최대 줌
  TILE_512_MAX: 20.5,
  // Tile 사이즈를 1024로 바꾼 Vworld 최소 줌
  TILE_1024_MIN: 21,
  // Tile 사이즈를 1024로 바꾼 Vworld 확대 최대 줌
  TILE_1024_MAX: 21.5,
  // Tile 사이즈를 2048로 바꾼 Vworld 최소 줌
  TILE_2048_MIN: 22,
  // Tile 사이즈를 2048로 바꾼 Vworld 확대 최대 줌
  TILE_2048_MAX: 22.5,
  // Tile 사이즈를 4096 바꾼 Vworld 최소 줌
  TILE_4096_MIN: 23,
  // Tile 사이즈를 4096 바꾼 Vworld 확대 최대 줌
  TILE_4096_MAX: 23.5,
} as const;

export const GEO_MAP_ZOOM_LEVEL_DEFAULT = GeoMapZoomLevel.TILE_256_MAX;

export enum ForeignStatusEnum {
  DOMESTIC = 'domestic',
  FOREIGN = 'foreign',
  PENDING = 'pending',
}

export enum ZoomTypeEnum {
  TILE_256 = 'TILE_256',
  TILE_512 = 'TILE_512',
  TILE_1024 = 'TILE_1024',
  TILE_2048 = 'TILE_2048',
  TILE_4096 = 'TILE_4096',
}

export enum GeoMapTypeIdEnum {
  KOREA_BASE_MAP = 'vworldBase',
  KOREA_SATELLITE_MAP = 'vworldSatellite',
  ZOOM_20_KOREA_BASE_MAP = 'zoom20VworldBase',
  ZOOM_20_KOREA_SATELLITE_MAP = 'zoom20VworldSatellite',
  ZOOM_21_KOREA_BASE_MAP = 'zoom21VworldBase',
  ZOOM_21_KOREA_SATELLITE_MAP = 'zoom21VworldSatellite',
  ZOOM_22_KOREA_BASE_MAP = 'zoom22VworldBase',
  ZOOM_22_KOREA_SATELLITE_MAP = 'zoom22VworldSatellite',
  ZOOM_23_KOREA_BASE_MAP = 'zoom23VworldBase',
  ZOOM_23_KOREA_SATELLITE_MAP = 'zoom23VworldSatellite',
  FOREIGN_BASE_MAP = 'base',
  FOREIGN_SATELLITE_MAP = 'satellite',
}

/**
 * 구글 맵의 타입
 */
export enum GeoMapTypeEnum {
  // 일반
  ROADMAP = 'roadmap',
  // 위성
  SATELLITE = 'satellite',
}

/**
 * 지도 타입 이미지
 */
export enum GeoMapTypeImageEnum {
  VWORLD = 'VWORLD',
  GOOGLE = 'GOOGLE',
}

export enum GeometryTypeEnum {
  Feature = 'Feature',
  Point = 'Point',
  MultiPoint = 'MultiPoint',
  LineString = 'LineString',
  MultiLineString = 'MultiLineString',
  Polygon = 'Polygon',
  MultiPolygon = 'MultiPolygon',
  FeatureCollection = 'FeatureCollection',
  GeometryCollection = 'GeometryCollection',
}

export enum MarkerEnum {
  POINT = 'POINT',
  ROBOT = 'ROBOT',
  NODE = 'NODE',
  MOBILE_NODE = 'MOBILE_NODE',
  STATION = 'STATION',
  // 좌표 관리 페이지에서 지도 클릭시 나타나는 노드
  CLICK_NODE = 'CLICK_NODE',
  // 커스텀 시나리오 때 보여지는 노드
  CUSTOM_NODE = 'CUSTOM_NODE',
  BASE = 'BASE',
  ROBOT_LOCATION = 'ROBOT_LOCATION',
  MOBILE_PATH_WAY_START = 'MOBILE_PATH_WAY_START',
  MOBILE_PATH_CURRENT_WAY_START = 'MOBILE_PATH_CURRENT_WAY_START',
  // 편집시 보여지는 노드
  EDIT_NODE = 'EDIT_NODE',
  PRE_NODE = 'PRE_NODE',
  END_NODE = 'END_NODE',
  SEGMENTAL_NODE = 'SEGMENTAL_NODE',
  /**
   * 코스 생성 및 수정시 보여지는 노드
   */
  NODE_COURSE = 'NODE_COURSE',
  EDIT_ROBOT_LOCATION = 'EDIT_ROBOT_LOCATION',
  ARROW = 'ARROW',
  EDIT_TOOL_BOX = 'EDIT_TOOL_BOX',
  // 사고 다발 구역
  ACCIDENT_ZONE = 'ACCIDENT_ZONE',
  // 마커를 안보이도록 하기
  NONE = 'NONE',
}

export enum PolylineEnum {
  DRIVING_PATH = 'DRIVING_PATH',
  CURRENT_PATH = 'CURRENT_PATH',
  GLOBAL_PATH = 'GLOBAL_PATH',
  CUSTOM_PATH = 'CUSTOM_PATH',
  MOBILE_REAL_TIME_PATH = 'MOBILE_REAL_TIME_PATH',
  MOBILE_PREV_PATH = 'MOBILE_PREV_PATH',
  EDIT_PATH = 'EDIT_PATH',
}

export enum GeoEventPositionEnum {
  DRAG_START = 'DRAG_START',
  DRAG_BEFORE = 'DRAG_BEFORE',
}

export type GeoMapBoundsType = google.maps.LatLngBoundsLiteral;

export type CoordinateType = {
  latitude: number;
  longitude: number;
};
