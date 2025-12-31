import EventListenerManager from '@design-system/geo-map/event/EventListenerManager';
import GeoMapEventManager, {
  GeoMapEventRemover,
} from '@design-system/geo-map/event/GeoMapEventManager';
import GeoFeatureManager, {
  GeoNodeTypeEnum,
} from '@design-system/geo-map/feature/GeoFeatureManager';
import GeoNode from '@design-system/geo-map/feature/GeoNode';
import GeoWay from '@design-system/geo-map/feature/GeoWay';
import GeoMarker, {
  MarkerIdType,
} from '@design-system/geo-map/marker/GeoMarker';
import GeoMarkerManager from '@design-system/geo-map/marker/GeoMarkerManager';
import { GeoLatLngType } from '@design-system/types/geoMap.type';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';

/**
 * Node의 visible 상태 변경된 후 호출되는 이벤트
 * @param node 변경된 Node
 * @param isVisible 변경된 visible 상태
 */
export type OnNodeVisibleChanged = (
  node: GeoNode,
  isVisible: boolean,
  nodeTypes: Set<GeoNodeTypeEnum>,
) => void;
/**
 * Way의 visible 상태 변경된 후 호출되는 이벤트
 * @param way 변경된 Way
 * @param isVisible 변경된 visible 상태
 */
export type OnWayVisibleChanged = (way: GeoWay, isVisible: boolean) => void;
/**
 * Marker의 visible 상태 변경된 후 호출되는 이벤트
 * @param marker 변경된 Marker
 * @param isVisible 변경된 visible 상태
 */
export type OnMarkerVisibleChanged = (
  marker: GeoMarker,
  isVisible: boolean,
) => void;

export interface GeoFeatureVisiblePolicy {
  /**
   * EndpointNode를 보여줄지 여부
   * NodeTypes에 Endpoint가 포함되어 있어야 함
   */
  isEndpointNodeVisible: boolean;
  /**
   * SegmentNode를 보여줄지 여부
   * NodeTypes에 Segment가 포함되어 있어야 함
   */
  isSegmentNodeVisible: boolean;
  /**
   * Way를 보여줄지 여부
   */
  isWayVisible: boolean;
  /**
   * Node를 숨기는 기준 줌 레벨. undefined인 경우 숨기지 않음
   */
  nodeHideZoomLevel: number | undefined;
  /**
   * Marker를 보여줄지 여부
   */
  isMarkerVisible: boolean;
}

const EVENT_KEY = 'GeoFeatureVisibleManager';

class GeoFeatureVisibleManager {
  static GEO_FEATURE_VISIBLE_MANAGER_POLICY_DEFAULT: GeoFeatureVisiblePolicy = {
    isEndpointNodeVisible: true,
    isSegmentNodeVisible: true,
    isWayVisible: true,
    nodeHideZoomLevel: undefined,
    isMarkerVisible: true,
  };

  private readonly _markerManager: GeoMarkerManager;
  private readonly _featureManager: GeoFeatureManager;
  private readonly _mapEventManager: GeoMapEventManager;
  private readonly _mapEventRemover: GeoMapEventRemover;

  private readonly _map: google.maps.Map;
  private _policy: GeoFeatureVisiblePolicy;

  private _isNodesHiddenByZoomLevel = false;

  private _mapBounds?: google.maps.LatLngBounds;
  private _nodesInBoundsSet: Set<GeoNode> = new Set();
  private _waysInBoundsSet: Set<GeoWay> = new Set();
  private _markersInBoundsSet: Set<GeoMarker> = new Set();

  /**
   * 보여지는 Node를 저장
   * key는 Node의 ID
   * @private
   */
  private _nodeVisibleMap: Map<number, GeoNode> = new Map();
  /**
   * Node의 visible 상태 변경된 이벤트를 관리
   */
  private _nodeVisibleChangedEventListenerManager: EventListenerManager<
    string,
    OnNodeVisibleChanged
  > = new EventListenerManager();

  /**
   * 보여지는 Way를 저장
   * key는 Way의 ID
   * @private
   */
  private _wayVisibleMap: Map<number, GeoWay> = new Map();
  /**
   * Way의 visible 상태 변경된 이벤트를 관리
   */
  private _wayVisibleChangedEventListenerManager: EventListenerManager<
    string,
    OnWayVisibleChanged
  > = new EventListenerManager();
  /**
   * Way의 visible 상태 변경된 이벤트 리스너 추가
   */
  addWayVisibleChangedListener = (
    key: string,
    listener: OnWayVisibleChanged,
  ) => {
    this._wayVisibleChangedEventListenerManager.addEventListener(key, listener);
  };
  /**
   * Way의 visible 상태 변경된 이벤트 리스너 삭제
   */
  removeWayVisibleChangedListener = (key: string) => {
    this._wayVisibleChangedEventListenerManager.removeEventListener(key);
  };

  /**
   * 보여지는 Marker를 저장
   * key는 Marker의 ID
   * @private
   */
  private _markerVisibleMap: Map<MarkerIdType, GeoMarker> = new Map();
  /**
   * Marker의 visible 상태 변경된 이벤트를 관리
   */
  private _markerVisibleChangedEventListenerManager: EventListenerManager<
    string,
    OnMarkerVisibleChanged
  > = new EventListenerManager();

  constructor(
    map: google.maps.Map,
    featureManager: GeoFeatureManager,
    mapEventManager: GeoMapEventManager,
    markerManager: GeoMarkerManager,
    policy: GeoFeatureVisiblePolicy = GeoFeatureVisibleManager.GEO_FEATURE_VISIBLE_MANAGER_POLICY_DEFAULT,
  ) {
    this._map = map;
    this._featureManager = featureManager;
    this._mapEventManager = mapEventManager;
    this._markerManager = markerManager;
    this._mapEventRemover = new GeoMapEventRemover(mapEventManager);
    this._policy = policy;

    this._featureManager.addNodeAddedListener(EVENT_KEY, (node) => {
      if (node.isVisible()) {
        this._nodeVisibleMap.set(node.getId(), node);
      }
      if (!this._mapBounds || this._policy.nodeHideZoomLevel === undefined) {
        return;
      }
      const isInBounds = this._mapBounds.contains(node.getPosition());
      if (isInBounds) {
        this._nodesInBoundsSet.add(node);
      }
      const isVisibleChanged = this.setNodeVisible(
        node,
        this._canNodeVisible(node, isInBounds),
      );
      if (!isVisibleChanged) {
        this._nodeVisibleChangedEventListenerManager.invokeEventListeners(
          node,
          node.isVisible(),
          this._featureManager.getNodeTypes(node),
        );
      }
    });
    this._featureManager.addNodeDeletedListener(EVENT_KEY, (node) => {
      this._nodeVisibleMap.delete(node.getId());
      this._nodesInBoundsSet.delete(node);
    });

    this._featureManager.addWayAddedListener(EVENT_KEY, (way) => {
      if (way.isVisible()) {
        this._wayVisibleMap.set(way.getId(), way);
      }
      if (!this._mapBounds) {
        return;
      }

      const geoMapBounds = GeoMapUtils.toGeoBoundsFromGoogleBounds(
        this._mapBounds,
      );
      const isInBounds =
        way
          .getNodes()
          .some((node) => !!this._mapBounds?.contains(node.getPosition())) ||
        way.isSomeInBounds(geoMapBounds);
      this._waysInBoundsSet.add(way);
      this.setWayVisible(way, isInBounds);
    });

    this._featureManager.addWayDeletedListener(EVENT_KEY, (way) => {
      this._wayVisibleMap.delete(way.getId());
      this._waysInBoundsSet.delete(way);
    });

    this._markerManager.addMarkerAddedEventListener(EVENT_KEY, (marker) => {
      if (marker.isVisible()) {
        this._markerVisibleMap.set(marker.getId(), marker);
      }
      if (!this._mapBounds) {
        return;
      }
      this.setMarkerVisible(
        marker,
        this._mapBounds.contains(marker.getPosition()),
      );
    });

    this._markerManager.addMarkerDeletedEventListener(EVENT_KEY, (marker) => {
      this._markerVisibleMap.delete(marker.getId());
      this._markersInBoundsSet.delete(marker);
    });

    this._markerManager.addMarkerPositionChangeEventListener(
      EVENT_KEY,
      (marker) => {
        const isInBounds = !!this._mapBounds?.contains(marker.getPosition());
        if (isInBounds) {
          this._markersInBoundsSet.add(marker);
        }
        if (isInBounds !== this.isMarkerVisible(marker)) {
          this.setMarkerVisible(marker, isInBounds);
        }
      },
    );

    this._mapEventRemover.addEventId(
      this._mapEventManager.addBoundsChangedStickyEventListener((bounds) => {
        this._mapBounds = bounds;
        this._nodesInBoundsSet.clear();
        const isAvailableZoomLevelToHideNode =
          this.isAvailableZoomLevelToHideNode(this._map.getZoom() ?? 0);
        this._featureManager.getAllNodes().forEach((node) => {
          const isInBounds = bounds.contains(node.getPosition());
          if (isInBounds) {
            this._nodesInBoundsSet.add(node);
          }
          this.setNodeVisible(node, this._canNodeVisible(node, isInBounds));
        });
        this._isNodesHiddenByZoomLevel = isAvailableZoomLevelToHideNode;

        this._waysInBoundsSet.clear();
        const geoMapBounds = GeoMapUtils.toGeoBoundsFromGoogleBounds(bounds);
        featureManager.getAllWays().forEach((way) => {
          const isInBounds =
            way
              .getNodes()
              .some((node) => bounds.contains(node.getPosition())) ||
            way.isSomeInBounds(geoMapBounds);
          if (isInBounds) {
            this._waysInBoundsSet.add(way);
          }
          if (isInBounds !== this.isWayVisible(way)) {
            this.setWayVisible(way, isInBounds);
          }
        });

        this._markersInBoundsSet.clear();
        this._markerManager.getAllMarker().forEach((marker) => {
          const isInBounds = bounds.contains(marker.getPosition());
          if (isInBounds) {
            this._markersInBoundsSet.add(marker);
          }
          if (isInBounds !== this.isMarkerVisible(marker)) {
            this.setMarkerVisible(marker, isInBounds);
          }
        });
      }),
    );
  }

  /**
   * Node의 visible 상태 변경된 후 호출되는 이벤트 리스너 추가
   * @param key
   * @param listener
   */
  addNodeVisibleChangedListener = (
    key: string,
    listener: OnNodeVisibleChanged,
  ) => {
    this._nodeVisibleChangedEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  /**
   * Node의 visible 상태 변경된 후 호출되는 이벤트 리스너 삭제
   * @param key
   */
  removeNodeVisibleChangedListener = (key: string) => {
    this._nodeVisibleChangedEventListenerManager.removeEventListener(key);
  };

  getNodesInBounds = (): GeoNode[] => {
    return Array.from(this._nodesInBoundsSet);
  };

  private _canNodeVisible = (node: GeoNode, isInBounds: boolean) => {
    const isAvailableZoomLevelToHideNode = this.isAvailableZoomLevelToHideNode(
      this._map.getZoom() ?? 0,
    );
    const nodeTypes = this._featureManager.getNodeTypes(node);
    const isEndpointNode =
      nodeTypes.has(GeoNodeTypeEnum.START) ||
      nodeTypes.has(GeoNodeTypeEnum.END);
    const isSegmentNode = nodeTypes.has(GeoNodeTypeEnum.SEGMENTAL);
    const isNodeConnectedMultipleWays =
      nodeTypes.has(GeoNodeTypeEnum.START_MULTIPLE) ||
      nodeTypes.has(GeoNodeTypeEnum.END_MULTIPLE) ||
      nodeTypes.has(GeoNodeTypeEnum.SEGMENTAL) ||
      (nodeTypes.has(GeoNodeTypeEnum.START) &&
        nodeTypes.has(GeoNodeTypeEnum.END));
    return (
      isInBounds &&
      ((this._policy.isEndpointNodeVisible && !isNodeConnectedMultipleWays) ||
        !isAvailableZoomLevelToHideNode) &&
      ((this._policy.isEndpointNodeVisible && isEndpointNode) ||
        (this._policy.isSegmentNodeVisible &&
          (isSegmentNode || nodeTypes.size === 0)))
    );
  };
  getNodesVisible = (): GeoNode[] => {
    return Array.from(this._nodeVisibleMap.values());
  };
  setNodeVisible = (node: GeoNode, visible: boolean) => {
    if (this.isNodeVisible(node) === visible) {
      return false;
    }
    const r = node.setVisible(visible);
    if (!r) {
      const message =
        'setNodeVisible, failed to node.setVisible. node:' + node.getId();
      if (GeoMapUtils.IS_DEBUG) {
        throw new Error(message);
      } else {
        console.error(message);
      }
      return false;
    }
    if (visible) {
      this._nodeVisibleMap.set(node.getId(), node);
    } else {
      this._nodeVisibleMap.delete(node.getId());
    }
    this._nodeVisibleChangedEventListenerManager.invokeEventListeners(
      node,
      visible,
      this._featureManager.getNodeTypes(node),
    );
    return true;
  };
  isNodeVisible = (node: GeoNode) => {
    const isNodeInVisibleMap = this._nodeVisibleMap.has(node.getId());
    if (node.isVisible() !== isNodeInVisibleMap) {
      const message = `isNodeVisible, visible state is not equals. node.isVisible ${node.isVisible()}, isNodeInVisibleMap ${isNodeInVisibleMap}, node.id: ${node.getId()}`;
      if (GeoMapUtils.IS_DEBUG) {
        throw new Error(message);
      } else {
        console.error(message);
      }
    }
    return isNodeInVisibleMap;
  };
  getNodeVisibleWithinPx = (
    latLng: GeoLatLngType,
    px: number,
    options?: {
      nodesIdExclude?: number[];
      isClickable?: boolean;
      isDraggable?: boolean;
      isNodeEnabled?: boolean;
    },
  ): GeoNode | undefined => {
    const {
      nodesIdExclude = [],
      isClickable,
      isDraggable,
      isNodeEnabled,
    } = options || {};
    const nodesIdExcludeSet = new Set(nodesIdExclude);
    const radius = GeoMapUtils.calculateDistance(latLng, px, this._map) ?? 0;
    let nodeClosest: GeoNode | undefined = undefined;
    let nodeClosestDistance: number = radius;

    this.getNodesVisible().forEach((node) => {
      if (
        nodesIdExcludeSet.has(node.getId()) ||
        (isClickable !== undefined && node.isClickable() !== isClickable) ||
        (isDraggable !== undefined && node.isDraggable() !== isDraggable) ||
        (isNodeEnabled !== undefined && node.isEnabled() !== isNodeEnabled)
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
    options?: { nodesIdExclude?: number[]; isNodeEnabled?: boolean },
  ): { nodeClickable?: GeoNode; nodeDraggable?: GeoNode } => {
    const { nodesIdExclude = [], isNodeEnabled } = options || {};
    const nodesIdExcludeSet = new Set(nodesIdExclude);

    const radius = GeoMapUtils.calculateDistance(latLng, px, this._map) ?? 0;
    let nodeClickableClosest: GeoNode | undefined = undefined;
    let nodeClickableClosestDistance: number = radius;
    let nodeDraggableClosest: GeoNode | undefined = undefined;
    let nodeDraggableClosestDistance: number = radius;
    this._nodesInBoundsSet.forEach((node) => {
      if (
        (isNodeEnabled !== undefined && isNodeEnabled !== node.isEnabled()) ||
        nodesIdExcludeSet.has(node.getId())
      ) {
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

  getWayInBounds = (): GeoWay[] => {
    return Array.from(this._waysInBoundsSet);
  };

  getWaysVisible = (): GeoWay[] => {
    return Array.from(this._wayVisibleMap.values());
  };
  setWayVisible = (way: GeoWay, visible: boolean) => {
    if (way.isVisible() === visible) {
      return false;
    }
    const r = way.setVisible(visible);
    if (!r) {
      const message = 'setWayVisible, failed to way.setVisible. way:' + way;
      if (GeoMapUtils.IS_DEBUG) {
        throw new Error(message);
      } else {
        console.error(message);
      }
      return false;
    }
    if (visible) {
      this._wayVisibleMap.set(way.getId(), way);
    } else {
      this._wayVisibleMap.delete(way.getId());
    }
    this._wayVisibleChangedEventListenerManager.invokeEventListeners(
      way,
      visible,
    );

    return true;
  };
  isWayVisible = (way: GeoWay) => {
    const isWayInVisibleMap = this._wayVisibleMap.has(way.getId());
    if (way.isVisible() !== isWayInVisibleMap) {
      const message = `isWayVisible, visible state is not equals. way.isVisible ${way.isVisible()}, isWayInVisibleMap ${isWayInVisibleMap}`;
      if (GeoMapUtils.IS_DEBUG) {
        throw new Error(message);
      } else {
        console.error(message);
      }
    }
    return isWayInVisibleMap;
  };

  isNodesHiddenByZoomLevel = () => {
    return this._isNodesHiddenByZoomLevel;
  };

  isAvailableZoomLevelToHideNode = (zoomLevel: number) => {
    return (
      this._policy.nodeHideZoomLevel !== undefined &&
      zoomLevel < this._policy.nodeHideZoomLevel
    );
  };
  /*
   * Node의 visible 상태 변경된 후 호출되는 이벤트 리스너 추가
   * @param key
   * @param listener
   */
  addMarkerVisibleChangedListener = (
    key: string,
    listener: OnMarkerVisibleChanged,
  ) => {
    return this._markerVisibleChangedEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  /**
   * Marker의 visible 상태 변경된 후 호출되는 이벤트 리스너 삭제
   * @param key
   */
  removeMarkerVisibleChangedListener = (key: string) => {
    return this._markerVisibleChangedEventListenerManager.removeEventListener(
      key,
    );
  };

  getMarkersInBounds = (): GeoMarker[] => {
    return Array.from(this._markersInBoundsSet);
  };

  getMarkersVisible = (): GeoMarker[] => {
    return Array.from(this._markerVisibleMap.values());
  };
  setMarkerVisible = (marker: GeoMarker, visible: boolean) => {
    if (this.isMarkerVisible(marker) === visible) {
      return false;
    }
    const r = marker.setVisible(visible);
    if (!r) {
      const message =
        'setMarkerVisible, failed to marker.setVisible. marker:' +
        marker.getId();
      if (GeoMapUtils.IS_DEBUG) {
        throw new Error(message);
      } else {
        console.error(message);
      }
      return false;
    }
    if (visible) {
      this._markerVisibleMap.set(marker.getId(), marker);
    } else {
      this._markerVisibleMap.delete(marker.getId());
    }
    this._markerVisibleChangedEventListenerManager.invokeEventListeners(
      marker,
      visible,
    );
    return true;
  };
  isMarkerVisible = (marker: GeoMarker) => {
    const isMarkerInVisibleMap = this._markerVisibleMap.has(marker.getId());
    if (marker.isVisible() !== isMarkerInVisibleMap) {
      const message = `isMarkerVisible, visible state is not equals. marker.isVisible ${marker.isVisible()}, isMarkerInVisibleMap ${isMarkerInVisibleMap}, marker.id: ${marker.getId()}`;
      if (GeoMapUtils.IS_DEBUG) {
        throw new Error(message);
      } else {
        console.error(message);
      }
    }
    return isMarkerInVisibleMap;
  };
  getMarkerVisibleWithinPx = (
    latLng: GeoLatLngType,
    px: number,
    options?: {
      markersIdExclude?: MarkerIdType[];
      isClickable?: boolean;
      isDraggable?: boolean;
    },
  ): GeoMarker | undefined => {
    const { markersIdExclude = [], isClickable, isDraggable } = options || {};

    const markersIdExcludeSet = new Set(markersIdExclude);

    const radius = GeoMapUtils.calculateDistance(latLng, px, this._map) ?? 0;
    let markerClosest: GeoMarker | undefined = undefined;
    let markerClosestDistance: number = radius;

    this.getMarkersVisible().forEach((node) => {
      if (
        markersIdExcludeSet.has(node.getId()) ||
        (isClickable !== undefined && node.isClickable() !== isClickable) ||
        (isDraggable !== undefined && node.isDraggable() !== isDraggable)
      ) {
        return;
      }
      const distance = GeoMapUtils.getDistanceTwoPoint(
        node.getPosition(),
        latLng,
      );
      if (distance < markerClosestDistance) {
        markerClosest = node;
        markerClosestDistance = distance;
      }
    });

    return markerClosest;
  };

  setPolicy = (policy: GeoFeatureVisiblePolicy) => {
    const {
      isEndpointNodeVisible,
      isSegmentNodeVisible,
      isWayVisible,
      nodeHideZoomLevel,
      isMarkerVisible,
    } = policy;
    this._policy.isEndpointNodeVisible = isEndpointNodeVisible;
    this._policy.isSegmentNodeVisible = isSegmentNodeVisible;
    this._policy.nodeHideZoomLevel = nodeHideZoomLevel;
    this._isNodesHiddenByZoomLevel = this.isAvailableZoomLevelToHideNode(
      this._map.getZoom() ?? 0,
    );
    this._nodesInBoundsSet.forEach((node) => {
      this.setNodeVisible(node, this._canNodeVisible(node, true));
    });

    if (this._policy.isWayVisible !== isWayVisible) {
      this._waysInBoundsSet.forEach((way) => {
        this.setWayVisible(way, isWayVisible);
      });
    }
    if (this._policy.isMarkerVisible !== isMarkerVisible) {
      this._markersInBoundsSet.forEach((marker) => {
        this.setMarkerVisible(marker, isMarkerVisible);
      });
    }
  };

  getPolicy = (): GeoFeatureVisiblePolicy => {
    return {
      isEndpointNodeVisible: this._policy.isEndpointNodeVisible,
      isSegmentNodeVisible: this._policy.isSegmentNodeVisible,
      isWayVisible: this._policy.isWayVisible,
      nodeHideZoomLevel: this._policy.nodeHideZoomLevel,
      isMarkerVisible: this._policy.isMarkerVisible,
    };
  };

  destroy = () => {
    this._nodesInBoundsSet.clear();
    this._waysInBoundsSet.clear();
    this._markersInBoundsSet.clear();

    this._nodeVisibleMap.clear();
    this._wayVisibleMap.clear();
    this._markerVisibleMap.clear();

    this._nodeVisibleChangedEventListenerManager.destroy();
    this._wayVisibleChangedEventListenerManager.destroy();
    this._markerVisibleChangedEventListenerManager.destroy();

    this._mapEventRemover.destroy();
  };
}

export default GeoFeatureVisibleManager;
