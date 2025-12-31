import EventListenerManager from '@design-system/geo-map/event/EventListenerManager';
import GeoNode, {
  GeoNodeOptionType,
} from '@design-system/geo-map/feature/GeoNode';
import GeoWay from '@design-system/geo-map/feature/GeoWay';
import GeoLineSegment from '@design-system/geo-map/line-segment/GeoLineSegment';
import { GeoLatLngType } from '@design-system/types/geoMap.type';
import StructSetUtils from '@design-system/utils/structSetUtils';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';

/**
 * Feature
 */
interface GeoMapFeature {
  nodeMap: Map<number, GeoNode>;
  wayMap: Map<number, GeoWay>;
}

export type GeoFeaturesType = {
  nodes: GeoNode[];
  ways: GeoWay[];
  lineSegments: GeoLineSegment[];
};

export enum GeoNodeTypeEnum {
  /**
   * 시작점
   * [1, 2, 3]인 경우, 시작점은 1
   */
  START = 'START',
  /**
   * 끝점
   * [1, 2, 3]인 경우, 끝점은 3
   */
  END = 'END',
  /**
   * 중간점
   * [1, 2, 3]인 경우, 중간점은 2
   */
  SEGMENTAL = 'SEGMENTAL',
  /**
   * 시작점이 여러개
   * [1, 2, 3], [1, 4, 5]인 2개의 길이 있는 경우, 1은 START와 START_MULTIPLE를 갖음
   */
  START_MULTIPLE = 'START_MULTIPLE',
  /**
   * 끝점이 여러개
   * [1, 2, 3], [4, 5, 3]인 2개의 길이 있는 경우, 3은 END와 END_MULTIPLE을 갖음
   */
  END_MULTIPLE = 'END_MULTIPLE',
  /**
   * 중간점이 여러개
   * [1, 2, 3], [4, 2, 5]인 2개의 길이 있는 경우, 2는 SEGMENTAL과 SEGMENTAL_MULTIPLE을 갖음
   */
  SEGMENTAL_MULTIPLE = 'SEGMENTAL_MULTIPLE',
}

export interface GeoFeatureResult {
  // 업데이트되었거나 업데이트가 필요한 Node들
  nodesUpdated: GeoNode[];
  // Types이 변경된 Node들. value는 변경되기 전의 Node의 type들
  nodesUpdatedTypesMap: Map<GeoNode, Set<GeoNodeTypeEnum>>;
  // 삭제된 Node들
  nodesDeleted: GeoNode[];
  // 업데이트되었거나 업데이트가 필요한 Way들
  waysUpdated: GeoWay[];
  // 삭제된 Way들
  waysDeleted: GeoWay[];
}

/**
 * NbMapFeatureManager의 key를 구함
 * @param latLng
 */
const getGeoMapFeatureKey = (latLng: GeoLatLngType): string => {
  return `${latLng.lat},${latLng.lng}`;
};

/**
 * Node가 추가된 후 호출되는 이벤트
 * @param nodeAdded 추가된 Node
 */
export type OnNodeAdded = (nodeAdded: GeoNode) => void;
/**
 * Node가 삭제된 후 호출되는 이벤트
 * @param nodeDeleted 삭제된 Node
 */
export type OnNodeDeleted = (nodeDeleted: GeoNode) => void;
/**
 * Node의 type이 변경된 후 호출되는 이벤트
 * @param nodeChanged 변경된 Node
 * @param nodeTypesBeforeChanged 변경 전 Node의 type들
 */
export type OnNodeTypesChanged = (
  nodeChanged: GeoNode,
  nodeTypes: Set<GeoNodeTypeEnum>,
  nodeTypesBeforeChanged: Set<GeoNodeTypeEnum>,
) => void;
/**
 * Node의 위치가 변경된 후 호출되는 이벤트
 * @param node 변경된 Node
 */
export type OnNodePositionChanged = (node: GeoNode) => void;

/**
 * Way가 추가된 후 호출되는 이벤트
 * @param wayAdded 추가된 Way
 */
export type OnWayAdded = (wayAdded: GeoWay) => void;
/**
 * Way가 삭제된 후 호출되는 이벤트
 * @param wayDeleted 삭제된 Way
 */
export type OnWayDeleted = (wayDeleted: GeoWay) => void;
/**
 * Way가 업데이트된 후 호출되는 이벤트
 * @param wayUpdated 업데이트된 Way
 */
export type OnWayUpdated = (wayUpdated: GeoWay) => void;
/**
 * Way가 교체된 후 호출되는 이벤트
 */
export type OnWayReplace = (waysAdded: GeoWay[], wayDeleted: GeoWay) => void;
/**
 * Way에 Node가 추가된 후 호출되는 이벤트
 */
export type OnWayNodeAdded = (
  way: GeoWay,
  node: GeoNode,
  indexOfNodeAdded: number,
) => void;
/**
 * Way에 Node가 삭제된 후 호출되는 이벤트
 */
export type OnWayNodeDeleted = (
  way: GeoWay,
  node: GeoNode,
  indexAtOfNodeDeleted: number,
) => void;
/**
 * Way의 Node들이 병합된 후 호출되는 이벤트
 * @param way 대상 Way
 * @param nodeDeleted 병합되어 삭제된 Node
 * @param node 병합되고 남은 Node
 * @param nodeDeletedIndexAtBeforeMerged 병합되어 삭제된 Node의 병합되기 전 index
 * @param nodeIndexAtBeforeMerged 병합되고 남은 Node의 병합되기 전 index
 */
export type OnWayNodesMerged = (
  way: GeoWay,
  nodeDeleted: GeoNode,
  node: GeoNode,
  nodeDeletedIndexAtBeforeMerged: number,
  nodeIndexAtBeforeMerged: number,
  wayLengthBeforeMerged: number,
) => void;

const GeoFeatureManagerKey = 'GeoFeatureManagerKey';

/**
 * Map의 Feature를 관리
 */
class GeoFeatureManager {
  private _map: google.maps.Map;
  // key: getNbMapFeatureKey(latLng)
  /**
   * 위도/경도가 동일한 Node와 Way를 저장
   * key는 getNbMapFeatureKey(latLng)로 생성한 값을 사용
   * @private
   */
  private _featureMap: Map<string, GeoMapFeature> = new Map();
  /**
   * 전체 Node를 저장
   * key는 Node의 ID
   * @private
   */
  private _nodeMap: Map<number, GeoNode> = new Map();
  /**
   * 전체 Way를 저장
   * key는 Way의 ID
   * @private
   */
  private _wayMap: Map<number, GeoWay> = new Map();
  private _isFeatureEdited: boolean;

  constructor(googleMap: google.maps.Map) {
    this._map = googleMap;
    this._isFeatureEdited = false;

    this._nodeAddedEventListenerManager.addEventListener(
      GeoFeatureManagerKey,
      () => this.setIsFeatureEdited(true),
    );
    this._nodeDeletedEventListenerManager.addEventListener(
      GeoFeatureManagerKey,
      () => this.setIsFeatureEdited(true),
    );
    this._nodeTypesChangedEventListenerManager.addEventListener(
      GeoFeatureManagerKey,
      () => this.setIsFeatureEdited(true),
    );
    this._nodePositionChangedEventListenerManager.addEventListener(
      GeoFeatureManagerKey,
      () => this.setIsFeatureEdited(true),
    );
    this._nodesEnabledChangedDebounceEventListenerManager.addDebounceEventInvokedListener(
      GeoFeatureManagerKey,
      () => {
        this._nodesEnabledChangedMap.clear();
      },
    );

    this._wayAddedEventListenerManager.addEventListener(
      GeoFeatureManagerKey,
      () => this.setIsFeatureEdited(true),
    );
    this._wayDeletedEventListenerManager.addEventListener(
      GeoFeatureManagerKey,
      () => this.setIsFeatureEdited(true),
    );
    this._wayUpdatedEventListenerManager.addEventListener(
      GeoFeatureManagerKey,
      () => this.setIsFeatureEdited(true),
    );
    this._wayReplacedEventListenerManager.addEventListener(
      GeoFeatureManagerKey,
      () => this.setIsFeatureEdited(true),
    );
    this._nodeAddedToWayEventListenerManager.addEventListener(
      GeoFeatureManagerKey,
      () => this.setIsFeatureEdited(true),
    );
    this._nodeDeletedFromWayEventListenerManager.addEventListener(
      GeoFeatureManagerKey,
      () => this.setIsFeatureEdited(true),
    );
    this._wayNodesMergedEventListenerManager.addEventListener(
      GeoFeatureManagerKey,
      () => this.setIsFeatureEdited(true),
    );
    this._wayTagsChangedEventListenerManager.addEventListener(
      GeoFeatureManagerKey,
      () => this.setIsFeatureEdited(true),
    );
    this._waysEnabledChangedDebounceEventListenerManager.addDebounceEventInvokedListener(
      GeoFeatureManagerKey,
      () => {
        this._waysEnabledChangedMap.clear();
      },
    );
  }

  /**
   * ====================================================================================
   * 이벤트 리스너
   * ====================================================================================
   */
  /**
   * Node가 추가된 후 호출되는 이벤트 리스너 맵
   */
  private _nodeAddedEventListenerManager: EventListenerManager<
    string,
    OnNodeAdded
  > = new EventListenerManager();
  /**
   * Node가 삭제된 후 호출되는 이벤트 리스너 맵
   */
  private _nodeDeletedEventListenerManager: EventListenerManager<
    string,
    OnNodeDeleted
  > = new EventListenerManager();
  /**
   * Node의 type이 변경된 후 호출되는 이벤트 리스너 맵
   */
  private _nodeTypesChangedEventListenerManager: EventListenerManager<
    string,
    OnNodeTypesChanged
  > = new EventListenerManager();
  /**
   * Node의 위치가 변경된 이벤트를 관리
   */
  private _nodePositionChangedEventListenerManager: EventListenerManager<
    string,
    OnNodePositionChanged
  > = new EventListenerManager();
  /**
   * Node의 enabled가 변경된 후 호출되는 이벤트 리스너
   */
  private _nodeEnabledChangedEventListenerManager: EventListenerManager<
    string,
    (node: GeoNode, enabledNew: boolean) => void
  > = new EventListenerManager();
  /**
   * Node들 중에 enabled가 true인 Node들
   */
  private _nodesEnabledSet: Set<GeoNode> = new Set();
  /**
   * Node들의 enabled가 변경된 후 호출되는 이벤트 리스너에 전달할 args
   */
  private _nodesEnabledChangedMap: Map<GeoNode, boolean> = new Map();
  /**
   * Node들의 enabled가 변경된 후 호출되는 이벤트 리스너
   */
  private _nodesEnabledChangedDebounceEventListenerManager: EventListenerManager<
    string,
    (
      nodeMap: Readonly<Map<GeoNode, boolean>>,
      nodesEnabledSet: Readonly<Set<GeoNode>>,
    ) => void
  > = new EventListenerManager();

  /**
   * Way가 추가된 후 호출되는 이벤트 리스너 맵
   */
  private _wayAddedEventListenerManager: EventListenerManager<
    string,
    OnWayAdded
  > = new EventListenerManager();
  /**
   * Way가 삭제된 후 호출되는 이벤트 리스너 맵
   */
  private _wayDeletedEventListenerManager: EventListenerManager<
    string,
    OnWayDeleted
  > = new EventListenerManager();
  /**
   * Way가 변경된 후 호출되는 이벤트 리스너 맵
   */
  private _wayUpdatedEventListenerManager: EventListenerManager<
    string,
    OnWayUpdated
  > = new EventListenerManager();
  /**
   * Way가 교체된 후 호출되는 이벤트 리스너 맵
   */
  private _wayReplacedEventListenerManager: EventListenerManager<
    string,
    OnWayReplace
  > = new EventListenerManager();
  /**
   * Way에 노드가 추가된 후에 호출되는 이벤트 리스너
   */
  private _nodeAddedToWayEventListenerManager: EventListenerManager<
    string,
    OnWayNodeAdded
  > = new EventListenerManager();
  /**
   * Way에 노드가 삭제된 후에 호출되는 이벤트 리스너
   */
  private _nodeDeletedFromWayEventListenerManager: EventListenerManager<
    string,
    OnWayNodeDeleted
  > = new EventListenerManager();
  /**
   * Way의 노드들이 병합된 후에 호출되는 이벤트 리스너
   */
  private _wayNodesMergedEventListenerManager: EventListenerManager<
    string,
    OnWayNodesMerged
  > = new EventListenerManager();
  /**
   * Way의 태그가 변경된 후 호출되는 이벤트 리스너
   */
  private _wayTagsChangedEventListenerManager: EventListenerManager<
    string,
    (way: GeoWay) => void
  > = new EventListenerManager();

  private _featureEditedEventListenerManager: EventListenerManager<
    string,
    (isEdit: boolean) => void
  > = new EventListenerManager();
  /**
   * Way의 enabled가 변경된 후 호출되는 이벤트 리스너
   */
  private _wayEnabledChangedEventListenerManager: EventListenerManager<
    string,
    (way: GeoWay, enabledNew: boolean) => void
  > = new EventListenerManager();
  /**
   * Way들 중에 enabled가 true인 Way들
   */
  private _waysEnabledSet: Set<GeoWay> = new Set();
  /**
   * Way들의 enabled가 변경된 후 호출되는 이벤트 리스너에 전달할 args
   */
  private _waysEnabledChangedMap: Map<GeoWay, boolean> = new Map();
  /**
   * Way들의 enabled가 변경된 후 호출되는 이벤트 리스너
   */
  private _waysEnabledChangedDebounceEventListenerManager: EventListenerManager<
    string,
    (
      waysMap: Readonly<Map<GeoWay, boolean>>,
      waysEnabledSet: Readonly<Set<GeoWay>>,
    ) => void
  > = new EventListenerManager();

  /**
   * ===============================================================================================
   * addListener 영역
   * ===============================================================================================
   */
  /**
   * Node가 추가된 후 호출되는 이벤트 리스너 추가
   * @param key
   * @param listener
   */
  addNodeAddedListener = (key: string, listener: OnNodeAdded) => {
    this._nodeAddedEventListenerManager.addEventListener(key, listener);
  };
  /**
   * Node가 추가된 후 호출되는 이벤트 리스너 삭제
   * @param key
   */
  removeNodeAddedListener = (key: string) => {
    this._nodeAddedEventListenerManager.removeEventListener(key);
  };
  /**
   * Node가 삭제된 후 호출되는 이벤트 리스너 추가
   * @param key
   * @param listener
   */
  addNodeDeletedListener = (key: string, listener: OnNodeDeleted) => {
    this._nodeDeletedEventListenerManager.addEventListener(key, listener);
  };
  /**
   * Node가 삭제된 후 호출되는 이벤트 리스너 삭제
   * @param key
   */
  removeNodeDeletedListener = (key: string) => {
    this._nodeDeletedEventListenerManager.removeEventListener(key);
  };

  /**
   * Node의 type이 변경된 후 호출되는 이벤트 리스너 추가
   * @param key
   * @param listener
   */
  addNodeTypesChangedListener = (key: string, listener: OnNodeTypesChanged) => {
    this._nodeTypesChangedEventListenerManager.addEventListener(key, listener);
  };
  /**
   * Node의 type이 변경된 후 호출되는 이벤트 리스너 삭제
   * @param key
   */
  removeNodeTypesChangedListener = (key: string) => {
    this._nodeTypesChangedEventListenerManager.removeEventListener(key);
  };
  /**
   * Node의 위치가 변경된 후 호출되는 이벤트 리스너 추가
   * @param key
   * @param listener
   */
  addNodePositionChangedListener = (
    key: string,
    listener: OnNodePositionChanged,
  ) => {
    this._nodePositionChangedEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  /**
   * Node의 위치가 변경된 후 호출되는 이벤트 리스너 삭제
   * @param key
   */
  removeNodePositionChangedListener = (key: string) => {
    this._nodePositionChangedEventListenerManager.removeEventListener(key);
  };
  /**
   * Node의 enabled가 변경된 후 호출되는 이벤트 리스너 추가
   * @param key
   * @param listener
   */
  addNodeEnabledChangedListener = (
    key: string,
    listener: (node: GeoNode, enabledNew: boolean) => void,
  ) => {
    this._nodeEnabledChangedEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  /**
   * Node의 enabled가 변경된 후 호출되는 이벤트 리스너 삭제
   * @param key
   */
  removeNodeEnabledChangedListener = (key: string) => {
    this._nodeEnabledChangedEventListenerManager.removeEventListener(key);
  };
  /**
   * Node들의 enabled가 변경된 후 호출되는 이벤트 리스너 추가
   * @param key
   * @param listener
   */
  addNodesEnabledChangedDebounceListener = (
    key: string,
    listener: (
      nodeMap: Readonly<Map<GeoNode, boolean>>,
      nodesEnabledSet: Readonly<Set<GeoNode>>,
    ) => void,
  ) => {
    this._nodesEnabledChangedDebounceEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  /**
   * Node들의 enabled가 변경된 후 호출되는 이벤트 리스너 삭제
   * @param key
   */
  removeNodesEnabledChangedDebounceListener = (key: string) => {
    this._nodesEnabledChangedDebounceEventListenerManager.removeEventListener(
      key,
    );
  };

  /**
   * Way가 추가된 후 호출되는 이벤트 리스너 추가
   * @param key
   * @param listener
   */
  addWayAddedListener = (key: string, listener: OnWayAdded) => {
    this._wayAddedEventListenerManager.addEventListener(key, listener);
  };
  /**
   * Way가 추가된 후 호출되는 이벤트 리스너 삭제
   * @param key
   */
  removeWayAddedListener = (key: string) => {
    this._wayAddedEventListenerManager.removeEventListener(key);
  };
  /**
   * Way가 삭제된 후 호출되는 이벤트 리스너 추가
   * @param key
   * @param listener
   */
  addWayDeletedListener = (key: string, listener: OnWayDeleted) => {
    this._wayDeletedEventListenerManager.addEventListener(key, listener);
  };
  /**
   * Way가 삭제된 후 호출되는 이벤트 리스너 삭제
   * @param key
   */
  removeWayDeletedListener = (key: string) => {
    this._wayDeletedEventListenerManager.removeEventListener(key);
  };
  /**
   * Way가 업데이트된 후 호출되는 이벤트 리스너 추가
   */
  addWayUpdatedListener = (key: string, listener: OnWayDeleted) => {
    this._wayUpdatedEventListenerManager.addEventListener(key, listener);
  };
  /**
   * Way가 업데이트된 후 호출되는 이벤트 리스너 삭제
   */
  removeWayUpdatedListener = (key: string) => {
    this._wayUpdatedEventListenerManager.removeEventListener(key);
  };
  /**
   * Way가 교체된 후 호출되는 이벤트 리스너 추가
   */
  addWayReplacedListener = (key: string, listener: OnWayReplace) => {
    this._wayReplacedEventListenerManager.addEventListener(key, listener);
  };
  /**
   * Way가 교체된 후 호출되는 이벤트 리스너 삭제
   */
  removeWayReplacedListener = (key: string) => {
    this._wayReplacedEventListenerManager.removeEventListener(key);
  };

  /**
   * Way에 Node가 추가된 후 호출되는 이벤트 리스너 추가
   */
  addNodeAddedToWayListener = (key: string, listener: OnWayNodeAdded) => {
    this._nodeAddedToWayEventListenerManager.addEventListener(key, listener);
  };
  /**
   * Way에 Node가 추가된 후 호출되는 이벤트 리스너 삭제
   */
  removeNodeAddedToWayListener = (key: string) => {
    this._nodeAddedToWayEventListenerManager.removeEventListener(key);
  };
  /**
   * Way에 Node가 삭제된 후 호출되는 이벤트 리스너 추가
   */
  addNodeDeletedFromWayListener = (key: string, listener: OnWayNodeDeleted) => {
    this._nodeDeletedFromWayEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  /**
   * Way에 Node가 삭제된 후 호출되는 이벤트 리스너 삭제
   */
  removeNodeDeletedFromWayListener = (key: string) => {
    this._nodeDeletedFromWayEventListenerManager.removeEventListener(key);
  };
  /**
   * Way의 Node들이 병합된 후 호출되는 이벤트 리스너 추가
   */
  addWayNodesMergedListener = (key: string, listener: OnWayNodesMerged) => {
    this._wayNodesMergedEventListenerManager.addEventListener(key, listener);
  };
  /**
   * Way의 Node들이 병합된 후 호출되는 이벤트 리스너 삭제
   */
  removeWayNodesMergedListener = (key: string) => {
    this._wayNodesMergedEventListenerManager.removeEventListener(key);
  };
  /**
   * Way의 태그가 변경된 후 호출되는 이벤트 리스너 추가
   */
  addWayTagsChangedListener = (
    key: string,
    listener: (way: GeoWay) => void,
  ) => {
    this._wayTagsChangedEventListenerManager.addEventListener(key, listener);
  };
  /**
   * Way의 태그가 변경된 후 호출되는 이벤트 리스너 삭제
   */
  removeWayTagsChangedListener = (key: string) => {
    this._wayTagsChangedEventListenerManager.removeEventListener(key);
  };
  /**
   * Way의 enabled가 변경된 후 호출되는 이벤트 리스너 추가
   */
  addWayEnabledChangedListener = (
    key: string,
    listener: (way: GeoWay, enabledNew: boolean) => void,
  ) => {
    this._wayEnabledChangedEventListenerManager.addEventListener(key, listener);
  };
  /**
   * Way의 enabled가 변경된 후 호출되는 이벤트 리스너 삭제
   */
  removeWayEnabledChangedListener = (key: string) => {
    this._wayEnabledChangedEventListenerManager.removeEventListener(key);
  };
  /**
   * Way들의 enabled가 변경된 후 호출되는 이벤트 리스너 추가
   */
  addWaysEnabledChangedDebounceListener = (
    key: string,
    listener: (
      wayMap: Readonly<Map<GeoWay, boolean>>,
      waysEnabledSet: Readonly<Set<GeoWay>>,
    ) => void,
  ) => {
    this._waysEnabledChangedDebounceEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  /**
   * Way들의 enabled가 변경된 후 호출되는 이벤트 리스너 삭제
   */
  removeWaysEnabledChangedDebounceListener = (key: string) => {
    this._waysEnabledChangedDebounceEventListenerManager.removeEventListener(
      key,
    );
  };
  /**
   * feature가 어딘가 변화되었다면 isFeatureEdited는 true가 되는 이벤트 리스너 추가
   */
  addFeatureEditedEventListener = (
    key: string,
    listener: (isFeatureEdited: boolean) => void,
  ) => {
    this._featureEditedEventListenerManager.addEventListener(key, listener);
  };
  removeFeatureEditedEventListener = (key: string) => {
    this._featureEditedEventListenerManager.removeEventListener(key);
  };

  isFeaturedEdited = () => {
    return this._isFeatureEdited;
  };

  setIsFeatureEdited = (isFeatureEdited: boolean) => {
    if (this.isFeaturedEdited() === isFeatureEdited) {
      return false;
    }
    this._featureEditedEventListenerManager.invokeEventListeners(
      isFeatureEdited,
    );
    this._isFeatureEdited = isFeatureEdited;
    return true;
  };

  /**
   * 위도/경도에 해당하는 Feature를 가져오거나 생성
   * @param latLng
   */
  getOrCreate = (latLng: GeoLatLngType): GeoMapFeature => {
    const key = getGeoMapFeatureKey(latLng);
    let feature = this._featureMap.get(key);
    if (!feature) {
      feature = {
        nodeMap: new Map(),
        wayMap: new Map(),
      };
      this._featureMap.set(key, feature);
    }
    return feature;
  };

  /**
   * ===============================================================================================
   * Node
   * ===============================================================================================
   */

  /**
   * Node 가져오기
   * @param nodeId
   * @exception Node가 없는 경우 에러 발생
   */
  getNode = (nodeId: number): GeoNode => {
    const node = this._nodeMap.get(nodeId);
    if (!node) {
      throw new Error(`getNode, Node not found. nodeId ${nodeId}`);
    }
    return node;
  };

  /**
   * 입력받은 Node ID들에 해당하는 Node들을 가져오기
   * @param nodeIds
   * @exception Node가 없는 경우 에러 발생
   */
  getNodes = (nodeIds: number[]): GeoNode[] => {
    return nodeIds.map((nodeId) => {
      const node = this._nodeMap.get(nodeId);
      if (!node) {
        throw new Error(`getNodes, Node not found. nodeId ${nodeId}`);
      }
      return node;
    });
  };

  /**
   * 모든 Node 가져오기
   */
  getAllNodes = () => {
    return Array.from(this._nodeMap.values());
  };

  /**
   * Enabled 상태인 Node들 가져오기
   */
  getNodesEnabled = () => {
    return Array.from(this._nodesEnabledSet);
  };

  /**
   * Node 추가
   * @param node
   */
  addNode = (node: GeoNode) => {
    if (this._nodeMap.has(node.getId())) {
      return undefined;
    }
    const latLng = node.getPosition();
    if (!latLng) {
      return undefined;
    }
    const feature = this.getOrCreate(latLng);
    feature.nodeMap.set(node.getId(), node);
    this._nodeMap.set(node.getId(), node);
    if (node.isEnabled()) {
      this._nodesEnabledSet.add(node);
    } else {
      this._nodesEnabledSet.delete(node);
    }
    node.addEnabledChangeEventListener((enabledNew) => {
      this._nodeEnabledChangedEventListenerManager.invokeEventListeners(
        node,
        enabledNew,
      );
      if (enabledNew) {
        this._nodesEnabledSet.add(node);
      } else {
        this._nodesEnabledSet.delete(node);
      }
      this._nodesEnabledChangedMap.set(node, enabledNew);
      this._nodesEnabledChangedDebounceEventListenerManager.invokeDebounceEventListeners(
        this._nodesEnabledChangedMap,
        this._nodesEnabledSet,
      );
    });
    this._nodeAddedEventListenerManager.invokeEventListeners(node);

    return feature;
  };

  /**
   * Node를 삭제
   * Node를 포함하고 있는 Way가 있으면 Way에서 Node를 삭제하고, Way가 사용 불가능한 경우 삭제
   * @param node 삭제할 Node
   */
  private _deleteNodeInternal = (
    node: GeoNode,
  ): GeoFeatureResult & {
    nodesTypesBeforeDelete: Map<GeoNode, Set<GeoNodeTypeEnum>>;
    nodesTypesAfterDelete: Map<GeoNode, Set<GeoNodeTypeEnum>>;
    nodeDeletedIndexesAtMapOfWay: Map<GeoWay, number[]>;
  } => {
    const waysUpdatedSet = new Set<GeoWay>();
    const waysDeletedSet = new Set<GeoWay>();
    const nodesDeletedSet = new Set<GeoNode>([node]);
    const nodesUpdatedSet = new Set<GeoNode>();
    const nodesUpdatedTypesMap = new Map<GeoNode, Set<GeoNodeTypeEnum>>();
    const nodesTypesBeforeDelete = new Map<GeoNode, Set<GeoNodeTypeEnum>>();
    const nodesTypesAfterDelete = new Map<GeoNode, Set<GeoNodeTypeEnum>>();
    const nodeDeletedIndexesAtMapOfWay = new Map<GeoWay, number[]>();

    const latLng = node.getPosition();
    const feature = this.getOrCreate(latLng);
    feature.nodeMap.delete(node.getId());
    this._nodeMap.delete(node.getId());

    // feature의 wayMap은 node의 위치를 갖고 있는
    feature.wayMap.forEach((way) => {
      if (!way.hasNode(node)) return;

      let nodesCountInWay = 0;
      way.getNodes().forEach((nodeInWay) => {
        if (nodeInWay === node) {
          nodesCountInWay += 1;
          return;
        }
        if (nodesTypesBeforeDelete.has(nodeInWay)) return;
        nodesTypesBeforeDelete.set(nodeInWay, this.getNodeTypes(nodeInWay));
      });
      for (let i = 0; i < nodesCountInWay; i++) {
        const indexOfDeleteNode = way.getNodes().indexOf(node);
        if (indexOfDeleteNode < 0) {
          continue;
        }
        if (way.deleteNode(indexOfDeleteNode)) {
          const nodeDeletedIndexes: number[] =
            nodeDeletedIndexesAtMapOfWay.get(way) || [];
          nodeDeletedIndexes.push(indexOfDeleteNode);
          nodeDeletedIndexesAtMapOfWay.set(way, nodeDeletedIndexes);
        }
      }
      feature.wayMap.delete(way.getId());
      const nodes = way.getNodes();
      if (nodes.length === 3 && nodes[0] === nodes[2]) {
        way.deleteNode(2);
      }

      if (way.isAvailable()) {
        way.updatePath();
        waysUpdatedSet.add(way);
      } else {
        const {
          nodesUpdated: addNodesUpdated,
          nodesDeleted: addNodesDeleted,
          waysDeleted: addWaysDeleted,
        } = this._deleteWayInternal(way);
        StructSetUtils.add(waysDeletedSet, addWaysDeleted);
        StructSetUtils.add(nodesDeletedSet, addNodesDeleted);
        StructSetUtils.add(nodesUpdatedSet, addNodesUpdated);
        waysDeletedSet.add(way);
      }
    });

    nodesTypesBeforeDelete.forEach((nodeTypes, nodeInWay) => {
      if (nodesDeletedSet.has(nodeInWay)) return;
      const nodeTypesNew = this.getNodeTypes(nodeInWay);
      nodesTypesAfterDelete.set(nodeInWay, nodeTypesNew);
      if (!StructSetUtils.isSame(nodeTypes, nodeTypesNew)) {
        nodesUpdatedSet.add(nodeInWay);
        nodesUpdatedTypesMap.set(nodeInWay, nodeTypes);
      }
    });

    return {
      nodesUpdated: Array.from(nodesUpdatedSet),
      nodesUpdatedTypesMap,
      nodesDeleted: Array.from(nodesDeletedSet),
      waysUpdated: Array.from(waysUpdatedSet),
      waysDeleted: Array.from(waysDeletedSet),
      nodesTypesBeforeDelete,
      nodesTypesAfterDelete,
      nodeDeletedIndexesAtMapOfWay,
    };
  };
  deleteNode = (node: GeoNode): GeoFeatureResult => {
    const results = this._deleteNodeInternal(node);
    results.nodesUpdatedTypesMap.forEach((nodeTypes, node) => {
      const nodeTypesNew = results.nodesTypesAfterDelete.get(node);
      const nodeTypesOld = results.nodesTypesBeforeDelete.get(node);
      nodeTypesNew &&
        nodeTypesOld &&
        this._nodeTypesChangedEventListenerManager.invokeEventListeners(
          node,
          nodeTypesNew,
          nodeTypesOld,
        );
    });
    results.nodesDeleted.forEach((node) => {
      this._nodeDeletedEventListenerManager.invokeEventListeners(node);
    });
    results.waysUpdated.forEach((way) => {
      results.nodeDeletedIndexesAtMapOfWay
        .get(way)
        ?.forEach((nodeDeletedIndexAtOfWay) => {
          this._nodeDeletedFromWayEventListenerManager.invokeEventListeners(
            way,
            node,
            nodeDeletedIndexAtOfWay,
          );
        });
      this._wayUpdatedEventListenerManager.invokeEventListeners(way);
    });
    results.waysDeleted.forEach((way) => {
      results.nodeDeletedIndexesAtMapOfWay
        .get(way)
        ?.forEach((nodeDeletedIndexAtOfWay) => {
          this._nodeDeletedFromWayEventListenerManager.invokeEventListeners(
            way,
            node,
            nodeDeletedIndexAtOfWay,
          );
        });
      this._wayDeletedEventListenerManager.invokeEventListeners(way);
    });

    this._nodesEnabledSet.delete(node);
    return results;
  };

  /**
   * 기존 노드를 새 노드로 교체. 기존 노드는 삭제됨. 기존 노드와 새 노드의 위치(position)은 동일해야 함
   * @param nodeOld 기존 노드
   * @param nodeNew 새 노드
   */
  mergeNode = (nodeOld: GeoNode, nodeNew: GeoNode): GeoFeatureResult => {
    if (
      !GeoMapUtils.isLatLngEquals(nodeOld.getPosition(), nodeNew.getPosition())
    ) {
      const message = `mergeNode, Node position is different. nodeOld.id: ${nodeOld.getId()}, nodeOld.position: lat: ${
        nodeOld.getPosition().lat
      }, lng: ${nodeOld.getPosition().lng}, nodeNew: lat: ${nodeNew.getPosition().lat}, lng: ${
        nodeNew.getPosition().lng
      }`;
      if (GeoMapUtils.IS_DEBUG) {
        throw new Error(message);
      }
      console.error(message);
      return {
        nodesUpdated: [],
        nodesUpdatedTypesMap: new Map(),
        nodesDeleted: [],
        waysUpdated: [],
        waysDeleted: [],
      };
    }

    const waysUpdatedSet = new Set<GeoWay>();
    const waysDeletedSet = new Set<GeoWay>();
    const nodesDeletedSet = new Set<GeoNode>();
    const nodesUpdatedSet = new Set<GeoNode>();
    const nodesTypesBeforeDelete = new Map<GeoNode, Set<GeoNodeTypeEnum>>();
    const nodesTypesAfterDelete = new Map<GeoNode, Set<GeoNodeTypeEnum>>();
    const nodesUpdatedTypesMap = new Map<GeoNode, Set<GeoNodeTypeEnum>>();
    const nodeMergedIndexAtMapOfWay = new Map<GeoWay, [number, number]>();
    const waysLengthBeforeMerge = new Map<GeoWay, number>();

    const feature = this.getOrCreate(nodeOld.getPosition());
    const { wayOfNodeOld, wayOfNodeNew } = Array.from(
      feature.wayMap.values(),
    ).reduce(
      (results, way) => {
        if (way.hasNode(nodeOld)) {
          results.wayOfNodeOld = way;
        }
        if (way.hasNode(nodeNew)) {
          results.wayOfNodeNew = way;
        }

        return results;
      },
      { wayOfNodeOld: undefined, wayOfNodeNew: undefined } as {
        wayOfNodeOld: GeoWay | undefined;
        wayOfNodeNew: GeoWay | undefined;
      },
    );

    if (!wayOfNodeOld || !wayOfNodeNew) {
      const message = `mergeNode, Node is not in way. nodeOld.id: ${nodeOld.getId()}, wayOfNodeOld.id: ${wayOfNodeOld?.getId()},
       nodeNew.id: ${nodeNew.getId()}, wayOfNodeNew.id: ${wayOfNodeNew?.getId()}`;
      if (GeoMapUtils.IS_DEBUG) {
        throw new Error(message);
      }
      console.error(message);
      return {
        nodesUpdated: [],
        nodesUpdatedTypesMap: new Map(),
        nodesDeleted: [],
        waysUpdated: [],
        waysDeleted: [],
      };
    }

    feature.nodeMap.delete(nodeOld.getId());
    nodesDeletedSet.add(nodeOld);

    nodesTypesBeforeDelete.set(nodeNew, this.getNodeTypes(nodeNew));

    feature.wayMap.forEach((way) => {
      if (!way.hasNode(nodeOld)) {
        return;
      }
      waysLengthBeforeMerge.set(way, way.getNodes().length);

      const nodeDeletedIndexAtOfWay = way.mergeNode(nodeOld, nodeNew);
      if (nodeDeletedIndexAtOfWay === undefined) {
        return;
      }
      const nodeNewIndexAtOfWay = way.getIndexOfNode(nodeNew);
      nodeMergedIndexAtMapOfWay.set(way, [
        nodeDeletedIndexAtOfWay,
        nodeNewIndexAtOfWay,
      ]);
    });

    feature.wayMap.forEach((way) => {
      if (way.isAvailable()) {
        waysUpdatedSet.add(way);
        way.updatePath();
      } else {
        const {
          nodesUpdated: addNodesUpdated,
          nodesDeleted: addNodesDeleted,
          waysDeleted: addWaysDeleted,
        } = this._deleteWayInternal(way);
        StructSetUtils.add(waysDeletedSet, addWaysDeleted);
        StructSetUtils.add(nodesDeletedSet, addNodesDeleted);
        StructSetUtils.add(nodesUpdatedSet, addNodesUpdated);
        waysDeletedSet.add(way);
      }
    });

    nodesTypesBeforeDelete.forEach((nodeTypes, nodeInWay) => {
      if (nodesDeletedSet.has(nodeInWay)) return;
      const nodeTypesNew = this.getNodeTypes(nodeInWay);
      nodesTypesAfterDelete.set(nodeInWay, nodeTypesNew);
      if (!StructSetUtils.isSame(nodeTypes, nodeTypesNew)) {
        nodesUpdatedSet.add(nodeInWay);
        nodesUpdatedTypesMap.set(nodeInWay, nodeTypes);
      }
    });

    const results = {
      nodesUpdated: Array.from(nodesUpdatedSet),
      nodesUpdatedTypesMap,
      nodesDeleted: Array.from(nodesDeletedSet),
      waysUpdated: Array.from(waysUpdatedSet),
      // 두개의 점 밖에 없는 선인 경우 인접한 점 끼리 머지되어 way가 isAvailable 하지 않을 때
      waysDeleted: Array.from(waysDeletedSet),
    };

    nodeMergedIndexAtMapOfWay.forEach(
      ([nodeDeletedIndexAtBeforeMerged, nodeIndexAtBeforeMerged], way) => {
        this._wayNodesMergedEventListenerManager.invokeEventListeners(
          way,
          nodeOld,
          nodeNew,
          nodeDeletedIndexAtBeforeMerged,
          nodeIndexAtBeforeMerged,
          waysLengthBeforeMerge.get(way) || 0,
        );
      },
    );

    nodesUpdatedTypesMap.forEach((nodeTypesOld, node) => {
      const nodeTypesNew = nodesTypesAfterDelete.get(node);
      nodeTypesNew &&
        this._nodeTypesChangedEventListenerManager.invokeEventListeners(
          node,
          nodeTypesNew,
          nodeTypesOld,
        );
    });
    results.nodesDeleted.forEach((node) => {
      this._nodeMap.delete(nodeOld.getId());
      this._nodeDeletedEventListenerManager.invokeEventListeners(node);
    });
    results.waysUpdated.forEach((way) => {
      this._wayUpdatedEventListenerManager.invokeEventListeners(way);
    });
    results.waysDeleted.forEach((way) => {
      this._wayMap.delete(way.getId());
      this._wayDeletedEventListenerManager.invokeEventListeners(way);
    });
    return results;
  };

  cloneNode = (originalNode: GeoNode) => {
    // 1. 기존 노드의 상태 가져오기
    const id = originalNode.getId();
    const position = originalNode.getPosition();
    const googleMap = originalNode.getGoogleMap();
    const options: GeoNodeOptionType = {
      ...originalNode.getMarkerOptions(),
      contentRenderFn: () => originalNode.getContent(),
    };
    const tags = originalNode.getTags();

    // 2. 새로운 노드 인스턴스 생성
    return new GeoNode({ position, id, googleMap, options, tags });
  };

  getNodesInbounds = (
    bounds: google.maps.LatLngBounds,
    nodeTypes?: Set<GeoNodeTypeEnum>,
  ): GeoNode[] => {
    return this.getAllNodes().filter((node) => {
      if (
        nodeTypes &&
        StructSetUtils.intersection(nodeTypes, this.getNodeTypes(node)).size ===
          0
      ) {
        return false;
      }
      return bounds.contains(node.getPosition());
    });
  };

  addNodeToWay = (
    nodeId: number,
    way: GeoWay,
    indexOf: number,
  ): GeoFeatureResult | undefined => {
    const node = this.getNode(nodeId);
    if (!node) {
      return undefined;
    }
    const result: GeoFeatureResult = {
      nodesUpdated: [],
      nodesUpdatedTypesMap: new Map(),
      nodesDeleted: [],
      waysUpdated: [],
      waysDeleted: [],
    };
    const nodeOfIndex =
      indexOf === 0
        ? way.getStartNode()
        : indexOf >= way.getNodes().length
          ? way.getEndNode()
          : undefined;
    const nodeOfIndexTypeOld = nodeOfIndex
      ? this.getNodeTypes(nodeOfIndex)
      : undefined;
    const nodeTypesOld = this.getNodeTypes(node);
    way.addNode(node, indexOf);
    this.getOrCreate(node.getPosition()).wayMap.set(way.getId(), way);
    const nodeTypesNew = this.getNodeTypes(node);
    if (!StructSetUtils.isSame(nodeTypesOld, nodeTypesNew)) {
      result.nodesUpdatedTypesMap.set(node, nodeTypesOld);
      this._nodeTypesChangedEventListenerManager.invokeEventListeners(
        node,
        nodeTypesNew,
        nodeTypesOld,
      );
    }
    if (nodeOfIndex && nodeOfIndexTypeOld) {
      const nodeOfIndexTypeNew = this.getNodeTypes(nodeOfIndex);
      if (!StructSetUtils.isSame(nodeOfIndexTypeOld, nodeOfIndexTypeNew)) {
        result.nodesUpdatedTypesMap.set(nodeOfIndex, nodeOfIndexTypeOld);
        this._nodeTypesChangedEventListenerManager.invokeEventListeners(
          nodeOfIndex,
          nodeOfIndexTypeNew,
          nodeOfIndexTypeOld,
        );
      }
    }
    way.updatePath();
    result.waysUpdated.push(way);
    this._nodeAddedToWayEventListenerManager.invokeEventListeners(
      way,
      node,
      indexOf,
    );

    return result;
  };

  deleteNodeFromWayByIndex = (
    way: GeoWay,
    nodeIndex: number,
  ): GeoFeatureResult | undefined => {
    const node = way.getNodeOfIndex(nodeIndex);
    if (!node) {
      return undefined;
    }
    const waysUpdatedSet = new Set<GeoWay>();
    const waysDeletedSet = new Set<GeoWay>();
    const nodesDeletedSet = new Set<GeoNode>();
    const nodesUpdatedSet = new Set<GeoNode>();
    const nodesUpdatedTypesMap = new Map<GeoNode, Set<GeoNodeTypeEnum>>();
    const nodesTypesBeforeDelete = new Map<GeoNode, Set<GeoNodeTypeEnum>>();
    const nodesTypesAfterDelete = new Map<GeoNode, Set<GeoNodeTypeEnum>>();
    const nodeDeletedIndexesAtMapOfWay = new Map<GeoWay, number[]>();

    const latLng = node.getPosition();
    const feature = this.getOrCreate(latLng);

    nodesTypesBeforeDelete.set(node, this.getNodeTypes(node));

    const isNodeBelongAnotherWays = this.getWaysWithNode(node).some(
      (wayWithNode) => wayWithNode !== way,
    );
    const countOfNodes = way.getCountOfNodes(node);
    if (!isNodeBelongAnotherWays && countOfNodes === 1) {
      feature.nodeMap.delete(node.getId());
    }

    if (countOfNodes === 1) {
      feature.wayMap.delete(way.getId());
    }

    if (way.deleteNode(nodeIndex)) {
      const nodeDeletedIndexes: number[] =
        nodeDeletedIndexesAtMapOfWay.get(way) || [];
      nodeDeletedIndexes.push(nodeIndex);
      nodeDeletedIndexesAtMapOfWay.set(way, nodeDeletedIndexes);
    }

    if (way.isAvailable()) {
      way.updatePath();
      waysUpdatedSet.add(way);
    } else {
      const {
        nodesUpdated: addNodesUpdated,
        nodesDeleted: addNodesDeleted,
        waysDeleted: addWaysDeleted,
        nodesUpdatedTypesMap: addNodeUpdatedTypesMap,
      } = this._deleteWayInternal(way);
      StructSetUtils.add(waysDeletedSet, addWaysDeleted);
      StructSetUtils.add(nodesDeletedSet, addNodesDeleted);
      StructSetUtils.add(nodesUpdatedSet, addNodesUpdated);
      addNodeUpdatedTypesMap.forEach((nodeTypes, node) => {
        nodesTypesBeforeDelete.set(node, nodeTypes);
      });
      waysDeletedSet.add(way);
    }

    if (this.getWaysWithNode(node).length === 0) {
      const resultDeleteNode = this._deleteNodeInternal(node);
      StructSetUtils.add(nodesDeletedSet, resultDeleteNode.nodesDeleted);
      StructSetUtils.add(nodesUpdatedSet, resultDeleteNode.nodesUpdated);
      StructSetUtils.add(waysUpdatedSet, resultDeleteNode.waysUpdated);
      StructSetUtils.add(waysDeletedSet, resultDeleteNode.waysDeleted);
    }

    nodesTypesBeforeDelete.forEach((nodeTypes, nodeInWay) => {
      if (nodesDeletedSet.has(nodeInWay)) return;
      const nodeTypesNew = this.getNodeTypes(nodeInWay);
      nodesTypesAfterDelete.set(nodeInWay, nodeTypesNew);
      if (!StructSetUtils.isSame(nodeTypes, nodeTypesNew)) {
        nodesUpdatedSet.add(nodeInWay);
        nodesUpdatedTypesMap.set(nodeInWay, nodeTypes);
      }
    });

    const results = {
      nodesUpdated: Array.from(nodesUpdatedSet),
      nodesUpdatedTypesMap,
      nodesDeleted: Array.from(nodesDeletedSet),
      waysUpdated: Array.from(waysUpdatedSet),
      waysDeleted: Array.from(waysDeletedSet),
    };
    nodesUpdatedTypesMap.forEach((nodeTypes, node) => {
      const nodeTypesNew = nodesTypesAfterDelete.get(node);
      const nodeTypesOld = nodesTypesBeforeDelete.get(node);
      nodeTypesNew &&
        nodeTypesOld &&
        this._nodeTypesChangedEventListenerManager.invokeEventListeners(
          node,
          nodeTypesNew,
          nodeTypesOld,
        );
    });
    results.nodesDeleted.forEach((node) => {
      this._nodeDeletedEventListenerManager.invokeEventListeners(node);
    });
    results.waysUpdated.forEach((way) => {
      nodeDeletedIndexesAtMapOfWay
        .get(way)
        ?.forEach((nodeDeletedIndexAtOfWay) => {
          this._nodeDeletedFromWayEventListenerManager.invokeEventListeners(
            way,
            node,
            nodeDeletedIndexAtOfWay,
          );
        });
      this._wayUpdatedEventListenerManager.invokeEventListeners(way);
    });
    results.waysDeleted.forEach((way) => {
      nodeDeletedIndexesAtMapOfWay
        .get(way)
        ?.forEach((nodeDeletedIndexAtOfWay) => {
          this._nodeDeletedFromWayEventListenerManager.invokeEventListeners(
            way,
            node,
            nodeDeletedIndexAtOfWay,
          );
        });
      this._wayDeletedEventListenerManager.invokeEventListeners(way);
    });

    return results;
  };

  getAdjacentNodes = (node: GeoNode): GeoNode[] => {
    return Array.from(
      this.getWaysWithNode(node).reduce((acc, way) => {
        way.getAdjacentNodes(node).forEach((adjacentNode) => {
          acc.add(adjacentNode);
        });
        return acc;
      }, new Set<GeoNode>()),
    );
  };

  getNodeWithinPx = (
    latLng: GeoLatLngType,
    px: number,
    options?: {
      nodesIdExclude?: number[];
      isClickable?: boolean;
      isDraggable?: boolean;
    },
  ): GeoNode | undefined => {
    const zoomLevel = this._map.getZoom();
    if (zoomLevel === undefined) {
      return undefined;
    }
    const { nodesIdExclude = [], isClickable, isDraggable } = options || {};

    const nodesIdExcludeSet = new Set(nodesIdExclude);

    const radius = GeoMapUtils.calculateDistance(latLng, px, this._map) ?? 0;
    let nodeClosest: GeoNode | undefined = undefined;
    let nodeClosestDistance: number = radius;
    this._nodeMap.forEach((node) => {
      if (
        nodesIdExcludeSet.has(node.getId()) ||
        (isClickable !== undefined && node.isClickable() !== isClickable) ||
        (isDraggable !== undefined && node.isDraggable() !== isDraggable)
      ) {
        return;
      }
      const distance = GeoMapUtils.getDistanceTwoPoint(
        node.getPosition(),
        latLng,
      );
      if (distance < nodeClosestDistance) {
        nodeClosest = node;
        nodeClosestDistance = distance;
      }
    });

    return nodeClosest;
  };

  getNodeClickableAndDraggableWithinPx = (
    latLng: GeoLatLngType,
    px: number,
    options?: { nodesIdExclude?: number[] },
  ): { nodeClickable?: GeoNode; nodeDraggable?: GeoNode } => {
    const zoomLevel = this._map.getZoom();
    if (zoomLevel === undefined) {
      return {};
    }
    const { nodesIdExclude = [] } = options || {};

    const nodesIdExcludeSet = new Set(nodesIdExclude);

    const radius = GeoMapUtils.calculateDistance(latLng, px, this._map) ?? 0;
    let nodeClickableClosest: GeoNode | undefined = undefined;
    let nodeClickableClosestDistance: number = radius;
    let nodeDraggableClosest: GeoNode | undefined = undefined;
    let nodeDraggableClosestDistance: number = radius;
    this._nodeMap.forEach((node) => {
      if (nodesIdExcludeSet.has(node.getId())) {
        return;
      }
      const distance = GeoMapUtils.getDistanceTwoPoint(
        node.getPosition(),
        latLng,
      );
      if (node.isClickable() && distance <= nodeClickableClosestDistance) {
        nodeClickableClosest = node;
        nodeClickableClosestDistance = distance;
      }
      if (node.isDraggable() && distance <= nodeDraggableClosestDistance) {
        nodeDraggableClosest = node;
        nodeDraggableClosestDistance = distance;
      }
    });

    return {
      nodeClickable: nodeClickableClosest,
      nodeDraggable: nodeDraggableClosest,
    };
  };

  /**
   * ===============================================================================================
   * Way
   * ===============================================================================================
   */
  getWay = (wayId: number): GeoWay => {
    const way = this._wayMap.get(wayId);
    if (!way) {
      throw new Error(`getWay, Way not found. WayId ${wayId}`);
    }
    return way;
  };

  getWays = (wayIds: number[]): GeoWay[] => {
    return wayIds.map((wayId) => {
      const way = this._wayMap.get(wayId);
      if (!way) {
        throw new Error(`getWays, Way not found. WayId ${wayId}`);
      }
      return way;
    });
  };
  /**
   * 인접한 두 Node를 포함하는 Way들 가져오기
   * @param node1
   * @param node2
   */
  getWaysOfSiblingNodes = (node1: GeoNode, node2: GeoNode): GeoWay[] => {
    return this.getWaysWithNode(node1).filter((way) => {
      if (!way.hasNode(node2)) {
        return false;
      }
      const indexOfNode1 = way.getIndexOfNode(node1);
      const indexOfNode2 = way.getIndexOfNode(node2);
      return Math.abs(indexOfNode1 - indexOfNode2) === 1;
    });
  };
  /**
   * 모든 Way 가져오기
   */
  getAllWays = () => {
    return Array.from(this._wayMap.values());
  };

  /**
   * Enabled 상태인 Way들 가져오기
   */
  getWaysEnabled = () => {
    return Array.from(this._waysEnabledSet);
  };

  /**
   * Way 추가
   * @param way
   * @return types이 변경된 Node들의 Map. key: Node, value: 변경 전 types
   */
  addWay = (way: GeoWay): Map<GeoNode, Set<GeoNodeTypeEnum>> | undefined => {
    // 왜 enableSetWay에 계속 같은 id값이 남아있지??
    this._waysEnabledSet.forEach((way) => {
      if (!way.isAvailable()) {
        way.destroy();
      }
    });
    if (this._wayMap.has(way.getId())) {
      return undefined;
    }
    way.addTagsChangeListener(
      this._wayTagsChangedEventListenerManager.invokeEventListeners,
    );
    way.addEnabledChangeListener((enabledNew) => {
      this._wayEnabledChangedEventListenerManager.invokeEventListeners(
        way,
        enabledNew,
      );
      if (enabledNew) {
        this._waysEnabledSet.add(way);
      } else {
        this._waysEnabledSet.delete(way);
      }
      this._waysEnabledChangedMap.set(way, enabledNew);
      this._waysEnabledChangedDebounceEventListenerManager.invokeDebounceEventListeners(
        this._waysEnabledChangedMap,
        this._waysEnabledSet,
      );
    });

    if (way.isEnabled()) {
      this._waysEnabledSet.add(way);
    } else {
      this._waysEnabledSet.delete(way);
    }

    const nodesTypesOldMap = new Map<GeoNode, Set<GeoNodeTypeEnum>>();
    const nodesUpdatedTypesMap = new Map<GeoNode, Set<GeoNodeTypeEnum>>();
    const nodesTypesNewMap = new Map<GeoNode, Set<GeoNodeTypeEnum>>();
    const nodes = way.getNodes();
    nodes.forEach((node) => {
      nodesTypesOldMap.set(node, this.getNodeTypes(node));
    });
    nodes.forEach((node) => {
      const latLng = node.getPosition();
      const nodeTypesOld = nodesTypesOldMap.get(node);
      if (!latLng || !nodeTypesOld) {
        return;
      }
      const feature = this.getOrCreate(latLng);
      feature.wayMap.set(way.getId(), way);
      const nodeTypesNew = this.getNodeTypes(node);
      if (!StructSetUtils.isSame(nodeTypesOld, nodeTypesNew)) {
        nodesUpdatedTypesMap.set(node, nodeTypesOld);
        nodesTypesNewMap.set(node, nodeTypesNew);
      }
    });
    this._wayMap.set(way.getId(), way);
    this._wayAddedEventListenerManager.invokeEventListeners(way);
    nodesUpdatedTypesMap.forEach((nodeTypesOld, node) => {
      const nodesTypes = nodesTypesNewMap.get(node);
      nodesTypes &&
        this._nodeTypesChangedEventListenerManager.invokeEventListeners(
          node,
          nodesTypes,
          nodeTypesOld,
        );
    });
    return nodesUpdatedTypesMap;
  };
  private _deleteWayInternal = (way: GeoWay): GeoFeatureResult => {
    const waysUpdatedSet = new Set<GeoWay>();
    const waysDeletedSet = new Set<GeoWay>([way]);
    const nodesDeletedSet = new Set<GeoNode>();
    const nodeUpdatedSet = new Set<GeoNode>();
    const nodesUpdatedTypesMap = new Map<GeoNode, Set<GeoNodeTypeEnum>>();

    way.getNodes().forEach((node) => {
      const feature = this.getOrCreate(node.getPosition());
      const nodeTypesOld = this.getNodeTypes(node);
      feature.wayMap.delete(way.getId());

      const waysWithNode = this.getWaysWithNode(node);
      if (waysWithNode.length === 0) {
        feature.nodeMap.delete(node.getId());
        this._nodeMap.delete(node.getId());
        nodesDeletedSet.add(node);
      } else {
        const nodeTypesNew = this.getNodeTypes(node);
        if (!StructSetUtils.isSame(nodeTypesOld, nodeTypesNew)) {
          nodeUpdatedSet.add(node);
          nodesUpdatedTypesMap.set(node, nodeTypesOld);
        }
      }
      const indexOfNode = way.getIndexOfNode(node);
      way.deleteNode(indexOfNode);
    });
    this._wayMap.delete(way.getId());

    return {
      nodesDeleted: Array.from(nodesDeletedSet),
      nodesUpdatedTypesMap,
      waysUpdated: Array.from(waysUpdatedSet),
      waysDeleted: Array.from(waysDeletedSet),
      nodesUpdated: Array.from(nodeUpdatedSet),
    };
  };
  deleteWay = (way: GeoWay): GeoFeatureResult => {
    const results = this._deleteWayInternal(way);

    results.nodesUpdatedTypesMap.forEach((nodesTypesOld, node) => {
      this._nodeTypesChangedEventListenerManager.invokeEventListeners(
        node,
        this.getNodeTypes(node),
        nodesTypesOld,
      );
    });
    results.nodesDeleted.forEach((node) => {
      this._nodeDeletedEventListenerManager.invokeEventListeners(node);
    });
    results.waysUpdated.forEach((way) => {
      this._wayUpdatedEventListenerManager.invokeEventListeners(way);
    });
    results.waysDeleted.forEach((way) => {
      this._wayDeletedEventListenerManager.invokeEventListeners(way);
    });

    this._waysEnabledSet.delete(way);

    return results;
  };

  refreshEnabledWays = () => {
    const deleteWays: GeoWay[] = [];
    this._waysEnabledSet.forEach((way) => {
      if (!way.isAvailable()) {
        deleteWays.push(way);
      }
    });
    deleteWays.forEach((way) => {
      this._waysEnabledSet.delete(way);
    });
    deleteWays.length = 0;
  };

  /**
   * 입력받은 nodes들에 포함된 way들에서 nodes를 끝점으로 하는 way들을 구성하는 nodes를 구하는 함수
   * @param nodes
   */
  getSplitWayNodesListByNodes = (nodes: GeoNode[]) => {
    const nodesSet = new Set(nodes);
    return this.getWaysWithNodes(nodes).reduce((result, way) => {
      result.set(way, way.splitByNodes(nodesSet));
      return result;
    }, new Map<GeoWay, GeoNode[][]>());
  };

  getSplitWayNodesListByNodesExcludePair = (
    nodesExcludePairListMap: Map<GeoWay, [GeoNode, GeoNode][]>,
  ) => {
    const isNodesExcludePair = (
      way: GeoWay,
      node1: GeoNode,
      node2: GeoNode,
    ) => {
      return !!nodesExcludePairListMap
        .get(way)
        ?.find(([node1InPair, node2InPair]) => {
          return (
            (node1InPair === node1 && node2InPair === node2) ||
            (node1InPair === node2 && node2InPair === node1)
          );
        });
    };
    const result: Map<GeoWay, GeoNode[][]> = new Map();
    nodesExcludePairListMap.forEach((nodeExcludePairList, way) => {
      let nodes = <GeoNode[]>[];
      let nodeStart: GeoNode | undefined;
      way.getNodes().forEach((node) => {
        if (nodeStart) {
          if (isNodesExcludePair(way, nodeStart, node)) {
            if (nodes.length > 0) {
              const nodesList = result.get(way) || [];
              nodesList.push(nodes);
              result.set(way, nodesList);
              nodes = [];
            }
          } else {
            if (nodes.length === 0) {
              nodes.push(nodeStart);
            }
            nodes.push(node);
          }
        }
        nodeStart = node;
      });
      const nodesList = result.get(way) || [];
      nodesList.push(nodes);
      result.set(way, nodesList);
    });
    return result;
  };

  replaceWay = (waysAdded: GeoWay[], wayDeleted: GeoWay) => {
    const tags = wayDeleted.getTags();
    waysAdded.forEach((way) => {
      tags && way.setTags(tags);
      this.addWay(way);
    });
    this._wayReplacedEventListenerManager.invokeEventListeners(
      waysAdded,
      wayDeleted,
    );
    this.deleteWay(wayDeleted);
  };

  updateNodeLatLng = (node: GeoNode, latLngNew: GeoLatLngType): GeoWay[] => {
    const waysUpdated = <GeoWay[]>[];
    if (GeoMapUtils.isLatLngEquals(node.getPosition(), latLngNew)) {
      return waysUpdated;
    }

    const feature = this.getOrCreate(node.getPosition());
    const featureNew = this.getOrCreate(latLngNew);

    featureNew.nodeMap.set(node.getId(), node);
    feature.nodeMap.delete(node.getId());

    const oldFeatureNodes = Array.from(feature.nodeMap.values());

    feature.wayMap.forEach((way) => {
      if (way.hasNode(node)) {
        featureNew.wayMap.set(way.getId(), way);
        waysUpdated.push(way);
      }
    });

    waysUpdated.forEach((way) => {
      if (!way.hasSomeNodes(...oldFeatureNodes)) {
        feature.wayMap.delete(way.getId());
      }
    });

    node.setPosition(latLngNew);
    waysUpdated.forEach((way) => {
      way.updatePath();
      this._wayUpdatedEventListenerManager.invokeEventListeners(way);
    });
    this._nodePositionChangedEventListenerManager.invokeEventListeners(node);
    return waysUpdated;
  };

  getNodeTypes = (node: GeoNode): Set<GeoNodeTypeEnum> => {
    const typesSet = new Set<GeoNodeTypeEnum>();
    const feature = this.getOrCreate(node.getPosition());
    const ways = Array.from(feature.wayMap.values()).filter((way) =>
      way.hasNode(node),
    );
    for (const way of ways) {
      if (way.isStartNode(node)) {
        if (typesSet.has(GeoNodeTypeEnum.START)) {
          typesSet.add(GeoNodeTypeEnum.START_MULTIPLE);
        } else {
          typesSet.add(GeoNodeTypeEnum.START);
        }
      }
      if (way.isEndNode(node)) {
        if (typesSet.has(GeoNodeTypeEnum.END)) {
          typesSet.add(GeoNodeTypeEnum.END_MULTIPLE);
        } else {
          typesSet.add(GeoNodeTypeEnum.END);
        }
      }
      if (way.isSegmentalNode(node)) {
        if (typesSet.has(GeoNodeTypeEnum.SEGMENTAL)) {
          typesSet.add(GeoNodeTypeEnum.SEGMENTAL_MULTIPLE);
        } else {
          typesSet.add(GeoNodeTypeEnum.SEGMENTAL);
        }
      }
      if (typesSet.size === 6) {
        break;
      }
    }
    return typesSet;
  };

  /**
   * Node가 포함되어 있는지 확인
   * @param nodeId
   */
  isNodeContains = (nodeId: number) => {
    return this._nodeMap.has(nodeId);
  };

  /**
   * Way가 포함되어 있는지 확인
   * @param wayId
   */
  isWayContains = (wayId: number) => {
    return this._wayMap.has(wayId);
  };

  /**
   * 입력받은 Node를 포함하는 Way들을 가져오기
   * @param node
   */
  getWaysWithNode = (node: GeoNode): GeoWay[] => {
    const ways = <GeoWay[]>[];
    const latLng = node.getPosition();
    const feature = this.getOrCreate(latLng);
    feature.wayMap.forEach((way) => {
      if (way.hasNode(node)) {
        ways.push(way);
      }
    });
    return ways;
  };

  getWaysWithNodes = (nodes: GeoNode[]): GeoWay[] => {
    const waysSet = new Set<GeoWay>();
    nodes.forEach((node) => {
      const latLng = node.getPosition();
      if (!latLng) {
        return;
      }
      const feature = this.getOrCreate(latLng);
      feature.wayMap.forEach((way) => {
        if (way.hasSomeNodes(...nodes)) {
          waysSet.add(way);
        }
      });
    });
    return Array.from(waysSet);
  };

  destroy = () => {
    this._nodeMap.forEach((node) => {
      node.destroy();
    });
    this._wayMap.forEach((way) => {
      way.destroy();
    });
    this._nodeMap.clear();
    this._wayMap.clear();
    this._featureMap.clear();
    this._nodesEnabledSet.clear();
    this._nodesEnabledChangedMap.clear();
    this._nodeAddedEventListenerManager.destroy();
    this._nodeDeletedEventListenerManager.destroy();
    this._nodePositionChangedEventListenerManager.destroy();
    this._nodeEnabledChangedEventListenerManager.destroy();
    this._nodeTypesChangedEventListenerManager.destroy();
    this._nodesEnabledChangedDebounceEventListenerManager.destroy();

    this._waysEnabledSet.clear();
    this._waysEnabledChangedMap.clear();
    this._wayAddedEventListenerManager.destroy();
    this._wayDeletedEventListenerManager.destroy();
    this._wayUpdatedEventListenerManager.destroy();
    this._wayReplacedEventListenerManager.destroy();
    this._nodeAddedToWayEventListenerManager.destroy();
    this._nodeDeletedFromWayEventListenerManager.destroy();
    this._wayNodesMergedEventListenerManager.destroy();
    this._waysEnabledChangedDebounceEventListenerManager.destroy();
    this._wayTagsChangedEventListenerManager.destroy();

    this._featureEditedEventListenerManager.destroy();
  };
}

export default GeoFeatureManager;
