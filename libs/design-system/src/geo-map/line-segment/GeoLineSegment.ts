import EventListenerManager from '@design-system/geo-map/event/EventListenerManager';
import GeoNode from '@design-system/geo-map/feature/GeoNode';
import GeoWay, {
  GeoWayOptionType,
} from '@design-system/geo-map/feature/GeoWay';
import { theme } from '@design-system/root/tailwind.config';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';
import IdGenerator from '@design-system/utils/geo-map/IdGenerator';
import DataUtils from '@design-system/utils/dataUtils';

export interface GeoLineSegmentOptionType extends Partial<
  Omit<GeoWayOptionType, 'map'>
> {
  draggable?: boolean | null;
  clickable?: boolean | null;
}

enum GeoLineSegmentEventEnum {
  VISIBLE_CHANGE = 'VISIBLE_CHANGE',
}

class GeoLineSegment {
  private _idGenerator: IdGenerator = new IdGenerator();
  private _map: google.maps.Map;
  private _way: GeoWay;
  private _nodeStart: GeoNode;
  private _nodeEnd: GeoNode;
  private _polyline: google.maps.Polyline;
  private _zIndex: GeoLineSegmentOptionType['zIndex'];
  private _visible: GeoLineSegmentOptionType['visible'];
  private _draggable: GeoLineSegmentOptionType['draggable'];
  private _clickable: GeoLineSegmentOptionType['clickable'];
  private _strokeColor: GeoLineSegmentOptionType['strokeColor'];
  private _strokeWeight: GeoLineSegmentOptionType['strokeWeight'];
  private _strokeOpacity: GeoLineSegmentOptionType['strokeOpacity'];

  private _visibleChangeEventManager: EventListenerManager<
    string,
    (visible: boolean) => void
  > = new EventListenerManager();

  constructor(
    map: google.maps.Map,
    way: GeoWay,
    nodeStart: GeoNode,
    nodeEnd: GeoNode,
    options?: GeoLineSegmentOptionType,
  ) {
    this._map = map;
    this._way = way;
    this._nodeStart = nodeStart;
    this._nodeEnd = nodeEnd;
    const { visible = false, ..._options } = options || {};
    const defaultOptions: google.maps.PolylineOptions = {
      path: GeoMapUtils.getPath([this._nodeStart, this._nodeEnd]),
      ...GeoWay.DefaultOptions,
      ..._options,
      map: visible ? this._map : null,
    };

    this._polyline = new google.maps.Polyline({
      ...defaultOptions,
      clickable: false,
      draggable: false,
    });

    const {
      strokeColor = theme.colors.mono['800'],
      strokeWeight = GeoWay.StrokeWeight.NORMAL,
      zIndex = theme.zIndex.map.polyline.normal,
      clickable = options?.clickable || false,
      draggable = options?.draggable || false,
      strokeOpacity,
    } = defaultOptions;
    this.setLineSegmentOptions({
      strokeOpacity,
      strokeWeight,
      strokeColor,
      zIndex,
      clickable,
      draggable,
      visible,
    });
  }

  getId = () => {
    return `${this._nodeStart.getId()}-${this._nodeEnd.getId()}`;
  };

  setVisible = (visible: boolean) => {
    if (this.isVisible() === visible) return false;
    this._visible = visible;
    this._polyline.setMap(visible ? this._map : null);
    this._visibleChangeEventManager.invokeEventListeners(visible);
    return true;
  };

  isVisible = () => this._visible;

  /**
   * Draggable 설정
   * @param draggable
   */
  setDraggable = (draggable: boolean) => {
    if (this.isDraggable() === draggable) return;
    this._draggable = draggable;
    this._polyline.setDraggable(draggable);
  };
  /**
   * Draggable 확인
   */
  isDraggable = () => this._draggable;
  setClickable = (clickable: GeoLineSegmentOptionType['clickable']) => {
    if (this._clickable === clickable) return;
    this._clickable = !!clickable;
  };
  isClickable = () => this._clickable;
  setZIndex = (zIndex: GeoLineSegmentOptionType['zIndex']) => {
    this._zIndex = zIndex;
    this._polyline.setOptions({ zIndex });
  };
  getZIndex = () => this._zIndex;
  setStrokeColor = (strokeColor: GeoLineSegmentOptionType['strokeColor']) => {
    this._strokeColor = strokeColor;
    this._polyline.setOptions({ strokeColor });
  };
  getStrokeColor = () => this._strokeColor;
  setStrokeWeight = (
    strokeWeight: GeoLineSegmentOptionType['strokeWeight'],
  ) => {
    this._strokeWeight = strokeWeight;
    this._polyline.setOptions({ strokeWeight });
  };
  getStrokeWeight = () => this._strokeWeight;
  setStrokeOpacity = (
    strokeOpacity: GeoLineSegmentOptionType['strokeOpacity'],
  ) => {
    this._strokeOpacity = strokeOpacity;
    this._polyline.setOptions({ strokeOpacity });
  };
  getStrokeOpacity = () => this._strokeOpacity;
  setIcons = (icons: google.maps.IconSequence[] | null) => {
    this._polyline.setOptions({ icons });
  };

  setLineSegmentOptions = (options: GeoLineSegmentOptionType) => {
    const {
      clickable,
      draggable,
      visible,
      zIndex,
      strokeWeight,
      strokeColor,
      strokeOpacity,
      icons = null,
    } = options;
    if (!DataUtils.isNullOrUndefined(clickable)) {
      this.setClickable(clickable);
    }
    if (!DataUtils.isNullOrUndefined(draggable)) {
      this.setDraggable(draggable);
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
    this.setIcons(icons);
  };

  getPath = () => {
    const [start, end] = this._polyline.getPath().getArray();
    return { start, end };
  };
  updatePath = () => {
    this._polyline.setPath(
      GeoMapUtils.getPath([this._nodeStart, this._nodeEnd]),
    );
  };

  hasNode = (node: GeoNode) =>
    this._nodeStart === node || this._nodeEnd === node;

  isEqualsNodes = (node1: GeoNode, node2: GeoNode) => {
    return (
      (this._nodeStart === node1 && this._nodeEnd === node2) ||
      (this._nodeStart === node2 && this._nodeEnd === node1)
    );
  };

  getWay = () => this._way;
  getNodeStart = () => this._nodeStart;
  getNodeEnd = () => this._nodeEnd;
  getNodes = () => [this._nodeStart, this._nodeEnd];

  /**
   * ===============================================================================================
   * Event
   * ===============================================================================================
   */
  private _createEventId = (eventName: GeoLineSegmentEventEnum) => {
    return JSON.stringify({
      lineSegmentId: this.getId(),
      eventName,
      id: this._idGenerator.getNextId(),
    });
  };
  private _getEventListenerManager = (eventName: GeoLineSegmentEventEnum) => {
    switch (eventName) {
      case GeoLineSegmentEventEnum.VISIBLE_CHANGE:
        return this._visibleChangeEventManager;
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

  addVisibleChangeListener = (listener: (visible: boolean) => void) => {
    const key = this._createEventId(GeoLineSegmentEventEnum.VISIBLE_CHANGE);
    this._visibleChangeEventManager.addEventListener(key, listener);
    return key;
  };

  destroy = () => {
    this._polyline.setMap(null);
    this._visibleChangeEventManager.destroy();
  };
}

export default GeoLineSegment;
