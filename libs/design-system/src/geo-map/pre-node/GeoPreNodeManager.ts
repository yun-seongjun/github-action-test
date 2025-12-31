import EventListenerManager from '@design-system/geo-map/event/EventListenerManager';
import GeoMapEventManager, {
  GeoMapEventRemover,
} from '@design-system/geo-map/event/GeoMapEventManager';
import GeoFeatureManager from '@design-system/geo-map/feature/GeoFeatureManager';
import GeoNode, {
  GeoNodeOptionType,
} from '@design-system/geo-map/feature/GeoNode';
import GeoWay from '@design-system/geo-map/feature/GeoWay';
import GeoLineSegment from '@design-system/geo-map/line-segment/GeoLineSegment';
import GeoLineSegmentManager from '@design-system/geo-map/line-segment/GeoLineSegmentManager';
import { GeoLatLngType } from '@design-system/types/geoMap.type';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';
import IdGenerator from '@design-system/utils/geo-map/IdGenerator';
import GeoHistoryManager from '@design-system/geo-map/history/GeoHistoryManager';

interface PreNodeParts {
  nodeStart: GeoNode;
  nodeEnd: GeoNode;
  way: GeoWay;
  preNode: GeoNode;
}

export interface GeoPreNodePolicy {
  isPreNodeEnable: boolean;
  isPreNodeClickEnable: boolean;
  isPreNodeDragEnable: boolean;
  isPreNodeRemoveOnDragStart: boolean;
  isPreNodeRemoveOnClick: boolean;
  /**
   * PreNode를 숨기는 기준 줌 레벨. undefined인 경우 숨기지 않음
   */
  preNodeEnabledZoomLevel: number | undefined;
}

const EVENT_KEY = 'PreNodeManager';

class GeoPreNodeManager {
  static INIT_POLICY: GeoPreNodePolicy = {
    isPreNodeEnable: false,
    isPreNodeDragEnable: false,
    isPreNodeClickEnable: false,
    isPreNodeRemoveOnDragStart: false,
    isPreNodeRemoveOnClick: false,
    preNodeEnabledZoomLevel: undefined,
  };
  private readonly _googleMap: google.maps.Map;
  private _idGenerator: IdGenerator;
  private readonly _featureManager: GeoFeatureManager;
  private readonly _lineSegmentManager: GeoLineSegmentManager;
  private readonly _mapEventManager: GeoMapEventManager;
  private _mapEventRemover: GeoMapEventRemover;
  private _historyManager: GeoHistoryManager;
  private _preNodeOption: GeoNodeOptionType;

  private _isPreNodeEnable = false;
  private _isPreNodeClickEnable = false;
  private _isPreNodeDragEnable = false;
  private _isPreNodeRemoveOnDragStart = false;
  private _isPreNodeRemoveOnClick = false;
  private _preNodeEnabledZoomLevel: number | undefined = undefined;

  private _zoomLevel: number;
  private _isPreNodesEnabledByZoomLevel = false;

  private _preNodeSet: Set<GeoNode> = new Set();
  private _preNodeMapOfNode: Map<GeoNode, Set<GeoNode>> = new Map();
  private _preNodeEventIdsMap: Map<GeoNode, Set<string>> = new Map();
  private _preNodePartsMapByPreNode: Map<GeoNode, PreNodeParts> = new Map();
  private _preNodePartsMapByWay: Map<GeoWay, Set<PreNodeParts>> = new Map();

  private _preNodeAddedEventListener: EventListenerManager<
    string,
    (preNode: GeoNode) => void
  > = new EventListenerManager();
  private _preNodeDeletedEventListener: EventListenerManager<
    string,
    (preNode: GeoNode) => void
  > = new EventListenerManager();
  private _preNodeRemovedEventListener: EventListenerManager<
    string,
    (
      preNode: GeoNode,
      way: GeoWay,
      nodeStart: GeoNode,
      nodeEnd: GeoNode,
    ) => void
  > = new EventListenerManager();

  constructor({
    zoomLevel,
    googleMap,
    idGenerator,
    featureManager,
    lineSegmentManager,
    mapEventManager,
    policy = GeoPreNodeManager.INIT_POLICY,
    options,
    historyManager,
  }: {
    zoomLevel: number;
    googleMap: google.maps.Map;
    idGenerator: IdGenerator;
    featureManager: GeoFeatureManager;
    lineSegmentManager: GeoLineSegmentManager;
    mapEventManager: GeoMapEventManager;
    policy?: GeoPreNodePolicy;
    options: GeoNodeOptionType;
    historyManager: GeoHistoryManager;
  }) {
    this._zoomLevel = zoomLevel;
    this._googleMap = googleMap;
    this._idGenerator = idGenerator;
    this._featureManager = featureManager;
    this._lineSegmentManager = lineSegmentManager;
    this._mapEventManager = mapEventManager;
    this._mapEventRemover = new GeoMapEventRemover(mapEventManager);
    this._preNodeOption = options;
    this._historyManager = historyManager;

    this._lineSegmentManager.addLineSegmentAddedEventListener(
      EVENT_KEY,
      (lineSegment) => {
        if (!this._isPreNodeEnable || !this._isPreNodesEnabledByZoomLevel) {
          return;
        }
        this._createPreNodeOfLineSegment(lineSegment);
      },
    );
    this._lineSegmentManager.addLineSegmentDeletedEventListener(
      EVENT_KEY,
      (lineSegment) => {
        if (!this._isPreNodeEnable || !this._isPreNodesEnabledByZoomLevel) {
          return;
        }
        const nodeStart = lineSegment.getNodeStart();
        const nodeEnd = lineSegment.getNodeEnd();
        this._destroyPreNodeOfLineSegment(lineSegment);
        /* preNode를 Node로 변경시 겹친 LineSegment가 제거되는 경우, PreNode를 생성
        Node와 Way의 정보가 다음과 같은 경우
        1 - 2 - 3
        way1의 노드: 1, 2, 3
        way2의 노드: 2, 3
        way1의 노드 2와 3의 preNode를 Node로 변경하면, way2의 노드 2와 3의 preNode가 사라지므로, way2의 preNode를 생성해야함
       */
        this._featureManager
          .getWaysOfSiblingNodes(nodeStart, nodeEnd)
          .forEach((way) => {
            const nodeParts = this._preNodePartsMapByWay.get(way);
            const isPreNodeExists =
              !!nodeParts &&
              Array.from(nodeParts).some((nodePart) => {
                return (
                  (nodePart.nodeStart === nodeStart &&
                    nodePart.nodeEnd === nodeEnd) ||
                  (nodePart.nodeStart === nodeEnd &&
                    nodePart.nodeEnd === nodeStart)
                );
              });
            if (!isPreNodeExists) {
              this._createPreNode(
                this._googleMap,
                this._idGenerator.getNextId(),
                way,
                nodeStart,
                nodeEnd,
                this._preNodeOption,
              );
            }
          });
      },
    );

    this._mapEventRemover.addEventId(
      this._mapEventManager.addZoomChangedStickyDebounceEventListener(
        (event, zoomLevelNew, zoomLevelOld) => {
          this._zoomLevel = zoomLevelNew;
          const isPreNodeEnabledZoomLevel = this.isPreNodeEnabledZoomLevel(
            this._zoomLevel,
          );
          if (
            this._isPreNodesEnabledByZoomLevel !== isPreNodeEnabledZoomLevel
          ) {
            if (this._isPreNodeEnable && isPreNodeEnabledZoomLevel) {
              this._lineSegmentManager
                .getAllLineSegments()
                .forEach((lineSegment) => {
                  this._createPreNodeOfLineSegment(lineSegment);
                });
            } else {
              this.getAllPreNodes().forEach((preNode) => {
                this._destroyPreNode(preNode);
              });
            }
            this._isPreNodesEnabledByZoomLevel = isPreNodeEnabledZoomLevel;
          }
        },
      ),
    );
    this._featureManager.addNodePositionChangedListener(EVENT_KEY, (node) => {
      if (!this._isPreNodeEnable) {
        return;
      }

      if (this._preNodeMapOfNode.has(node)) {
        this._updatePreNodesPosition(node);
      }
    });
    this.setPolicy(policy);
  }

  /**
   * =========================================================================================================
   * Policy
   * =========================================================================================================
   */
  getPolicy = (): GeoPreNodePolicy => {
    return {
      isPreNodeEnable: this._isPreNodeEnable,
      isPreNodeClickEnable: this._isPreNodeClickEnable,
      isPreNodeDragEnable: this._isPreNodeDragEnable,
      isPreNodeRemoveOnClick: this._isPreNodeRemoveOnClick,
      isPreNodeRemoveOnDragStart: this._isPreNodeRemoveOnDragStart,
      preNodeEnabledZoomLevel: this._preNodeEnabledZoomLevel,
    };
  };

  setPolicy = (policy: GeoPreNodePolicy) => {
    this.setIsPreNodeEnabled(policy.isPreNodeEnable);
    if (policy.isPreNodeEnable) {
      this.setIsPreNodeDragEnable(policy.isPreNodeDragEnable);
      this.setIsPreNodeClickEnable(policy.isPreNodeClickEnable);
      this.setIsPreNodeRemoveOnClick(policy.isPreNodeRemoveOnClick);
      this.setIsPreNodeRemoveOnDragStart(policy.isPreNodeRemoveOnDragStart);
      this.setIsPreNodeDragEnable(policy.isPreNodeDragEnable);
      this.setPreNodeEnabledZoomLevel(policy.preNodeEnabledZoomLevel);
    }
  };

  isPreNodeEnabled = () => {
    return this._isPreNodeEnable;
  };

  setIsPreNodeEnabled = (isPreNodeEnable: boolean) => {
    if (this._isPreNodeEnable === isPreNodeEnable) return;
    this._isPreNodeEnable = isPreNodeEnable;
    const isPreNodeEnabledZoomLevel = this.isPreNodeEnabledZoomLevel(
      this._zoomLevel,
    );

    if (isPreNodeEnable) {
      if (this._isPreNodeEnable && isPreNodeEnabledZoomLevel) {
        this._lineSegmentManager.getAllLineSegments().forEach((lineSegment) => {
          this._createPreNodeOfLineSegment(lineSegment);
        });
      } else {
        this.getAllPreNodes().forEach((preNode) => {
          this._destroyPreNode(preNode);
        });
      }
    } else {
      this.getAllPreNodes().forEach((preNode) => this._destroyPreNode(preNode));

      this.setIsPreNodeDragEnable(false);
      this.setIsPreNodeClickEnable(false);
      this.setIsPreNodeRemoveOnDragStart(false);
      this.setIsPreNodeDragEnable(false);
    }
  };

  isPreNodeClickEnable = () => {
    return this._isPreNodeClickEnable;
  };

  setIsPreNodeClickEnable = (isPreNodeClickEnable: boolean) => {
    if (!this._isPreNodeEnable) return;
    if (this._isPreNodeClickEnable === isPreNodeClickEnable) return;
    this._isPreNodeClickEnable = isPreNodeClickEnable;

    this.getAllPreNodes().forEach((preNode) =>
      preNode.setClickable(isPreNodeClickEnable),
    );
  };

  isPreNodeDragEnable = () => {
    return this._isPreNodeDragEnable;
  };

  setIsPreNodeDragEnable = (isPreNodeDragEnable: boolean) => {
    if (!this._isPreNodeEnable) return;
    if (this._isPreNodeDragEnable === isPreNodeDragEnable) return;
    this._isPreNodeDragEnable = isPreNodeDragEnable;

    this.getAllPreNodes().forEach((preNode) =>
      preNode.setDraggable(isPreNodeDragEnable),
    );
  };

  isPreNodeRemoveOnDragStart = () => {
    return this._isPreNodeRemoveOnDragStart;
  };

  setIsPreNodeRemoveOnDragStart = (isPreNodeRemoveOnDragStart: boolean) => {
    if (!this._isPreNodeEnable) return;
    if (this._isPreNodeRemoveOnDragStart === isPreNodeRemoveOnDragStart) return;
    this._isPreNodeRemoveOnDragStart = isPreNodeRemoveOnDragStart;
  };

  isPreNodeRemoveOnClick = () => {
    return this._isPreNodeRemoveOnClick;
  };

  setIsPreNodeRemoveOnClick = (isPreNodeRemoveOnClick: boolean) => {
    if (!this._isPreNodeEnable) return;
    if (this._isPreNodeRemoveOnClick === isPreNodeRemoveOnClick) return;
    this._isPreNodeRemoveOnClick = isPreNodeRemoveOnClick;
  };

  getPreNodeEnabledZoomLevel = () => {
    return this._preNodeEnabledZoomLevel;
  };

  setPreNodeEnabledZoomLevel = (
    preNodeEnabledZoomLevel: number | undefined,
  ) => {
    if (this._preNodeEnabledZoomLevel === preNodeEnabledZoomLevel) {
      return;
    }
    this._preNodeEnabledZoomLevel = preNodeEnabledZoomLevel;
    const isPreNodeEnabledZoomLevel = this.isPreNodeEnabledZoomLevel(
      this._zoomLevel,
    );
    if (this._isPreNodesEnabledByZoomLevel !== isPreNodeEnabledZoomLevel) {
      if (this._isPreNodeEnable && isPreNodeEnabledZoomLevel) {
        this._lineSegmentManager.getAllLineSegments().forEach((lineSegment) => {
          this._createPreNodeOfLineSegment(lineSegment);
        });
      } else {
        this.getAllPreNodes().forEach((preNode) =>
          this._destroyPreNode(preNode),
        );
      }
      this._isPreNodesEnabledByZoomLevel = isPreNodeEnabledZoomLevel;
    }
  };

  isPreNodeEnabledZoomLevel = (zoomLevel: number) => {
    return (
      this._preNodeEnabledZoomLevel === undefined ||
      zoomLevel >= this._preNodeEnabledZoomLevel
    );
  };

  private _createPreNode = (
    googleMap: google.maps.Map,
    nodeId: number,
    way: GeoWay,
    nodeStart: GeoNode,
    nodeEnd: GeoNode,
    nodeOption: GeoNodeOptionType,
  ) => {
    const centerLatLng = GeoMapUtils.getCenterLatLng(
      nodeStart.getPosition(),
      nodeEnd.getPosition(),
    );
    const preNode = new GeoNode({
      position: centerLatLng,
      id: nodeId,
      googleMap,
      options: nodeOption,
    });
    this._preNodeSet.add(preNode);
    const preNodeParts = {
      nodeStart,
      nodeEnd,
      way,
      preNode,
    };
    this._preNodePartsMapByPreNode.set(preNode, preNodeParts);
    if (this._preNodeMapOfNode.has(nodeStart)) {
      this._preNodeMapOfNode.get(nodeStart)?.add(preNode);
    } else {
      this._preNodeMapOfNode.set(nodeStart, new Set([preNode]));
    }
    if (this._preNodeMapOfNode.has(nodeEnd)) {
      this._preNodeMapOfNode.get(nodeEnd)?.add(preNode);
    } else {
      this._preNodeMapOfNode.set(nodeEnd, new Set([preNode]));
    }
    if (this._preNodePartsMapByWay.has(way)) {
      this._preNodePartsMapByWay.get(way)?.add(preNodeParts);
    } else {
      this._preNodePartsMapByWay.set(way, new Set([preNodeParts]));
    }

    const eventIdsSet =
      this._preNodeEventIdsMap.get(preNode) || new Set<string>();
    const clickEventId = preNode.addClickEventListener(() => {
      if (!this._isPreNodeRemoveOnClick) {
        return;
      }
      this._removePreNode(preNode);
      this._historyManager.clear();
    });
    eventIdsSet.add(clickEventId);

    const dragStartEventId = preNode.addDragStartEventListener(() => {
      if (!this._isPreNodeRemoveOnDragStart) {
        return;
      }
      this._removePreNode(preNode);
    });
    eventIdsSet.add(dragStartEventId);

    this._preNodeEventIdsMap.set(preNode, eventIdsSet);

    this._preNodeAddedEventListener.invokeEventListeners(preNode);
    return preNode;
  };

  private _createPreNodeOfLineSegment = (lineSegment: GeoLineSegment) => {
    return this._createPreNode(
      this._googleMap,
      this._idGenerator.getNextId(),
      lineSegment.getWay(),
      lineSegment.getNodeStart(),
      lineSegment.getNodeEnd(),
      this._preNodeOption,
    );
  };

  private _destroyPreNodeOfLineSegment = (lineSegment: GeoLineSegment) => {
    const preNode = this.getPreNodeByNodes(
      lineSegment.getNodeStart(),
      lineSegment.getNodeEnd(),
    );
    if (preNode) {
      this._destroyPreNode(preNode);
    }
  };

  getAllPreNodes = () => {
    return Array.from(this._preNodeSet);
  };

  getPreNodeParts = (way: GeoWay) => {
    return Array.from(this._preNodePartsMapByWay.get(way) || []);
  };

  getPreNodeByNodes = (nodeStart: GeoNode, nodeEnd: GeoNode) => {
    const preNodeSetOfNodeStart = this._preNodeMapOfNode.get(nodeStart);
    const preNodeSetOfNodeEnd = this._preNodeMapOfNode.get(nodeEnd);
    if (!preNodeSetOfNodeStart || !preNodeSetOfNodeEnd) {
      return undefined;
    }

    return Array.from(preNodeSetOfNodeStart).find((preNode) => {
      return preNodeSetOfNodeEnd.has(preNode);
    });
  };

  getPreNodeWithinPx = (
    latLng: GeoLatLngType,
    px: number,
  ): GeoNode | undefined => {
    const zoomLevel = this._googleMap.getZoom();
    if (zoomLevel === undefined) {
      return undefined;
    }

    const radius =
      GeoMapUtils.calculateDistance(latLng, px, this._googleMap) ?? 0;
    let preNodeClosest: GeoNode | undefined = undefined;
    let preNodeClosestDistance: number = radius;
    this._preNodeSet.forEach((preNode) => {
      const distance = GeoMapUtils.getDistanceTwoPoint(
        preNode.getPosition(),
        latLng,
      );
      if (distance <= preNodeClosestDistance) {
        preNodeClosest = preNode;
        preNodeClosestDistance = distance;
      }
    });

    return preNodeClosest;
  };

  isPreNodeExists = (preNode: GeoNode) => {
    return this._preNodeSet.has(preNode);
  };
  isPreNodeExistsByNodes = (nodeStart: GeoNode, nodeEnd: GeoNode) => {
    return !!this.getPreNodeByNodes(nodeStart, nodeEnd);
  };

  /**
   * 입력받은 Node와 관련된 PreNode들의 위치를 업데이트
   * @param node
   */
  private _updatePreNodesPosition = (node: GeoNode) => {
    this._preNodeMapOfNode.get(node)?.forEach((preNode) => {
      const { nodeStart, nodeEnd } =
        this._preNodePartsMapByPreNode.get(preNode) || {};
      if (nodeStart && nodeEnd) {
        const centerLatLng = GeoMapUtils.getCenterLatLng(
          nodeStart.getPosition(),
          nodeEnd.getPosition(),
        );
        preNode.setPosition(centerLatLng);
      }
    });
  };

  private _removePreNodeInternal = (preNode: GeoNode) => {
    const preNodeParts = this._preNodePartsMapByPreNode.get(preNode);
    if (!preNodeParts) {
      return undefined;
    }

    this._preNodeEventIdsMap.get(preNode)?.forEach((eventId) => {
      preNode.removeEventListener(eventId);
    });
    this._preNodeEventIdsMap.delete(preNode);
    this._preNodeSet.delete(preNode);
    const { nodeStart, nodeEnd, way } = preNodeParts;
    this._preNodePartsMapByPreNode.delete(preNode);
    this._preNodeMapOfNode.get(nodeStart)?.delete(preNode);
    this._preNodeMapOfNode.get(nodeEnd)?.delete(preNode);
    this._preNodePartsMapByWay.get(way)?.delete(preNodeParts);

    return preNodeParts;
  };

  private _removePreNode = (preNode: GeoNode) => {
    const preNodeParts = this._removePreNodeInternal(preNode);
    if (preNodeParts) {
      this._preNodeRemovedEventListener.invokeEventListeners(
        preNode,
        preNodeParts.way,
        preNodeParts.nodeStart,
        preNodeParts.nodeEnd,
      );
    }
  };

  private _destroyPreNode = (preNode: GeoNode) => {
    const preNodeParts = this._removePreNodeInternal(preNode);
    if (!preNodeParts) {
      return undefined;
    }
    this._preNodeDeletedEventListener.invokeEventListeners(preNode);
    preNode.destroy();
    return preNodeParts;
  };

  /**
   * =================================================================================================================
   * EventListener
   * =================================================================================================================
   */

  addPreNodeAddedEventListener = (
    key: string,
    listener: (preNode: GeoNode) => void,
  ) => {
    this._preNodeAddedEventListener.addEventListener(key, listener);
  };

  removePreNodeAddedEventListener = (key: string) => {
    this._preNodeAddedEventListener.removeEventListener(key);
  };

  addPreNodeDeletedEventListener = (
    key: string,
    listener: (preNode: GeoNode) => void,
  ) => {
    this._preNodeDeletedEventListener.addEventListener(key, listener);
  };

  removePreNodeDeletedEventListener = (key: string) => {
    this._preNodeDeletedEventListener.removeEventListener(key);
  };

  addPreNodeRemovedEventListener = (
    key: string,
    listener: (
      preNode: GeoNode,
      way: GeoWay,
      nodeStart: GeoNode,
      nodeEnd: GeoNode,
    ) => void,
  ) => {
    this._preNodeRemovedEventListener.addEventListener(key, listener);
  };
  removePreNodeRemovedEventListener = (key: string) => {
    this._preNodeRemovedEventListener.removeEventListener(key);
  };

  destroy = () => {
    this._preNodeMapOfNode.clear();
    this._preNodePartsMapByPreNode.clear();
    this._preNodePartsMapByWay.clear();
    this._preNodeEventIdsMap.forEach((eventIds) => {
      eventIds.forEach((eventId) => {
        this._mapEventManager.removeEventListener(eventId);
      });
    });
    this._preNodeSet.forEach((preNode) => preNode.destroy());
    this._preNodeSet.clear();

    this._preNodeAddedEventListener.destroy();
    this._preNodeDeletedEventListener.destroy();
    this._preNodeRemovedEventListener.destroy();

    this._mapEventRemover.destroy();
  };
}

export default GeoPreNodeManager;
