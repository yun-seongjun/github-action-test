import EventListenerManager, {
  GeoMapElementEventNameEnum,
  GeoMapEventNameEnum,
  StreetViewEventNameEnum,
} from '@design-system/geo-map/event/EventListenerManager';
import EventPreventer, {
  EventPreventerTypeEnum,
} from '@design-system/geo-map/event/EventPreventer';
import NotificationEventManager from '@design-system/geo-map/event/NotificationEventManager';
import { GeoNodeElementEventNameEnum } from '@design-system/geo-map/feature/GeoNodeEventManager';
import GeoLayer from '@design-system/geo-map/layer/GeoLayer';
import {
  GeoLatLngType,
  GeoMapTypeEnum,
  GeoMapTypeIdEnum,
  GeoMapTypeImageEnum,
} from '@design-system/types/geoMap.type';
import DataUtils from '@design-system/utils/dataUtils';
import EnvUtils from '@design-system/utils/envUtils';
import GeoEventMockerUtils from '@design-system/utils/geo-map/GeoEventMockerUtils';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';
import IdGenerator from '@design-system/utils/geo-map/IdGenerator';

enum GeoMapInnerEventEnum {
  MAP_TYPE_CHANGE = 'MAP_TYPE_CHANGE',
  MAP_TYPE_IMAGE_CHANGE = 'MAP_TYPE_IMAGE_CHANGE',
}

const LAYER_ACTIVATED_KEY = 'LAYER_ACTIVATED_KEY';

type OnLayerSelectedChangeEventListener = (
  layerSelected: GeoLayer,
  layerSelectedOld?: GeoLayer,
) => void;
type OnLayerMainEventListener = (layerMain: GeoLayer) => void;

const isMultiTouchEvent = (event: TouchEvent) => {
  return event.touches.length > 1;
};

interface GeoMapEventManagerOptions {
  dragBoxEnabled?: boolean;
}

class GeoMapEventManager {
  private _idGenerator: IdGenerator = new IdGenerator();
  private readonly _eventPreventer: EventPreventer;
  private readonly _notificationEventManager: NotificationEventManager;
  private readonly _googleMap: google.maps.Map;
  private _zoomLevel: number;
  private _mapTypeId: GeoMapTypeIdEnum;
  private _mapTypeIdBefore: GeoMapTypeIdEnum;

  // GeoMapEvent
  private _clickEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _doubleClickEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _dragStartEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _dragEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _dragEndEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  // mouse down/move/up. PC에서 발생하는 맵 선택 이벤트
  private _mouseDownEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _mouseMoveEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _mouseUpEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  // finger down/move/up. 태블릿에서 손가락으로 맵 선택시 발생하는 맵 선택 이벤트
  private _fingerDownEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _fingerMoveEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _fingerUpEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _fingerMultipleDownEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _fingerMultipleMoveEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _fingerMultipleUpEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  // pencil down/move/up. 태블릿에서 펜슬로 맵 선택시 발생하는 맵 선택 이벤트
  private _pencilDownEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _pencilMoveEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _pencilUpEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _zoomChangedEventListenerManager: EventListenerManager<
    string,
    (
      event: google.maps.MapMouseEvent | undefined,
      zoomLevel: number,
      zoomLevelOld: number,
    ) => void
  > = new EventListenerManager();
  private _zoomChangedDebounceEventListenerManager: EventListenerManager<
    string,
    (
      event: google.maps.MapMouseEvent | undefined,
      zoomLevel: number,
      zoomLevelOld: number,
    ) => void
  > = new EventListenerManager(500);
  private _mapTypeIdChangeEventStickyListenerManager: EventListenerManager<
    string,
    (
      mapTypeIdChanged: GeoMapTypeIdEnum,
      mapTypeIdBefore: GeoMapTypeIdEnum,
    ) => void
  > = new EventListenerManager();
  private _boundsChangedDebounceEventListenerManager: EventListenerManager<
    string,
    (bounds: google.maps.LatLngBounds) => void
  > = new EventListenerManager(500);
  private _projectionChangedEventListenerManager: EventListenerManager<
    string,
    (projection: google.maps.Projection) => void
  > = new EventListenerManager();
  private _touchStartEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _touchMoveEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _touchEndEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _centerChangedEventListenerManager: EventListenerManager<
    string,
    (center: GeoLatLngType) => void
  > = new EventListenerManager();
  private _headingChangedEventListenerManager: EventListenerManager<
    string,
    (heading: number) => void
  > = new EventListenerManager();

  // GeoMapInnerEvent
  private _mapTypeChangeStickyEventListenerManager: EventListenerManager<
    string,
    (mapType: GeoMapTypeEnum) => void
  > = new EventListenerManager();
  private _mapTypeImageChangeStickyEventListenerManager: EventListenerManager<
    string,
    (mapType: GeoMapTypeImageEnum) => void
  > = new EventListenerManager();

  // Layer 관련 이벤트
  private _layerSelectedChangeEventManager: EventListenerManager<
    string,
    OnLayerSelectedChangeEventListener
  > = new EventListenerManager();
  private _layerMainEventManager: EventListenerManager<
    string,
    OnLayerMainEventListener
  > = new EventListenerManager();

  private _dragBoxEnabled: boolean;
  private _dragBoxDragStartEventListenerManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent, latLng: GeoLatLngType) => void
  > = new EventListenerManager();
  private _dragBoxDragEventListenerManager: EventListenerManager<
    string,
    (
      event: google.maps.MapMouseEvent,
      latLng: GeoLatLngType,
      latLngBefore: GeoLatLngType,
      latLngStart: GeoLatLngType,
      dragBoxPath: GeoLatLngType[],
    ) => void
  > = new EventListenerManager();
  private _dragBoxDragEndEventListenerManager: EventListenerManager<
    string,
    (
      event: google.maps.MapMouseEvent,
      bounds: google.maps.LatLngBounds,
      latLng: GeoLatLngType,
      latLngStart: GeoLatLngType,
      dragBoxPath: GeoLatLngType[],
    ) => void
  > = new EventListenerManager();

  private _streetViewVisibleEventListenerManager: EventListenerManager<
    string,
    (visible: boolean) => void
  > = new EventListenerManager();
  private _streetViewPositionChangedEventListenerManager: EventListenerManager<
    string,
    (position: GeoLatLngType) => void
  > = new EventListenerManager();

  private _googleBounds: google.maps.LatLngBounds | undefined;

  private _mapDragClickTouchMoveEventEnabled = true;
  setMapDragClickTouchMoveEventEnabled = (enabled: boolean) => {
    this._mapDragClickTouchMoveEventEnabled = enabled;
  };
  isMapDragClickTouchMoveEventEnabled = () => {
    return this._mapDragClickTouchMoveEventEnabled;
  };

  private _pencilGestureHandlingEnabled = false;
  setPencilGestureHandlingEnabled = (enabled: boolean) => {
    this._pencilGestureHandlingEnabled = enabled;
  };
  isPencilGestureHandlingEnabled = () => {
    return this._pencilGestureHandlingEnabled;
  };

  constructor(
    googleMap: google.maps.Map,
    eventPreventer: EventPreventer,
    notificationEventManager: NotificationEventManager,
    { dragBoxEnabled = false }: GeoMapEventManagerOptions = {},
  ) {
    this._googleMap = googleMap;
    this._eventPreventer = eventPreventer;
    this._notificationEventManager = notificationEventManager;
    this._zoomLevel = googleMap.getZoom() || 16;
    this._mapTypeId = googleMap.getMapTypeId() as GeoMapTypeIdEnum;
    this._mapTypeIdBefore = this._mapTypeId;
    this._dragBoxEnabled = dragBoxEnabled;

    const isTablet = EnvUtils.isTablet();
    // GeoMapEvent
    this._googleMap.addListener(
      GeoMapEventNameEnum.CLICK,
      (event: google.maps.MapMouseEvent) => {
        if (EnvUtils.isQaMode()) {
          this._mapEventLogger(event, GeoMapEventNameEnum.CLICK);
        }

        if (!this._mapDragClickTouchMoveEventEnabled) {
          return;
        }
        event.stop();
        event.domEvent.stopPropagation();
        event.domEvent.preventDefault();

        this._clickEventListenerManager.invokeEventListeners(event);
        this._notificationEventManager.invokeMapClickEventListener(event);
      },
    );
    this._googleMap.addListener(
      GeoMapEventNameEnum.DOUBLE_CLICK,
      (event: google.maps.MapMouseEvent) => {
        if (!this._mapDragClickTouchMoveEventEnabled) {
          return;
        }
        this._doubleClickEventListenerManager.invokeEventListeners(event);
      },
    );
    this._googleMap.addListener(
      GeoMapEventNameEnum.DRAG_START,
      (event: google.maps.MapMouseEvent) => {
        // console.log('GoogleMap, DRAG_START')
        if (!this._mapDragClickTouchMoveEventEnabled) {
          return;
        }
        this._dragStartEventListenerManager.invokeEventListeners(event);
        this._notificationEventManager.invokeMapDragStartEventListener(event);
      },
    );
    this._googleMap.addListener(
      GeoMapEventNameEnum.DRAG,
      (event: google.maps.MapMouseEvent) => {
        // console.log('GoogleMap, DRAG')
        if (!this._mapDragClickTouchMoveEventEnabled) {
          return;
        }
        this._dragEventListenerManager.invokeEventListeners(event);
        this._notificationEventManager.invokeMapDragEventListener(event);
      },
    );
    this._googleMap.addListener(
      GeoMapEventNameEnum.DRAG_END,
      (event: google.maps.MapMouseEvent) => {
        // console.log('GoogleMap, DRAG_END')
        if (!this._mapDragClickTouchMoveEventEnabled) {
          return;
        }
        this._dragEndEventListenerManager.invokeEventListeners(event);
        this._notificationEventManager.invokeMapDragEndEventListener(event);
      },
    );
    let zoomLevelDebounceOld = 0;
    this._googleMap.addListener(
      GeoMapEventNameEnum.ZOOM_CHANGED,
      (event: google.maps.MapMouseEvent) => {
        const zoomLevel = this._googleMap.getZoom();
        // console.log('GoogleMap, ZOOM_CHANGED, zoomLevel', zoomLevel)
        if (zoomLevel !== undefined) {
          if (
            !this._zoomChangedDebounceEventListenerManager.isInvokeDebounced()
          ) {
            zoomLevelDebounceOld = this._zoomLevel;
          }
          const zoomLevelOld = this._zoomLevel;
          this._zoomLevel = zoomLevel;
          this._zoomChangedEventListenerManager.invokeEventListeners(
            event,
            this._zoomLevel,
            zoomLevelOld,
          );
          this._zoomChangedDebounceEventListenerManager.invokeDebounceEventListeners(
            event,
            this._zoomLevel,
            zoomLevelDebounceOld,
          );
        }
      },
    );
    this._googleMap.addListener(GeoMapEventNameEnum.BOUNDS_CHANGED, () => {
      const googleBoundsNew = this._googleMap.getBounds();
      if (!googleBoundsNew) return;
      this._googleBounds = googleBoundsNew;
      this._boundsChangedDebounceEventListenerManager.invokeDebounceEventListeners(
        googleBoundsNew,
      );
      this._notificationEventManager.invokeMapBoundsChangedDebounceEventListener(
        googleBoundsNew,
      );
    });
    this._googleMap.addListener(GeoMapEventNameEnum.PROJECTION_CHANGED, () => {
      const googleProjection = this._googleMap.getProjection();
      if (!googleProjection) return;
      this._projectionChangedEventListenerManager.invokeEventListeners(
        googleProjection,
      );
    });
    this._googleMap.addListener(GeoMapEventNameEnum.CENTER_CHANGED, () => {
      const mapCenter = this._googleMap.getCenter();
      if (!mapCenter) return;
      const formatMapCenter = GeoMapUtils.toLatLng(mapCenter);
      this._centerChangedEventListenerManager.invokeEventListeners(
        formatMapCenter,
      );
      this._notificationEventManager.invokeMapCenterChangedEventListener(
        formatMapCenter,
      );
    });
    this._googleMap.addListener(GeoMapEventNameEnum.HEADING_CHANGED, () => {
      const mapHeading = this._googleMap.getHeading();
      if (DataUtils.isNullOrUndefined(mapHeading)) return;
      this._headingChangedEventListenerManager.invokeEventListeners(mapHeading);
      this._notificationEventManager.invokeMapHeadingChangedEventListener(
        mapHeading,
      );
    });

    const streetView = this._googleMap.getStreetView();
    streetView.addListener(StreetViewEventNameEnum.VISIBLE_CHANGED, () => {
      this._streetViewVisibleEventListenerManager.invokeEventListeners(
        streetView.getVisible(),
      );
    });
    streetView.addListener(StreetViewEventNameEnum.POSITION_CHANGED, () => {
      const position = streetView.getPosition();
      if (position) {
        this._streetViewPositionChangedEventListenerManager.invokeEventListeners(
          GeoMapUtils.formatToFixedPosition(GeoMapUtils.toLatLng(position)),
        );
      }
    });

    // GeoMapElementEvent
    let isTouchDown = false;
    let touchMoveEventLatest: TouchEvent | undefined;
    let touchFingerSingleMoveEventLatest: TouchEvent | undefined;
    let touchFingerMultipleMoveEventLatest: TouchEvent | undefined;
    this._googleMap
      .getDiv()
      .addEventListener(
        GeoMapElementEventNameEnum.TOUCH_START,
        (event: TouchEvent) => {
          if (!this._mapDragClickTouchMoveEventEnabled || isTouchDown) {
            return;
          }
          const mapEvent = GeoEventMockerUtils.createMapMouseEventFromDomEvent(
            this._googleMap,
            event,
          );
          if (!mapEvent) {
            return;
          }
          isTouchDown = true;
          touchMoveEventLatest = DataUtils.deepCopy(event);
          this._touchStartEventListenerManager.invokeEventListeners(mapEvent);
          if (isTablet) {
            const isFingerEvent = GeoMapUtils.isFingerTouchEvent(event.touches);
            const isMultiEvent = isMultiTouchEvent(event);
            if (isFingerEvent) {
              if (this._pencilGestureHandlingEnabled) {
                this._googleMap.setOptions({ gestureHandling: 'greedy' });
              }
              if (isMultiEvent) {
                if (touchFingerSingleMoveEventLatest) {
                  this._fingerUpEventListenerManager.invokeEventListeners(
                    mapEvent,
                  );
                  touchFingerSingleMoveEventLatest = undefined;
                }
                this._fingerMultipleDownEventListenerManager.invokeEventListeners(
                  mapEvent,
                );
                touchFingerMultipleMoveEventLatest = DataUtils.deepCopy(event);
              } else {
                this._fingerDownEventListenerManager.invokeEventListeners(
                  mapEvent,
                );
                touchFingerSingleMoveEventLatest = DataUtils.deepCopy(event);
              }
            } else {
              this._pencilDownEventListenerManager.invokeEventListeners(
                mapEvent,
              );
            }
            this._mouseDownEventListenerManager.invokeEventListeners(mapEvent);
          }
        },
      );
    this._googleMap
      .getDiv()
      .addEventListener(
        GeoMapElementEventNameEnum.TOUCH_MOVE,
        (event: TouchEvent) => {
          // console.log('GoogleMap, TOUCH_MOVE', event)
          if (!this._mapDragClickTouchMoveEventEnabled || !isTouchDown) {
            return;
          }
          const mapEvent = GeoEventMockerUtils.createMapMouseEventFromDomEvent(
            this._googleMap,
            event,
          );
          if (!mapEvent) {
            return;
          }
          touchMoveEventLatest = DataUtils.deepCopy(event);
          this._touchMoveEventListenerManager.invokeEventListeners(mapEvent);
          if (isTablet) {
            const isFingerEvent = GeoMapUtils.isFingerTouchEvent(event.touches);
            const isMultiEvent = isMultiTouchEvent(event);
            if (isFingerEvent) {
              if (isMultiEvent) {
                if (touchFingerMultipleMoveEventLatest) {
                  this._fingerMultipleMoveEventListenerManager.invokeEventListeners(
                    mapEvent,
                  );
                  touchFingerMultipleMoveEventLatest =
                    DataUtils.deepCopy(event);
                }
              } else {
                if (touchFingerSingleMoveEventLatest) {
                  this._fingerMoveEventListenerManager.invokeEventListeners(
                    mapEvent,
                  );
                  touchFingerSingleMoveEventLatest = DataUtils.deepCopy(event);
                }
              }
            } else {
              this._pencilMoveEventListenerManager.invokeEventListeners(
                mapEvent,
              );
            }
            this._mouseMoveEventListenerManager.invokeEventListeners(mapEvent);
          }
        },
      );
    this._googleMap
      .getDiv()
      .addEventListener(
        GeoMapElementEventNameEnum.TOUCH_END,
        (event: TouchEvent) => {
          // console.log(
          //   'GoogleMap, TOUCH_END, _mapDragClickTouchMoveEventEnabled',
          //   this._mapDragClickTouchMoveEventEnabled,
          //   'isTouchDown',
          //   isTouchDown,
          //   'event',
          //   event
          // )
          if (!this._mapDragClickTouchMoveEventEnabled || !isTouchDown) {
            return;
          }
          isTouchDown = false;
          const eventNew: TouchEvent = {
            ...event,
            touches: (touchMoveEventLatest?.touches as TouchList) || [],
          };
          const mapEvent = GeoEventMockerUtils.createMapMouseEventFromDomEvent(
            this._googleMap,
            eventNew,
          );
          if (!mapEvent) {
            return;
          }
          this._touchEndEventListenerManager.invokeEventListeners(mapEvent);
          if (isTablet) {
            const isFingerEvent = GeoMapUtils.isFingerTouchEvent(
              eventNew.touches,
            );
            const isMultiEvent = isMultiTouchEvent(eventNew);
            if (isFingerEvent) {
              if (this._pencilGestureHandlingEnabled) {
                this._googleMap.setOptions({ gestureHandling: 'none' });
              }
              if (isMultiEvent) {
                if (touchFingerMultipleMoveEventLatest) {
                  this._fingerMultipleUpEventListenerManager.invokeEventListeners(
                    mapEvent,
                  );
                  touchFingerMultipleMoveEventLatest = undefined;
                }
              } else {
                if (touchFingerSingleMoveEventLatest) {
                  this._fingerUpEventListenerManager.invokeEventListeners(
                    mapEvent,
                  );
                  touchFingerSingleMoveEventLatest = undefined;
                }
              }
            } else {
              this._pencilUpEventListenerManager.invokeEventListeners(mapEvent);
            }
            this._mouseUpEventListenerManager.invokeEventListeners(mapEvent);
          }
        },
      );

    /**
     * Todo:: rdh 모든 레이어의 node,lineSegment를 가져와서 각 레이어의 node, lineSegment zIndex를 가져와서 그 순서대로 이벤트를 일으키고 mouseDown 이벤트가 끝나면 prevent를 풀게 하는 작업을 해야합니다.
     */
    this._googleMap.addListener(
      GeoMapElementEventNameEnum.MOUSE_DOWN,
      (event: google.maps.MapMouseEvent) => {
        if (!this._mapDragClickTouchMoveEventEnabled) {
          return;
        }
        event.domEvent.preventDefault();
        const isPrevent = this._eventPreventer.isPrevent(
          EventPreventerTypeEnum.CLICK,
        );
        if (isPrevent) {
          return;
        }
        !isTablet &&
          this._mouseDownEventListenerManager.invokeEventListeners(event);
      },
    );
    this._googleMap.addListener(
      GeoMapEventNameEnum.MOUSE_MOVE,
      (event: google.maps.MapMouseEvent) => {
        if (!this._mapDragClickTouchMoveEventEnabled) {
          return;
        }
        !isTablet &&
          this._mouseMoveEventListenerManager.invokeEventListeners(event);
      },
    );
    this._googleMap.addListener(
      GeoMapElementEventNameEnum.MOUSE_UP,
      (event: google.maps.MapMouseEvent) => {
        // console.log('GoogleMap, MOUSE_UP')
        if (!this._mapDragClickTouchMoveEventEnabled) {
          return;
        }
        !isTablet &&
          this._mouseUpEventListenerManager.invokeEventListeners(event);
      },
    );

    // customEvent invoke
    this.addMapTypeIdChangeStickyEventListener(
      (mapTypeIdChanged, mapTypeIdBefore) => {
        const mapTypeBefore = GeoMapUtils.getMapType(mapTypeIdBefore);
        const mapTypeChanged = GeoMapUtils.getMapType(mapTypeIdChanged);
        if (mapTypeBefore !== mapTypeChanged) {
          this._mapTypeChangeStickyEventListenerManager.invokeEventListeners(
            mapTypeChanged,
          );
        }

        const mapTypeImageBefore = GeoMapUtils.getMapTypeImage(mapTypeIdBefore);
        const mapTypeImageChanged =
          GeoMapUtils.getMapTypeImage(mapTypeIdChanged);
        if (mapTypeImageBefore !== mapTypeImageChanged) {
          this._mapTypeImageChangeStickyEventListenerManager.invokeEventListeners(
            mapTypeImageChanged,
          );
        }
      },
    );
  }

  getMapTypeId = () => {
    return this._mapTypeId;
  };

  private _createEventId = (eventName: string) => {
    return JSON.stringify({
      type: 'map',
      eventName,
      id: this._idGenerator.getNextId(),
    });
  };

  private _getEventListenerManager = (eventName: string) => {
    switch (eventName) {
      case GeoMapEventNameEnum.CLICK:
        return this._clickEventListenerManager;
      case GeoMapEventNameEnum.DOUBLE_CLICK:
        return this._doubleClickEventListenerManager;
      case GeoMapEventNameEnum.DRAG_START:
        return this._dragStartEventListenerManager;
      case GeoMapEventNameEnum.DRAG:
        return this._dragEventListenerManager;
      case GeoMapEventNameEnum.DRAG_END:
        return this._dragEndEventListenerManager;
      case GeoMapEventNameEnum.MOUSE_MOVE:
        return this._mouseMoveEventListenerManager;
      case GeoMapEventNameEnum.ZOOM_CHANGED:
        return this._zoomChangedEventListenerManager;
      case GeoMapEventNameEnum.ZOOM_CHANGED_DEBOUNCE:
        return this._zoomChangedDebounceEventListenerManager;
      case GeoMapEventNameEnum.BOUNDS_CHANGED:
        return this._boundsChangedDebounceEventListenerManager;
      case GeoMapEventNameEnum.CENTER_CHANGED:
        return this._centerChangedEventListenerManager;
      case GeoMapEventNameEnum.HEADING_CHANGED:
        return this._headingChangedEventListenerManager;
      case StreetViewEventNameEnum.VISIBLE_CHANGED:
        return this._streetViewVisibleEventListenerManager;
      case StreetViewEventNameEnum.POSITION_CHANGED:
        return this._streetViewPositionChangedEventListenerManager;
      // NodeElementEventName
      case GeoNodeElementEventNameEnum.MOUSE_UP:
        return this._mouseUpEventListenerManager;
      case GeoNodeElementEventNameEnum.MOUSE_DOWN:
        return this._mouseDownEventListenerManager;
      case GeoNodeElementEventNameEnum.TOUCH_START:
        return this._touchStartEventListenerManager;
      case GeoNodeElementEventNameEnum.TOUCH_END:
        return this._touchEndEventListenerManager;
      case GeoMapInnerEventEnum.MAP_TYPE_CHANGE:
        return this._mapTypeChangeStickyEventListenerManager;
      case GeoMapInnerEventEnum.MAP_TYPE_IMAGE_CHANGE:
        return this._mapTypeImageChangeStickyEventListenerManager;
      // CustomEventName
      case GeoMapEventNameEnum.FINGER_DOWN:
        return this._fingerDownEventListenerManager;
      case GeoMapEventNameEnum.FINGER_MOVE:
        return this._fingerMoveEventListenerManager;
      case GeoMapEventNameEnum.FINGER_UP:
        return this._fingerUpEventListenerManager;
      case GeoMapEventNameEnum.FINGER_MULTIPLE_DOWN:
        return this._fingerMultipleDownEventListenerManager;
      case GeoMapEventNameEnum.FINGER_MULTIPLE_MOVE:
        return this._fingerMultipleMoveEventListenerManager;
      case GeoMapEventNameEnum.FINGER_MULTIPLE_UP:
        return this._fingerMultipleUpEventListenerManager;
      case GeoMapEventNameEnum.PENCIL_DOWN:
        return this._pencilDownEventListenerManager;
      case GeoMapEventNameEnum.PENCIL_MOVE:
        return this._pencilMoveEventListenerManager;
      case GeoMapEventNameEnum.PENCIL_UP:
        return this._pencilUpEventListenerManager;
    }
  };

  isEventListening = (eventId: string) => {
    const isEventListeningSingle = (eventIdSingle: string) => {
      const { eventName } = JSON.parse(eventIdSingle);
      const eventListenerManager = this._getEventListenerManager(eventName);
      return !!eventListenerManager?.isEventListening(eventIdSingle);
    };

    const eventIdList = JSON.parse(eventId);
    if (Array.isArray(eventIdList)) {
      return eventIdList.every((eventIdSingle) =>
        isEventListeningSingle(eventIdSingle),
      );
    }
    return isEventListeningSingle(eventId);
  };

  removeEventListener = (eventId: string): boolean => {
    const removeEventListenerSingle = (eventIdSingle: string) => {
      const { eventName } = JSON.parse(eventIdSingle);
      const eventListenerManager = this._getEventListenerManager(eventName);
      return !!eventListenerManager?.removeEventListener(eventIdSingle);
    };

    const eventIdList = JSON.parse(eventId);
    if (Array.isArray(eventIdList)) {
      let removedCount = 0;
      eventIdList.forEach((eventIdSingle) => {
        if (removeEventListenerSingle(eventIdSingle)) {
          removedCount++;
        }
      });
      return removedCount > 0;
    }
    return removeEventListenerSingle(eventId);
  };

  clearEventListeners = () => {
    this._clickEventListenerManager.destroy();
    this._doubleClickEventListenerManager.destroy();
    this._dragStartEventListenerManager.destroy();
    this._dragEventListenerManager.destroy();
    this._dragEndEventListenerManager.destroy();
    this._mouseDownEventListenerManager.destroy();
    this._mouseMoveEventListenerManager.destroy();
    this._mouseUpEventListenerManager.destroy();
    this._zoomChangedEventListenerManager.destroy();
    this._zoomChangedDebounceEventListenerManager.destroy();
    this._mapTypeIdChangeEventStickyListenerManager.destroy();
    this._boundsChangedDebounceEventListenerManager.destroy();
    this._projectionChangedEventListenerManager.destroy();
    this._centerChangedEventListenerManager.destroy();
    this._headingChangedEventListenerManager.destroy();
    this._mapTypeChangeStickyEventListenerManager.destroy();
    this._mapTypeImageChangeStickyEventListenerManager.destroy();
    this._layerSelectedChangeEventManager.destroy();
    this._layerMainEventManager.destroy();

    this._dragBoxDragStartEventListenerManager.destroy();
    this._dragBoxDragEventListenerManager.destroy();
    this._dragBoxDragEndEventListenerManager.destroy();
    this._streetViewVisibleEventListenerManager.destroy();
    this._streetViewPositionChangedEventListenerManager.destroy();
    this._touchStartEventListenerManager.destroy();
    this._touchMoveEventListenerManager.destroy();
    this._touchEndEventListenerManager.destroy();

    this._fingerDownEventListenerManager.destroy();
    this._fingerMoveEventListenerManager.destroy();
    this._fingerUpEventListenerManager.destroy();

    this._fingerMultipleDownEventListenerManager.destroy();
    this._fingerMultipleMoveEventListenerManager.destroy();
    this._fingerMultipleUpEventListenerManager.destroy();

    this._pencilDownEventListenerManager.destroy();
    this._pencilMoveEventListenerManager.destroy();
    this._pencilUpEventListenerManager.destroy();
  };

  addClickEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.CLICK);
    this._clickEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };

  addDoubleClickEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.DOUBLE_CLICK);
    this._doubleClickEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };

  addDragStartEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.DRAG_START);
    this._dragStartEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };

  addDragEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.DRAG);
    this._dragEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };

  addDragEndEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.DRAG_END);
    this._dragEndEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };

  addMapTypeIdChangeStickyEventListener = (
    listener: (
      mapTypeIdChanged: GeoMapTypeIdEnum,
      mapTypeIdBefore: GeoMapTypeIdEnum,
    ) => void,
    isSticky = true,
  ) => {
    const eventId = this._createEventId(
      GeoMapEventNameEnum.MAP_TYPE_ID_CHANGED,
    );
    this._mapTypeIdChangeEventStickyListenerManager.addEventListener(
      eventId,
      listener,
    );
    isSticky && listener(this._mapTypeId, this._mapTypeIdBefore);
    return eventId;
  };

  invokeMapTypeIdChangeStickyEventListener = (
    mapTypeIdChanged: GeoMapTypeIdEnum,
  ) => {
    this._mapTypeIdBefore = this._mapTypeId;
    this._mapTypeId = mapTypeIdChanged;
    this._mapTypeIdChangeEventStickyListenerManager.invokeEventListeners(
      this._mapTypeId,
      this._mapTypeIdBefore,
    );
  };

  addBoundsChangedStickyEventListener = (
    listener: (bounds: google.maps.LatLngBounds) => void,
  ) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.BOUNDS_CHANGED);
    this._boundsChangedDebounceEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    if (this._googleBounds) {
      listener(this._googleBounds);
    }
    return eventId;
  };

  addProjectionChangedEventListener = (
    listener: (projection: google.maps.Projection) => void,
    isSticky = false,
  ) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.PROJECTION_CHANGED);
    this._projectionChangedEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    if (isSticky) {
      const googleProjection = this._googleMap.getProjection();
      if (!googleProjection) return;
      this._projectionChangedEventListenerManager.invokeEventListeners(
        googleProjection,
      );
    }
    return eventId;
  };

  addCenterChangedEventListener = (
    listener: (center: GeoLatLngType) => void,
  ) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.CENTER_CHANGED);
    this._centerChangedEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };

  addHeadingChangedEventListener = (listener: (heading: number) => void) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.HEADING_CHANGED);
    this._headingChangedEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    return eventId;
  };

  // GeoMapElementEvent
  addMouseDownEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoMapElementEventNameEnum.MOUSE_DOWN);
    this._mouseDownEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };

  addMouseMoveEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.MOUSE_MOVE);
    this._mouseMoveEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };

  addMouseUpEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoMapElementEventNameEnum.MOUSE_UP);
    this._mouseUpEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };

  addFingerDownEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.FINGER_DOWN);
    this._fingerDownEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };

  addFingerMoveEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.FINGER_MOVE);
    this._fingerMoveEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };

  addFingerUpEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.FINGER_UP);
    this._fingerUpEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };

  addFingerMultipleDownEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(
      GeoMapEventNameEnum.FINGER_MULTIPLE_DOWN,
    );
    this._fingerMultipleDownEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    return eventId;
  };

  addFingerMultipleMoveEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(
      GeoMapEventNameEnum.FINGER_MULTIPLE_MOVE,
    );
    this._fingerMultipleMoveEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    return eventId;
  };

  addFingerMultipleUpEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.FINGER_MULTIPLE_UP);
    this._fingerMultipleUpEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    return eventId;
  };

  addPencilDownEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.PENCIL_DOWN);
    this._pencilDownEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };

  addPencilMoveEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.PENCIL_MOVE);
    this._pencilMoveEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };

  addPencilUpEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.PENCIL_UP);
    this._pencilUpEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };

  addZoomChangedStickyEventListener = (
    listener: (
      event: google.maps.MapMouseEvent | undefined,
      zoomLevel: number,
      zoomLevelOld: number,
    ) => void,
    isSticky = true,
  ) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.ZOOM_CHANGED);
    this._zoomChangedEventListenerManager.addEventListener(eventId, listener);
    isSticky && listener(undefined, this._zoomLevel, 0);
    return eventId;
  };
  addZoomChangedStickyDebounceEventListener = (
    listener: (
      event: google.maps.MapMouseEvent | undefined,
      zoomLevel: number,
      zoomLevelOld: number,
    ) => void,
  ) => {
    const eventId = this._createEventId(
      GeoMapEventNameEnum.ZOOM_CHANGED_DEBOUNCE,
    );
    this._zoomChangedDebounceEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    listener(undefined, this._zoomLevel, 0);
    return eventId;
  };

  addTouchStartEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoMapElementEventNameEnum.TOUCH_START);
    this._touchStartEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };

  addTouchMoveEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoMapElementEventNameEnum.TOUCH_MOVE);
    this._touchMoveEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };

  addTouchEndEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoMapElementEventNameEnum.TOUCH_END);
    this._touchEndEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };

  // GeoMapInnerEvent
  addMapTypeChangeStickyEventListener = (
    listener: (mapType: GeoMapTypeEnum) => void,
  ) => {
    const eventId = this._createEventId(GeoMapInnerEventEnum.MAP_TYPE_CHANGE);
    this._mapTypeChangeStickyEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    listener(GeoMapUtils.getMapType(this._mapTypeId));
    return eventId;
  };

  addMapTypeImageChangeStickyEventListener = (
    listener: (mapTypeImage: GeoMapTypeImageEnum) => void,
  ) => {
    const eventId = this._createEventId(
      GeoMapInnerEventEnum.MAP_TYPE_IMAGE_CHANGE,
    );
    this._mapTypeImageChangeStickyEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    listener(GeoMapUtils.getMapTypeImage(this._mapTypeId));
    return eventId;
  };

  // LayerEvent
  addLayerSelectedChangeEventListener = (
    listener: OnLayerSelectedChangeEventListener,
  ) => {
    const eventId = this._createEventId(LAYER_ACTIVATED_KEY);
    this._layerSelectedChangeEventManager.addEventListener(eventId, listener);
    return eventId;
  };

  invokeLayerSelectedChangeEventListener = (
    layerControlling: GeoLayer,
    layerControllingOld?: GeoLayer,
  ) => {
    this._layerSelectedChangeEventManager.invokeEventListeners(
      layerControlling,
      layerControllingOld,
    );
  };

  addLayerMainEventListener = (listener: OnLayerMainEventListener) => {
    const eventId = this._createEventId(LAYER_ACTIVATED_KEY);
    this._layerMainEventManager.addEventListener(eventId, listener);
    return eventId;
  };

  invokeLayerMainEventListener = (layerMain: GeoLayer) => {
    this._layerMainEventManager.invokeEventListeners(layerMain);
  };

  addStreetViewVisibleEventListener = (
    listener: (visible: boolean) => void,
  ) => {
    const eventId = this._createEventId(
      StreetViewEventNameEnum.VISIBLE_CHANGED,
    );
    this._streetViewVisibleEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    return eventId;
  };

  addStreetViewPositionChangedEventListener = (
    listener: (position: GeoLatLngType) => void,
  ) => {
    const eventId = this._createEventId(
      StreetViewEventNameEnum.POSITION_CHANGED,
    );
    this._streetViewPositionChangedEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    return eventId;
  };

  /**
   * =================================================================================================================
   * DragBox
   * =================================================================================================================
   */
  setDragBoxEnabled = (dragBoxEnabled: boolean) => {
    this._dragBoxEnabled = dragBoxEnabled;
  };
  isDragBoxEnabled = () => {
    return this._dragBoxEnabled;
  };
  private _dragBoxPath: GeoLatLngType[] = [];
  addDragBoxDragStartEventListener = (
    listener: (event: google.maps.MapMouseEvent, latLng: GeoLatLngType) => void,
  ) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.DRAG_START);
    this._dragBoxDragStartEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    return eventId;
  };
  addDragBoxDragEventListener = (
    listener: (
      event: google.maps.MapMouseEvent,
      latLng: GeoLatLngType,
      latLngBefore: GeoLatLngType,
      latLngStart: GeoLatLngType,
      dragBoxPath: GeoLatLngType[],
    ) => void,
  ) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.DRAG);
    this._dragBoxDragEventListenerManager.addEventListener(eventId, listener);
    return eventId;
  };
  addDragBoxDragEndEventListener = (
    listener: (
      event: google.maps.MapMouseEvent,
      bounds: google.maps.LatLngBounds,
      latLng: GeoLatLngType,
      latLngStart: GeoLatLngType,
      dragBoxPath: GeoLatLngType[],
    ) => void,
  ) => {
    const eventId = this._createEventId(GeoMapEventNameEnum.DRAG_END);
    this._dragBoxDragEndEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    return eventId;
  };
  invokeDragBoxDragStartEventListener = (
    event: google.maps.MapMouseEvent,
    latLng: GeoLatLngType,
  ) => {
    if (!this._dragBoxEnabled) {
      return false;
    }
    this._dragBoxPath = [{ lat: latLng.lat, lng: latLng.lng }];
    this._dragBoxDragStartEventListenerManager.invokeEventListeners(
      event,
      latLng,
    );
    return true;
  };
  invokeDragBoxDragEventListeners = (
    event: google.maps.MapMouseEvent,
    latLng: GeoLatLngType,
    latLngBefore: GeoLatLngType,
    latLngStart: GeoLatLngType,
  ) => {
    if (!this._dragBoxEnabled) {
      return false;
    }
    this._dragBoxPath.push({ lat: latLng.lat, lng: latLng.lng });
    this._dragBoxDragEventListenerManager.invokeEventListeners(
      event,
      latLng,
      latLngBefore,
      latLngStart,
      this._dragBoxPath,
    );
    return true;
  };

  invokeDragBoxDragEndEventListeners = (
    event: google.maps.MapMouseEvent,
    latLng: GeoLatLngType,
    latLngStart: GeoLatLngType,
  ) => {
    if (!this._dragBoxEnabled) {
      return false;
    }
    const bounds = new google.maps.LatLngBounds(
      GeoMapUtils.makeBoundsFromPositions(latLngStart, latLng),
    );
    this._dragBoxDragEndEventListenerManager.invokeEventListeners(
      event,
      bounds,
      latLng,
      latLngStart,
      this._dragBoxPath,
    );
    return true;
  };

  destroy = () => {
    this.clearEventListeners();
  };

  private _mapEventLogger = (
    event: google.maps.MapMouseEvent,
    eventName: string,
  ) => {
    const mapEvent = event.domEvent as MouseEvent;
    const latlng = event.latLng?.toJSON();
    console.log(`QA_MODE:: GoogleMap:: ${eventName}`);
    console.table({
      pageX: mapEvent.pageX,
      pageY: mapEvent.pageY,
      lat: latlng?.lat,
      lng: latlng?.lng,
    });
  };
}

export class GeoMapEventRemover {
  private _mapEventManager: GeoMapEventManager;
  private _eventIdSet: Set<string> = new Set();

  constructor(mapEventManager: GeoMapEventManager) {
    this._mapEventManager = mapEventManager;
  }

  addEventId = (eventId: string) => {
    this._eventIdSet.add(eventId);
  };

  deleteEventId = (eventId: string) => {
    this._eventIdSet.delete(eventId);
  };

  removeAllEvents = () => {
    this._eventIdSet.forEach((eventId) => {
      this._mapEventManager.removeEventListener(eventId);
    });
    this._eventIdSet.clear();
  };

  destroy = () => {
    this.removeAllEvents();
  };
}

export default GeoMapEventManager;
