import GeoToolBoxManager from '@design-system/geo-map/GeoToolBoxManager';
import EventListenerManager from '@design-system/geo-map/event/EventListenerManager';
import GeoMapEventManager, {
  GeoMapEventRemover,
} from '@design-system/geo-map/event/GeoMapEventManager';
import GeoFeatureManager from '@design-system/geo-map/feature/GeoFeatureManager';
import GeoNode from '@design-system/geo-map/feature/GeoNode';
import {
  GeoNodeDragEndEventType,
  GeoNodeDragEventType,
} from '@design-system/geo-map/feature/GeoNodeEventManager';
import GeoWay from '@design-system/geo-map/feature/GeoWay';
import GeoNodeCandidate from '@design-system/geo-map/node-candidate/GeoNodeCandidate';
import GeoFeatureVisibleManager from '@design-system/geo-map/optimizer/GeoFeatureVisibleManager';
import { GeoLatLngType } from '@design-system/types/geoMap.type';
import GeoEventMockerUtils, {
  MouseEventEnum,
} from '@design-system/utils/geo-map/GeoEventMockerUtils';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';
import IdGenerator from '@design-system/utils/geo-map/IdGenerator';

export interface GeoNodeCandidatePolicy {
  isCreatable: boolean;
  isDeleteActivatedWhenToolBoxDeleteButtonClick: boolean;
  nodeSnappingPx: number;
  pencilSupportedEnabled: boolean;
}

const KEY = 'GeoWayCreateManager';

class GeoNodeCandidateManager {
  private _idGenerator: IdGenerator;
  private readonly _map: google.maps.Map;
  private readonly _featureManager: GeoFeatureManager;
  private readonly _featureVisibleManager: GeoFeatureVisibleManager;
  private readonly _toolBoxManager: GeoToolBoxManager;
  private _mapEventRemover: GeoMapEventRemover;
  private readonly _mapEventManager: GeoMapEventManager;
  private _policy: GeoNodeCandidatePolicy = {
    isCreatable: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
    pencilSupportedEnabled: false,
  };
  private _nodeCandidateAddedEventListener: EventListenerManager<
    string,
    (nodeCandidate: GeoNodeCandidate) => void
  > = new EventListenerManager();
  private _nodeCandidateDeletedEventListener: EventListenerManager<
    string,
    (nodeCandidate: GeoNodeCandidate) => void
  > = new EventListenerManager();
  private _nodeCandidateDragStartEventListener: EventListenerManager<
    string,
    (nodeCandidate: GeoNodeCandidate, event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _nodeCandidateDragEventListener: EventListenerManager<
    string,
    (nodeCandidate: GeoNodeCandidate, event: GeoNodeDragEventType) => void
  > = new EventListenerManager();
  private _nodeCandidateDragEndEventListener: EventListenerManager<
    string,
    (nodeCandidate: GeoNodeCandidate, event: GeoNodeDragEndEventType) => void
  > = new EventListenerManager();

  private _nodeSnapping: GeoNode | undefined;
  private _nodePositionBeforeDrag: GeoLatLngType | undefined;
  private _nodeCandidate: GeoNodeCandidate | undefined;
  private _nodeBefore: GeoNode | undefined;
  private _wayCreating: GeoWay | undefined;
  private _nodeCandidateMap: Map<GeoNode, GeoNodeCandidate> = new Map();

  constructor(
    map: google.maps.Map,
    featureManager: GeoFeatureManager,
    featureVisibleManager: GeoFeatureVisibleManager,
    toolBoxManager: GeoToolBoxManager,
    googleMapEventManager: GeoMapEventManager,
    createNode: (position: GeoLatLngType) => GeoNode,
    createWay: (nodes: GeoNode[]) => GeoWay,
    policy: GeoNodeCandidatePolicy = {
      isCreatable: false,
      isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
      nodeSnappingPx: GeoNode.RADIUS_PX * 2,
      pencilSupportedEnabled: false,
    },
  ) {
    this._idGenerator = new IdGenerator(500000);
    this._map = map;
    this._featureManager = featureManager;
    this._featureVisibleManager = featureVisibleManager;
    this._toolBoxManager = toolBoxManager;
    this._mapEventManager = googleMapEventManager;
    this._mapEventRemover = new GeoMapEventRemover(this._mapEventManager);
    this.setPolicy(policy);

    this._featureVisibleManager.addNodeVisibleChangedListener(
      KEY,
      (node, visible) => {},
    );
    this._featureManager.addNodeDeletedListener(KEY, (node) => {
      if (this.isCreatable()) {
        this._destroyNodeCandidate(node);
      }
    });
    const handleDownEventListener = (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) {
        return;
      }
      const latLng = GeoMapUtils.toLatLng(event.latLng);

      if (this._nodeBefore) {
        if (!this._nodeCandidate) {
          this._nodePositionBeforeDrag = latLng;
          this._nodeCandidate = this._createNodeCandidate(
            this._nodeBefore,
            latLng,
          );
        }
      } else {
        const node = this._featureManager.getNodeWithinPx(
          latLng,
          this._policy.nodeSnappingPx,
        );
        this._nodeBefore =
          node || createNode(GeoMapUtils.toLatLng(event.latLng));
        this._nodePositionBeforeDrag = latLng;
        if (this._nodeCandidate) {
          const message = 'nodeCandidate must be undefined';
          if (GeoMapUtils.IS_DEBUG) {
            throw new Error(message);
          } else {
            console.error(message);
          }
        }
        this._nodeCandidate = this._createNodeCandidate(
          this._nodeBefore,
          latLng,
        );
      }
    };
    this._mapEventRemover.addEventId(
      this._mapEventManager.addPencilDownEventListener((event) => {
        if (!this.isCreatable() || !this.isPencilSupportedEnabled()) {
          return;
        }
        handleDownEventListener(event);
      }),
    );
    this._mapEventRemover.addEventId(
      this._mapEventManager.addMouseDownEventListener((event) => {
        if (!this.isCreatable() || this.isPencilSupportedEnabled()) {
          return;
        }
        handleDownEventListener(event);
      }),
    );
    const _getSnappingNode = (latLng: GeoLatLngType) => {
      const nodesIdExclude: number[] = [];
      if (this._nodeBefore) {
        nodesIdExclude.push(this._nodeBefore.getId());
        this._featureManager
          .getAdjacentNodes(this._nodeBefore)
          .forEach((node) => {
            nodesIdExclude.push(node.getId());
          });
      }
      return this._featureVisibleManager.getNodeVisibleWithinPx(
        latLng,
        this._policy.nodeSnappingPx,
        {
          nodesIdExclude,
        },
      );
    };
    const handleMoveEventListener = (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) {
        return;
      }
      if (this._nodeCandidate) {
        const latLng = GeoMapUtils.toLatLng(event.latLng);
        if (this._nodePositionBeforeDrag) {
          this._invokeNodeCandidateDragStartEventListener(
            this._nodeCandidate,
            GeoEventMockerUtils.createMapMouseEvent(
              MouseEventEnum.DRAG_START,
              this._nodePositionBeforeDrag,
            ),
          );
          this._nodePositionBeforeDrag = undefined;
        }

        this._nodeSnapping = _getSnappingNode(latLng);
        if (this._nodeSnapping) {
          this._nodeCandidate.setInnerVisible(false);
          this._nodeCandidate.setPosition(this._nodeSnapping.getPosition());
        } else {
          this._nodeCandidate.setInnerVisible(true);
          this._nodeCandidate.setPosition(latLng);
        }
        if (
          !GeoMapUtils.isLatLngEquals(this._nodeCandidate.getPosition(), latLng)
        ) {
          this._invokeNodeCandidateDragEventListener(this._nodeCandidate, {
            event,
            beforeLatLng: this._nodeCandidate.getPosition(),
          });
        }
      }
    };
    this._mapEventRemover.addEventId(
      this._mapEventManager.addPencilMoveEventListener((event) => {
        if (!this.isCreatable() || !this.isPencilSupportedEnabled()) {
          return;
        }
        handleMoveEventListener(event);
      }),
    );
    this._mapEventRemover.addEventId(
      this._mapEventManager.addMouseMoveEventListener((event) => {
        if (!this.isCreatable() || this.isPencilSupportedEnabled()) {
          return;
        }
        handleMoveEventListener(event);
      }),
    );

    const handleUpEventListener = (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) {
        return;
      }
      const latLng = GeoMapUtils.toLatLng(event.latLng);
      if (
        this._nodeBefore &&
        !this._isNodeAddableDistance(this._nodeBefore, latLng)
      ) {
        return;
      }

      if (!this._nodeSnapping) {
        this._nodeSnapping = _getSnappingNode(latLng);
      }
      if (!this._nodeSnapping && this._wayCreating) {
        for (const node of this._wayCreating.getNodes()) {
          if (!this._isNodeAddableDistance(node, latLng)) {
            return;
          }
        }
      }

      if (this._nodeCandidate) {
        const node = this._nodeSnapping || createNode(latLng);
        if (this._wayCreating) {
          this._featureManager.addNodeToWay(
            node.getId(),
            this._wayCreating,
            this._wayCreating.getNodes().length,
          );
        } else {
          if (this._nodeBefore) {
            this._wayCreating = createWay([this._nodeBefore, node]);
          }
        }
        this._nodeBefore = node;
        this._invokeNodeCandidateDragEndEventListener(this._nodeCandidate, {
          event,
          startLatLng: this._nodeCandidate.getNodeTargeted().getPosition(),
        });
        this._nodeCandidate.destroy();
        this._nodeCandidate = this._createNodeCandidate(
          this._nodeBefore,
          GeoMapUtils.toLatLng(event.latLng),
        );
      }
    };
    this._mapEventRemover.addEventId(
      this._mapEventManager.addPencilUpEventListener((event) => {
        if (!this.isCreatable() || !this.isPencilSupportedEnabled()) {
          return;
        }
        handleUpEventListener(event);
      }),
    );
    this._mapEventRemover.addEventId(
      this._mapEventManager.addMouseUpEventListener((event) => {
        if (!this.isCreatable() || this.isPencilSupportedEnabled()) {
          return;
        }
        handleUpEventListener(event);
      }),
    );

    // toolBox 이벤트
    this._toolBoxManager.addDeleteButtonClickEventListener(KEY, () => {
      if (
        !this.isDeleteActivatedWhenToolBoxDeleteButtonClick() ||
        !this.isCreatable() ||
        !this._wayCreating ||
        !this._nodeBefore
      ) {
        return;
      }
      this._featureManager.deleteNodeFromWayByIndex(
        this._wayCreating,
        this._wayCreating.getLastIndexOfNode(this._nodeBefore),
      );
      if (this._wayCreating.getNodes().length < 2) {
        if (this._nodeCandidate) {
          this.clearCandidate();
        }
        return;
      }
      this._nodeBefore = this._wayCreating.getEndNode();
      if (this._nodeCandidate) {
        this._nodeCandidate.destroy();
        this._nodeCandidate = this._createNodeCandidate(
          this._nodeBefore,
          this._nodeBefore.getPosition(),
        );
      }
    });
    this._toolBoxManager.addCloseButtonClickEventListener(KEY, () => {
      this.clearCandidate();
    });
    this._toolBoxManager.addAppendModeButtonClickEventListener(KEY, () => {
      this.clearCandidate();
    });
  }

  private _isNodeAddableDistance = (node: GeoNode, latLng: GeoLatLngType) => {
    const zoomLevel = this._map.getZoom();
    if (zoomLevel) {
      const radius = GeoMapUtils.calculateDistance(
        node.getPosition(),
        GeoNode.RADIUS_PX,
        this._map,
      );
      if (!radius) return false;
      const distance = GeoMapUtils.getDistanceTwoPoint(
        node.getPosition(),
        latLng,
      );
      const diff = distance - radius;
      return diff > 0;
    }
    return false;
  };

  getAllNodeCandidates = () => {
    return Array.from(this._nodeCandidateMap.values());
  };

  clearCandidate = () => {
    this._nodeSnapping = undefined;
    this._nodeCandidate?.destroy();
    this._nodeCandidate = undefined;
    this._nodePositionBeforeDrag = undefined;
    this._nodeCandidate = undefined;
    if (this._nodeBefore && !this._wayCreating) {
      if (this._featureManager.getWaysWithNode(this._nodeBefore).length === 0) {
        this._featureManager.deleteNode(this._nodeBefore);
      }
    }
    this._nodeBefore = undefined;
    this._wayCreating = undefined;
  };

  clearCandidateWhenWayCreating = () => {
    if (!this._wayCreating) {
      return;
    }
    if (this._wayCreating.getNodes().length < 2) {
      if (this._nodeCandidate) {
        this.clearCandidate();
      }
      return;
    }
  };

  setCreatable = (enabled: boolean) => {
    if (this._policy.isCreatable === enabled) {
      return;
    }
    this._policy.isCreatable = enabled;

    if (!enabled) {
      this._featureManager.getAllNodes().forEach((node) => {
        this._destroyNodeCandidate(node);
      });
      this.clearCandidate();
    }
  };
  isCreatable = () => {
    return this._policy.isCreatable;
  };

  setDeleteActivatedWhenToolBoxDeleteButtonClick = (enabled: boolean) => {
    this._policy.isDeleteActivatedWhenToolBoxDeleteButtonClick = enabled;
  };
  isDeleteActivatedWhenToolBoxDeleteButtonClick = () => {
    return this._policy.isDeleteActivatedWhenToolBoxDeleteButtonClick;
  };

  setNodeSnappingPx = (nodeSnappingPx: number) => {
    this._policy.nodeSnappingPx = nodeSnappingPx;
  };
  getNodeSnappingPx = () => {
    return this._policy.nodeSnappingPx;
  };

  setPencilSupportedEnabled = (enabled: boolean) => {
    this._policy.pencilSupportedEnabled = enabled;
  };
  isPencilSupportedEnabled = () => {
    return this._policy.pencilSupportedEnabled;
  };

  setPolicy = (policy: GeoNodeCandidatePolicy) => {
    this.setCreatable(policy.isCreatable);
    this.setDeleteActivatedWhenToolBoxDeleteButtonClick(
      policy.isDeleteActivatedWhenToolBoxDeleteButtonClick,
    );
    this.setNodeSnappingPx(policy.nodeSnappingPx);
    this.setPencilSupportedEnabled(policy.pencilSupportedEnabled);
  };
  getPolicy = () => {
    return { ...this._policy };
  };

  // key: GeoNode, value: nodeWrapper
  private _createNodeCandidate = (node: GeoNode, latLng: GeoLatLngType) => {
    const nodeCandidate = new GeoNodeCandidate(
      this._idGenerator.getNextId(),
      this._map,
      node,
      latLng,
    );
    nodeCandidate.setClickable(false);
    nodeCandidate.setDraggable(false);
    this._nodeCandidateMap.set(node, nodeCandidate);
    nodeCandidate.addDragStartEventListener((event) => {
      this._invokeNodeCandidateDragStartEventListener(nodeCandidate, event);
    });
    nodeCandidate.addDragEventListener(({ event, beforeLatLng }) => {
      this._invokeNodeCandidateDragEventListener(nodeCandidate, {
        event,
        beforeLatLng,
      });
    });
    nodeCandidate.addDragEndEventListener((event) => {
      this._invokeNodeCandidateDragEndEventListener(nodeCandidate, event);
    });
    this._invokeNodeCandidateAddedEventListener(nodeCandidate);
    return nodeCandidate;
  };
  private _destroyNodeCandidate = (node: GeoNode) => {
    const nodeCandidate = this._nodeCandidateMap.get(node);
    if (nodeCandidate) {
      this._nodeCandidateMap.delete(node);
      this._invokeNodeCandidateDeletedEventListener(nodeCandidate);
      nodeCandidate.destroy();
    }
  };

  addNodeCandidateAddedEventListener = (
    key: string,
    listener: (nodeCandidate: GeoNodeCandidate) => void,
  ) => {
    this._nodeCandidateAddedEventListener.addEventListener(key, listener);
  };
  removeNodeCandidateAddedEventListener = (key: string) => {
    this._nodeCandidateAddedEventListener.removeEventListener(key);
  };
  private _invokeNodeCandidateAddedEventListener = (
    nodeCandidate: GeoNodeCandidate,
  ) => {
    this._nodeCandidateAddedEventListener.invokeEventListeners(nodeCandidate);
  };

  addNodeCandidateDeletedEventListener = (
    key: string,
    listener: (nodeCandidate: GeoNodeCandidate) => void,
  ) => {
    this._nodeCandidateDeletedEventListener.addEventListener(key, listener);
  };
  removeNodeCandidateDeletedEventListener = (key: string) => {
    this._nodeCandidateDeletedEventListener.removeEventListener(key);
  };
  private _invokeNodeCandidateDeletedEventListener = (
    nodeCandidate: GeoNodeCandidate,
  ) => {
    this._nodeCandidateDeletedEventListener.invokeEventListeners(nodeCandidate);
  };

  addNodeCandidateDragStartEventListener = (
    key: string,
    listener: (
      nodeCandidate: GeoNodeCandidate,
      event: google.maps.MapMouseEvent,
    ) => void,
  ) => {
    this._nodeCandidateDragStartEventListener.addEventListener(key, listener);
  };
  removeNodeCandidateDragStartEventListener = (key: string) => {
    this._nodeCandidateDragStartEventListener.removeEventListener(key);
  };
  private _invokeNodeCandidateDragStartEventListener = (
    nodeCandidate: GeoNodeCandidate,
    event: google.maps.MapMouseEvent,
  ) => {
    nodeCandidate.showPolyLine();
    this._nodeCandidateDragStartEventListener.invokeEventListeners(
      nodeCandidate,
      event,
    );
  };

  addNodeCandidateDragEventListener = (
    key: string,
    listener: (
      nodeCandidate: GeoNodeCandidate,
      event: GeoNodeDragEventType,
    ) => void,
  ) => {
    this._nodeCandidateDragEventListener.addEventListener(key, listener);
  };
  removeNodeCandidateDragEventListener = (key: string) => {
    this._nodeCandidateDragEventListener.removeEventListener(key);
  };
  private _invokeNodeCandidateDragEventListener = (
    nodeCandidate: GeoNodeCandidate,
    event: GeoNodeDragEventType,
  ) => {
    this._nodeCandidateDragEventListener.invokeEventListeners(
      nodeCandidate,
      event,
    );
  };

  addNodeCandidateDragEndEventListener = (
    key: string,
    listener: (
      nodeCandidate: GeoNodeCandidate,
      event: GeoNodeDragEndEventType,
    ) => void,
  ) => {
    this._nodeCandidateDragEndEventListener.addEventListener(key, listener);
  };
  removeNodeCandidateDragEndEventListener = (key: string) => {
    this._nodeCandidateDragEndEventListener.removeEventListener(key);
  };
  private _invokeNodeCandidateDragEndEventListener = (
    nodeCandidate: GeoNodeCandidate,
    event: GeoNodeDragEndEventType,
  ) => {
    this._nodeCandidateDragEndEventListener.invokeEventListeners(
      nodeCandidate,
      event,
    );
    nodeCandidate.reset();
  };

  destroy = () => {
    this.clearCandidate();
    this._nodeCandidateMap.forEach((nodeCandidate) => {
      nodeCandidate.destroy();
    });
    this._nodeCandidateAddedEventListener.destroy();
    this._nodeCandidateDeletedEventListener.destroy();
    this._nodeCandidateDragStartEventListener.destroy();
    this._nodeCandidateDragEventListener.destroy();
    this._nodeCandidateDragEndEventListener.destroy();

    this._nodeCandidateMap.clear();
    this._mapEventRemover.destroy();
  };
}

export default GeoNodeCandidateManager;
