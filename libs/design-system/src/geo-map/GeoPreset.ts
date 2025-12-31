import GeoNode from '@design-system/geo-map/feature/GeoNode';
import GeoWay from '@design-system/geo-map/feature/GeoWay';
import IdGenerator from '@design-system/utils/geo-map/IdGenerator';

const nodesInfo = [
  { id: 1, lat: 37.05, lng: 127.05 },
  { id: 2, lat: 37.05, lng: 127.051 },
  { id: 3, lat: 37.05, lng: 127.052 },
  { id: 4, lat: 37.05, lng: 127.053 },
  { id: 5, lat: 37.05, lng: 127.054 },
  { id: 6, lat: 37.052, lng: 127.049 },
  { id: 7, lat: 37.051, lng: 127.049 },
  { id: 8, lat: 37.051, lng: 127.05 },
  { id: 9, lat: 37.052, lng: 127.051 },
  { id: 10, lat: 37.051, lng: 127.051 },
  { id: 11, lat: 37.051, lng: 127.052 },
  { id: 12, lat: 37.049, lng: 127.052 },
  { id: 13, lat: 37.048, lng: 127.05 },
  { id: 14, lat: 37.048, lng: 127.051 },
  { id: 15, lat: 37.047, lng: 127.05 },
  { id: 16, lat: 37.047, lng: 127.051 },
  { id: 17, lat: 37.047, lng: 127.052 },
  { id: 18, lat: 37.046, lng: 127.05 },
  { id: 19, lat: 37.046, lng: 127.051 },
  { id: 20, lat: 37.045, lng: 127.051 },
  { id: 21, lat: 37.044, lng: 127.05 },
  { id: 22, lat: 37.044, lng: 127.051 },
  { id: 23, lat: 37.043, lng: 127.051 },
  { id: 24, lat: 37.043, lng: 127.052 },
  { id: 25, lat: 37.042, lng: 127.05 },
  { id: 26, lat: 37.042, lng: 127.051 },
  { id: 27, lat: 37.042, lng: 127.052 },
  { id: 28, lat: 37.041, lng: 127.052 },
  { id: 29, lat: 37.041, lng: 127.053 },
  { id: 30, lat: 37.04, lng: 127.053 },
  { id: 31, lat: 37.04, lng: 127.054 },
  { id: 32, lat: 37.039, lng: 127.05 },
  { id: 33, lat: 37.039, lng: 127.051 },
  { id: 34, lat: 37.038, lng: 127.051 },
  { id: 35, lat: 37.038, lng: 127.05 },
  { id: 36, lat: 37.047, lng: 127.05 },
  { id: 37, lat: 37.047, lng: 127.051 },
  { id: 38, lat: 37.047, lng: 127.052 },
  { id: 39, lat: 37.048, lng: 127.053 },
] as const;

const latLngList = nodesInfo.map((nodeInfo) => ({
  lat: nodeInfo.lat,
  lng: nodeInfo.lng,
}));
const latLng = latLngList[0];
const coordinate = [latLng.lng, latLng.lat];

/**
 * 노드 생성. 겹치는 노드는 없음
 * @param count
 * @param googleMap
 * @deprecated
 */
const generateNodes = (count: number, googleMap: google.maps.Map) => {
  if (count > nodesInfo.length)
    throw new Error(`최대 ${nodesInfo.length}개까지만 생성 가능합니다`);

  const nodeInfosSliced = nodesInfo.slice(0, count);

  return {
    nodes: nodeInfosSliced.map((nodeInfo) => {
      return new GeoNode({
        id: nodeInfo.id,
        position: { lat: nodeInfo.lat, lng: nodeInfo.lng },
        googleMap,
        options: { contentRenderFn: () => document.createElement('div') },
      });
    }),
    nodeInfos: nodeInfosSliced,
  };
};

/**
 * Node.id 기반
 *
 *          6      9
 *          │      │
 *          7  8   10  11
 *          │  │   │   │
 *          └─ 1 ─ 2 ─ 3 ─ 4 ─ 5
 *                     │
 *                     12
 *  Way1: [1, 2, 3, 4, 5]
 *  Way2: [6, 7, 1]
 *  Way3: [8, 1]
 *  Way4: [9, 10, 2]
 *  Way5: [11, 3, 12]
 *
 *
 *                13 ─ 14
 *  Way6: [13, 14]
 *
 *
 *                15 ─ 16 ─ 17
 * Way7: [15, 16, 17]
 *
 *
 *                18 ─ 19
 *                     │
 *                     20
 * Way8: [18, 19]
 * Way9: [19, 20]
 *
 *
 *                21 ─ 22
 *                     │
 *                     23 ─ 24
 * Way10: [21, 22]
 * Way11: [22, 23]
 * Way12: [23, 24]
 *
 *
 *                25 ─ 26 ─ 27
 *                          │
 *                          28 ─ 29
 *                               │
 *                               30 ─ 31
 * Way13: [25, 26, 27]
 * Way14: [27, 28, 29]
 * Way15: [29, 30, 31]
 *
 *
 *                32 ─ 33
 *                │     │
 *                35 ─ 34
 * Way16: [32, 33, 34, 35, 32]
 *
 *
 *                39
 *                |
 *           36 ─ 37 - 38
 * Way17: [36, 37]
 * Way18: [37, 39]
 * Way19: [37, 38]
 *
 *                39
 *                |
 *           36 ─ 37 - 38
 * Way20: [36, 37, 38]
 * Way21: [37, 39]
 */
const waysInfo = [
  { id: 1, nodes: [1, 2, 3, 4, 5] },
  { id: 2, nodes: [6, 7, 1] },
  { id: 3, nodes: [8, 1] },
  { id: 4, nodes: [9, 10, 2] },
  { id: 5, nodes: [11, 3, 12] },
  { id: 6, nodes: [13, 14] },
  { id: 7, nodes: [15, 16, 17] },
  { id: 8, nodes: [18, 19] },
  { id: 9, nodes: [19, 20] },
  { id: 10, nodes: [21, 22] },
  { id: 11, nodes: [22, 23] },
  { id: 12, nodes: [23, 24] },
  { id: 13, nodes: [25, 26, 27] },
  { id: 14, nodes: [27, 28, 29] },
  { id: 15, nodes: [29, 30, 31] },
  { id: 16, nodes: [32, 33, 34, 35, 32] },
  { id: 17, nodes: [36, 37] },
  { id: 18, nodes: [37, 39] },
  { id: 19, nodes: [37, 38] },
] as const;

/**
 * @param countOfWays
 * @param googleMap
 * @deprecated
 */
const generateNodesAndWays = (
  countOfWays: number,
  googleMap: google.maps.Map,
) => {
  const idGenerator = new IdGenerator();
  const { nodes, nodeInfos } = generateNodes(nodesInfo.length, googleMap);
  const nodesMap = new Map(nodes.map((node) => [node.getId(), node]));

  if (countOfWays > waysInfo.length)
    throw new Error(`최대 ${waysInfo.length}개까지만 생성 가능합니다`);
  const wayInfosSliced = waysInfo.slice(0, countOfWays);
  const countOfNodes = wayInfosSliced.reduce(
    (acc, wayInfo) => acc + wayInfo.nodes.length,
    0,
  );

  return {
    nodes: nodes.slice(0, countOfNodes),
    nodeInfos: nodeInfos.slice(0, countOfNodes),
    wayInfos: wayInfosSliced,
    ways: wayInfosSliced.map(
      (wayInfo) =>
        new GeoWay({
          id: wayInfo.id,
          googleMap,
          nodes: [...wayInfo.nodes].reduce((result, id) => {
            const node = nodesMap.get(id);
            if (node) {
              result.push(node);
            }
            return result;
          }, [] as GeoNode[]),
          idGenerator,
        }),
    ),
  };
};

const BOUND = {
  north: 37.7134,
  south: 37.0113,
  east: 128.4604,
  west: 127.0419,
} as const;

// 라인들이 바운드에 교차하는 바운드의 선분 - 바운드의 아래쪽
const LINE_BOUND_TARGET = {
  start: { lat: BOUND.south, lng: BOUND.east },
  end: { lat: BOUND.south, lng: BOUND.west },
} as const;

// 라인들이 바운드에 교차하는 바운드의 선분 - 바운드의 오른쪽
const LINE_BOUND_TARGET2 = {
  start: { lat: BOUND.north, lng: BOUND.east },
  end: { lat: BOUND.south, lng: BOUND.east },
} as const;

const LINE_BOUND_CROSS1 = {
  start: { lat: 37.3432, lng: 127.9612 },
  end: { lat: 36.6045, lng: 127.973 },
} as const;

const LINE_BOUND_CROSS2 = {
  start: { lat: 36.9004, lng: 127.9552 },
  end: { lat: 37.3737, lng: 128.5697 },
} as const;

const LINE_BOUND_NOT_CROSS = {
  start: { lat: 36.8034, lng: 127.7544 },
  end: { lat: 36.8082, lng: 128.2743 },
} as const;

/**
 * @deprecated
 */
const getMap = () => {
  return new google.maps.Map(document.createElement('div'));
};

/**
 * @deprecated
 */
const initialize = () => {
  global.google.maps.LatLng = jest.fn().mockImplementation((lat, lng) => {
    const instance = { lat: () => lat, lng: () => lng };
    // LatLng의 프로토타입을 실제 google.maps.LatLng 프로토타입으로 설정
    Object.setPrototypeOf(instance, google.maps.LatLng.prototype);
    return instance;
  });
};

const GeoPreset = {
  initialize,
  BOUND,
  LINE_BOUND_CROSS1,
  LINE_BOUND_CROSS2,
  LINE_BOUND_NOT_CROSS,
  LINE_BOUND_TARGET,
  LINE_BOUND_TARGET2,
  nodesInfo,
  latLng,
  coordinate,
  latLngList,
  generateNodes,
  waysInfo,
  generateNodesAndWays,
  getMap,
} as const;

export type GeoPresetType = typeof GeoPreset;

export default GeoPreset;
