import WayOptionsFactory from '@design-system/components/geo-map/WayOptionsFactory';
import GeoToolBoxManager from '@design-system/geo-map/GeoToolBoxManager';
import GeoFeatureActivationManager from '@design-system/geo-map/activation/GeoFeatureActivationManager';
import EventPreventer, {
  EventPreventerTypeEnum,
} from '@design-system/geo-map/event/EventPreventer';
import GeoMapEventManager, {
  GeoMapEventRemover,
} from '@design-system/geo-map/event/GeoMapEventManager';
import GeoFeatureManager, {
  GeoFeaturesType,
  GeoNodeTypeEnum,
} from '@design-system/geo-map/feature/GeoFeatureManager';
import GeoNode, {
  GeoNodeOptionType,
} from '@design-system/geo-map/feature/GeoNode';
import GeoWay from '@design-system/geo-map/feature/GeoWay';
import GeoLineSegment from '@design-system/geo-map/line-segment/GeoLineSegment';
import GeoLineSegmentManager from '@design-system/geo-map/line-segment/GeoLineSegmentManager';
import GeoFeatureVisibleManager from '@design-system/geo-map/optimizer/GeoFeatureVisibleManager';
import GeoPreNodeManager from '@design-system/geo-map/pre-node/GeoPreNodeManager';
import {
  GeoFeatureTagsType,
  GeoLatLngType,
  GeoMapTypeEnum,
  MarkerEnum,
  PolylineEnum,
} from '@design-system/types/geoMap.type';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';
import IdGenerator from '@design-system/utils/geo-map/IdGenerator';
import NodeContentsFuncFactory from '@design-system/components/geo-map/NodeContentsFuncFactory';
import GeoHistoryManager from '@design-system/geo-map/history/GeoHistoryManager';
import MoveNodeCommand, {
  OldWaysValueType,
} from '@design-system/geo-map/history/MoveNodeCommand';
import FeatureCommand, {
  FeatureCommandProps,
  LineSegmentUndoDataType,
} from '@design-system/geo-map/history/FeatureCommand';

const GEO_MAP_LAYER_DELEGATOR = 'GeoLayerDelegator';

/**
 * Layer 관련 정책
 * 사용자 인터렉션과 관련이 있으면서 스타일이 아닌 정책 + 모든 편집 모드들에서 각각 설정해서 가져가야하는 기능들
 */
export interface GeoLayerDelegatorPolicy {
  isEndpointNodeClickable: boolean;
  isSegmentalNodeClickable: boolean;
  isEndpointNodeDraggable: boolean;
  isSegmentalNodeDraggable: boolean;
  isNodeSnappingEnabled: boolean;
  isDivideWayWhenToolBoxDivideButtonClick: boolean;
  isDeleteActivatedWhenToolBoxDeleteButtonClick: boolean;
  isCopyActivatedWhenToolBoxCopyButtonClick: boolean;
  isDeactivateAllWhenToolBoxClosed: boolean;
  nodeSnappingPx: number;
}

class GeoLayerDelegator {
  static LAYER_DELEGATOR_INIT_POLICY: GeoLayerDelegatorPolicy = {
    isEndpointNodeClickable: false,
    isSegmentalNodeClickable: false,
    isEndpointNodeDraggable: false,
    isSegmentalNodeDraggable: false,
    isNodeSnappingEnabled: false,
    isDivideWayWhenToolBoxDivideButtonClick: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    isCopyActivatedWhenToolBoxCopyButtonClick: false,
    isDeactivateAllWhenToolBoxClosed: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
  };
  private _idGenerator: IdGenerator;
  private readonly _map: google.maps.Map;
  private readonly _mapEventManager: GeoMapEventManager;
  private _mapEventRemover: GeoMapEventRemover;
  private readonly _featureManager: GeoFeatureManager;
  private readonly _featureVisibleManager: GeoFeatureVisibleManager;
  private readonly _preNodeManager: GeoPreNodeManager;
  private readonly _featureActivationManager: GeoFeatureActivationManager;
  private readonly _lineSegmentManager: GeoLineSegmentManager;
  private readonly _historyManager: GeoHistoryManager;
  private readonly _eventPreventer: EventPreventer;
  private _mapType: GeoMapTypeEnum;
  private _featuresCopied: {
    ways: GeoWay[];
    nodes: GeoNode[];
  } = { ways: [], nodes: [] };

  private _isEndpointNodeClickable = false;
  private _isSegmentalNodeClickable = false;
  private _isEndpointNodeDraggable = false;
  private _isSegmentalNodeDraggable = false;

  private readonly _toolBoxManager: GeoToolBoxManager;

  constructor(
    idGenerator: IdGenerator,
    map: google.maps.Map,
    googleMapEventManager: GeoMapEventManager,
    featureManager: GeoFeatureManager,
    featureVisibleManager: GeoFeatureVisibleManager,
    preNodeManager: GeoPreNodeManager,
    featureActivationManager: GeoFeatureActivationManager,
    toolBoxManager: GeoToolBoxManager,
    lineSegmentManager: GeoLineSegmentManager,
    historyManager: GeoHistoryManager,
    clickEventPreventer: EventPreventer,
    policy: GeoLayerDelegatorPolicy = GeoLayerDelegator.LAYER_DELEGATOR_INIT_POLICY,
  ) {
    this._idGenerator = idGenerator;
    this._map = map;
    this._toolBoxManager = toolBoxManager;
    this._mapEventManager = googleMapEventManager;
    this._mapEventRemover = new GeoMapEventRemover(googleMapEventManager);
    this._featureManager = featureManager;
    this._featureVisibleManager = featureVisibleManager;
    this._preNodeManager = preNodeManager;
    this._featureActivationManager = featureActivationManager;
    this._historyManager = historyManager;
    this._lineSegmentManager = lineSegmentManager;
    this._eventPreventer = clickEventPreventer;
    this._mapType = GeoMapTypeEnum.SATELLITE;
    this.setPolicy(policy);

    if (GeoMapUtils.IS_DEBUG) {
      this._mapEventRemover.addEventId(
        this._mapEventManager.addDoubleClickEventListener(() => {
          console.log(
            'GeoFeatureManager. nodes',
            this._featureManager.getAllNodes().map((node) => node.getId()),
          );
          this._featureManager.getAllWays().map((way) => {
            console.log(
              'GeoFeatureManager. way',
              way.getId(),
              'way.nodes',
              way.getNodeIds(),
            );
            console.log(
              'GeoPreNodeManager. way.preNodes',
              this._preNodeManager
                .getPreNodeParts(way)
                .map(
                  (preNodeParts) =>
                    `nodeStart:${preNodeParts.nodeStart.getId()}, nodeEnd:${preNodeParts.nodeEnd.getId()}`,
                ),
            );
          });
          console.log(
            'GeoFeatureActivationManager. nodesActivatedSet:',
            Array.from(this._featureActivationManager.getNodesActivated()).map(
              (node) => node.getId(),
            ),
          );
          console.log(
            'GeoFeatureActivationManager. lineSegmentsActivatedMapOfNode:',
            Array.from(
              this._featureActivationManager.getLineSegmentsActivated(),
            ).map((lineSegment) => lineSegment.getId()),
          );
          console.log(
            'GeoFeatureActivationManager. waysActivatedSet:',
            Array.from(this._featureActivationManager.getWaysActivated()).map(
              (way) => way.getId(),
            ),
          );
        }),
      );
    }
    this._featureVisibleManager.addNodeVisibleChangedListener(
      GEO_MAP_LAYER_DELEGATOR,
      (node, isVisible) => {
        if (!isVisible) {
          return;
        }
        const nodeTypes = this._featureManager.getNodeTypes(node);
        if (nodeTypes.size > 0) {
          const isEndpointNode =
            nodeTypes.has(GeoNodeTypeEnum.START) ||
            nodeTypes.has(GeoNodeTypeEnum.END);
          const isSegmentalNode = nodeTypes.has(GeoNodeTypeEnum.SEGMENTAL);
          const isCurrentNodeClickable =
            (this._isEndpointNodeClickable && isEndpointNode) ||
            (this._isSegmentalNodeClickable && isSegmentalNode);
          if (node.isClickable() !== isCurrentNodeClickable) {
            node.setClickable(isCurrentNodeClickable);
          }
          const isCurrentNodeDraggable =
            (this._isEndpointNodeDraggable && isEndpointNode) ||
            (this._isSegmentalNodeDraggable && isSegmentalNode);
          if (node.isDraggable() !== isCurrentNodeDraggable) {
            node.setDraggable(isCurrentNodeDraggable);
          }
        }
      },
    );
    this._featureManager.addNodeAddedListener(
      GEO_MAP_LAYER_DELEGATOR,
      (node) => {
        this._setNodeDragEventListenerForMove(node);
      },
    );
    this._featureManager.addNodeTypesChangedListener(
      GEO_MAP_LAYER_DELEGATOR,
      (node, nodeTypes) => {
        if (!node.isVisible()) {
          return;
        }
        const isEndpointNode =
          nodeTypes.has(GeoNodeTypeEnum.START) ||
          nodeTypes.has(GeoNodeTypeEnum.END);
        const isSegmentalNode = nodeTypes.has(GeoNodeTypeEnum.SEGMENTAL);
        const isCurrentNodeClickable =
          (this._isEndpointNodeClickable && isEndpointNode) ||
          (this._isSegmentalNodeClickable && isSegmentalNode);
        node.setClickable(isCurrentNodeClickable);
        const isCurrentNodeDraggable =
          (this._isEndpointNodeDraggable && isEndpointNode) ||
          (this._isSegmentalNodeDraggable && isSegmentalNode);
        node.setDraggable(isCurrentNodeDraggable);
      },
    );
    this._featureManager.addNodeDeletedListener(
      GEO_MAP_LAYER_DELEGATOR,
      (node) => {
        node.destroy();
      },
    );
    this._featureManager.addWayDeletedListener(
      GEO_MAP_LAYER_DELEGATOR,
      (way) => {
        way.destroy();
      },
    );
    // PreNodeManager, add event
    this._preNodeManager.addPreNodeRemovedEventListener(
      GEO_MAP_LAYER_DELEGATOR,
      (preNode, way, nodeStart, nodeEnd) => {
        this._featureManager.addNode(preNode);

        const nodes = way.getNodes();
        let _nodeBefore: GeoNode | undefined = undefined;
        let indexOf = -1;
        for (let i = 0; i < way.getNodes().length; i++) {
          const node = nodes[i];
          if (_nodeBefore && _nodeBefore === nodeStart && node === nodeEnd) {
            indexOf = i;
            break;
          }
          _nodeBefore = node;
        }
        if (indexOf === -1) {
          throw Error('GeoLayerDelegator. NodeRemovedEvent. indexOf is -1.');
        }
        this._featureManager.addNodeToWay(preNode.getId(), way, indexOf);
        if (
          this._featureActivationManager.getPolicy()
            .isNodeAndLineSegmentSingleActivateByClickEnabled
        ) {
          this._featureActivationManager.deactivateAllNodes();
          this._featureActivationManager.deactivateAllLineSegments();
        }
        this._featureActivationManager.activateNode(preNode);
      },
    );

    // 구글맵 맵의 이벤트들
    // GoogleMap, add event
    this._mapEventRemover.addEventId(
      this._mapEventManager.addClickEventListener(() => {}),
    );
    this._mapEventRemover.addEventId(
      this._mapEventManager.addMouseDownEventListener((event) => {
        // TODO: pss, OS에 따라서  click 또는 mouse down을 선택적으로 등록해야 함
        // this.handleMapClickEvent(event)
      }),
    );
    this._mapEventRemover.addEventId(
      this._mapEventManager.addMapTypeChangeStickyEventListener((mapType) => {
        this._mapType = mapType;
      }),
    );

    // 도구 버튼들의 이벤트 등록
    // 길 분할
    this._toolBoxManager.addDivideWaysButtonClickEventListener(
      GEO_MAP_LAYER_DELEGATOR,
      () => {
        if (!this._isDivideWayWhenToolBoxDivideButtonClick) {
          return;
        }
        this._featureManager
          .getSplitWayNodesListByNodes(
            this._featureActivationManager.getNodesActivated(),
          )
          .forEach((nodesList, way) => {
            const waysCreated = nodesList.map((nodes) => {
              return this.createWay(
                this._idGenerator.getNextId(),
                nodes.map((node) => node.getId()),
              );
            });
            this._featureManager.replaceWay(waysCreated, way);
          });
        this._featureActivationManager.deactivateAll();
      },
    );

    // 삭제
    this._toolBoxManager.addDeleteButtonClickEventListener(
      GEO_MAP_LAYER_DELEGATOR,
      (nodes, ways, lineSegments) => {
        if (!this._isDeleteActivatedWhenToolBoxDeleteButtonClick) {
          return;
        }
        this.deleteFeatures({ nodes, ways, lineSegments });
      },
    );

    this._toolBoxManager.addCloseButtonClickEventListener(
      GEO_MAP_LAYER_DELEGATOR,
      () => {
        if (this._isDeactivateAllWhenToolBoxClosed) {
          this._featureActivationManager.deactivateAll();
        }
      },
    );
  }

  private _deleteFeaturesCore = (
    nodes: GeoNode[],
    lineSegments: GeoLineSegment[],
  ): Array<LineSegmentUndoDataType> => {
    const lineSegmentUndoData: Array<LineSegmentUndoDataType> = [];
    const nodesExcludePairListMap = lineSegments.reduce(
      (result, lineSegment) => {
        const value = result.get(lineSegment.getWay()) || [];
        value.push([lineSegment.getNodeStart(), lineSegment.getNodeEnd()]);
        result.set(lineSegment.getWay(), value);
        return result;
      },
      new Map<GeoWay, [GeoNode, GeoNode][]>(),
    );

    this._featureManager
      .getSplitWayNodesListByNodesExcludePair(nodesExcludePairListMap)
      .forEach((nodesList, way) => {
        const waysCreated = nodesList.reduce((result, nodes) => {
          if (nodes.length > 0) {
            result.push(
              this.createWay(
                this._idGenerator.getNextId(),
                nodes.map((node) => node.getId()),
              ),
            );
          }
          return result;
        }, [] as GeoWay[]);
        const previousNodes = way.getNodes().map((node) => ({
          id: node.getId(),
          position: node.getPosition(),
          options: node.getOptions(),
          tags: node.getTags(),
        }));
        if (waysCreated.length > 0) {
          lineSegmentUndoData.push({
            waysCreated,
            previousNodes,
          });
          this._featureManager.replaceWay(waysCreated, way);
        } else {
          this._featureManager.deleteWay(way);
        }
      });
    nodes.forEach((node) => {
      this._featureManager.deleteNode(node);
    });
    lineSegments.forEach((lineSegment) => {
      this._lineSegmentManager.deleteLineSegment(lineSegment);
      this._lineSegmentManager.deleteLineSegmentDirection(
        lineSegment.getWay(),
        lineSegment.getNodeStart(),
        lineSegment.getNodeEnd(),
      );
    });
    nodesExcludePairListMap.clear();
    this._featureManager.refreshEnabledWays();

    return lineSegmentUndoData;
  };

  deleteFeatures = (features: GeoFeaturesType) => {
    const { nodes, lineSegments, ways } = features;
    const featuresDeleted = { ...features, ways: new Map<GeoWay, GeoNode[]>() };
    ways.forEach((way) => featuresDeleted.ways.set(way, way.getNodes()));

    const lineSegmentUndoData = this._deleteFeaturesCore(nodes, lineSegments);

    const featureCommandProps: FeatureCommandProps = {
      featureManager: this._featureManager,
      lineSegmentManager: this._lineSegmentManager,
      createWay: this.createWay,
      createNode: this.createNode,
      featuresDeleted,
      lineSegmentUndoData,
      deleteFeaturesCore: this._deleteFeaturesCore,
    };

    const command = new FeatureCommand(featureCommandProps);
    this._historyManager.register(command);
  };

  private _syncNodeState = () => {
    this._featureVisibleManager.getNodesVisible().forEach((node) => {
      const nodeTypes = this._featureManager.getNodeTypes(node);
      const isEndpointNode =
        nodeTypes.has(GeoNodeTypeEnum.START) ||
        nodeTypes.has(GeoNodeTypeEnum.END);
      const isSegmentalNode = nodeTypes.has(GeoNodeTypeEnum.SEGMENTAL);
      const isCurrentNodeClickable =
        (this._isEndpointNodeClickable && isEndpointNode) ||
        (this._isSegmentalNodeClickable && isSegmentalNode);
      node.setClickable(isCurrentNodeClickable);
      const isCurrentNodeDraggable =
        (this._isEndpointNodeDraggable && isEndpointNode) ||
        (this._isSegmentalNodeDraggable && isSegmentalNode);
      node.setDraggable(isCurrentNodeDraggable);
    });
  };

  /**
   * =========================================================================================================
   * Policy
   * =========================================================================================================
   */
  getPolicy = (): GeoLayerDelegatorPolicy => {
    return {
      isEndpointNodeClickable: this._isEndpointNodeClickable,
      isSegmentalNodeClickable: this._isSegmentalNodeClickable,
      isEndpointNodeDraggable: this._isEndpointNodeDraggable,
      isSegmentalNodeDraggable: this._isSegmentalNodeDraggable,
      isNodeSnappingEnabled: this._isNodeSnappingEnabled,
      isDivideWayWhenToolBoxDivideButtonClick:
        this._isDivideWayWhenToolBoxDivideButtonClick,
      isDeleteActivatedWhenToolBoxDeleteButtonClick:
        this._isDeleteActivatedWhenToolBoxDeleteButtonClick,
      isCopyActivatedWhenToolBoxCopyButtonClick:
        this._isCopyActivatedWhenToolBoxCopyButtonClick,
      isDeactivateAllWhenToolBoxClosed: this._isDeactivateAllWhenToolBoxClosed,
      nodeSnappingPx: this._nodeSnappingPx,
    };
  };

  // GeoLayerDelegator는 정책을 setPolicy를 통해서만 설정합니다. 개별로 정책을 따로 설정하지 않습니다.
  setPolicy = (policy: GeoLayerDelegatorPolicy) => {
    const {
      isEndpointNodeClickable,
      isSegmentalNodeClickable,
      isEndpointNodeDraggable,
      isSegmentalNodeDraggable,
      isNodeSnappingEnabled,
      isDivideWayWhenToolBoxDivideButtonClick,
      isDeleteActivatedWhenToolBoxDeleteButtonClick,
      isCopyActivatedWhenToolBoxCopyButtonClick,
      isDeactivateAllWhenToolBoxClosed,
      nodeSnappingPx,
    } = policy;
    this._isEndpointNodeClickable = isEndpointNodeClickable;
    this._isSegmentalNodeClickable = isSegmentalNodeClickable;
    this._isEndpointNodeDraggable = isEndpointNodeDraggable;
    this._isSegmentalNodeDraggable = isSegmentalNodeDraggable;
    this._isNodeSnappingEnabled = isNodeSnappingEnabled;
    this._isDivideWayWhenToolBoxDivideButtonClick =
      isDivideWayWhenToolBoxDivideButtonClick;
    this._isDeleteActivatedWhenToolBoxDeleteButtonClick =
      isDeleteActivatedWhenToolBoxDeleteButtonClick;
    this._isCopyActivatedWhenToolBoxCopyButtonClick =
      isCopyActivatedWhenToolBoxCopyButtonClick;
    this._isDeactivateAllWhenToolBoxClosed = isDeactivateAllWhenToolBoxClosed;
    this._nodeSnappingPx = nodeSnappingPx;

    this._syncNodeState();
  };

  /**
   * Node 생성
   */
  createNode = (
    id: number,
    position: GeoLatLngType,
    options?: Pick<GeoNodeOptionType, 'visible' | 'clickable' | 'draggable'>,
    tags?: GeoFeatureTagsType,
  ) => {
    const { visible = false, draggable, clickable } = options || {};
    const nodeNew = new GeoNode({
      id,
      googleMap: this._map,
      position: { lng: position.lng, lat: position.lat },
      options: {
        ...NodeContentsFuncFactory[MarkerEnum.EDIT_NODE](id),
        visible,
        clickable,
        draggable,
      },
      tags,
    });
    this._featureManager.addNode(nodeNew);
    return nodeNew;
  };
  /**
   * Way 생성
   */
  createWay = (
    id: number,
    nodeIds: number[],
    tags?: GeoFeatureTagsType,
    isVisible = true,
  ) => {
    const newWay = new GeoWay({
      id: id,
      idGenerator: this._idGenerator,
      googleMap: this._map,
      nodes: nodeIds.map((nodeId: number) =>
        this._featureManager.getNode(nodeId),
      ),
      tags: tags
        ? Object.entries(tags).reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {} as GeoFeatureTagsType)
        : undefined,
      options: {
        ...WayOptionsFactory[PolylineEnum.EDIT_PATH](this._mapType),
        visible: isVisible,
      },
    });
    this._featureManager.addWay(newWay);
    return newWay;
  };

  /**
   * =========================================================================================================
   * Node Drag 관련
   * =========================================================================================================
   */

  private _isNodeSnappingEnabled = false;
  setNodeSnappingEnabled = (enabled: boolean) => {
    this._isNodeSnappingEnabled = enabled;
  };

  isNodeSnappingEnabled = () => {
    return this._isNodeSnappingEnabled;
  };

  private _updateNodeLatLng = (node: GeoNode, movedLatLng: GeoLatLngType) => {
    if (GeoMapUtils.isLatLngEquals(node.getPosition(), movedLatLng)) return;
    return this._featureManager.updateNodeLatLng(node, movedLatLng);
  };

  private _setNodeDragEventListenerForMove = (node: GeoNode) => {
    let nodeSnapping: GeoNode | undefined = undefined;
    let ways: GeoWay[] = [];
    const oldWays = new Map<GeoWay, OldWaysValueType>();
    const oldPositions: GeoLatLngType[] = [];
    const newPositions: GeoLatLngType[] = [];

    node.addDragStartEventListener((event) => {
      ways = this._featureManager.getWaysWithNode(node);
      ways.forEach((way) =>
        oldWays.set(way, {
          nodes: way.getNodes().map((node) => ({
            id: node.getId(),
            position: { ...node.getPosition() },
            options: { ...node.getOptions() },
            tags: node.getTags() ? { ...node.getTags() } : undefined,
          })),
        }),
      );
    });

    node.addDragEventListener((nodeDragEvent) => {
      this._featureVisibleManager.getNodesVisible().forEach((nodeCurrent) => {
        if (nodeCurrent === node) return;
        nodeCurrent.setClickable(false);
      });
      const { event, beforeLatLng } = nodeDragEvent;
      if (!event?.latLng) return;
      const latLngNew = GeoMapUtils.toLatLng(event.latLng);
      const nodesActivated = this._featureActivationManager.getNodesActivated();
      nodesActivated.forEach((node) => {
        oldPositions.push(node.getPosition());
      });

      if (nodesActivated.length > 1) {
        nodesActivated.forEach((nodeActivated) => {
          if (nodeActivated === node) {
            this._updateNodeLatLng(node, latLngNew);
          } else {
            const positionNodeActivated = nodeActivated.getPosition();
            const positionNew = {
              lat:
                positionNodeActivated.lat - (beforeLatLng.lat - latLngNew.lat),
              lng:
                positionNodeActivated.lng - (beforeLatLng.lng - latLngNew.lng),
            };
            this._updateNodeLatLng(nodeActivated, positionNew);
          }
        });
      } else {
        if (this._isNodeSnappingEnabled) {
          const nodesIdExclude = this._featureManager
            .getWaysWithNode(node)
            .reduce(
              (acc, way) => {
                way.getNotAdjacentNodesId(node).forEach((nodeId) => {
                  acc.push(nodeId);
                });
                return acc;
              },
              [node.getId()] as number[],
            );
          nodeSnapping = this._featureVisibleManager.getNodeVisibleWithinPx(
            latLngNew,
            this._nodeSnappingPx,
            {
              nodesIdExclude,
            },
          );
        } else {
          nodeSnapping = undefined;
        }
        this._updateNodeLatLng(
          node,
          nodeSnapping ? nodeSnapping.getPosition() : latLngNew,
        );
        node.setInnerVisible(!nodeSnapping);
      }
    });

    node.addDragEndEventListener(({ event }) => {
      const nodesActivated = this._featureActivationManager.getNodesActivated();
      if (nodesActivated.length > 1) {
        nodesActivated.forEach((nodeActivated) => {
          newPositions.push(nodeActivated.getPosition());
        });
      }
      if (nodesActivated.length === 1) {
        const { latLng } = event;
        if (!latLng) return;
        const latLngNew = GeoMapUtils.toLatLng(latLng);
        newPositions.push(latLngNew);
      }

      node.setClickable(false);
      node.setDraggable(false);
      this._syncNodeState();
      // 비주기적으로, 마우스 click 시, dragStart/drag/dragEnd가 발생한 후에 click 이벤트가 발생함
      // 이로 인해 마우스 한번 click으로 node가 activated -> deactivated 상태로 변경하는 문제가 발생함
      // 이를 막기 위해 preventer를 사용함
      this._eventPreventer.updateEventAtToNow(EventPreventerTypeEnum.CLICK);
      const moveCommand = new MoveNodeCommand({
        nodes: this._featureActivationManager.getNodesActivated(),
        newPositions,
        oldPositions,
        oldWays,
        featureManager: {
          featureManager: this._featureManager,
          featureVisibleManager: this._featureVisibleManager,
        },
        createNode: this.createNode,
        createWay: this.createWay,
        isMerged: Boolean(nodeSnapping),
      });
      if (nodeSnapping) {
        const result = this._featureManager.mergeNode(node, nodeSnapping);
        if (
          !result.nodesDeleted.find(
            (nodeDeleted) => nodeDeleted === nodeSnapping,
          )
        ) {
          // TODO: pss, _featureActivationManager에 nodeMerged 이벤트 추가후 분리 해야 함
          this._featureActivationManager.activateNode(nodeSnapping);
        }
        nodeSnapping = undefined;
      }

      this._historyManager.register(moveCommand);
      newPositions.length = 0;
      oldPositions.length = 0;
    });
  };

  /**
   * =========================================================================================================
   * ToolBox 관련
   * =========================================================================================================
   */
  private _isDivideWayWhenToolBoxDivideButtonClick = false;
  setDivideWayWhenToolBoxDivideButtonClick = (enabled: boolean) => {
    this._isDivideWayWhenToolBoxDivideButtonClick = enabled;
  };
  isDivideWayWhenToolBoxDivideButtonClick = () => {
    return this._isDivideWayWhenToolBoxDivideButtonClick;
  };
  private _isDeleteActivatedWhenToolBoxDeleteButtonClick = false;
  setDeleteActivatedWhenToolBoxDeleteButtonClick = (enabled: boolean) => {
    this._isDeleteActivatedWhenToolBoxDeleteButtonClick = enabled;
  };
  isDeleteActivatedWhenToolBoxDeleteButtonClick = () => {
    return this._isDeleteActivatedWhenToolBoxDeleteButtonClick;
  };
  private _isCopyActivatedWhenToolBoxCopyButtonClick = false;
  setCopyActivatedWhenToolBoxCopyButtonClick = (enabled: boolean) => {
    this._isCopyActivatedWhenToolBoxCopyButtonClick = enabled;
  };
  isCopyActivatedWhenToolBoxCopyButtonClick = () => {
    return this._isCopyActivatedWhenToolBoxCopyButtonClick;
  };
  private _isDeactivateAllWhenToolBoxClosed = false;
  setDeactivateAllWhenToolBoxClosed = (enabled: boolean) => {
    this._isDeactivateAllWhenToolBoxClosed = enabled;
  };
  isDeactivateAllWhenToolBoxClosed = () => {
    return this._isDeactivateAllWhenToolBoxClosed;
  };
  private _nodeSnappingPx: number = GeoNode.RADIUS_PX * 2;
  setNodeSnappingPx = (px: number) => {
    this._nodeSnappingPx = px;
  };
  getNodeSnappingPx = () => {
    return this._nodeSnappingPx;
  };

  pasteLineSegment = (lineSegments: GeoLineSegment[]) => {
    this._featuresCopied = { ways: [], nodes: [] };
    try {
      const wayMapLineSegments = new Map<GeoWay, Set<GeoLineSegment>>();
      lineSegments.forEach((lineSegment) => {
        const lineSegmentWay = lineSegment.getWay();
        const lineSegmentSetByWay = wayMapLineSegments.get(lineSegmentWay);
        if (lineSegmentSetByWay) {
          lineSegmentSetByWay.add(lineSegment);
        } else {
          wayMapLineSegments.set(
            lineSegmentWay,
            new Set<GeoLineSegment>([lineSegment]),
          );
        }
      });

      Array.from(wayMapLineSegments.entries()).forEach(
        ([way, lineSegmentSet]) => {
          const sortedLineSegments = Array.from(lineSegmentSet.values()).sort(
            (lineSegmentA, lineSegmentB) => {
              return (
                way.getIndexOfNode(lineSegmentA.getNodeStart()) -
                way.getIndexOfNode(lineSegmentB.getNodeEnd())
              );
            },
          );

          const pathNodesByLineSegments = Array.from(
            new Set(
              sortedLineSegments
                .map((lineSegments) => lineSegments.getNodes())
                .flat(),
            ).values(),
          ).map((node) => node);

          const newPathNodeIds = pathNodesByLineSegments.map((node) => {
            const nodeCopied = this.createNode(
              this._idGenerator.getNextId(),
              node.getPosition(),
            );
            this._featuresCopied.nodes.push(nodeCopied);
            return nodeCopied.getId();
          });
          wayMapLineSegments.clear();
          const wayCopied = this.createWay(
            this._idGenerator.getNextId(),
            newPathNodeIds,
          );
          this._featuresCopied.ways.push(wayCopied);
        },
      );

      return true;
    } catch (error) {
      console.log('ERR:: GeoLayerDelegator:: pasteLineSegment:: ', error);
      return false;
    }
  };

  destroy = () => {
    this._mapEventRemover.removeAllEvents();
    this._featuresCopied = { ways: [], nodes: [] };
  };
}

export default GeoLayerDelegator;
