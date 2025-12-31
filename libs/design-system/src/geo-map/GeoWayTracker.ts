import { GeoLatLngType } from '@design-system/types';
import EventListenerManager from '@design-system/geo-map/event/EventListenerManager';
import { TagClassValueEnum } from '@design-system/root/src';

interface IsPointOnLineSegmentParams {
  currentRobotLocation: GeoLatLngType;
  wayStartNode: GeoLatLngType;
  wayEndNode: GeoLatLngType;
}

interface Bbox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}
const DISTANCE_THRESHOLD = 0.00002; // 약 2m
class GeoWayTracker extends EventListenerManager<
  TagClassValueEnum,
  (isEnter: boolean) => void
> {
  private activeWays: Map<number, GeoLatLngType[]> = new Map();
  private ways: GeoLatLngType[][];

  constructor(ways: GeoLatLngType[][]) {
    super();
    this.ways = ways;
  }

  private createBoundingBox(way: GeoLatLngType[]): Bbox {
    const lats = way.map(({ lat }) => lat);
    const lngs = way.map(({ lng }) => lng);
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }

  private isInsideBoundingBox(robotPos: GeoLatLngType, bbox: Bbox) {
    const { lat, lng } = robotPos;
    return (
      lat >= bbox.minLat &&
      lat <= bbox.maxLat &&
      lng >= bbox.minLng &&
      lng <= bbox.maxLng
    );
  }

  private isPointOnLineSegment({
    currentRobotLocation,
    wayStartNode,
    wayEndNode,
  }: IsPointOnLineSegmentParams) {
    // 1. 위도에 따른 거리 보정 계산
    const latitudeFactor = Math.cos((currentRobotLocation.lat * Math.PI) / 180);

    // 2. 선분의 방향 벡터 (경도 거리 보정 적용)
    const dx = (wayEndNode.lng - wayStartNode.lng) * latitudeFactor;
    const dy = wayEndNode.lat - wayStartNode.lat;

    // 3. 시작점에서 현재 위치까지의 벡터 (경도 거리 보정 적용)
    const px = (currentRobotLocation.lng - wayStartNode.lng) * latitudeFactor;
    const py = currentRobotLocation.lat - wayStartNode.lat;

    // 4. 선분의 길이 제곱
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared === 0) return false; // 시작점과 끝점이 같은 경우

    // 5. 점과 선분 사이의 실제 거리 계산
    const crossProduct = Math.abs(px * dy - py * dx) / Math.sqrt(lengthSquared);

    // 6. 선분 위의 투영점의 위치 비율
    const dotProduct = (px * dx + py * dy) / lengthSquared;

    return (
      crossProduct <= DISTANCE_THRESHOLD && dotProduct >= 0 && dotProduct <= 1
    );
  }

  private isPointOnPath(
    currentRobotLocation: GeoLatLngType,
    way: GeoLatLngType[],
  ): boolean {
    // 1. bbox로 첫 필터링
    const bbox = this.createBoundingBox(way);
    if (!this.isInsideBoundingBox(currentRobotLocation, bbox)) return false;

    // 2. 각 선분에 대해 검사
    for (let i = 0; i < way.length - 1; i++) {
      const isOnSegment = this.isPointOnLineSegment({
        currentRobotLocation,
        wayStartNode: way[i],
        wayEndNode: way[i + 1],
      });
      if (isOnSegment) return true;
    }

    return false;
  }

  findWayForRobot(currentRobotLocation: GeoLatLngType) {
    // 현재 활성화된 way가 있다면
    if (this.activeWays.size > 0) {
      const activeWayEntry = Array.from(this.activeWays.entries()).find(
        ([_, way]) => this.isPointOnPath(currentRobotLocation, way),
      );
      if (activeWayEntry) {
        return activeWayEntry[0];
      }
      this.invokeDebounceEventListeners(true);
      // way out 이벤트 invoke
      this.activeWays.clear();
    } else {
      const newWayEntry = this.ways.findIndex((way) =>
        this.isPointOnPath(currentRobotLocation, way),
      );

      if (newWayEntry !== -1) {
        this.activeWays.set(newWayEntry, this.ways[newWayEntry]);
        this.invokeDebounceEventListeners(false);
        return newWayEntry;
      }

      return null;
    }
  }
}

export default GeoWayTracker;
