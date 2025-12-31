import { FeatureCollection, Position, Feature } from 'geojson';
import GeoNode from '@design-system/geo-map/feature/GeoNode';
import {
  CoordinateType,
  GeoLatLngType,
  GeoMapBoundsType,
  GeoMapTypeEnum,
  GeoMapTypeIdEnum,
  GeoMapTypeImageEnum,
  GeoMapZoomLevel,
  GeometryTypeEnum,
  GoogleLatLngType,
  ZoomTypeEnum,
} from '@design-system/types/geoMap.type';
import DataUtils from '@design-system/utils/dataUtils';
import EnvUtils from '@design-system/utils/envUtils';
import { TypeUtils } from '@design-system/utils/typeUtils';
import IdGenerator from '@design-system/utils/geo-map/IdGenerator';
import NativeBridgeAction from '@design-system/utils/native-bridge/NativeBridgeAction';
import { BrowserUtils } from '@design-system/utils';
import { NullablePartial } from '@design-system/types';
import { TagClassValueEnum } from '@design-system/root/src';

export interface ScreenPosition {
  x: number;
  y: number;
}

const _isLatLngAltitudeLiteral = (
  obj: any,
): obj is google.maps.LatLngAltitudeLiteral => {
  return (
    'altitude' in obj &&
    typeof obj.lat === 'number' &&
    typeof obj.lng === 'number'
  );
};

const getPath = (nodes: GeoNode[]) => {
  return nodes.reduce((result, node) => {
    const latLng = node.getPosition();
    if (latLng) {
      result.push(latLng);
    }
    return result;
  }, [] as GeoLatLngType[]);
};

/**
 * 중심 좌표 구하기
 *
 * @param latLngList
 */
const getCenterLatLng = (...latLngList: GeoLatLngType[]): GeoLatLngType => {
  const latLngBounds = new google.maps.LatLngBounds();
  latLngList.forEach((latLng) => {
    latLng && latLngBounds.extend(latLng);
  });
  return toLatLng(latLngBounds.getCenter());
};

const getCenterLng = (lng1: number, lng2: number) => {
  const tempPoint1 = new google.maps.LatLng(0, lng1); // 위도가 없는 가상의 지점 생성
  const tempPoint2 = new google.maps.LatLng(0, lng2); // 위도가 없는 가상의 지점 생성
  const tempMidPoint = google.maps.geometry.spherical.interpolate(
    tempPoint1,
    tempPoint2,
    0.5,
  );
  return tempMidPoint.lng();
};

const getCenterLat = (lat1: number, lat2: number) => {
  const tempPoint1 = new google.maps.LatLng(lat1, 0); // 위도가 없는 가상의 지점 생성
  const tempPoint2 = new google.maps.LatLng(lat2, 0); // 위도가 없는 가상의 지점 생성
  const tempMidPoint = google.maps.geometry.spherical.interpolate(
    tempPoint1,
    tempPoint2,
    0.5,
  );
  return tempMidPoint.lng();
};

const isLatLngEquals = (
  latLng1: GeoLatLngType,
  latLng2: GeoLatLngType,
): boolean => {
  return latLng1.lat === latLng2.lat && latLng1.lng === latLng2.lng;
};

const toLatLngFromCoordinate = (coordinates: Position): GeoLatLngType => {
  return { lat: coordinates[1], lng: coordinates[0] };
};

const toLatLng = (latlng: GoogleLatLngType): GeoLatLngType => {
  if (latlng instanceof google.maps.LatLng) {
    return {
      lat: latlng.lat(),
      lng: latlng.lng(),
    };
  }
  if (_isLatLngAltitudeLiteral(latlng)) {
    return {
      lat: latlng.lat,
      lng: latlng.lng,
    };
  }
  return latlng;
};

const isEmptyLatLng = (latlng: NullablePartial<GeoLatLngType>) => {
  return (
    DataUtils.isNullOrUndefined(latlng.lat) ||
    DataUtils.isNullOrUndefined(latlng.lng)
  );
};

const isValidLatLng = (
  latlng: NullablePartial<GeoLatLngType>,
): latlng is GeoLatLngType => {
  return (
    !isEmptyLatLng(latlng) &&
    !DataUtils.isEmpty(latlng.lat) &&
    !DataUtils.isEmpty(latlng.lng)
  );
};

const makeBoundsFromPositions = (
  startLatLng: GeoLatLngType,
  endLatLng: GeoLatLngType,
): GeoMapBoundsType => {
  const verticalHi = Math.max(startLatLng.lat, endLatLng.lat);
  const verticalLow = Math.min(startLatLng.lat, endLatLng.lat);
  const horizontalHi = Math.max(startLatLng.lng, endLatLng.lng);
  const horizontalLow = Math.min(startLatLng.lng, endLatLng.lng);
  return {
    north: verticalHi,
    east: horizontalHi,
    south: verticalLow,
    west: horizontalLow,
  };
};

const calculateDistance = (
  latLng: GeoLatLngType,
  px: number,
  map: google.maps.Map,
): number | undefined => {
  const point = latLngToPoint(latLng, map);
  if (!point) return undefined;

  const newPoint = { x: point.x + px, y: point.y };
  const newLatLng = pointToLatLng(newPoint, map);
  if (!newLatLng) return undefined;

  return google.maps.geometry.spherical.computeDistanceBetween(
    new google.maps.LatLng(latLng.lat, latLng.lng),
    new google.maps.LatLng(newLatLng.lat, newLatLng.lng),
  );
};

const makeBoundsFromPositionAndDistance = (
  latLng: GeoLatLngType,
  distance: number,
): GeoMapBoundsType => {
  const _distance = distance / 100000;
  const verticalHi = latLng.lat + _distance;
  const verticalLow = latLng.lat - _distance;
  const horizontalHi = latLng.lng + _distance;
  const horizontalLow = latLng.lng - _distance;
  return {
    north: verticalHi,
    east: horizontalHi,
    south: verticalLow,
    west: horizontalLow,
  };
};

const makeBoundsWithPaddingPx = (
  bounds: google.maps.LatLngBounds,
  map: google.maps.Map,
  paddingXPixel: number,
  paddingYPixel: number,
): google.maps.LatLngBounds | undefined => {
  const verticalOffset = paddingYPixel;
  const horizontalOffset = paddingXPixel;

  const ne = toLatLng(bounds.getNorthEast());
  const sw = toLatLng(bounds.getSouthWest());

  const topRight = latLngToPoint({ lat: ne.lat, lng: ne.lng }, map);
  const bottomLeft = latLngToPoint({ lat: sw.lat, lng: sw.lng }, map);

  if (!topRight || !bottomLeft) {
    return undefined;
  }

  // 가장자리로부터 offset 만큼 안쪽 좌표를 계산
  const insetTopRight = new google.maps.Point(
    topRight.x - horizontalOffset,
    topRight.y + verticalOffset,
  );
  const insetBottomLeft = new google.maps.Point(
    bottomLeft.x + horizontalOffset,
    bottomLeft.y - verticalOffset,
  );

  const insetNe = pointToLatLng(insetTopRight, map);
  const insetSw = pointToLatLng(insetBottomLeft, map);

  return new google.maps.LatLngBounds(insetSw, insetNe);
};

const toGeoBoundsFromGoogleBounds = (
  latLngBounds: google.maps.LatLngBounds,
): GeoMapBoundsType => {
  return {
    north: latLngBounds.getNorthEast().lat(),
    east: latLngBounds.getNorthEast().lng(),
    south: latLngBounds.getSouthWest().lat(),
    west: latLngBounds.getSouthWest().lng(),
  };
};

const getDistanceTwoPoint = (point1: GeoLatLngType, point2: GeoLatLngType) => {
  return google.maps.geometry.spherical.computeDistanceBetween(point1, point2);
};

const getDistancePointOfTwoLatLng = (
  latLng1: GeoLatLngType,
  latLng2: GeoLatLngType,
  googleMap: google.maps.Map,
): { x: number; y: number } => {
  const point1 = latLngToPoint(latLng1, googleMap);
  const point2 = latLngToPoint(latLng2, googleMap);
  if (!point1 || !point2) {
    return { x: 0, y: 0 };
  }
  return { x: point2.x - point1.x, y: point2.y - point1.y };
};

// 위도, 경도를 라디안으로 변환하는 보조 함수
const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

// 단위 m
const getDistanceTwoPointWithoutGoogle = (
  position1: GeoLatLngType,
  position2: GeoLatLngType,
) => {
  const { lat: lat1, lng: lng1 } = position1;
  const { lat: lat2, lng: lng2 } = position2;
  // 지구 반지름 (단위: km)
  const R = 6371;
  // 위도, 경도의 차이(라디안)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lng2 - lng1);
  // Haversine 공식을 이용한 두 점 사이의 거리 계산
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance * 1000;
};

const getDistanceToLine = (
  point: GeoLatLngType,
  lineStart: GeoLatLngType,
  lineEnd: GeoLatLngType,
) => {
  const A = point.lat - lineStart.lat;
  const B = point.lng - lineStart.lng;
  const C = lineEnd.lat - lineStart.lat;
  const D = lineEnd.lng - lineStart.lng;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  if (len_sq !== 0) {
    // 분모가 0이 아닌 경우
    param = dot / len_sq;
  }

  let xx, yy;

  if (param < 0) {
    xx = lineStart.lat;
    yy = lineStart.lng;
  } else if (param > 0 && param > 1) {
    xx = lineEnd.lat;
    yy = lineEnd.lng;
  } else {
    xx = lineStart.lat + param * C;
    yy = lineStart.lng + param * D;
  }

  const dx = point.lat - xx;
  const dy = point.lng - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

const getMapType = (mapTypeId: GeoMapTypeIdEnum | string): GeoMapTypeEnum => {
  switch (mapTypeId) {
    case GeoMapTypeIdEnum.KOREA_BASE_MAP:
    case GeoMapTypeIdEnum.ZOOM_20_KOREA_BASE_MAP:
    case GeoMapTypeIdEnum.ZOOM_21_KOREA_BASE_MAP:
    case GeoMapTypeIdEnum.ZOOM_22_KOREA_BASE_MAP:
    case GeoMapTypeIdEnum.FOREIGN_BASE_MAP:
      return GeoMapTypeEnum.ROADMAP;
    case GeoMapTypeIdEnum.KOREA_SATELLITE_MAP:
    case GeoMapTypeIdEnum.ZOOM_20_KOREA_SATELLITE_MAP:
    case GeoMapTypeIdEnum.ZOOM_21_KOREA_SATELLITE_MAP:
    case GeoMapTypeIdEnum.ZOOM_22_KOREA_SATELLITE_MAP:
    case GeoMapTypeIdEnum.ZOOM_23_KOREA_SATELLITE_MAP:
    case GeoMapTypeIdEnum.FOREIGN_SATELLITE_MAP:
      return GeoMapTypeEnum.SATELLITE;
    default:
      return GeoMapTypeEnum.ROADMAP;
  }
};

const getMapTypeImage = (mapTypeId: GeoMapTypeIdEnum): GeoMapTypeImageEnum => {
  switch (mapTypeId) {
    case GeoMapTypeIdEnum.KOREA_BASE_MAP:
    case GeoMapTypeIdEnum.KOREA_SATELLITE_MAP:
    case GeoMapTypeIdEnum.ZOOM_20_KOREA_BASE_MAP:
    case GeoMapTypeIdEnum.ZOOM_20_KOREA_SATELLITE_MAP:
    case GeoMapTypeIdEnum.ZOOM_21_KOREA_BASE_MAP:
    case GeoMapTypeIdEnum.ZOOM_21_KOREA_SATELLITE_MAP:
    case GeoMapTypeIdEnum.ZOOM_22_KOREA_BASE_MAP:
    case GeoMapTypeIdEnum.ZOOM_22_KOREA_SATELLITE_MAP:
    case GeoMapTypeIdEnum.ZOOM_23_KOREA_BASE_MAP:
    case GeoMapTypeIdEnum.ZOOM_23_KOREA_SATELLITE_MAP:
      return GeoMapTypeImageEnum.VWORLD;
    case GeoMapTypeIdEnum.FOREIGN_BASE_MAP:
    case GeoMapTypeIdEnum.FOREIGN_SATELLITE_MAP:
      return GeoMapTypeImageEnum.GOOGLE;
    default:
      return GeoMapTypeImageEnum.GOOGLE;
  }
};

const vworldMapTypeSet = new Set([
  GeoMapTypeIdEnum.KOREA_BASE_MAP,
  GeoMapTypeIdEnum.KOREA_SATELLITE_MAP,
  GeoMapTypeIdEnum.ZOOM_20_KOREA_BASE_MAP,
  GeoMapTypeIdEnum.ZOOM_20_KOREA_SATELLITE_MAP,
  GeoMapTypeIdEnum.ZOOM_21_KOREA_BASE_MAP,
  GeoMapTypeIdEnum.ZOOM_21_KOREA_SATELLITE_MAP,
  GeoMapTypeIdEnum.ZOOM_22_KOREA_BASE_MAP,
  GeoMapTypeIdEnum.ZOOM_22_KOREA_SATELLITE_MAP,
  GeoMapTypeIdEnum.ZOOM_23_KOREA_BASE_MAP,
  GeoMapTypeIdEnum.ZOOM_23_KOREA_SATELLITE_MAP,
]);
const isVworldMap = (mapTypeId: GeoMapTypeIdEnum) =>
  vworldMapTypeSet.has(mapTypeId);

const baseMapTypeSet = new Set([
  GeoMapTypeIdEnum.KOREA_BASE_MAP,
  GeoMapTypeIdEnum.FOREIGN_BASE_MAP,
  GeoMapTypeIdEnum.ZOOM_20_KOREA_BASE_MAP,
  GeoMapTypeIdEnum.ZOOM_21_KOREA_BASE_MAP,
  GeoMapTypeIdEnum.ZOOM_22_KOREA_BASE_MAP,
  GeoMapTypeIdEnum.ZOOM_23_KOREA_BASE_MAP,
]);
const isBaseMap = (mapTypeId: GeoMapTypeIdEnum) =>
  baseMapTypeSet.has(mapTypeId);

const getZoomType = (zoomLevel: number) => {
  if (zoomLevel < GeoMapZoomLevel.TILE_256_MAX) {
    return ZoomTypeEnum.TILE_256;
  }
  if (zoomLevel < GeoMapZoomLevel.TILE_512_MAX) {
    return ZoomTypeEnum.TILE_512;
  }
  if (zoomLevel < GeoMapZoomLevel.TILE_1024_MAX) {
    return ZoomTypeEnum.TILE_1024;
  }
  if (zoomLevel < GeoMapZoomLevel.TILE_2048_MAX) {
    return ZoomTypeEnum.TILE_2048;
  }
  return ZoomTypeEnum.TILE_4096;
};

const getMapTypeId = (
  zoomLevel: number,
  mapTypeImage: GeoMapTypeImageEnum,
  mapType: GeoMapTypeEnum,
) => {
  if (mapTypeImage === GeoMapTypeImageEnum.GOOGLE) {
    return mapType === GeoMapTypeEnum.ROADMAP
      ? GeoMapTypeIdEnum.FOREIGN_BASE_MAP
      : GeoMapTypeIdEnum.FOREIGN_SATELLITE_MAP;
  }

  const zoomType = getZoomType(zoomLevel);
  switch (zoomType) {
    case ZoomTypeEnum.TILE_256:
      return mapType === GeoMapTypeEnum.ROADMAP
        ? GeoMapTypeIdEnum.KOREA_BASE_MAP
        : GeoMapTypeIdEnum.KOREA_SATELLITE_MAP;
    case ZoomTypeEnum.TILE_512:
      return mapType === GeoMapTypeEnum.ROADMAP
        ? GeoMapTypeIdEnum.ZOOM_20_KOREA_BASE_MAP
        : GeoMapTypeIdEnum.ZOOM_20_KOREA_SATELLITE_MAP;
    case ZoomTypeEnum.TILE_1024:
      return mapType === GeoMapTypeEnum.ROADMAP
        ? GeoMapTypeIdEnum.ZOOM_21_KOREA_BASE_MAP
        : GeoMapTypeIdEnum.ZOOM_21_KOREA_SATELLITE_MAP;
    case ZoomTypeEnum.TILE_2048:
      return mapType === GeoMapTypeEnum.ROADMAP
        ? GeoMapTypeIdEnum.ZOOM_22_KOREA_BASE_MAP
        : GeoMapTypeIdEnum.ZOOM_22_KOREA_SATELLITE_MAP;
    case ZoomTypeEnum.TILE_4096:
      return mapType === GeoMapTypeEnum.ROADMAP
        ? GeoMapTypeIdEnum.ZOOM_23_KOREA_BASE_MAP
        : GeoMapTypeIdEnum.ZOOM_23_KOREA_SATELLITE_MAP;
  }
};

export type LineLatLngType = { start: GeoLatLngType; end: GeoLatLngType };

/**
 * 두 선분을 넣으면 두 선분의 외적값을 반환합니다.
 * 외적이란 ?
 * @link https://alpaca-code.tistory.com/195 - 블로그가 아닌 글은 너무 추상적이고 어렵게 쓰여있습니다.
 * @return {crossProduct1, crossProduct2} - 두 선분에 대해서 벡터값을 구하고 외적을 계산한 값
 */
const getIntersectLineCrossProducts = (
  line1: LineLatLngType,
  line2: LineLatLngType,
) => {
  const calcVector = (point1: GeoLatLngType, point2: GeoLatLngType) => [
    point2.lng - point1.lng,
    point2.lat - point1.lat,
  ];
  const calcCrossProduct = (vector1: number[], vector2: number[]) =>
    vector1[0] * vector2[1] - vector1[1] * vector2[0];

  const A1A2 = calcVector(line1.start, line1.end);
  const A1B1 = calcVector(line1.start, line2.start);
  const A1B2 = calcVector(line1.start, line2.end);
  const B1B2 = calcVector(line2.start, line2.end);
  const B1A1 = calcVector(line2.start, line1.start);
  const B1A2 = calcVector(line2.start, line1.end);

  // 외적 계산
  const crossProduct1 =
    calcCrossProduct(A1A2, A1B1) * calcCrossProduct(A1A2, A1B2);
  const crossProduct2 =
    calcCrossProduct(B1B2, B1A1) * calcCrossProduct(B1B2, B1A2);

  // 두 외적이 모두 0보다 작으면 교차함
  return { crossProduct1, crossProduct2 };
};

// 두 선분이 교차 하는지 확인
const isIntersectLine = (line1: LineLatLngType, line2: LineLatLngType) => {
  const { crossProduct1, crossProduct2 } = getIntersectLineCrossProducts(
    line1,
    line2,
  );
  // 두 외적이 모두 0보다 작으면 교차함
  return crossProduct1 < 0 && crossProduct2 < 0;
};

type LineCrossBoundValueType = {
  isLineCrossBound: boolean;
  crossProduct1: number;
  crossProduct2: number;
};
// 한 선분이 사각형의 경계에 교차하는지 확인
const getLineCrossBoundValues = (
  line: LineLatLngType,
  bound: GeoMapBoundsType,
): LineCrossBoundValueType[] => {
  const boundPoints = {
    northWest: { lat: bound.north, lng: bound.west },
    northEast: { lat: bound.north, lng: bound.east },
    southWest: { lat: bound.south, lng: bound.west },
    southEast: { lat: bound.south, lng: bound.east },
  };
  const boundLines = {
    north: { start: boundPoints.northWest, end: boundPoints.northEast },
    east: { start: boundPoints.northEast, end: boundPoints.southEast },
    south: { start: boundPoints.southEast, end: boundPoints.southWest },
    west: { start: boundPoints.southWest, end: boundPoints.northWest },
  };
  return Object.values(boundLines).reduce((result, boundLine) => {
    const { crossProduct1, crossProduct2 } = getIntersectLineCrossProducts(
      line,
      boundLine,
    );
    result.push({
      isLineCrossBound: crossProduct1 < 0 && crossProduct2 < 0,
      crossProduct1,
      crossProduct2,
    });
    return result;
  }, [] as LineCrossBoundValueType[]);
};

const isLineCrossBound = (line: LineLatLngType, bound: GeoMapBoundsType) => {
  return getLineCrossBoundValues(line, bound).some(
    (crossBound) => crossBound.isLineCrossBound,
  );
};

const isLineCrossPolygon = (line: LineLatLngType, polygon: GeoLatLngType[]) => {
  const lineList = polygon.map((latLng, index) => {
    const nextIndex = index + 1 === polygon.length ? 0 : index + 1;
    return { start: latLng, end: polygon[nextIndex] };
  });
  return lineList.some((polygonLine) => isIntersectLine(line, polygonLine));
};

const getLatLngDistancePx = (
  latLng: GeoLatLngType,
  distance: { x: number; y: number },
  googleMap: google.maps.Map,
): GeoLatLngType => {
  const point = latLngToPoint(latLng, googleMap);
  if (!point) {
    return latLng;
  }
  const latLngNew = pointToLatLng(
    new google.maps.Point(point.x + distance.x, point.y + distance.y),
    googleMap,
  );
  return latLngNew || latLng;
};

const latLngToPoint = (latLng: GeoLatLngType, map: google.maps.Map) => {
  const overlayView: google.maps.OverlayView = map.get('overlayView');
  const clientRect = map.getDiv().getBoundingClientRect();
  const screenPoint = overlayView
    .getProjection()
    .fromLatLngToContainerPixel(new google.maps.LatLng(latLng));
  return screenPoint
    ? { x: screenPoint.x + clientRect.x, y: screenPoint.y + clientRect.y }
    : undefined;
};

const pointToLatLng = (
  screenPosition: ScreenPosition,
  map: google.maps.Map,
) => {
  const overlayView: google.maps.OverlayView = map.get('overlayView');
  const clientRect = map.getDiv().getBoundingClientRect();
  const result = overlayView
    .getProjection()
    .fromContainerPixelToLatLng(
      new google.maps.Point(
        screenPosition.x - clientRect.x,
        screenPosition.y - clientRect.y,
      ),
    );
  return result ? toLatLng(result) : undefined;
};

const addFilenameExtension = (filename: string, extension = '.xml') => {
  return filename.toLowerCase().endsWith(extension.toLowerCase())
    ? filename
    : `${filename}${extension}`;
};

const formatToFixedPosition = (
  position: GeoLatLngType,
  fractionDigits = 7,
): GeoLatLngType => {
  return {
    lng: parseFloat(position.lng.toFixed(fractionDigits)),
    lat: parseFloat(position.lat.toFixed(fractionDigits)),
  };
};

const toPointFromEvent = (event: Event) => {
  let [clientX, clientY] = [0, 0];
  if (TypeUtils.isMouseEvent(event)) {
    clientX = event.clientX;
    clientY = event.clientY;
  }
  if (TypeUtils.isTouchEvent(event)) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  }
  return new google.maps.Point(clientX, clientY);
};

const eventToLatLng = (event: Event, map: google.maps.Map) => {
  return pointToLatLng(toPointFromEvent(event), map);
};

const getRobotHeading = (yawZ: number) => {
  return yawZ < 0 ? 360 + yawZ : yawZ;
};

const getHeadingSampled = (headingNew: number, headingOfMap = 0, step = 40) => {
  const diff = Math.abs(headingOfMap - headingNew);
  if (diff <= step) {
    return headingOfMap;
  }
  return Math.round(headingNew / step) * step;
};

enum TouchTypeEnum {
  DIRECT = 'direct',
  PENCIL = 'pencil',
}

const isFingerTouchEvent = (touches: TouchList) => {
  if (touches.length < 1) {
    return false;
  }
  const touch = touches[0];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore touchType은 safari iOS와 webView iOS에서만 지원함
  const { touchType, force } = touch;
  // force, 손가락으로 터치한 경우 android는 1, iOS는 0
  //        펜슬로 터치한 경우 0보다 크고 1보다 작은 값(예를 들면, android는 0.0051282052882015705, iOS는 0.07999999999999999)
  return touchType === TouchTypeEnum.DIRECT || force === 1;
};

const _removePositionsContinuousDuplicates = (positions: GeoLatLngType[]) => {
  return positions.filter((position, index, arr) => {
    if (index === 0) return true;
    const prevPosition = arr[index - 1];
    return !GeoMapUtils.isLatLngEquals(position, prevPosition);
  });
};

const positionsToGeoJson = (
  positions: GeoLatLngType[],
  startId?: number,
): FeatureCollection => {
  const idGenerator = new IdGenerator(startId);
  const positionsRemovedDuplicates =
    _removePositionsContinuousDuplicates(positions);
  const features: any[] = positionsRemovedDuplicates.map((position) => {
    return {
      type: GeometryTypeEnum.Feature,
      properties: {
        type: 'node',
        id: idGenerator.getNextId(),
      },
      geometry: {
        type: GeometryTypeEnum.Point,
        coordinates: [position.lng, position.lat],
      },
    };
  });

  const lineStringFeature = {
    type: GeometryTypeEnum.Feature,
    properties: {
      type: 'way',
      id: idGenerator.getNextId(),
      nodes: features.map((feature) => feature.properties.id),
    },
    geometry: {
      type: GeometryTypeEnum.LineString,
      coordinates: features.map((feature) => feature.geometry.coordinates),
    },
  };

  features.push(lineStringFeature);

  return {
    type: GeometryTypeEnum.FeatureCollection,
    features,
  };
};

const qaMapEventLogger = (
  event: google.maps.MapMouseEvent,
  eventName: string,
) => {
  const mapEvent = event.domEvent as MouseEvent;
  const latlng = event.latLng?.toJSON();
  console.log(`QGoogleMap:: ${eventName}`);
  console.table({
    pageX: mapEvent.pageX,
    pageY: mapEvent.pageY,
    lat: latlng?.lat,
    lng: latlng?.lng,
  });
};

const findMatchingIndices = (
  coordinates: CoordinateType[],
  target: CoordinateType,
): number[] => {
  return coordinates.reduce((acc: number[], cur, idx) => {
    if (
      cur.latitude === target.latitude &&
      cur.longitude === target.longitude
    ) {
      acc.push(idx);
    }
    return acc;
  }, []);
};

const getCurrentLocation = async () => {
  if (EnvUtils.isNeubilityApp()) {
    return NativeBridgeAction.location().then((value) => {
      if (
        !value ||
        !value?.isSuccess ||
        !value?.data?.latitude ||
        !value?.data?.longitude
      ) {
        return;
      }
      return { lat: value.data.latitude, lng: value.data.longitude };
    });
  } else {
    return BrowserUtils.getCurrentLocation();
  }
};

const filterValidLineStringCoordinates = (
  feature: Feature,
  tag?: TagClassValueEnum,
): number[][] | null => {
  if (feature.geometry?.type !== GeometryTypeEnum.LineString) return null;

  if (!tag) return feature.geometry.coordinates;
  return feature.properties?.tags?.class?.includes(tag)
    ? feature.geometry.coordinates
    : null;
};

export const GeoMapUtils = {
  IS_DEBUG: EnvUtils.isDevMode(),
  formatToFixedPosition,
  getPath,
  isLineCrossBound,
  isLineCrossPolygon,
  getLineCrossBoundValues,
  isIntersectLine,
  getIntersectLineValue: getIntersectLineCrossProducts,
  toLatLng,
  latLngToPoint,
  pointToLatLng,
  getCenterLatLng,
  getCenterLng,
  getCenterLat,
  isLatLngEquals,
  isEmptyLatLng,
  isValidLatLng,
  toLatLngFromCoordinate,
  makeBoundsFromPositions,
  makeBoundsFromPositionAndDistance,
  makeBoundsWithPaddingPx,
  toGeoBoundsFromGoogleBounds,
  getDistanceTwoPoint,
  getDistancePointOfTwoLatLng,
  getDistanceToLine,
  getMapType,
  getMapTypeImage,
  isVworldMap,
  isBaseMap,
  getZoomType,
  getMapTypeId,
  calculateDistance,
  getLatLngDistancePx,
  addFilenameExtension,
  toPointFromEvent,
  eventToLatLng,
  getRobotHeading,
  getHeadingSampled,
  isFingerTouchEvent,
  positionsToGeoJson,
  qaMapEventLogger,
  findMatchingIndices,
  getCurrentLocation,
  getDistanceTwoPointWithoutGoogle,
  filterValidLineStringCoordinates,
} as const;

export type GeoMapUtilsType = typeof GeoMapUtils;
