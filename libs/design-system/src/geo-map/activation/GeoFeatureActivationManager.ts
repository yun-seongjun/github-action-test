import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';
import GeoNode from '@design-system/geo-map/feature/GeoNode';
import GeoWay from '@design-system/geo-map/feature/GeoWay';
import GeoLineSegment from '@design-system/geo-map/line-segment/GeoLineSegment';
import GeoFeatureManager, {
  GeoFeaturesType,
  GeoNodeTypeEnum,
} from '@design-system/geo-map/feature/GeoFeatureManager';
import GeoFeatureVisibleManager from '@design-system/geo-map/optimizer/GeoFeatureVisibleManager';
import GeoLineSegmentManager from '@design-system/geo-map/line-segment/GeoLineSegmentManager';
import GeoMapEventManager, {
  GeoMapEventRemover,
} from '@design-system/geo-map/event/GeoMapEventManager';
import { EventPreventerTypeEnum } from '@design-system/index';
import EventPreventer from '@design-system/geo-map/event/EventPreventer';
import EventListenerManager from '@design-system/geo-map/event/EventListenerManager';

type OnNodeActivateEventListener = (
  node: GeoNode,
  isActivated: boolean,
) => void;
type OnWayActivateEventListener = (
  way: GeoWay,
  isActivated: boolean,
  waysActivated: GeoWay[],
) => void;
type OnLineSegmentActivateEventListener = (
  lineSegment: GeoLineSegment,
  isActivated: boolean,
) => void;

export interface GeoFeatureActivationPolicy {
  isEndpointNodeActivateEnabled: boolean;
  isEndpointNodeMultipleActivateEnabled: boolean;
  isSegmentNodeActivateEnabled: boolean;
  isSegmentNodeMultipleActivateEnabled: boolean;
  isNodeSingleActivateEnabled: boolean;
  isNodeAndLineSegmentSingleActivateByClickEnabled: boolean;
  isNodeAddedToWaySingleActivateEnabled: boolean;
  isNodeDeletedFromWayDeactivateEnabled: boolean;
  isNodeActivateByDragBoxEnabled: boolean;
  isWayActivateEnabled: boolean;
  isLineSegmentActivateEnabledByDragBox: boolean;
  isLineSegmentActivateEnabled: boolean;
  isWayLineSegmentsActivateEnabled: boolean;
  isWaySingleActivateEnabled: boolean;
}

const KEY = 'GeoFeatureActivationManager';
class GeoFeatureActivationManager {
  static FEATURE_ACTIVATION_MANAGER_INIT_POLICY: GeoFeatureActivationPolicy = {
    isEndpointNodeActivateEnabled: false,
    isEndpointNodeMultipleActivateEnabled: false,
    isSegmentNodeActivateEnabled: false,
    isSegmentNodeMultipleActivateEnabled: false,
    isNodeSingleActivateEnabled: false,
    isNodeAndLineSegmentSingleActivateByClickEnabled: false,
    isNodeAddedToWaySingleActivateEnabled: false,
    isNodeDeletedFromWayDeactivateEnabled: false,
    isNodeActivateByDragBoxEnabled: false,
    isWayActivateEnabled: false,
    isLineSegmentActivateEnabledByDragBox: false,
    isLineSegmentActivateEnabled: false,
    isWayLineSegmentsActivateEnabled: false,
    isWaySingleActivateEnabled: false,
  };
  private readonly _featureManager: GeoFeatureManager;
  private readonly _featureVisibleManager: GeoFeatureVisibleManager;
  private readonly _lineSegmentManager: GeoLineSegmentManager;
  private readonly _geoMapEventManager: GeoMapEventManager;
  private readonly _geoMapEventRemover: GeoMapEventRemover;
  private readonly _eventPreventer: EventPreventer;

  constructor(
    featureManager: GeoFeatureManager,
    featureVisibleManager: GeoFeatureVisibleManager,
    lineSegmentManager: GeoLineSegmentManager,
    geoMapEventManager: GeoMapEventManager,
    eventPreventer: EventPreventer,
    policy: GeoFeatureActivationPolicy = GeoFeatureActivationManager.FEATURE_ACTIVATION_MANAGER_INIT_POLICY,
  ) {
    this._featureManager = featureManager;
    this._featureVisibleManager = featureVisibleManager;
    this._lineSegmentManager = lineSegmentManager;
    this._geoMapEventManager = geoMapEventManager;
    this._eventPreventer = eventPreventer;
    this._geoMapEventRemover = new GeoMapEventRemover(geoMapEventManager);

    this.setPolicy(policy);

    // Node에 이벤트 설정
    this._featureManager.addNodeAddedListener(KEY, (node) => {
      node.addClickEventListener(() => {
        if (
          !this._isNodeActivatable(node) ||
          this._eventPreventer.isPrevent(EventPreventerTypeEnum.CLICK)
        ) {
          return;
        }

        if (this.isNodeActivated(node)) {
          this.deactivateNode(node);
          return;
        }

        if (this._isNodeAddedToWaySingleActivateEnabled) {
          this.deactivateAllNodes();
          return;
        }

        const nodeTypes = this._featureManager.getNodeTypes(node);

        if (
          !this._isEndpointNodeMultipleActivateEnabled &&
          !nodeTypes.has(GeoNodeTypeEnum.SEGMENTAL) &&
          (nodeTypes.has(GeoNodeTypeEnum.START) ||
            nodeTypes.has(GeoNodeTypeEnum.END))
        ) {
          this.deactivateEndpointNodes();
        }
        if (
          !this._isSegmentNodeMultipleActiveEnabled &&
          nodeTypes.has(GeoNodeTypeEnum.SEGMENTAL) &&
          !(
            nodeTypes.has(GeoNodeTypeEnum.START) ||
            nodeTypes.has(GeoNodeTypeEnum.END)
          )
        ) {
          this.deactivateSegmentNodes();
        }
        if (this._isNodeAndLineSegmentSingleActivateByClickEnabled) {
          this.deactivateAllNodes();
          this.deactivateAllLineSegments();
        }
        this.activateNode(node);
      });

      node.addDragStartEventListener(() => {
        if (this.isNodeActivated(node)) {
          this._invokeActivatedDragStartEventListeners();
          return;
        }
        const nodeTypes = this._featureManager.getNodeTypes(node);
        if (
          !this._isEndpointNodeMultipleActivateEnabled &&
          !nodeTypes.has(GeoNodeTypeEnum.SEGMENTAL) &&
          (nodeTypes.has(GeoNodeTypeEnum.START) ||
            nodeTypes.has(GeoNodeTypeEnum.END))
        ) {
          this.deactivateEndpointNodes();
        }
        if (
          !this._isSegmentNodeMultipleActiveEnabled &&
          nodeTypes.has(GeoNodeTypeEnum.SEGMENTAL) &&
          !(
            nodeTypes.has(GeoNodeTypeEnum.START) ||
            nodeTypes.has(GeoNodeTypeEnum.END)
          )
        ) {
          this.deactivateSegmentNodes();
        }
        if (this._isNodeAndLineSegmentSingleActivateByClickEnabled) {
          this.deactivateAllNodes();
          this.deactivateAllLineSegments();
        }
        this.activateNode(node);
        this._invokeActivatedDragStartEventListeners();
      });
      node.addDragEventListener(() => {
        if (
          this.isNodeActivated(node) ||
          this._lineSegmentsActivatedMapOfNode.has(node)
        ) {
          this._invokeActivatedDragEventListeners();
        }
      });
      node.addDragEndEventListener(() => {
        if (
          this.isNodeActivated(node) ||
          this._lineSegmentsActivatedMapOfNode.has(node)
        ) {
          this._invokeActivatedDragEndEventListeners();
        }
      });
    });
    this._featureManager.addNodeDeletedListener(KEY, (node) => {
      this.deactivateNode(node);
    });
    this._featureManager.addNodeTypesChangedListener(KEY, (node, nodeTypes) => {
      if (
        this.isNodeActivated(node) &&
        !this._isNodeActivatable(node, nodeTypes)
      ) {
        this.deactivateNode(node);
      }
    });
    this._featureManager.addNodeAddedToWayListener(KEY, (way, node) => {
      if (this._isNodeAddedToWaySingleActivateEnabled) {
        this.deactivateAllNodes();
        this.activateNode(node);
      }
    });
    this._featureManager.addNodeDeletedFromWayListener(KEY, (way, node) => {
      if (this._isNodeDeletedFromWayDeactivateEnabled) {
        this.deactivateNode(node);
      }
      if (this._isNodeAddedToWaySingleActivateEnabled) {
        way.getNodes().length > 1 && this.activateNode(way.getEndNode());
        return;
      }
      if (this.isWayActivated(way) && !this.isWayActivatable(way)) {
        this.deactivateWay(way);
      }
    });

    this._lineSegmentManager.addLineSegmentClickEventListener(
      KEY,
      (lineSegment) => {
        const isPrevent = this._eventPreventer.isPrevent(
          EventPreventerTypeEnum.CLICK,
        );
        if (isPrevent) {
          return;
        }

        if (!this._isLineSegmentActivateEnabled) {
          return;
        }

        if (!lineSegment) {
          const message = 'nodeStart 또는 nodeEnd가 없습니다.';
          if (GeoMapUtils.IS_DEBUG) {
            throw new Error(message);
          } else {
            console.error(message);
          }
        }
        if (this.isLineSegmentActivated(lineSegment)) {
          if (this._isWayLineSegmentsActivateEnabled) {
            this.deactivateWayLineSegments(lineSegment.getWay());
          } else {
            this.deactivateLineSegment(lineSegment);
          }
        } else {
          if (this._isNodeAndLineSegmentSingleActivateByClickEnabled) {
            this.deactivateAllNodes();
            this.deactivateAllLineSegments();
          }
          if (this._isWayLineSegmentsActivateEnabled) {
            this.activateWayLineSegments(lineSegment.getWay());
          } else {
            this.activateLineSegment(lineSegment);
          }
        }
      },
    );
    this._lineSegmentManager.addLineSegmentDividedEventListener(
      KEY,
      (lineSegmentsAdded, lineSegmentDeleted) => {
        const isLineSegmentActivated =
          this.isLineSegmentActivated(lineSegmentDeleted);
        if (isLineSegmentActivated) {
          lineSegmentsAdded.forEach((lineSegment) => {
            this.activateLineSegment(lineSegment);
          });
        }
      },
    );
    this._lineSegmentManager.addLineSegmentReplacedEventListener(
      KEY,
      (lineSegmentAdded, lineSegmentsDeleted) => {
        const isActivated = this.isLineSegmentActivated(lineSegmentsDeleted);
        if (isActivated) {
          this.activateLineSegment(lineSegmentAdded);
          this.deactivateLineSegment(lineSegmentsDeleted);
        }
      },
    );
    this._lineSegmentManager.addLineSegmentMergedEventListener(
      KEY,
      (lineSegmentAdded, lineSegmentDeleted1, lineSegmentDeleted2) => {
        const isActivated =
          this.isLineSegmentActivated(lineSegmentDeleted1) &&
          this.isLineSegmentActivated(lineSegmentDeleted2);
        if (isActivated) {
          this.activateLineSegment(lineSegmentAdded);
        }
      },
    );
    this._lineSegmentManager.addLineSegmentDeletedEventListener(
      KEY,
      (lineSegment) => {
        this.deactivateLineSegment(lineSegment);
      },
    );

    // Way에 이벤트 설정
    this._featureManager.addWayAddedListener(KEY, (way) => {
      if (this._isNodeAddedToWaySingleActivateEnabled) {
        this.activateNode(way.getEndNode());
      }
    });
    this._featureManager.addWayReplacedListener(KEY, (wayAdded, wayDeleted) => {
      this._lineSegmentsActivatedMapOfWay
        .get(wayDeleted)
        ?.forEach((lineSegmentDeleted) => {
          wayAdded.forEach((way) => {
            const lineSegment = this._lineSegmentManager.getLineSegment(
              way,
              lineSegmentDeleted.getNodeStart(),
              lineSegmentDeleted.getNodeEnd(),
            );
            if (lineSegment) {
              this.activateLineSegment(lineSegment);
            }
          });
        });
    });
    this._featureManager.addWayDeletedListener(KEY, (way) => {
      this._lineSegmentsActivatedMapOfWay.get(way)?.forEach((lineSegment) => {
        this.deactivateLineSegment(lineSegment);
      });
      this._waysActivatedSet.delete(way);
    });

    // Node 활성화/비활성화 시, Way 활성화 활성화 이벤트
    this.addNodeActivatedEventListener(KEY, (node, isActivated) => {
      if (!this._isWayActivateEnabled) {
        return;
      }

      const ways = this._featureManager.getWaysWithNode(node);
      ways.forEach((way) => {
        if (isActivated) {
          this.activateWay(way);
          return;
        }
        if (!this.isWayActivatable(way)) {
          this.deactivateWay(way);
        }
      });
    });

    // DragBox
    this._geoMapEventManager.addDragBoxDragEndEventListener(
      (event, bounds, latLng, latLngStart, dragBoxPath) => {
        const boundsPolygon = new google.maps.Polygon({ paths: dragBoxPath });
        const nodesInbounds = this._featureVisibleManager
          .getNodesInBounds()
          .filter((node) => {
            return google.maps.geometry.poly.containsLocation(
              node.getPosition(),
              boundsPolygon,
            );
          });

        // dragBox로 node를 활성화 합니다.
        if (this._isNodeActivateByDragBoxEnabled) {
          nodesInbounds.forEach((node) => this.activateNode(node));
        }

        // dragBox로 lineSegment를 활성화 합니다.
        if (this._isLineSegmentActivatedByDragBox) {
          nodesInbounds.forEach((node) => {
            this._lineSegmentManager
              .getLineSegmentsOfNode(node)
              .forEach((lineSegment) => {
                this.activateLineSegment(lineSegment);
              });
          });
          this._lineSegmentManager
            .getAllLineSegments()
            .forEach((lineSegment) => {
              if (!this.isLineSegmentActivated(lineSegment)) {
                const isLineSegmentCrossPolygon =
                  GeoMapUtils.isLineCrossPolygon(
                    {
                      start: lineSegment.getNodeStart().getPosition(),
                      end: lineSegment.getNodeEnd().getPosition(),
                    },
                    dragBoxPath,
                  );
                isLineSegmentCrossPolygon &&
                  this.activateLineSegment(lineSegment);
              }
            });
        }
      },
    );

    if (!this._isNodeActivateByDragBoxEnabled) {
      this.deactivateAllNodes();
      return;
    }
  }

  /**
   * =========================================================================================================
   * 정책
   * =========================================================================================================
   */
  private _isEndpointNodeActivateEnabled = false;
  private _isEndpointNodeMultipleActivateEnabled = false;
  private _isSegmentNodeActivateEnabled = false;
  private _isSegmentNodeMultipleActiveEnabled = false;
  private _isNodeSingleActivateEnabled = false;
  private _isNodeAndLineSegmentSingleActivateByClickEnabled = false;
  private _isNodeAddedToWaySingleActivateEnabled = false;
  private _isNodeDeletedFromWayDeactivateEnabled = false;
  private _isNodeActivateByDragBoxEnabled = false;
  private _isWayActivateEnabled = false;
  private _isLineSegmentActivatedByDragBox = false;
  private _isLineSegmentActivateEnabled = false;
  private _isWayLineSegmentsActivateEnabled = false;
  private _isWaySingleActivateEnabled = false;

  setEndpointNodeActivateEnabled = (isEndpointNodeActivateEnabled: boolean) => {
    if (this._isEndpointNodeActivateEnabled === isEndpointNodeActivateEnabled) {
      return;
    }
    this._isEndpointNodeActivateEnabled = isEndpointNodeActivateEnabled;
    if (!isEndpointNodeActivateEnabled) {
      this.deactivateEndpointNodes();
    }
  };
  getEndpointNodeActivateEnabled = () => {
    return this._isEndpointNodeActivateEnabled;
  };
  setEndpointNodeMultipleActivateEnabled = (
    isEndpointNodeMultipleActivateEnabled: boolean,
  ) => {
    if (
      this._isEndpointNodeMultipleActivateEnabled ===
      isEndpointNodeMultipleActivateEnabled
    ) {
      return;
    }
    this._isEndpointNodeMultipleActivateEnabled =
      isEndpointNodeMultipleActivateEnabled;
    if (!isEndpointNodeMultipleActivateEnabled) {
      this.deactivateEndpointNodes();
    }
  };
  getEndpointNodeMultipleActivateEnabled = () => {
    return this._isEndpointNodeMultipleActivateEnabled;
  };
  setSegmentNodeActivateEnabled = (isSegmentNodeActivateEnabled: boolean) => {
    if (this._isSegmentNodeActivateEnabled === isSegmentNodeActivateEnabled) {
      return;
    }
    this._isSegmentNodeActivateEnabled = isSegmentNodeActivateEnabled;
    if (!isSegmentNodeActivateEnabled) {
      this.deactivateSegmentNodes();
    }
  };
  getSegmentNodeActivateEnabled = () => {
    return this._isSegmentNodeActivateEnabled;
  };
  setSegmentNodeMultipleActivateEnabled = (
    isSegmentNodeMultipleActiveEnabled: boolean,
  ) => {
    if (
      this._isSegmentNodeMultipleActiveEnabled ===
      isSegmentNodeMultipleActiveEnabled
    ) {
      return;
    }
    this._isSegmentNodeMultipleActiveEnabled =
      isSegmentNodeMultipleActiveEnabled;
    if (!isSegmentNodeMultipleActiveEnabled) {
      this.deactivateSegmentNodes();
    }
  };
  getSegmentNodeMultipleActiveEnabled = () => {
    return this._isSegmentNodeMultipleActiveEnabled;
  };
  setNodeSingleActivateEnabled = (isNodeSingleActivateEnabled: boolean) => {
    if (this._isNodeSingleActivateEnabled === isNodeSingleActivateEnabled) {
      return;
    }
    this._isNodeSingleActivateEnabled = isNodeSingleActivateEnabled;
    if (!isNodeSingleActivateEnabled) {
      const nodesActivated = Array.from(this._nodesActivatedSet);
      nodesActivated.forEach((node, index) => {
        if (nodesActivated.length - 1 !== index) {
          this.deactivateNode(node);
        }
      });
    }
  };
  getNodeSingleActivateEnabled = () => {
    return this._isNodeSingleActivateEnabled;
  };
  setNodeAndLineSegmentSingleActivateByClickEnabled = (
    isNodeSingleActivateByClickEnabled: boolean,
  ) => {
    if (
      this._isNodeAndLineSegmentSingleActivateByClickEnabled ===
      isNodeSingleActivateByClickEnabled
    ) {
      return;
    }
    this._isNodeAndLineSegmentSingleActivateByClickEnabled =
      isNodeSingleActivateByClickEnabled;
    if (!isNodeSingleActivateByClickEnabled) {
      const nodesActivated = Array.from(this._nodesActivatedSet);
      nodesActivated.forEach((node, index) => {
        if (nodesActivated.length - 1 !== index) {
          this.deactivateNode(node);
        }
      });
      this.deactivateAllLineSegments();
    }
  };
  getNodeAndLineSegmentSingleActivateByClickEnabled = () => {
    return this._isNodeAndLineSegmentSingleActivateByClickEnabled;
  };
  setNodeAddedToWaySingleActivateEnabled = (
    isNodeAddedToWaySingleActivateEnabled: boolean,
  ) => {
    if (
      this._isNodeAddedToWaySingleActivateEnabled ===
      isNodeAddedToWaySingleActivateEnabled
    ) {
      return;
    }
    this._isNodeAddedToWaySingleActivateEnabled =
      isNodeAddedToWaySingleActivateEnabled;
  };
  getNodeAddedToWaySingleActivateEnabled = () => {
    return this._isNodeAddedToWaySingleActivateEnabled;
  };
  setNodeDeletedFromWayDeactivateEnabled = (
    isNodeDeletedFromWayDeactivateEnabled: boolean,
  ) => {
    if (
      this._isNodeDeletedFromWayDeactivateEnabled ===
      isNodeDeletedFromWayDeactivateEnabled
    ) {
      return;
    }
    this._isNodeDeletedFromWayDeactivateEnabled =
      isNodeDeletedFromWayDeactivateEnabled;
  };
  getNodeDeletedFromWayDeactivateEnabled = () => {
    return this._isNodeDeletedFromWayDeactivateEnabled;
  };
  setNodeActivateByDragBoxEnabled = (
    isNodeActivateByDragBoxEnabled: boolean,
  ) => {
    if (
      this._isNodeActivateByDragBoxEnabled === isNodeActivateByDragBoxEnabled
    ) {
      return;
    }
    this._isNodeActivateByDragBoxEnabled = isNodeActivateByDragBoxEnabled;
  };
  getNodeActivateByDragBoxEnabled = () => {
    return this._isNodeActivateByDragBoxEnabled;
  };
  setWayActivateEnabled = (isWayActivateEnabled: boolean) => {
    if (this._isWayActivateEnabled === isWayActivateEnabled) {
      return;
    }
    this._isWayActivateEnabled = isWayActivateEnabled;
    if (!isWayActivateEnabled) {
      this.deactivateAllWays();
    }
  };
  getWayActivateEnabled = () => {
    return this._isWayActivateEnabled;
  };
  setLineSegmentActivateByDragBoxEnabled = (
    isLineSegmentActivateByDragBoxEnabled: boolean,
  ) => {
    if (
      this._isLineSegmentActivatedByDragBox ===
      isLineSegmentActivateByDragBoxEnabled
    ) {
      return;
    }
    this._isLineSegmentActivatedByDragBox =
      isLineSegmentActivateByDragBoxEnabled;

    // Todo:: 정책만 변하고 상태가 변하지 않음
  };
  getWayLineSegmentActivateByDragBoxEnabled = () => {
    return this._isLineSegmentActivatedByDragBox;
  };
  setLineSegmentActivateEnabled = (isLineSegmentActivateEnabled: boolean) => {
    if (this._isLineSegmentActivateEnabled === isLineSegmentActivateEnabled) {
      return;
    }
    this._isLineSegmentActivateEnabled = isLineSegmentActivateEnabled;
    if (!isLineSegmentActivateEnabled) {
      this.deactivateAllLineSegments();
    }
  };
  getLineSegmentActivateEnabled = () => {
    return this._isLineSegmentActivateEnabled;
  };
  setWayLineSegmentsActivateEnabled = (
    isWayLineSegmentsActivateEnabled: boolean,
  ) => {
    if (
      this._isWayLineSegmentsActivateEnabled ===
      isWayLineSegmentsActivateEnabled
    ) {
      return;
    }
    this._isWayLineSegmentsActivateEnabled = isWayLineSegmentsActivateEnabled;
    if (isWayLineSegmentsActivateEnabled) {
      this._lineSegmentsActivatedSet.forEach((lineSegment) => {
        this._lineSegmentManager
          .getLineSegmentsOfWay(lineSegment.getWay())
          .forEach((lineSegmentWillActivated) => {
            this.activateLineSegment(lineSegmentWillActivated);
          });
      });
    }
  };
  getWayLineSegmentsActivateEnabled = () => {
    return this._isWayLineSegmentsActivateEnabled;
  };
  setWaySingleActivateEnabled = (isWaySingleActivateEnabled: boolean) => {
    if (this._isWaySingleActivateEnabled === isWaySingleActivateEnabled) {
      return;
    }
    this._isWaySingleActivateEnabled = isWaySingleActivateEnabled;
    if (isWaySingleActivateEnabled && this._waysActivatedSet.size > 1) {
      this.deactivateAllLineSegments();
      this.deactivateAllWays();
    }
  };
  getWaySingleActivateEnabled = () => {
    return this._isWaySingleActivateEnabled;
  };

  private _isNodeActivatable = (
    node: GeoNode,
    nodeTypes?: Set<GeoNodeTypeEnum>,
  ) => {
    const _nodeTypes = nodeTypes ?? this._featureManager.getNodeTypes(node);
    return (
      ((this._isEndpointNodeActivateEnabled ||
        this._isEndpointNodeMultipleActivateEnabled) &&
        (_nodeTypes.has(GeoNodeTypeEnum.START) ||
          _nodeTypes.has(GeoNodeTypeEnum.END))) ||
      ((this._isSegmentNodeActivateEnabled ||
        this._isSegmentNodeMultipleActiveEnabled) &&
        _nodeTypes.has(GeoNodeTypeEnum.SEGMENTAL))
    );
  };

  setPolicy = (policy: GeoFeatureActivationPolicy) => {
    const {
      isEndpointNodeActivateEnabled,
      isEndpointNodeMultipleActivateEnabled,
      isSegmentNodeActivateEnabled,
      isSegmentNodeMultipleActivateEnabled,
      isNodeSingleActivateEnabled,
      isNodeAndLineSegmentSingleActivateByClickEnabled,
      isNodeAddedToWaySingleActivateEnabled,
      isNodeDeletedFromWayDeactivateEnabled,
      isNodeActivateByDragBoxEnabled,
      isWayActivateEnabled,
      isLineSegmentActivateEnabledByDragBox,
      isLineSegmentActivateEnabled,
      isWayLineSegmentsActivateEnabled,
      isWaySingleActivateEnabled,
    } = policy;
    this.setEndpointNodeActivateEnabled(isEndpointNodeActivateEnabled);
    this.setEndpointNodeMultipleActivateEnabled(
      isEndpointNodeMultipleActivateEnabled,
    );
    this.setSegmentNodeActivateEnabled(isSegmentNodeActivateEnabled);
    this.setSegmentNodeMultipleActivateEnabled(
      isSegmentNodeMultipleActivateEnabled,
    );
    this.setNodeSingleActivateEnabled(isNodeSingleActivateEnabled);
    this.setNodeAndLineSegmentSingleActivateByClickEnabled(
      isNodeAndLineSegmentSingleActivateByClickEnabled,
    );
    this.setNodeAddedToWaySingleActivateEnabled(
      isNodeAddedToWaySingleActivateEnabled,
    );
    this.setNodeDeletedFromWayDeactivateEnabled(
      isNodeDeletedFromWayDeactivateEnabled,
    );
    this.setNodeActivateByDragBoxEnabled(isNodeActivateByDragBoxEnabled);
    this.setWayActivateEnabled(isWayActivateEnabled);
    this.setLineSegmentActivateByDragBoxEnabled(
      isLineSegmentActivateEnabledByDragBox,
    );
    this.setLineSegmentActivateEnabled(isLineSegmentActivateEnabled);
    this.setWayLineSegmentsActivateEnabled(isWayLineSegmentsActivateEnabled);
    this.setWaySingleActivateEnabled(isWaySingleActivateEnabled);
  };
  getPolicy = (): GeoFeatureActivationPolicy => {
    return {
      isEndpointNodeActivateEnabled: this._isEndpointNodeActivateEnabled,
      isEndpointNodeMultipleActivateEnabled:
        this._isEndpointNodeMultipleActivateEnabled,
      isSegmentNodeActivateEnabled: this._isSegmentNodeActivateEnabled,
      isSegmentNodeMultipleActivateEnabled:
        this._isSegmentNodeMultipleActiveEnabled,
      isNodeSingleActivateEnabled: this._isNodeSingleActivateEnabled,
      isNodeAndLineSegmentSingleActivateByClickEnabled:
        this._isNodeAndLineSegmentSingleActivateByClickEnabled,
      isNodeAddedToWaySingleActivateEnabled:
        this._isNodeAddedToWaySingleActivateEnabled,
      isNodeDeletedFromWayDeactivateEnabled:
        this._isNodeDeletedFromWayDeactivateEnabled,
      isNodeActivateByDragBoxEnabled: this._isNodeActivateByDragBoxEnabled,
      isWayActivateEnabled: this._isWayActivateEnabled,
      isLineSegmentActivateEnabledByDragBox:
        this._isLineSegmentActivatedByDragBox,
      isLineSegmentActivateEnabled: this._isLineSegmentActivateEnabled,
      isWayLineSegmentsActivateEnabled: this._isWayLineSegmentsActivateEnabled,
      isWaySingleActivateEnabled: this._isWaySingleActivateEnabled,
    };
  };

  private _isEndpointNodeActivated = () => {
    return Array.from(this._nodesActivatedSet).some((node) => {
      const nodeTypes = this._featureManager.getNodeTypes(node);
      return (
        nodeTypes.has(GeoNodeTypeEnum.START) ||
        nodeTypes.has(GeoNodeTypeEnum.END)
      );
    });
  };

  private _isSegmentNodeActivated = () => {
    return Array.from(this._nodesActivatedSet).some((node) => {
      const nodeTypes = this._featureManager.getNodeTypes(node);
      return (
        nodeTypes.has(GeoNodeTypeEnum.SEGMENTAL) &&
        !nodeTypes.has(GeoNodeTypeEnum.START) &&
        !nodeTypes.has(GeoNodeTypeEnum.END)
      );
    });
  };

  /**
   * =========================================================================================================
   * Node 활성화 이벤트
   * =========================================================================================================
   */
  private _nodeActivatedEventListenerManager: EventListenerManager<
    string,
    OnNodeActivateEventListener
  > = new EventListenerManager();
  addNodeActivatedEventListener = (
    key: string,
    listener: OnNodeActivateEventListener,
  ) => {
    return this._nodeActivatedEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeNodeActivatedEventListener = (key: string) => {
    return this._nodeActivatedEventListenerManager.removeEventListener(key);
  };
  private _invokeNodeActivatedDebounceEventListeners = (
    node: GeoNode,
    isActivated: boolean,
  ) => {
    this._nodeActivatedEventListenerManager.invokeEventListeners(
      node,
      isActivated,
    );
    this._invokeActivatedChangeDebounceEventListener();
  };
  isNodeActivatedEventListening = (key: string) => {
    return this._nodeActivatedEventListenerManager.isEventListening(key);
  };

  /**
   * =========================================================================================================
   * Node 활성화 관련
   * =========================================================================================================
   */
  private _nodesActivatedSet: Set<GeoNode> = new Set();
  activateNode = (node: GeoNode) => {
    if (this._nodesActivatedSet.has(node)) {
      return false;
    }
    if (this._isNodeSingleActivateEnabled) {
      this.deactivateAllNodes();
    }
    this._nodesActivatedSet.add(node);
    this._invokeNodeActivatedDebounceEventListeners(node, true);
    return true;
  };
  deactivateNode = (node: GeoNode) => {
    const result = this._nodesActivatedSet.delete(node);
    this._invokeNodeActivatedDebounceEventListeners(node, false);
    return result;
  };
  deactivateEndpointNodes = () => {
    this._nodesActivatedSet.forEach((node) => {
      const nodeTypes = this._featureManager.getNodeTypes(node);
      if (
        nodeTypes.has(GeoNodeTypeEnum.START) ||
        nodeTypes.has(GeoNodeTypeEnum.END)
      ) {
        this.deactivateNode(node);
      }
    });
  };
  deactivateSegmentNodes = () => {
    this._nodesActivatedSet.forEach((node) => {
      const nodeTypes = this._featureManager.getNodeTypes(node);
      if (
        nodeTypes.has(GeoNodeTypeEnum.SEGMENTAL) &&
        !nodeTypes.has(GeoNodeTypeEnum.START) &&
        !nodeTypes.has(GeoNodeTypeEnum.END)
      ) {
        this.deactivateNode(node);
      }
    });
  };
  deactivateAllNodes = () => {
    const nodes = Array.from(this._nodesActivatedSet.values());
    this._nodesActivatedSet.clear();
    nodes.forEach((node) =>
      this._invokeNodeActivatedDebounceEventListeners(node, false),
    );
  };
  isNodeActivated = (node: GeoNode) => {
    return this._nodesActivatedSet.has(node);
  };
  getNodesActivated = () => {
    return Array.from(this._nodesActivatedSet.values());
  };
  // Todo::rdh 추후 activeNode들을 관리 할때 segmentalNodesActivatedSet, EndpointNodesActivatedSet, SegmentalAndEndpointNodesActivatedSet 로 나눠서 관리하게 되면 좋겠으나 시간이 없어 getNodesActivated를 중복사용합니다.
  // getSegmentalNodesActivated = () => {
  //   return this.getNodesActivated().filter(
  //     (node) => this._featureManager.getEditNodeType(node) === EditNodeTypeEnum.SEGMENTAL
  //   )
  // }
  // getEndpointNodesActivated = () => {
  //   return this.getNodesActivated().filter(
  //     (node) => this._featureManager.getEditNodeType(node) === EditNodeTypeEnum.BOTH_END
  //   )
  // }
  // getSegmentalAndEndpointNodesActivated = () => {
  //   return this.getNodesActivated().filter(
  //     (node) => this._featureManager.getEditNodeType(node) === EditNodeTypeEnum.SEGMENTAL_AND_BOTH_END
  //   )
  // }

  /**
   * =========================================================================================================
   * Way 활성화 이벤트
   * =========================================================================================================
   */
  private _wayActivatedEventListenerManager: EventListenerManager<
    string,
    OnWayActivateEventListener
  > = new EventListenerManager();
  addWayActivatedEventListener = (
    key: string,
    listener: OnWayActivateEventListener,
  ) => {
    this._wayActivatedEventListenerManager.addEventListener(key, listener);
  };
  removeWayActivatedEventListener = (key: string) => {
    this._wayActivatedEventListenerManager.removeEventListener(key);
  };
  private _invokeWayActivatedDebounceEventListeners = (
    way: GeoWay,
    isActivated: boolean,
  ) => {
    this._wayActivatedEventListenerManager.invokeEventListeners(
      way,
      isActivated,
      this.getWaysActivated(),
    );
    this._invokeActivatedChangeDebounceEventListener();
  };
  isWayActivatedEventListening = (key: string) => {
    return this._wayActivatedEventListenerManager.isEventListening(key);
  };

  /**
   * =========================================================================================================
   * Way 활성화 관련
   * =========================================================================================================
   */
  private _waysActivatedSet: Set<GeoWay> = new Set();
  activateWay = (way: GeoWay) => {
    if (this._waysActivatedSet.has(way)) {
      return false;
    }
    this._waysActivatedSet.add(way);
    this._invokeWayActivatedDebounceEventListeners(way, true);
    return true;
  };
  deactivateWay = (way: GeoWay) => {
    const result = this._waysActivatedSet.delete(way);
    this._invokeWayActivatedDebounceEventListeners(way, false);
    return result;
  };
  deactivateAllWays = () => {
    const ways = Array.from(this._waysActivatedSet.values());
    this._waysActivatedSet.clear();
    ways.forEach((way) => this.deactivateWay(way));
  };
  isWayActivated = (way: GeoWay) => {
    return this._waysActivatedSet.has(way);
  };
  getWaysActivated = () => {
    return Array.from(this._waysActivatedSet.values());
  };
  isWayHasNodeActivated = (way: GeoWay) => {
    return way.getNodes().some((node) => this.isNodeActivated(node));
  };
  isWayActivatable = (way: GeoWay) => {
    let nodeBefore: GeoNode | undefined = undefined;
    for (const node of way.getNodes()) {
      if (this.isNodeActivated(node)) {
        return true;
      }
      if (nodeBefore) {
        const lineSegment = this._lineSegmentManager.getLineSegment(
          way,
          nodeBefore,
          node,
        );
        if (lineSegment && this.isLineSegmentActivated(lineSegment)) {
          return true;
        }
      }
      nodeBefore = node;
    }
    return false;
  };

  /**
   * =========================================================================================================
   * LineSegment 활성화 관련
   * =========================================================================================================
   */
  private _lineSegmentsActivatedSet: Set<GeoLineSegment> = new Set();
  private _lineSegmentsActivatedMapOfWay: Map<GeoWay, Set<GeoLineSegment>> =
    new Map();
  private _lineSegmentsActivatedMapOfNode: Map<GeoNode, Set<GeoLineSegment>> =
    new Map();

  private _lineSegmentActivatedEventListenerManager: EventListenerManager<
    string,
    OnLineSegmentActivateEventListener
  > = new EventListenerManager();

  addLineSegmentActivatedEventListener = (
    key: string,
    listener: OnLineSegmentActivateEventListener,
  ) => {
    this._lineSegmentActivatedEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeLineSegmentActivatedEventListener = (key: string) => {
    this._lineSegmentActivatedEventListenerManager.removeEventListener(key);
  };
  private _invokeLineSegmentActivatedDebounceEventListeners = (
    lineSegment: GeoLineSegment,
    isActivated: boolean,
  ) => {
    this._lineSegmentActivatedEventListenerManager.invokeEventListeners(
      lineSegment,
      isActivated,
    );
    // Todo::rdh 아래코드는 this.addLineSegmentActivatedEventListener 이걸로 등록해야하지 않나요? 그래서 _invokeLineSegmentActivatedDebounceEventListeners 함수가 존재 해야하는 이유를 잘 모르겠어요.
    this._invokeActivatedChangeDebounceEventListener();
  };

  activateLineSegment = (lineSegment: GeoLineSegment) => {
    if (this._lineSegmentsActivatedSet.has(lineSegment)) {
      return false;
    }
    if (this._isWayActivateEnabled) {
      this.activateWay(lineSegment.getWay());
    }
    this._lineSegmentsActivatedSet.add(lineSegment);

    const lineSegmentsOfWay = this._lineSegmentsActivatedMapOfWay.get(
      lineSegment.getWay(),
    );
    if (lineSegmentsOfWay) {
      lineSegmentsOfWay.add(lineSegment);
    } else {
      this._lineSegmentsActivatedMapOfWay.set(
        lineSegment.getWay(),
        new Set([lineSegment]),
      );
    }

    const lineSegmentsOfNodeStart = this._lineSegmentsActivatedMapOfNode.get(
      lineSegment.getNodeStart(),
    );
    if (lineSegmentsOfNodeStart) {
      lineSegmentsOfNodeStart.add(lineSegment);
    } else {
      this._lineSegmentsActivatedMapOfNode.set(
        lineSegment.getNodeStart(),
        new Set([lineSegment]),
      );
    }

    const lineSegmentsOfNodeEnd = this._lineSegmentsActivatedMapOfNode.get(
      lineSegment.getNodeEnd(),
    );
    if (lineSegmentsOfNodeEnd) {
      lineSegmentsOfNodeEnd.add(lineSegment);
    } else {
      this._lineSegmentsActivatedMapOfNode.set(
        lineSegment.getNodeEnd(),
        new Set([lineSegment]),
      );
    }

    this._invokeLineSegmentActivatedDebounceEventListeners(lineSegment, true);
    return true;
  };
  activateWayLineSegments = (way: GeoWay) => {
    const lineSegments = this._lineSegmentManager.getLineSegmentsOfWay(way);
    lineSegments.forEach((lineSegment) =>
      this.activateLineSegment(lineSegment),
    );
  };

  deactivateLineSegment = (lineSegment: GeoLineSegment) => {
    if (!this._lineSegmentsActivatedSet.has(lineSegment)) {
      return false;
    }
    this._lineSegmentsActivatedSet.delete(lineSegment);
    const way = lineSegment.getWay();
    const lineSegmentsOfWay = this._lineSegmentsActivatedMapOfWay.get(way);
    if (lineSegmentsOfWay) {
      lineSegmentsOfWay.delete(lineSegment);
      if (lineSegmentsOfWay.size === 0) {
        this._lineSegmentsActivatedMapOfWay.delete(way);
      }
    }

    const lineSegmentsOfNodeStart = this._lineSegmentsActivatedMapOfNode.get(
      lineSegment.getNodeStart(),
    );
    if (lineSegmentsOfNodeStart) {
      lineSegmentsOfNodeStart.delete(lineSegment);
      if (lineSegmentsOfNodeStart.size === 0) {
        this._lineSegmentsActivatedMapOfNode.delete(lineSegment.getNodeStart());
      }
    }

    const lineSegmentsOfNodeEnd = this._lineSegmentsActivatedMapOfNode.get(
      lineSegment.getNodeEnd(),
    );
    if (lineSegmentsOfNodeEnd) {
      lineSegmentsOfNodeEnd.delete(lineSegment);
      if (lineSegmentsOfNodeEnd.size === 0) {
        this._lineSegmentsActivatedMapOfNode.delete(lineSegment.getNodeEnd());
      }
    }
    this._invokeLineSegmentActivatedDebounceEventListeners(lineSegment, false);
    if (this.isWayActivated(way) && !this.isWayActivatable(way)) {
      this.deactivateWay(way);
    }
    return true;
  };
  deactivateWayLineSegments = (way: GeoWay) => {
    const lineSegments = this._lineSegmentManager.getLineSegmentsOfWay(way);
    lineSegments.forEach((lineSegment) =>
      this.deactivateLineSegment(lineSegment),
    );
  };

  deactivateAllLineSegments = () => {
    const lineSegments = Array.from(this._lineSegmentsActivatedSet.values());
    lineSegments.forEach((lineSegment) =>
      this.deactivateLineSegment(lineSegment),
    );
  };

  isWayHasLineSegmentActivated = (way: GeoWay) => {
    return this._lineSegmentsActivatedMapOfWay.has(way);
  };

  getLineSegmentsActivated = () => {
    return Array.from(this._lineSegmentsActivatedSet);
  };

  isLineSegmentActivated = (lineSegment: GeoLineSegment) => {
    return this._lineSegmentsActivatedSet.has(lineSegment);
  };

  /**
   * =========================================================================================================
   * 활성화된 Node, Way, LineSegment 이벤트 관련
   * =========================================================================================================
   */
  private _activatedChangeEventListenerManager: EventListenerManager<
    string,
    (nodes: GeoNode[], ways: GeoWay[], lineSegments: GeoLineSegment[]) => void
  > = new EventListenerManager();
  addActivatedChangeEventListener = (
    key: string,
    listener: (
      nodes: GeoNode[],
      ways: GeoWay[],
      lineSegments: GeoLineSegment[],
    ) => void,
  ) => {
    this._activatedChangeEventListenerManager.addEventListener(key, listener);
  };
  removeActivatedChangeEventListener = (key: string) => {
    this._activatedChangeEventListenerManager.removeEventListener(key);
  };

  private _invokeActivatedChangeDebounceEventListener = () => {
    this._activatedChangeEventListenerManager.invokeDebounceEventListeners(
      this.getNodesActivated(),
      this.getWaysActivated(),
      this.getLineSegmentsActivated(),
    );
  };

  private _activatedDragStartEventListenerManager: EventListenerManager<
    string,
    (nodes: GeoNode[], ways: GeoWay[], lineSegments: GeoLineSegment[]) => void
  > = new EventListenerManager();
  addActivatedDragStartEventListener = (
    key: string,
    listener: (
      nodes: GeoNode[],
      ways: GeoWay[],
      lineSegments: GeoLineSegment[],
    ) => void,
  ) => {
    this._activatedDragStartEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeActivatedDragStartEventListener = (key: string) => {
    this._activatedDragStartEventListenerManager.removeEventListener(key);
  };
  private _invokeActivatedDragStartEventListeners = () => {
    this._activatedDragStartEventListenerManager.invokeEventListeners(
      this.getNodesActivated(),
      this.getWaysActivated(),
      this.getLineSegmentsActivated(),
    );
  };

  private _activatedDragEventListenerManager: EventListenerManager<
    string,
    (nodes: GeoNode[], ways: GeoWay[], lineSegments: GeoLineSegment[]) => void
  > = new EventListenerManager();
  addActivatedDragEventListener = (
    key: string,
    listener: (
      nodes: GeoNode[],
      ways: GeoWay[],
      lineSegments: GeoLineSegment[],
    ) => void,
  ) => {
    this._activatedDragEventListenerManager.addEventListener(key, listener);
  };
  removeActivatedDragEventListener = (key: string) => {
    this._activatedDragEventListenerManager.removeEventListener(key);
  };
  private _invokeActivatedDragEventListeners = () => {
    this._activatedDragEventListenerManager.invokeEventListeners(
      this.getNodesActivated(),
      this.getWaysActivated(),
      this.getLineSegmentsActivated(),
    );
  };

  private _activatedDragEndEventListenerManager: EventListenerManager<
    string,
    (nodes: GeoNode[], ways: GeoWay[], lineSegments: GeoLineSegment[]) => void
  > = new EventListenerManager();
  addActivatedDragEndEventListener = (
    key: string,
    listener: (
      nodes: GeoNode[],
      ways: GeoWay[],
      lineSegments: GeoLineSegment[],
    ) => void,
  ) => {
    this._activatedDragEndEventListenerManager.addEventListener(key, listener);
  };
  removeActivatedDragEndEventListener = (key: string) => {
    this._activatedDragEndEventListenerManager.removeEventListener(key);
  };
  private _invokeActivatedDragEndEventListeners = () => {
    this._activatedDragEndEventListenerManager.invokeEventListeners(
      this.getNodesActivated(),
      this.getWaysActivated(),
      this.getLineSegmentsActivated(),
    );
  };

  getFeaturesActivated = (): GeoFeaturesType => {
    return {
      nodes: this.getNodesActivated(),
      ways: this.getWaysActivated(),
      lineSegments: this.getLineSegmentsActivated(),
    };
  };

  deactivateAll = () => {
    this.deactivateAllNodes();
    this.deactivateAllWays();
    this.deactivateAllLineSegments();
  };

  destroy = () => {
    this._geoMapEventRemover.destroy();
    this._nodesActivatedSet.clear();
    this._waysActivatedSet.clear();
    this._lineSegmentsActivatedSet.clear();
    this._lineSegmentsActivatedMapOfWay.clear();
    this._lineSegmentsActivatedMapOfNode.clear();
    this._lineSegmentActivatedEventListenerManager.destroy();

    this._activatedDragStartEventListenerManager.destroy();
    this._activatedDragEventListenerManager.destroy();
    this._activatedDragEndEventListenerManager.destroy();

    this._nodeActivatedEventListenerManager.destroy();
    this._wayActivatedEventListenerManager.destroy();
    this._lineSegmentActivatedEventListenerManager.destroy();
    this._activatedChangeEventListenerManager.destroy();
  };
}

export default GeoFeatureActivationManager;
