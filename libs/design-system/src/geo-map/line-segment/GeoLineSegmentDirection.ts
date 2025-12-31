import EventListenerManager from '@design-system/geo-map/event/EventListenerManager';
import GeoNode from '@design-system/geo-map/feature/GeoNode';
import GeoWay from '@design-system/geo-map/feature/GeoWay';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';
import IdGenerator from '@design-system/utils/geo-map/IdGenerator';
import DataUtils from '@design-system/utils/dataUtils';

export interface GeoLineSegmentDirectionOptionType extends Pick<
  google.maps.PolylineOptions,
  'zIndex' | 'visible' | 'icons'
> {}

enum GeoLineSegmentDirectionEventEnum {
  VISIBLE_CHANGE = 'VISIBLE_CHANGE',
}

class GeoLineSegmentDirection {
  private _idGenerator: IdGenerator = new IdGenerator();
  private _map: google.maps.Map;
  private _way: GeoWay;
  private _nodeStart: GeoNode;
  private _nodeEnd: GeoNode;
  private _polyline: google.maps.Polyline;
  private _zIndex: GeoLineSegmentDirectionOptionType['zIndex'];
  private _visible: GeoLineSegmentDirectionOptionType['visible'];

  private _visibleChangeEventManager: EventListenerManager<
    string,
    (visible: boolean) => void
  > = new EventListenerManager();

  constructor(
    map: google.maps.Map,
    way: GeoWay,
    nodeStart: GeoNode,
    nodeEnd: GeoNode,
    options?: GeoLineSegmentDirectionOptionType,
  ) {
    this._map = map;
    this._way = way;
    this._nodeStart = nodeStart;
    this._nodeEnd = nodeEnd;
    const { visible = false, zIndex, ..._options } = options || {};

    this._polyline = new google.maps.Polyline({
      path: GeoMapUtils.getPath([this._nodeStart, this._nodeEnd]),
      ..._options,
      strokeColor: 'transparent',
      strokeOpacity: 0,
      strokeWeight: 0,
      clickable: false,
      draggable: false,
      map: visible ? this._map : null,
    });

    this.setOptions({
      zIndex,
      visible,
    });
  }

  getId = () => {
    return `direction-${this._nodeStart.getId()}-${this._nodeEnd.getId()}`;
  };

  setVisible = (visible: boolean) => {
    if (this.isVisible() === visible) return false;
    this._visible = visible;
    this._polyline.setMap(visible ? this._map : null);
    this._visibleChangeEventManager.invokeEventListeners(visible);
    return true;
  };

  isVisible = () => !!this._visible;

  setZIndex = (zIndex: GeoLineSegmentDirectionOptionType['zIndex']) => {
    this._zIndex = zIndex;
    this._polyline.setOptions({ zIndex });
  };
  getZIndex = () => this._zIndex;
  setIcons = (icons: google.maps.IconSequence[] | null) => {
    this._polyline.setOptions({ icons });
  };
  getIcons = () => this._polyline.get('icons');

  setOptions = (options: GeoLineSegmentDirectionOptionType) => {
    const { visible, zIndex, icons = null } = options;
    if (!DataUtils.isNullOrUndefined(visible)) {
      this.setVisible(visible);
    }
    if (!DataUtils.isNullOrUndefined(zIndex)) {
      this.setZIndex(zIndex);
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
  private _createEventId = (eventName: GeoLineSegmentDirectionEventEnum) => {
    return JSON.stringify({
      lineSegmentId: this.getId(),
      eventName,
      id: this._idGenerator.getNextId(),
    });
  };
  private _getEventListenerManager = (
    eventName: GeoLineSegmentDirectionEventEnum,
  ) => {
    switch (eventName) {
      case GeoLineSegmentDirectionEventEnum.VISIBLE_CHANGE:
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
    const key = this._createEventId(
      GeoLineSegmentDirectionEventEnum.VISIBLE_CHANGE,
    );
    this._visibleChangeEventManager.addEventListener(key, listener);
    return key;
  };

  destroy = () => {
    this._polyline.setMap(null);
    this._visibleChangeEventManager.destroy();
  };
}

export default GeoLineSegmentDirection;
