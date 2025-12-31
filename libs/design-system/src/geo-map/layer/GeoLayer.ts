import {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  LineString,
} from 'geojson';
import { v4 as uuidV4 } from 'uuid';
import { GeoFeatureStylePolicy } from '@design-system/constants/geo-map';
import { TagKeyEnum, TagValueType } from '@design-system/constants/map-tag';
import GeoToolBoxManager, {
  GeoToolBoxPolicy,
} from '@design-system/geo-map/GeoToolBoxManager';
import GeoFeatureActivationManager, {
  GeoFeatureActivationPolicy,
} from '@design-system/geo-map/activation/GeoFeatureActivationManager';
import EventListenerManager from '@design-system/geo-map/event/EventListenerManager';
import EventPreventer from '@design-system/geo-map/event/EventPreventer';
import GeoLayerEventInvoker, {
  GeoLayerEventInvokerPolicy,
} from '@design-system/geo-map/event/GeoLayerEventInvoker';
import GeoMapEventManager, {
  GeoMapEventRemover,
} from '@design-system/geo-map/event/GeoMapEventManager';
import NotificationEventManager from '@design-system/geo-map/event/NotificationEventManager';
import GeoNode, {
  GeoNodeOptionType,
} from '@design-system/geo-map/feature/GeoNode';
import GeoWay from '@design-system/geo-map/feature/GeoWay';
import GeoLayerDelegator, {
  GeoLayerDelegatorPolicy,
} from '@design-system/geo-map/layer/GeoLayerDelegator';
import GeoLineSegment from '@design-system/geo-map/line-segment/GeoLineSegment';
import GeoLineSegmentManager, {
  GeoLineSegmentPolicy,
} from '@design-system/geo-map/line-segment/GeoLineSegmentManager';
import {
  GeoMarkerOptionsType,
  MarkerIdType,
} from '@design-system/geo-map/marker/GeoMarker';
import GeoMarkerManager, {
  GeoMarkerPolicy,
} from '@design-system/geo-map/marker/GeoMarkerManager';
import GeoNodeCandidateManager, {
  GeoNodeCandidatePolicy,
} from '@design-system/geo-map/node-candidate/GeoNodeCandidateManager';
import GeoFeatureVisibleManager, {
  GeoFeatureVisiblePolicy,
} from '@design-system/geo-map/optimizer/GeoFeatureVisibleManager';
import GeoPreNodeManager, {
  GeoPreNodePolicy,
} from '@design-system/geo-map/pre-node/GeoPreNodeManager';
import GeoFeatureStyleManager from '@design-system/geo-map/style/GeoFeatureStyleManager';
import {
  GEO_MAP_ZOOM_LEVEL_DEFAULT,
  GeoFeatureLineStringPropertyType,
  GeoFeatureTagsType,
  GeoLatLngType,
  GeometryTypeEnum,
  MarkerEnum,
} from '@design-system/types/geoMap.type';
import { GeoFeatureTagsUtils } from '@design-system/utils/geo-map/GeoFeatureTagsUtils';
import IdGenerator, {
  GenIdType,
} from '@design-system/utils/geo-map/IdGenerator';
import GeoFeatureManager, {
  GeoFeaturesType,
} from '@design-system/geo-map/feature/GeoFeatureManager';
import NodeContentsFuncFactory, {
  EditToolMenuEnum,
} from '@design-system/components/geo-map/NodeContentsFuncFactory';
import GeoHistoryManager from '@design-system/geo-map/history/GeoHistoryManager';

const KEY = 'GeoLayer';

export interface WayEnabledResultType {
  waysEnabled: GeoWay[];
  waysDisabled: GeoWay[];
}

export interface GeoLayerPolicy {
  featureActivationPolicy: GeoFeatureActivationPolicy;
  layerDelegatorPolicy: GeoLayerDelegatorPolicy;
  nodeCandidatePolicy: GeoNodeCandidatePolicy;
  preNodePolicy: GeoPreNodePolicy;
  toolBoxPolicy: GeoToolBoxPolicy;
  featureStylePolicy: GeoFeatureStylePolicy;
  lineSegmentPolicy: GeoLineSegmentPolicy;
  markerPolicy: GeoMarkerPolicy;
  featureVisiblePolicy: GeoFeatureVisiblePolicy;
  layerEventInvokerPolicy: GeoLayerEventInvokerPolicy;
}

class GeoLayer {
  private readonly _idGenerator: IdGenerator;

  private _id: GenIdType;
  /**
   * 구글 맵
   * @private
   */
  private readonly _map: google.maps.Map;
  /**
   * GeoFeature
   * @private
   */
  private _featureManager: GeoFeatureManager;
  private _featureVisibleManager: GeoFeatureVisibleManager;
  private _lineSegmentManager: GeoLineSegmentManager;
  private _markerManager: GeoMarkerManager;
  private _nodeCandidateManager: GeoNodeCandidateManager;
  private _featureActivationManager: GeoFeatureActivationManager;
  private readonly _notificationEventManager: NotificationEventManager;
  private readonly _mapEventManager: GeoMapEventManager;
  private readonly _historyManager: GeoHistoryManager;
  private _mapEventRemover: GeoMapEventRemover;
  private _layerDelegator: GeoLayerDelegator;
  private _featureStyleManager: GeoFeatureStyleManager;
  private _preNodeManager: GeoPreNodeManager;
  private _toolBoxManager: GeoToolBoxManager;
  private _layerEventInvoker: GeoLayerEventInvoker;

  private _toolBoxMenuButtonClickEventListener: EventListenerManager<
    string,
    (menu: EditToolMenuEnum, event?: Event) => void
  > = new EventListenerManager();

  private _featureCopiedEventListener: EventListenerManager<
    string,
    (json: FeatureCollection<Geometry, GeoJsonProperties>) => void
  > = new EventListenerManager();

  /**
   * 생성자
   * 한 개의 GeoMap에 여러개의 GeoMapLayer가 있으므로 id가 있어야 합니다.
   * @param geoMap
   */
  constructor({
    id,
    map,
    geoMapEventManager,
    notificationEventManager,
    idGenerator,
    eventPreventer,
    policy,
  }: {
    id: GenIdType;
    map: google.maps.Map;
    geoMapEventManager: GeoMapEventManager;
    notificationEventManager: NotificationEventManager;
    idGenerator: IdGenerator;
    eventPreventer: EventPreventer;
    policy?: GeoLayerPolicy;
  }) {
    this._id = id;
    this._map = map;
    this._idGenerator = idGenerator;
    this._notificationEventManager = notificationEventManager;
    this._mapEventManager = geoMapEventManager;
    this._historyManager = new GeoHistoryManager(map);
    this._mapEventRemover = new GeoMapEventRemover(this._mapEventManager);

    this._featureManager = new GeoFeatureManager(map);
    this._markerManager = new GeoMarkerManager({
      map,
      mapEventManager: geoMapEventManager,
      policy: policy?.markerPolicy,
    });
    this._featureVisibleManager = new GeoFeatureVisibleManager(
      map,
      this._featureManager,
      geoMapEventManager,
      this._markerManager,
      policy?.featureVisiblePolicy,
    );
    this._lineSegmentManager = new GeoLineSegmentManager(
      map,
      this._featureManager,
      policy?.lineSegmentPolicy,
    );
    this._featureActivationManager = new GeoFeatureActivationManager(
      this._featureManager,
      this._featureVisibleManager,
      this._lineSegmentManager,
      geoMapEventManager,
      eventPreventer,
      policy?.featureActivationPolicy,
    );
    this._preNodeManager = new GeoPreNodeManager({
      zoomLevel: map.getZoom() || GEO_MAP_ZOOM_LEVEL_DEFAULT,
      googleMap: this._map,
      options: {
        ...NodeContentsFuncFactory[MarkerEnum.EDIT_NODE](),
        draggable: true,
        clickable: true,
      },
      featureManager: this._featureManager,
      lineSegmentManager: this._lineSegmentManager,
      mapEventManager: geoMapEventManager,
      idGenerator: this._idGenerator,
      policy: policy?.preNodePolicy,
      historyManager: this._historyManager,
    });

    this._layerEventInvoker = new GeoLayerEventInvoker(
      this._map,
      geoMapEventManager,
      this._lineSegmentManager,
      this._preNodeManager,
      this._featureVisibleManager,
      policy?.layerEventInvokerPolicy,
    );
    this._toolBoxManager = new GeoToolBoxManager({
      featureManager: this._featureManager,
      featureActivationManager: this._featureActivationManager,
      zoomLevel: map.getZoom() || GEO_MAP_ZOOM_LEVEL_DEFAULT,
      bounds: map.getBounds(),
      projection: map.getProjection(),
      googleMap: map,
      geoMapEventManager,
      policy: policy?.toolBoxPolicy,
    });
    this._toolBoxManager.addAppendModeButtonClickEventListener(KEY, (event) => {
      this._toolBoxMenuButtonClickEventListener.invokeEventListeners(
        EditToolMenuEnum.APPEND_MODE,
        event,
      );
      this._historyManager.clear();
    });
    this._toolBoxManager.addEditButtonClickEventListener(KEY, (event) => {
      this._toolBoxMenuButtonClickEventListener.invokeEventListeners(
        EditToolMenuEnum.EDIT_MODE,
        event,
      );
      this._historyManager.clear();
    });
    this._toolBoxManager.addTagEditButtonClickEventListener(KEY, (event) => {
      this._toolBoxMenuButtonClickEventListener.invokeEventListeners(
        EditToolMenuEnum.TAG_EDIT_MODE,
        event,
      );
      this._historyManager.clear();
    });
    this._toolBoxManager.addDeleteButtonClickEventListener(
      KEY,
      (
        nodes: GeoNode[],
        ways: GeoWay[],
        lineSegments: GeoLineSegment[],
        event?: Event,
      ) => {
        this._toolBoxMenuButtonClickEventListener.invokeEventListeners(
          EditToolMenuEnum.DELETE,
          event,
        );
      },
    );
    this._toolBoxManager.addCopyButtonClickEventListener(
      KEY,
      (lineSegmentsActivated, event) => {
        this._toolBoxMenuButtonClickEventListener.invokeEventListeners(
          EditToolMenuEnum.COPY,
          event,
        );
        this._featureCopiedEventListener.invokeEventListeners(
          this.lineSegmentsToJson(lineSegmentsActivated),
        );
        this._featureActivationManager.deactivateAll();
        this._historyManager.clear();
      },
    );
    this._toolBoxManager.addCloseButtonClickEventListener(KEY, (event) => {
      this._toolBoxMenuButtonClickEventListener.invokeEventListeners(
        EditToolMenuEnum.CLOSE,
        event,
      );
    });

    this._layerDelegator = new GeoLayerDelegator(
      idGenerator,
      map,
      geoMapEventManager,
      this._featureManager,
      this._featureVisibleManager,
      this._preNodeManager,
      this._featureActivationManager,
      this._toolBoxManager,
      this._lineSegmentManager,
      this._historyManager,
      eventPreventer,
      policy?.layerDelegatorPolicy,
    );

    this._nodeCandidateManager = new GeoNodeCandidateManager(
      map,
      this._featureManager,
      this._featureVisibleManager,
      this._toolBoxManager,
      geoMapEventManager,
      (position: GeoLatLngType) => {
        const node = this._layerDelegator.createNode(
          this._idGenerator.getNextId(),
          position,
        );
        this._featureManager.addNode(node);
        return node;
      },
      (nodes: GeoNode[]) => {
        const way = this._layerDelegator.createWay(
          this._idGenerator.getNextId(),
          nodes.map((node) => node.getId()),
        );
        this._featureManager.addWay(way);
        this._featureActivationManager.activateWay(way);
        return way;
      },
      policy?.nodeCandidatePolicy,
    );

    this._featureStyleManager = new GeoFeatureStyleManager(
      this._featureManager,
      this._featureVisibleManager,
      this._nodeCandidateManager,
      this._preNodeManager,
      this._lineSegmentManager,
      this._featureActivationManager,
      geoMapEventManager,
      policy?.featureStylePolicy,
    );

    /**
     * ===============================================================================================
     * NotificationEventManager invoke
     * ===============================================================================================
     */
    // featureActivationManager
    this._featureActivationManager.addWayActivatedEventListener(
      KEY,
      (way, isActivated, waysActivated: GeoWay[]) => {
        this._notificationEventManager.invokeWayActivatedEventListener(
          this.getId(),
          way,
          isActivated,
          waysActivated,
        );
      },
    );
    // featureManager
    this._featureManager.addWayTagsChangedListener(KEY, (way: GeoWay) => {
      this._notificationEventManager.invokeWayTagsChangedEventListener(
        this.getId(),
        way,
      );
    });
    this._featureManager.addFeatureEditedEventListener(
      KEY,
      (isFeatureEdited) => {
        this._notificationEventManager.invokeFeatureEditedEventListener(
          this.getId(),
          isFeatureEdited,
        );
      },
    );
    this._featureManager.addNodeEnabledChangedListener(
      KEY,
      (node: GeoNode, enabled: boolean) => {
        this._notificationEventManager.invokeNodeEnabledChangedEventListener(
          this.getId(),
          node,
          enabled,
        );
      },
    );
    this._featureManager.addNodesEnabledChangedDebounceListener(
      KEY,
      (
        nodesMap: Readonly<Map<GeoNode, boolean>>,
        nodesEnabledSet: Readonly<Set<GeoNode>>,
      ) => {
        this._notificationEventManager.invokeNodesEnabledChangedDebounceEventListener(
          this.getId(),
          nodesMap,
          nodesEnabledSet,
        );
      },
    );
    this._featureManager.addWayEnabledChangedListener(
      KEY,
      (way: GeoWay, enabled: boolean) => {
        this._notificationEventManager.invokeWayEnabledChangedEventListener(
          this.getId(),
          way,
          enabled,
        );
      },
    );
    this._featureManager.addWaysEnabledChangedDebounceListener(
      KEY,
      (
        wayMap: Readonly<Map<GeoWay, boolean>>,
        waysEnabledSet: Readonly<Set<GeoWay>>,
      ) => {
        this._notificationEventManager.invokeWaysEnabledChangedDebounceEventListener(
          this.getId(),
          wayMap,
          waysEnabledSet,
        );
      },
    );
    // markerManager
    this._markerManager.addMarkerAddedEventListener(KEY, (marker) => {
      this._notificationEventManager.invokeMarkerAddedEventListener(
        this.getId(),
        marker.getId(),
      );
      marker.overlayMarker.setMap(map);
      marker.overlayMarker.setVisible(false);
    });
    this._markerManager.addMarkerClickedEventListener(KEY, (marker) => {
      this._notificationEventManager.invokeMarkerClickEventListener(
        this.getId(),
        marker.getId(),
      );
    });
    this._markerManager.addMarkerMouseEnterEventListener(KEY, (marker) => {
      this._notificationEventManager.invokeMarkerMouseEnterEventListener(
        this.getId(),
        marker.getId(),
      );
    });
    this._markerManager.addMarkerMouseLeaveEventListener(KEY, (marker) => {
      this._notificationEventManager.invokeMarkerMouseLeaveEventListener(
        this.getId(),
        marker.getId(),
      );
    });
    this._markerManager.addMarkerDeletedEventListener(KEY, (marker) => {
      this._notificationEventManager.invokeMarkerDeletedEventListeners(
        this.getId(),
        marker.getId(),
      );
    });
    this._markerManager.addMarkerActivatedEventListener(
      KEY,
      (marker, isActivated) => {
        this._notificationEventManager.invokeMarkerActivatedEventListener(
          this.getId(),
          marker.getId(),
          isActivated,
        );
      },
    );
    this._markerManager.addMarkerIsSimplifyEventListener(
      KEY,
      (marker, isSimplify) => {
        this._notificationEventManager.invokeMarkerSimplifyEventListener(
          this.getId(),
          marker.getId(),
          isSimplify,
        );
      },
    );
    this._markerManager.addMarkerPositionChangeEventListener(
      KEY,
      (marker, before, newPosition) => {
        this._notificationEventManager.invokeMarkerChangePositionEventListener(
          this.getId(),
          marker.getId(),
          newPosition,
        );
      },
    );
    // lineSegmentManager
    this._lineSegmentManager.addLineSegmentClickEventListener(
      KEY,
      (lineSegment, event) => {
        this._notificationEventManager.invokeLineSegmentClickEventListener(
          this.getId(),
          lineSegment,
          event,
        );
      },
    );
    this._lineSegmentManager.addLineSegmentDirectionsVisibleChangeStickyEventListener(
      KEY,
      (visible) => {
        this._notificationEventManager.invokeLineSegmentDirectionsVisibleChangeStickyEventListener(
          this.getId(),
          visible,
        );
      },
    );
    this._mapEventRemover.addEventId(
      this._mapEventManager.addStreetViewVisibleEventListener((visible) => {
        if (visible) {
          this._featureVisibleManager.getMarkersVisible().forEach((marker) => {
            marker.overlayMarker.setVisible(true);
          });
        } else {
          this.getAllMarker().forEach((marker) => {
            marker.overlayMarker.setVisible(false);
          });
        }
      }),
    );

    // HistoryManager
    this._historyManager.addUndoEnableEventListener(KEY, (isEnable) => {
      this._notificationEventManager.invokeIsHistoryUndoEnabledChangedEventListener(
        this.getId(),
        isEnable,
      );
    });
    this._historyManager.addRedoEnableEventListener(KEY, (isEnable) => {
      this._notificationEventManager.invokeIsHistoryRedoEnabledChangedEventListener(
        this.getId(),
        isEnable,
      );
    });
  }

  /**
   * 노드 생성
   */
  createNode = (
    position: GeoLatLngType,
    options?: Pick<GeoNodeOptionType, 'visible' | 'clickable' | 'draggable'>,
    tags?: GeoFeatureTagsType,
  ) => {
    return this._layerDelegator.createNode(
      this._idGenerator.getNextId(),
      position,
      options,
      tags,
    );
  };

  /**
   * 웨이 생성
   */
  createWay = (nodeIds: GenIdType[], tags?: GeoFeatureTagsType) => {
    return this._layerDelegator.createWay(
      this._idGenerator.getNextId(),
      nodeIds,
      tags,
    );
  };

  /**
   * 웨이에 노드 추가
   */
  addNodeToWay = (node: GeoNode, way: GeoWay, indexOf: number) => {
    this._featureManager.addNodeToWay(node.getId(), way, indexOf);
  };

  /**
   * 노드 활성화
   */
  activateNode = (node: GeoNode) => {
    return this._featureActivationManager.activateNode(node);
  };
  /**
   * 노드 비활성화
   */
  deactivateNode = (node: GeoNode) => {
    this._featureActivationManager.deactivateNode(node);
  };
  /**
   * 노드 활성화 여부 확인
   */
  isNodeActivated = (node: GeoNode) => {
    return this._featureActivationManager.isNodeActivated(node);
  };
  /**
   * 노드 활성화 이벤트 등록
   */
  addNodeActivatedEventListener = (listener: (node: GeoNode) => void) => {
    const key = `GeoLayer-${this.getId()}-uuid-${uuidV4()}`;
    this._featureActivationManager.addNodeActivatedEventListener(key, listener);
    return key;
  };
  /**
   * 노드 활성화 이벤트 제거
   */
  removeNodeActivatedEventListener = (key: string) => {
    this._featureActivationManager.removeNodeActivatedEventListener(key);
  };

  /**
   * 폴리 라인 생성
   */
  createPolyLine = (options?: Omit<google.maps.PolylineOptions, 'map'>) => {
    return new google.maps.Polyline({ ...options, map: this._map });
  };

  setPolicy = (policy: GeoLayerPolicy) => {
    policy.featureActivationPolicy &&
      this._featureActivationManager.setPolicy(policy.featureActivationPolicy);
    policy.layerDelegatorPolicy &&
      this._layerDelegator.setPolicy(policy.layerDelegatorPolicy);
    policy.nodeCandidatePolicy &&
      this._nodeCandidateManager.setPolicy(policy.nodeCandidatePolicy);
    policy.preNodePolicy &&
      this._preNodeManager.setPolicy(policy.preNodePolicy);
    policy.toolBoxPolicy &&
      this._toolBoxManager.setPolicy(policy.toolBoxPolicy);
    policy.featureStylePolicy &&
      this._featureStyleManager.setPolicy(policy.featureStylePolicy);
    policy.lineSegmentPolicy &&
      this._lineSegmentManager.setPolicy(policy.lineSegmentPolicy);
    policy.markerPolicy && this._markerManager.setPolicy(policy.markerPolicy);
    policy.featureVisiblePolicy &&
      this._featureVisibleManager.setPolicy(policy.featureVisiblePolicy);
    policy.layerEventInvokerPolicy &&
      this._layerEventInvoker.setPolicy(policy.layerEventInvokerPolicy);
  };
  getPolicy = (): GeoLayerPolicy => {
    return {
      featureActivationPolicy: this._featureActivationManager.getPolicy(),
      layerDelegatorPolicy: this._layerDelegator.getPolicy(),
      nodeCandidatePolicy: this._nodeCandidateManager.getPolicy(),
      preNodePolicy: this._preNodeManager.getPolicy(),
      toolBoxPolicy: this._toolBoxManager.getPolicy(),
      featureStylePolicy: this._featureStyleManager.getPolicy(),
      lineSegmentPolicy: this._lineSegmentManager.getPolicy(),
      markerPolicy: this._markerManager.getPolicy(),
      featureVisiblePolicy: this._featureVisibleManager.getPolicy(),
      layerEventInvokerPolicy: this._layerEventInvoker.getPolicy(),
    };
  };

  getNodeAndWayAndLineSegmentMaxZIndex = () => {
    const featureStyleManagerPolicy = this._featureStyleManager.getPolicy();
    return Math.max(
      featureStyleManagerPolicy.zIndexWay +
        this._featureStyleManager.getLineSegmentZIndexAboveWay(),
      featureStyleManagerPolicy.zIndexNode,
    );
  };

  getId = () => {
    return this._id;
  };

  clearCandidateWhenWayCreating = () => {
    this._nodeCandidateManager.clearCandidateWhenWayCreating();
  };

  /**
   * 소멸자
   */
  destroy = () => {
    this._toolBoxMenuButtonClickEventListener.destroy();
    this._featureCopiedEventListener.destroy();
    this._featureManager.destroy();
    this._featureActivationManager.destroy();
    this._nodeCandidateManager.destroy();
    this._preNodeManager.destroy();
    this._toolBoxManager.destroy();
    this._featureStyleManager.destroy();
    this._lineSegmentManager.destroy();
    this._markerManager.destroy();
    this._featureVisibleManager.destroy();
    this._layerEventInvoker.destroy();
    this._layerDelegator.destroy();
    this._mapEventRemover.destroy();
    this._historyManager.destroy();
  };

  lineSegmentsToJson = (
    lineSegments: GeoLineSegment[],
  ): FeatureCollection<Geometry, GeoJsonProperties> => {
    const lineSegmentMapOfWay = new Map<GeoWay, GeoLineSegment[]>();
    const nodesSet = new Set<GeoNode>();
    lineSegments.forEach((lineSegment) => {
      const nodeStart = lineSegment.getNodeStart();
      const nodeEnd = lineSegment.getNodeEnd();
      nodesSet.add(nodeStart);
      nodesSet.add(nodeEnd);

      const way = lineSegment.getWay();
      const lineSegmentsOfWay = lineSegmentMapOfWay.get(way) || [];
      lineSegmentsOfWay.push(lineSegment);
      lineSegmentMapOfWay.set(way, lineSegmentsOfWay);
    });

    const json: FeatureCollection<Geometry, GeoJsonProperties> = {
      features: [],
      type: GeometryTypeEnum.FeatureCollection,
    };
    Array.from(nodesSet).forEach((node) => {
      json.features.push(node.toJson());
    });

    const _createWayFeature = (
      way: GeoWay,
    ): Feature<LineString, GeoFeatureLineStringPropertyType> => {
      return {
        geometry: {
          coordinates: [],
          type: GeometryTypeEnum.LineString,
        },
        properties: {
          type: 'way',
          id: idGenerator.getNextId(),
          nodes: [],
          tags: { ...way.getTags() },
        },
        type: GeometryTypeEnum.Feature,
      };
    };

    const idGenerator = new IdGenerator(700000);
    lineSegmentMapOfWay.forEach((lineSegmentsOfWay, way) => {
      let lineSegmentBefore: GeoLineSegment | undefined;
      let wayFeature:
        | Feature<LineString, GeoFeatureLineStringPropertyType>
        | undefined;
      lineSegmentsOfWay
        .sort((a, b) => b.getNodeStart().getId() - a.getNodeStart().getId())
        .forEach((lineSegment) => {
          const nodeStart = lineSegment.getNodeStart();
          const nodeEnd = lineSegment.getNodeEnd();

          const isWayNew =
            !lineSegmentBefore || lineSegmentBefore.getNodeEnd() !== nodeStart;
          if (isWayNew) {
            wayFeature = _createWayFeature(way);
            json.features.push(wayFeature);
            wayFeature.geometry.coordinates.push([
              nodeStart.getPosition().lng,
              nodeStart.getPosition().lat,
            ]);
            wayFeature.geometry.coordinates.push([
              nodeEnd.getPosition().lng,
              nodeEnd.getPosition().lat,
            ]);

            wayFeature.properties.nodes.push(nodeStart.getId());
            wayFeature.properties.nodes.push(nodeEnd.getId());
          } else if (wayFeature) {
            wayFeature.geometry.coordinates.push([
              nodeEnd.getPosition().lng,
              nodeEnd.getPosition().lat,
            ]);
            wayFeature.properties.nodes.push(nodeEnd.getId());
          }

          lineSegmentBefore = lineSegment;
        });
    });

    lineSegmentMapOfWay.clear();
    return json;
  };

  private _processFeatures = (
    features: Feature<Geometry, GeoJsonProperties>[],
    nodeIdMap: Map<GenIdType, GenIdType>,
    isGenerateNewId: boolean,
  ): GeoFeaturesType => {
    const result: GeoFeaturesType = {
      nodes: [],
      ways: [],
      lineSegments: [],
    };

    features.forEach((feature) => {
      if (feature.geometry.type === GeometryTypeEnum.Point) {
        if (!feature.properties?.id) return;

        const nodeId = isGenerateNewId
          ? this._idGenerator.getNextId()
          : feature.properties.id;
        nodeIdMap.set(feature.properties.id, nodeId);

        const node = this._layerDelegator.createNode(
          nodeId,
          {
            lng: feature.geometry.coordinates[0],
            lat: feature.geometry.coordinates[1],
          },
          { visible: false },
          feature.properties?.tags,
        );
        result.nodes.push(node);
      } else if (feature.geometry.type === GeometryTypeEnum.LineString) {
        if (!feature.properties?.id || !feature.properties?.nodes) return;

        const nodes = feature.properties.nodes.map((nodeId: number) =>
          nodeIdMap.get(nodeId),
        );
        const way = this._layerDelegator.createWay(
          isGenerateNewId
            ? this._idGenerator.getNextId()
            : feature.properties?.id,
          nodes,
          feature.properties?.tags,
          false,
        );

        result.ways.push(way);
        result.lineSegments.push(
          ...this._lineSegmentManager.getLineSegmentsOfWay(way),
        );
      }
    });

    return result;
  };

  importJson = (
    json: FeatureCollection<Geometry, GeoJsonProperties>,
    isGenerateNewId = false,
  ) => {
    const nodeIdMap = new Map<GenIdType, GenIdType>();
    const result = this._processFeatures(
      json.features,
      nodeIdMap,
      isGenerateNewId,
    );
    nodeIdMap.clear();
    return result;
  };

  importJsonList = (
    jsonList: FeatureCollection<Geometry, GeoJsonProperties>[],
    isGenerateNewId = false,
  ) => {
    const nodeIdMap = new Map<GenIdType, GenIdType>();
    const result = jsonList.reduce<GeoFeaturesType>(
      (acc, json) => {
        const processedFeatures = this._processFeatures(
          json.features,
          nodeIdMap,
          isGenerateNewId,
        );
        return {
          nodes: [...acc.nodes, ...processedFeatures.nodes],
          ways: [...acc.ways, ...processedFeatures.ways],
          lineSegments: [
            ...acc.lineSegments,
            ...processedFeatures.lineSegments,
          ],
        };
      },
      { nodes: [], ways: [], lineSegments: [] },
    );
    nodeIdMap.clear();
    return result;
  };

  deleteFeatures = (features: GeoFeaturesType) => {
    this._layerDelegator.deleteFeatures(features);
  };

  splitByNodes = () => {
    this._featureManager
      .getSplitWayNodesListByNodes(
        this._featureActivationManager.getNodesActivated(),
      )
      .forEach((nodesList, way) => {
        const waysCreated = nodesList.map((nodes) => {
          return this.createWay(
            nodes.map((node) => node.getId()),
            way.getTags(),
          );
        });
        this._featureManager.replaceWay(waysCreated, way);
      });
    this._featureActivationManager.deactivateAll();
  };

  exportJson = ():
    | FeatureCollection<Geometry, GeoJsonProperties>
    | undefined => {
    const nodeFeatures = this._featureManager
      .getAllNodes()
      .map((node) => node.toJson());
    const waysFeatures = this._featureManager
      .getAllWays()
      .map((way) => way.toJson());
    return {
      features: [...nodeFeatures, ...waysFeatures],
      type: GeometryTypeEnum.FeatureCollection,
    };
  };

  setDragBoxEnabled = (isDragBoxEnabled: boolean) => {
    this._layerEventInvoker.setDragBoxEnabled(isDragBoxEnabled);
  };
  isDragBoxEnabled = () => {
    return this._layerEventInvoker.isDragBoxEnabled();
  };

  activateNodes = (nodes: GeoNode[]) => {
    nodes.forEach((node) => {
      this._featureActivationManager.activateNode(node);
    });
  };
  deactivateNodes = (nodes: GeoNode[]) => {
    nodes.forEach((node) => {
      this._featureActivationManager.deactivateNode(node);
    });
  };

  activateWays = (ways: GeoWay[]) => {
    ways.forEach((way) => {
      this._featureActivationManager.activateWay(way);
    });
  };
  deactivateWays = (ways: GeoWay[]) => {
    ways.forEach((way) => {
      this._featureActivationManager.deactivateWay(way);
    });
  };

  getLineSegmentsOfWay = (way: GeoWay) => {
    return this._lineSegmentManager.getLineSegmentsOfWay(way);
  };

  activateLineSegments = (lineSegments: GeoLineSegment[]) => {
    lineSegments.forEach((lineSegment) => {
      this._featureActivationManager.activateLineSegment(lineSegment);
    });
  };
  deactivateLineSegments = (lineSegments: GeoLineSegment[]) => {
    lineSegments.forEach((lineSegment) => {
      this._featureActivationManager.deactivateLineSegment(lineSegment);
    });
  };

  deactivateAllFeatures = () => {
    this._featureActivationManager.deactivateAll();
  };

  setNodesEnabledAll = (enabled: boolean) => {
    this._featureManager.getAllNodes().forEach((node) => {
      node.setEnabled(enabled);
    });
  };

  /**
   * Tags에 해당하는 Way들을 활성화하고, 그렇지 않은 Way들은 비활성화
   * @param tagsIncluded 해당 tags들을 모두 포함하는 Way들을 활성화
   * @param tagsExcluded 값이 있는 경우, 해당 tags들을 모두 포함하지 않는 Way들을 활성화
   * @param withNode 활성화 된 Way의 Node들만 활성화할지 여부
   */
  enableWaysByTags = (
    tagsIncluded: Partial<Record<TagKeyEnum, TagValueType>>,
    tagsExcluded: Partial<Record<TagKeyEnum, TagValueType>> | undefined,
    withNode = false,
  ): WayEnabledResultType => {
    const waysEnabled: GeoWay[] = [];
    const waysDisabled: GeoWay[] = [];
    const nodeSetOfWayEnabled = new Set<GeoNode>();

    this._featureManager.getAllWays().forEach((way) => {
      const wayTags = way.getTags();
      const enabledNew =
        !!wayTags &&
        GeoFeatureTagsUtils.isTagsContains(wayTags, tagsIncluded) &&
        (!tagsExcluded ||
          !GeoFeatureTagsUtils.isTagsContains(wayTags, tagsExcluded));
      const isEnabledUpdated = way.setEnabled(enabledNew);
      if (isEnabledUpdated) {
        if (enabledNew) {
          waysEnabled.push(way);
        } else {
          waysDisabled.push(way);
        }
      }
      way.getNodes().forEach((node) => {
        if (enabledNew) {
          nodeSetOfWayEnabled.add(node);
        }
      });
    });

    if (withNode) {
      this._featureManager.getAllNodes().forEach((node) => {
        node.setEnabled(nodeSetOfWayEnabled.has(node));
      });
    }

    return { waysEnabled, waysDisabled };
  };

  enableWaysByTagsSomeExists = (
    isTagsSomeExists: boolean,
    withNode?: boolean,
  ): WayEnabledResultType => {
    const waysEnabled: GeoWay[] = [];
    const waysDisabled: GeoWay[] = [];
    const nodeMapOfWayEnabled = new Set<GeoNode>();

    this._featureManager.getAllWays().forEach((way) => {
      const wayTags = way.getTags();
      const enabledNew =
        GeoFeatureTagsUtils.isTagValuesSomeExists(wayTags) === isTagsSomeExists;
      const isEnabledUpdated = way.setEnabled(enabledNew);
      if (isEnabledUpdated) {
        if (enabledNew) {
          waysEnabled.push(way);
        } else {
          waysDisabled.push(way);
        }
      }

      way.getNodes().forEach((node) => {
        if (enabledNew) {
          nodeMapOfWayEnabled.add(node);
        }
      });
    });

    if (withNode) {
      this._featureManager.getAllNodes().forEach((node) => {
        node.setEnabled(nodeMapOfWayEnabled.has(node));
      });
    }

    return { waysEnabled, waysDisabled };
  };

  /**
   * 모든 Way들을 활성화 또는 비활성화
   * @param enabled
   */
  setWaysEnabledAll = (enabled: boolean) => {
    this._featureManager.getAllWays().forEach((way) => {
      way.setEnabled(enabled);
    });
  };

  /**
   * Enabled된 Way들을 반환
   */
  getWaysEnabled = () => {
    return this._featureManager.getWaysEnabled();
  };

  /**
   * ===============================================================================================
   * Feature Activated
   * ===============================================================================================
   */
  getWaysActivated = () => {
    return this._featureActivationManager.getWaysActivated();
  };

  getFeaturesActivated = () => {
    return this._featureActivationManager.getFeaturesActivated();
  };

  /**
   * ===============================================================================================
   * GeoLineSegmentDirection
   * ===============================================================================================
   */
  /**
   * @see GeoLineSegmentManager.setLineSegmentDirectionsVisible
   */
  setLineSegmentDirectionsVisible = (visible: boolean): boolean => {
    return this._lineSegmentManager.setLineSegmentDirectionsVisible(visible);
  };

  /**
   * ===============================================================================================
   * Marker
   * ===============================================================================================
   */
  getMarker = (markerId: MarkerIdType) => {
    return this._markerManager.getMarker(markerId);
  };

  getAllMarker = () => {
    return this._markerManager.getAllMarker();
  };

  createMarker = (props: GeoMarkerOptionsType) => {
    return this._markerManager.createMarker(props);
  };

  deleteMarker = (markerId: MarkerIdType) => {
    return this._markerManager.deleteMarker(markerId);
  };

  isMarkerSimplify = (markerId: MarkerIdType) => {
    return this._markerManager.isSimplify(markerId);
  };

  setMarkerSimplify = (markerId: MarkerIdType, isSimplify: boolean) => {
    return this._markerManager.setIsSimplify(markerId, isSimplify);
  };

  isMarkerActivated = (markerId: MarkerIdType) => {
    return this._markerManager.isActivated(markerId);
  };

  setIsMarkerActivated = (markerId: MarkerIdType, isActivated: boolean) => {
    return this._markerManager.setIsActivated(markerId, isActivated);
  };

  getMarkerContent = (markerId: MarkerIdType) => {
    return this._markerManager.getMarkerContent(markerId);
  };

  setMarkerContent = (
    markerId: MarkerIdType,
    markerContentRenderFn: () => HTMLDivElement,
  ) => {
    return this._markerManager.setMarkerContent(
      markerId,
      markerContentRenderFn,
    );
  };

  setPosition = (markerId: MarkerIdType, position: GeoLatLngType) => {
    return this._markerManager.setPosition(markerId, position);
  };

  getPosition = (markerId: MarkerIdType) => {
    return this._markerManager.getPosition(markerId);
  };

  setMarkerOptions = (
    markerId: MarkerIdType,
    markerOptions: GeoMarkerOptionsType,
  ) => {
    return this._markerManager.setOptions(markerId, markerOptions);
  };

  /**
   * ===============================================================================================
   * EventListener
   * ===============================================================================================
   */
  addToolBoxMenuButtonClickEventListener = (
    key: string,
    listener: (menu: EditToolMenuEnum, event?: Event) => void,
  ) => {
    this._toolBoxMenuButtonClickEventListener.addEventListener(key, listener);
  };
  removeToolBoxMenuButtonClickEventListener = (key: string) => {
    this._toolBoxMenuButtonClickEventListener.removeEventListener(key);
  };

  addFeatureCopiedEventListener = (
    key: string,
    listener: (json: FeatureCollection<Geometry, GeoJsonProperties>) => void,
  ) => {
    this._featureCopiedEventListener.addEventListener(key, listener);
  };
  removeFeatureCopiedEventListener = (key: string) => {
    this._featureCopiedEventListener.removeEventListener(key);
  };
  isEdited = () => {
    return this._featureManager.isFeaturedEdited();
  };
  setIsEdited = (isEdited: boolean) => {
    return this._featureManager.setIsFeatureEdited(isEdited);
  };

  /**
   * ===============================================================================================
   * History
   * ===============================================================================================
   */
  redo = () => {
    this._historyManager.redo();
  };
  undo = () => {
    this._historyManager.undo();
  };
  historyClear = () => {
    this._historyManager.clear();
  };
}

export default GeoLayer;
