import EventListenerManager from '@design-system/geo-map/event/EventListenerManager';
import {
  GeoEventPositionEnum,
  GeoLatLngType,
} from '@design-system/types/geoMap.type';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';
import IdGenerator, {
  GenIdType,
} from '@design-system/utils/geo-map/IdGenerator';

// TODO: pss GeoNodeEventNameEnum과 GeoNodeElementEventNameEnum를 외부(이 것을 사용하는 개발자)가 알 필요가 있을까요? -> export 를 제거
// @link https://developers.google.com/maps/documentation/javascript/reference/advanced-markers?hl=ko&_gl=1*whvawu*_up*MQ..*_ga*Mzc0MzgzOTI4LjE3MTI1NTQ1OTQ.*_ga_NRWSTWS78N*MTcxMjU1NDU5NC4xLjAuMTcxMjU1NDU5NC4wLjAuMA..#AdvancedMarkerElement.click
export enum GeoNodeEventNameEnum {
  CLICK = 'click',
  DRAG = 'drag',
  DRAG_END = 'dragend',
  DRAG_START = 'dragstart',
}

export enum GeoNodeChangeEventNameEnum {
  DRAGGABLE_CHANGE = 'DRAGGABLE_CHANGE',
  ENABLED_CHANGE = 'ENABLED_CHANGE',
}

export enum GeoNodeElementEventNameEnum {
  TOUCH_START = 'touchstart',
  TOUCH_END = 'touchend',
  MOUSE_OVER = 'mouseover',
  MOUSE_OUT = 'mouseout',
  MOUSE_ENTER = 'mouseenter',
  MOUSE_LEAVE = 'mouseleave',
  MOUSE_DOWN = 'mousedown',
  MOUSE_UP = 'mouseup',
  MOUSE_MOVE = 'mousemove',
  CONTEXT_MENU = 'contextmenu',
}

export type GeoNodeDragEndEventType = {
  event: google.maps.MapMouseEvent;
  startLatLng: GeoLatLngType;
};

export type GeoNodeDragEventType = {
  event: google.maps.MapMouseEvent;
  beforeLatLng: GeoLatLngType;
};

class GeoNodeEventManager {
  private _idGenerator = new IdGenerator();
  private _clickEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _dragStartEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _dragEventListenerManager: EventListenerManager<
    string,
    (event: GeoNodeDragEventType) => void
  > = new EventListenerManager();
  private _dragEndEventListenerManager: EventListenerManager<
    string,
    (event: GeoNodeDragEndEventType) => void
  > = new EventListenerManager();
  private _eventPositions: {
    [key in GeoEventPositionEnum]: GeoLatLngType | undefined;
  } = {
    [GeoEventPositionEnum.DRAG_START]: undefined,
    [GeoEventPositionEnum.DRAG_BEFORE]: undefined,
  };
  private _draggableChangeEventListenerManager: EventListenerManager<
    string,
    (draggableNew: boolean) => void
  > = new EventListenerManager();
  private _enabledChangeEventListenerManager: EventListenerManager<
    string,
    (enabledNew: boolean) => void
  > = new EventListenerManager();

  private _nodeId: GenIdType;
  constructor(nodeId: GenIdType) {
    this._nodeId = nodeId;
  }

  clearAllEventListeners = () => {
    this._clickEventListenerManager.destroy();
    this._dragStartEventListenerManager.destroy();
    this._dragEventListenerManager.destroy();
    this._dragEndEventListenerManager.destroy();
    this._draggableChangeEventListenerManager.destroy();
    this._enabledChangeEventListenerManager.destroy();
  };

  destroy = () => {
    this.clearAllEventListeners();
  };

  private _createEventId = (
    eventName: GeoNodeEventNameEnum | GeoNodeChangeEventNameEnum,
  ) => {
    return JSON.stringify({
      nodeId: this._nodeId,
      eventName,
      id: this._idGenerator.getNextId(),
    });
  };

  private _getEventListenerManager = (
    eventName: GeoNodeEventNameEnum | GeoNodeChangeEventNameEnum,
  ) => {
    switch (eventName) {
      case GeoNodeEventNameEnum.CLICK:
        return this._clickEventListenerManager;
      case GeoNodeEventNameEnum.DRAG_START:
        return this._dragStartEventListenerManager;
      case GeoNodeEventNameEnum.DRAG:
        return this._dragEventListenerManager;
      case GeoNodeEventNameEnum.DRAG_END:
        return this._dragEndEventListenerManager;
      case GeoNodeChangeEventNameEnum.DRAGGABLE_CHANGE:
        return this._draggableChangeEventListenerManager;
      case GeoNodeChangeEventNameEnum.ENABLED_CHANGE:
        return this._enabledChangeEventListenerManager;
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

    const eventIdList = JSON.parse(eventId);
    if (Array.isArray(eventIdList)) {
      eventIdList.forEach((eventIdSingle) =>
        removeEventListenerSingle(eventIdSingle),
      );
      return;
    }
    removeEventListenerSingle(eventId);
  };

  addClickEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoNodeEventNameEnum.CLICK);
    this._clickEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };
  invokeClickEventListener = (event: google.maps.MapMouseEvent) => {
    this._clickEventListenerManager.invokeEventListeners(event);
  };

  addDragStartEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoNodeEventNameEnum.DRAG_START);
    this._dragStartEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };
  invokeDragStartEventListener = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    this._eventPositions[GeoEventPositionEnum.DRAG_START] =
      GeoMapUtils.toLatLng(event.latLng);
    this._dragStartEventListenerManager.invokeEventListeners(event);
  };

  addDragEventListener = (listener: (event: GeoNodeDragEventType) => void) => {
    const eventId = this._createEventId(GeoNodeEventNameEnum.DRAG);
    this._dragEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };
  invokeDragEventListener = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) {
      return;
    }
    const latLng = GeoMapUtils.toLatLng(event.latLng);
    const beforeLatLng =
      this._eventPositions[GeoEventPositionEnum.DRAG_BEFORE] ??
      this._eventPositions[GeoEventPositionEnum.DRAG_START];
    if (!beforeLatLng) return;
    this._eventPositions[GeoEventPositionEnum.DRAG_BEFORE] = latLng;
    this._dragEventListenerManager.invokeEventListeners({
      event,
      beforeLatLng,
    });
  };

  addDragEndEventListener = (
    listener: (event: GeoNodeDragEndEventType) => void,
  ) => {
    const eventDragStartId = this._createEventId(
      GeoNodeEventNameEnum.DRAG_START,
    );
    const eventDragId = this._createEventId(GeoNodeEventNameEnum.DRAG);
    const eventDragEndId = this._createEventId(GeoNodeEventNameEnum.DRAG_END);

    this._dragStartEventListenerManager.addEventListener(
      eventDragStartId,
      (event: google.maps.MapMouseEvent) => {},
    );
    this._dragEventListenerManager.addEventListener(eventDragId, (event) => {});
    this._dragEndEventListenerManager.addEventListener(
      eventDragEndId,
      (event: GeoNodeDragEndEventType) => listener(event),
    );

    return JSON.stringify([eventDragStartId, eventDragId, eventDragEndId]);
  };

  invokeDragEndEventListener = (event: google.maps.MapMouseEvent) => {
    const startLatLng = this._eventPositions[GeoEventPositionEnum.DRAG_START];
    if (!event.latLng || !startLatLng) return;
    this._dragEndEventListenerManager.invokeEventListeners({
      event,
      startLatLng,
    });
    this._eventPositions[GeoEventPositionEnum.DRAG_START] = undefined;
    this._eventPositions[GeoEventPositionEnum.DRAG_BEFORE] = undefined;
  };

  addDraggableChangeEventListener = (
    listener: (draggable: boolean) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNodeChangeEventNameEnum.DRAGGABLE_CHANGE,
    );
    this._draggableChangeEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    return eventId;
  };

  invokeDraggableChangeEventListener = (draggable: boolean) => {
    this._draggableChangeEventListenerManager.invokeEventListeners(draggable);
  };

  addEnabledChangeEventListener = (listener: (enabled: boolean) => void) => {
    const eventId = this._createEventId(
      GeoNodeChangeEventNameEnum.ENABLED_CHANGE,
    );
    this._enabledChangeEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };

  invokeEnabledChangeEventListener = (enabled: boolean) => {
    this._enabledChangeEventListenerManager.invokeEventListeners(enabled);
  };
}

export default GeoNodeEventManager;
