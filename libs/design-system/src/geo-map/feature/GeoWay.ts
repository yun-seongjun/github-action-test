import { Feature, LineString } from 'geojson';
import EventListenerManager from '@design-system/geo-map/event/EventListenerManager';
import GeoNode from '@design-system/geo-map/feature/GeoNode';
import {
  GeoFeatureLineStringPropertyType,
  GeoFeatureTagsType,
  GeoMapBoundsType,
  GeometryTypeEnum,
} from '@design-system/types/geoMap.type';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';
import IdGenerator, {
  GenIdType,
} from '@design-system/utils/geo-map/IdGenerator';
import DataUtils from '@design-system/utils/dataUtils';
import { GeoLineStyle } from '@design-system/constants/geo-map';

enum GeoWayEventNameEnum {
  TAGS_CHANGE = 'TAGS_CHANGE',
  ENABLED_CHANGE = 'ENABLED_CHANGE',
  VISIBLE_CHANGE = 'VISIBLE_CHANGE',
}

export interface GeoWayOptionType extends Omit<
  google.maps.PolylineOptions,
  'editable' | 'path' | 'geodesic' | 'clickable' | 'draggable'
> {
  enabled?: boolean;
}

export interface GeoWayConstructType {
  nodes: GeoNode[];
  id: number;
  idGenerator: IdGenerator;
  googleMap: google.maps.Map;
  options?: GeoWayOptionType;
  tags?: GeoFeatureTagsType;
}
/**
 * Way
 */
class GeoWay {
  static DefaultOptions: google.maps.PolylineOptions = {
    geodesic: true,
    clickable: false,
  };
  static StrokeWeight = {
    NORMAL: 4,
    MOBILE_PATH: 6,
  };

  static STROKE_PX = GeoWay.StrokeWeight.NORMAL;

  private _polyLine: google.maps.Polyline;
  private _nodes: GeoNode[] = [];
  private _tags: GeoWayConstructType['tags'];
  private _id: GenIdType;
  private _zIndex: GeoWayOptionType['zIndex'];
  private _enabled?: GeoWayOptionType['enabled'];
  private _clickable?: boolean;
  private _draggable?: boolean;
  private _strokeColor: GeoWayOptionType['strokeColor'];
  private _strokeWeight: GeoWayOptionType['strokeWeight'];
  private _strokeOpacity: GeoWayOptionType['strokeOpacity'];
  private _icons: GeoWayOptionType['icons'];
  private _visible: GeoWayOptionType['visible'];
  private _idGenerator: IdGenerator = new IdGenerator();
  private _centerLine?: google.maps.Polyline;

  private _map: google.maps.Map;

  private _tagsChangeEventManager: EventListenerManager<
    string,
    (way: GeoWay) => void
  > = new EventListenerManager();
  private _enabledChangeEventManager: EventListenerManager<
    string,
    (enabled: boolean) => void
  > = new EventListenerManager();
  private _visibleChangeEventManager: EventListenerManager<
    string,
    (visible: boolean) => void
  > = new EventListenerManager();

  constructor({ nodes, id, googleMap, options, tags }: GeoWayConstructType) {
    this._id = id;
    this._nodes = [...nodes];
    this._tags = tags;
    this._map = googleMap;
    const { visible = true, enabled = true, ..._options } = options || {};
    const defaultOptions: google.maps.PolylineOptions = {
      path: GeoMapUtils.getPath(this._nodes),
      ...GeoWay.DefaultOptions,
      ..._options,
    };
    this._polyLine = new google.maps.Polyline(defaultOptions);
    const {
      strokeOpacity = 1,
      strokeWeight,
      strokeColor,
      zIndex,
      icons,
      clickable,
      draggable,
    } = defaultOptions;
    this.setPolylineOptions({
      strokeOpacity,
      strokeWeight,
      strokeColor,
      zIndex,
      visible,
    });
    this.setEnabled(enabled);
    this._polyLine.setMap(visible ? googleMap : null);
    tags && this.setTags(tags);
  }
  private _setMapNull = () => {
    this._polyLine.setMap(null);
  };

  getPolyLinePath = () => {
    return this._polyLine.getPath();
  };

  /**
   * 소멸자
   */
  destroy = () => {
    this._setMapNull();
    this.hideCenterLine();
    this._tagsChangeEventManager.destroy();
    this._enabledChangeEventManager.destroy();
  };

  getId = () => this._id;
  getPolyline = () => this._polyLine;
  /**
   * ===============================================================================================
   * Way Options
   * ===============================================================================================
   */
  setTags = (tags: GeoFeatureTagsType | undefined) => {
    this._tags = { ...tags };
    this._tagsChangeEventManager.invokeEventListeners(this);
  };
  getTags = () => DataUtils.deepCopy(this._tags);
  getGoogleMap = () => this._polyLine.getMap() as google.maps.Map;
  setVisible = (visible: boolean) => {
    if (this._visible === visible) {
      return false;
    }
    this._polyLine.setMap(visible ? this._map : null);
    this._centerLine?.setMap(visible ? this._map : null);
    this._visible = visible;
    this._visibleChangeEventManager.invokeEventListeners(visible);
    return true;
  };
  isVisible = () => !!this._visible;

  setEnabled = (enabled: boolean) => {
    if (this._enabled === enabled) {
      return false;
    }
    this._enabled = enabled;
    this._enabledChangeEventManager.invokeEventListeners(enabled);
    return true;
  };
  isEnabled = () => !!this._enabled;

  isAvailable = () => this._nodes.length > 1;
  setZIndex = (zIndex: GeoWayOptionType['zIndex']) => {
    this._zIndex = zIndex;
    this._polyLine.setOptions({ zIndex });
  };
  getZIndex = () => this._zIndex;
  setStrokeColor = (strokeColor: GeoWayOptionType['strokeColor']) => {
    this._strokeColor = strokeColor;
    this._polyLine.setOptions({ strokeColor });
  };
  getStrokeColor = () => this._strokeColor;
  setStrokeWeight = (strokeWeight: GeoWayOptionType['strokeWeight']) => {
    this._strokeWeight = strokeWeight;
    this._polyLine.setOptions({ strokeWeight });
  };
  getStrokeWeight = () => this._strokeWeight;
  setStrokeOpacity = (strokeOpacity: GeoWayOptionType['strokeOpacity']) => {
    if (this.getStrokeOpacity() === strokeOpacity) {
      return;
    }
    this._strokeOpacity = strokeOpacity;
    this._polyLine.setOptions({ strokeOpacity });
  };
  getStrokeOpacity = () => this._strokeOpacity;
  setIcons = (icons?: GeoWayOptionType['icons']) => {
    if (this.getIcons() === icons) return false;
    this._icons = icons;
    this._polyLine.setOptions({ icons });
  };
  getIcons = () => this._icons;
  /**
   * options에 넣지 않는 값들은 기존 옵션 값을 유지한 채 적용됩니다.
   * @param options
   */
  setPolylineOptions = (options: Partial<Omit<GeoWayOptionType, 'map'>>) => {
    const {
      enabled,
      visible,
      zIndex,
      strokeWeight,
      strokeColor,
      strokeOpacity,
      icons,
    } = options;
    if (!DataUtils.isNullOrUndefined(enabled)) {
      this.setEnabled(enabled);
    }
    if (!DataUtils.isNullOrUndefined(visible)) {
      this.setVisible(visible);
    }
    if (!DataUtils.isNullOrUndefined(zIndex)) {
      this.setZIndex(zIndex);
    }
    if (!DataUtils.isNullOrUndefined(strokeWeight)) {
      this.setStrokeWeight(strokeWeight);
    }
    if (!DataUtils.isNullOrUndefined(strokeColor)) {
      this.setStrokeColor(strokeColor);
    }
    if (!DataUtils.isNullOrUndefined(strokeOpacity)) {
      this.setStrokeOpacity(strokeOpacity);
    }
    if (!DataUtils.isNullOrUndefined(icons)) {
      this.setIcons(icons);
    }
  };
  getPolylineOptions = (): Omit<GeoWayOptionType, 'map'> => {
    return {
      enabled: this.isEnabled(),
      visible: this.isVisible(),
      zIndex: this.getZIndex(),
      strokeWeight: this.getStrokeWeight(),
      strokeColor: this.getStrokeColor(),
      strokeOpacity: this.getStrokeOpacity(),
      icons: this.getIcons(),
    };
  };
  getCenterPosition = () => {
    return GeoMapUtils.getCenterLatLng(
      ...this.getNodes().map((node) => node.getPosition()),
    );
  };

  /**
   * ===============================================================================================
   * Event
   * ===============================================================================================
   */
  private _createEventId = (eventName: GeoWayEventNameEnum) => {
    return JSON.stringify({
      wayId: this._id,
      eventName,
      id: this._idGenerator.getNextId(),
    });
  };
  private _getEventListenerManager = (eventName: GeoWayEventNameEnum) => {
    switch (eventName) {
      case GeoWayEventNameEnum.TAGS_CHANGE:
        return this._tagsChangeEventManager;
      case GeoWayEventNameEnum.ENABLED_CHANGE:
        return this._enabledChangeEventManager;
      case GeoWayEventNameEnum.VISIBLE_CHANGE:
        return this._visibleChangeEventManager;
    }
  };
  isEventListening = (eventId: string) => {
    const isEventListeningSingle = (eventIdSingle: string) => {
      const { eventName } = JSON.parse(eventIdSingle);
      const eventListenerManager = this._getEventListenerManager(eventName);
      return eventListenerManager.isEventListening(eventIdSingle);
    };
    try {
      const eventNameList = JSON.parse(eventId);
      if (Array.isArray(eventNameList)) {
        return eventNameList.every((eventNameSingle) =>
          isEventListeningSingle(eventNameSingle),
        );
      }

      return isEventListeningSingle(eventId);
    } catch {
      return false;
    }
  };
  removeEventListener = (eventId: string) => {
    const removeEventListenerSingle = (eventIdSingle: string) => {
      const { eventName } = JSON.parse(eventIdSingle);
      const eventListenerManager = this._getEventListenerManager(eventName);
      return eventListenerManager?.removeEventListener(eventIdSingle);
    };
    try {
      const eventNameList = JSON.parse(eventId);
      if (Array.isArray(eventNameList)) {
        return eventNameList.every((eventNameSingle) =>
          removeEventListenerSingle(eventNameSingle),
        );
      }

      return removeEventListenerSingle(eventId);
    } catch {
      return;
    }
  };
  addTagsChangeListener = (listener: (way: GeoWay) => void) => {
    const key = this._createEventId(GeoWayEventNameEnum.TAGS_CHANGE);
    this._tagsChangeEventManager.addEventListener(key, listener);
    return key;
  };

  addEnabledChangeListener = (listener: (enabled: boolean) => void) => {
    const key = this._createEventId(GeoWayEventNameEnum.ENABLED_CHANGE);
    this._enabledChangeEventManager.addEventListener(key, listener);
    return key;
  };

  addVisibleChangeListener = (listener: (visible: boolean) => void) => {
    const key = this._createEventId(GeoWayEventNameEnum.VISIBLE_CHANGE);
    this._visibleChangeEventManager.addEventListener(key, listener);
    return key;
  };

  /**
   * ===============================================================================================
   * ETC Way 기타 기능
   * ===============================================================================================
   */

  getCenterLine = () => {
    return this._centerLine;
  };
  showCenterLine = (props: GeoLineStyle) => {
    if (this._centerLine) {
      return false;
    }
    this._centerLine = new google.maps.Polyline({
      path: GeoMapUtils.getPath(this.getNodes()),
      map: this.getGoogleMap(),
      clickable: false,
      ...props,
    });
    return true;
  };

  hideCenterLine = () => {
    this._centerLine?.setMap(null);
    this._centerLine = undefined;
  };

  /**
   * Node들의 경로에 맞춰서 Way를 새로 그림
   */
  updatePath = () => {
    const polyLinePath = this._polyLine.getPath();
    const nodesPath = GeoMapUtils.getPath(this._nodes);
    if (polyLinePath.getLength() == nodesPath.length) {
      let isSamePosition = true;
      for (let i = 0; i < nodesPath.length; i++) {
        const polyLinePosition = polyLinePath.getAt(i);
        const nodePosition = nodesPath[i];
        if (
          polyLinePosition.lat() !== nodePosition.lat ||
          polyLinePosition.lng() !== nodePosition.lng
        ) {
          isSamePosition = false;
          break;
        }
      }
      if (isSamePosition) {
        return false;
      }
    }

    this._polyLine.setPath(nodesPath);
    this._centerLine?.setPath(nodesPath);
  };

  /**
   * ===============================================================================================
   * Way Node Controls
   * ===============================================================================================
   */

  /**
   * Node들을 구함
   */
  getNodes = () => [...this._nodes];
  getNodeIds = () => this._nodes.map((node) => node.getId());

  hasNode = (findNode: GeoNode) =>
    !!this.getNodes().find((node) => node === findNode);

  hasSomeNodes = (...findNodes: GeoNode[]) =>
    findNodes.some((node) => this.hasNode(node));

  isSomeNodesVisible = () => this._nodes.some((node) => !node.isVisible());

  /**
   * Node를 입력 받은 indexAt에 추가
   * @param node
   * @param indexAt
   */
  addNode = (node: GeoNode, indexAt: number) => {
    this._nodes.splice(indexAt, 0, node);
  };

  /**
   * Node를 제거
   * @param indexOfNode
   */
  deleteNode = (indexOfNode: number) => {
    if (indexOfNode > -1 && indexOfNode < this._nodes.length) {
      this._nodes.splice(indexOfNode, 1);
      return true;
    }
    return false;
  };
  getNodesLength = () => {
    return this._nodes.length;
  };
  /**
   * 입력 받은 Node가 현재 Way의 몇 번째 index에 있는지 구함
   * @param node
   */
  getIndexOfNode = (node: GeoNode) => {
    return this._nodes.indexOf(node);
  };
  getLastIndexOfNode = (node: GeoNode) => {
    return this._nodes.lastIndexOf(node);
  };
  getNodeOfIndex = (indexAt: number) => {
    if (indexAt < 0 || this._nodes.length <= indexAt) {
      return undefined;
    }
    return this._nodes[indexAt];
  };
  getCountOfNodes = (node: GeoNode) => {
    return this._nodes.reduce((acc, nodeCurrent) => {
      if (node === nodeCurrent) {
        acc++;
      }
      return acc;
    }, 0);
  };
  /**
   * 시작 Node를 구함
   * EndpointNode, start
   */
  getStartNode = () => {
    return this._nodes[0];
  };
  /**
   * 입력 받은 Node가 시작 Node인지 확인
   * @param node
   */

  getEndNode = () => {
    return this._nodes[this._nodes.length - 1];
  };

  getBothEndNodes = () => {
    return [this.getStartNode(), this.getEndNode()];
  };

  isStartNode = (node: GeoNode) => {
    return this.getStartNode() === node;
  };

  isEndNode = (node: GeoNode) => {
    return this.getEndNode() === node;
  };

  isBothEndNode = (node: GeoNode) => {
    return this.isStartNode(node) || this.isEndNode(node);
  };

  isSegmentalNode = (node: GeoNode) => {
    return this.getSegmentalNodes().includes(node);
  };

  getSegmentalNodes = () => {
    return this._nodes.slice(1, this._nodes.length - 1);
  };

  getAdjacentNodes = (node: GeoNode) => {
    let nodeBefore: GeoNode | undefined;
    return this.getNodes().reduce((acc, nodeCurrent) => {
      if (nodeBefore) {
        if (node === nodeCurrent) {
          acc.push(nodeBefore);
        }
        if (node === nodeBefore) {
          acc.push(nodeCurrent);
        }
      }
      nodeBefore = nodeCurrent;
      return acc;
    }, [] as GeoNode[]);
  };
  getAdjacentNodesId = (node: GeoNode) => {
    return this.getAdjacentNodes(node).map((node) => node.getId());
  };
  getNotAdjacentNodesId = (node: GeoNode) => {
    const adjacentNodesId = this.getAdjacentNodesId(node);
    return this.getNodes().reduce((acc, node) => {
      if (!adjacentNodesId.includes(node.getId())) {
        acc.push(node.getId());
      }
      return acc;
    }, [] as number[]);
  };

  isSomeInBounds = (bounds: GeoMapBoundsType) => {
    let nodeBefore: GeoNode | undefined;
    for (const node of this.getNodes()) {
      if (nodeBefore) {
        if (
          GeoMapUtils.isLineCrossBound(
            { start: nodeBefore.getPosition(), end: node.getPosition() },
            bounds,
          )
        ) {
          return true;
        }
      }
      nodeBefore = node;
    }
    return false;
  };

  /**
   * 두개의 점이 하나의 way안에서 서로 인접한 점인지 판별
   */
  isNodesAdjacent = (nodeA: GeoNode, nodeB: GeoNode) => {
    const nodeAIndex = this.getIndexOfNode(nodeA);
    if (nodeAIndex === -1) {
      return false;
    }
    const nodeBIndex = this.getIndexOfNode(nodeB);
    if (nodeBIndex === -1) {
      return false;
    }
    return Math.abs(nodeAIndex - nodeBIndex) === 1;
  };
  /**
   * 기존의 노드를 새로운 노드로 교체합니다.
   */
  mergeNode = (nodeOld: GeoNode, nodeNew: GeoNode) => {
    const nodeIndexOld = this._nodes.indexOf(nodeOld);
    const nodeIndexNew = this._nodes.indexOf(nodeNew);
    if (nodeIndexOld === -1) {
      return undefined;
    }
    this._nodes[nodeIndexOld] = nodeNew;
    if (nodeIndexNew !== -1) {
      this._nodes.splice(nodeIndexNew, 1);
    }
    return nodeIndexOld;
  };

  splitByNodes = (nodes: Set<GeoNode>) => {
    const nodesOfWayList: GeoNode[][] = [];

    let nodesOfWay: GeoNode[] = [];
    this._nodes.forEach((node, index) => {
      nodesOfWay.push(node);
      const isLastNode = index === this._nodes.length - 1;
      if ((nodes.has(node) || isLastNode) && nodesOfWay.length > 1) {
        nodesOfWayList.push(nodesOfWay);
        nodesOfWay = [node];
      }
    });

    return nodesOfWayList;
  };

  toJson = (): Feature<LineString, GeoFeatureLineStringPropertyType> => {
    const tags = this.getTags();
    const tagsExcludeEmptyValue = tags
      ? DataUtils.excludeEmptyProperty(tags)
      : undefined;

    return {
      type: GeometryTypeEnum.Feature,
      geometry: {
        type: GeometryTypeEnum.LineString,
        coordinates: this.getNodes().map((node) => {
          const nodePosition = node.getPosition();
          return [nodePosition.lng, nodePosition.lat];
        }),
      },
      properties: {
        type: 'way',
        id: this.getId(),
        nodes: this.getNodes().map((node) => node.getId()),
        tags: tagsExcludeEmptyValue,
      },
    };
  };
}

export default GeoWay;
