import EventListenerManager from '@design-system/geo-map/event/EventListenerManager';
import GeoNode from '@design-system/geo-map/feature/GeoNode';
import GeoWay from '@design-system/geo-map/feature/GeoWay';
import GeoLineSegment from '@design-system/geo-map/line-segment/GeoLineSegment';
import { MarkerIdType } from '@design-system/geo-map/marker/GeoMarker';
import { GeoLatLngType } from '@design-system/types/geoMap.type';
import IdGenerator, {
  GenIdType,
} from '@design-system/utils/geo-map/IdGenerator';

export enum GeoNotificationEventEnum {
  // map
  MAP_CENTER_CHANGED = 'map_center_changed',
  MAP_HEADING_CHANGED = 'map_heading_changed',
  MAP_BOUNDS_CHANGED_DEBOUNCE = 'map_bounds_changed_debounce',
  MAP_DRAG = 'map_drag',
  MAP_CLICK = 'map_click',
  STREET_VIEW_POSITION_CHANGED = 'street_view_position_changed',
  STREET_VIEW_VISIBLE = 'street_view_visible',
  STREET_VIEW_NOT_FOUND_VIEW = 'street_view_not_found_view',
  // layer
  LAYER_IS_EDITED_CHANGED = 'layer_is_edited_changed',
  // marker
  MARKER_ADDED = 'marker_added',
  MARKER_DELETED = 'marker_deleted',
  MARKER_CLICK = 'marker_click',
  MARKER_MOUSE_ENTER = 'marker_enter',
  MARKER_MOUSE_LEAVE = 'marker_leave',
  MARKER_ACTIVATED = 'marker_activated',
  MARKER_SIMPLIFY = 'marker_simplify',
  MARKER_CHANGE_POSITION = 'marker_change_position',
  // lineSegment
  LINE_SEGMENT_CLICK_POSITION = 'line_segment_click_position',
  // way
  WAY_ACTIVATED = 'way_activated',
  WAY_TAGS_CHANGED = 'way_tags_changed',
  // history
  HISTORY_IS_UNDO_ENABLED = 'history_is_undo_enabled',
  HISTORY_IS_REDO_ENABLED = 'history_is_redo_enabled',
}

class NotificationEventManager {
  private _idGenerator: IdGenerator = new IdGenerator();
  private _createEventId = (eventName: string) => {
    return JSON.stringify({
      type: 'notification_event',
      eventName,
      id: this._idGenerator.getNextId(),
    });
  };

  // map
  private _mapHeadingChangedEventManager: EventListenerManager<
    string,
    (heading: number) => void
  > = new EventListenerManager();
  private _mapCenterChangedEventManager: EventListenerManager<
    string,
    (center: GeoLatLngType) => void
  > = new EventListenerManager();
  private _mapBoundsChangedDebounceEventManager: EventListenerManager<
    string,
    (bounds: google.maps.LatLngBounds) => void
  > = new EventListenerManager();
  private _streetViewPositionChangedEventListenerManager: EventListenerManager<
    string,
    (position: GeoLatLngType) => void
  > = new EventListenerManager();
  private _streetViewVisibleEventListenerManager: EventListenerManager<
    string,
    (visible: boolean) => void
  > = new EventListenerManager();
  private _streetViewNotFoundViewEventListenerManager: EventListenerManager<
    string,
    () => void
  > = new EventListenerManager();
  private _markerAddedEventManager: EventListenerManager<
    string,
    (layerId: GenIdType, markerId: MarkerIdType) => void
  > = new EventListenerManager();
  private _markerDeletedEventManager: EventListenerManager<
    string,
    (layerId: GenIdType, markerId: MarkerIdType) => void
  > = new EventListenerManager();
  private _mapDragStartEventManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _mapDragEventManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _mapDragEndEventManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _mapClickEventManager: EventListenerManager<
    string,
    (event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  // layer
  private _featureEditedEventListenerManager: EventListenerManager<
    string,
    (layerId: GenIdType, isEdit: boolean) => void
  > = new EventListenerManager();

  // marker
  private _markerActivatedEventManager: EventListenerManager<
    string,
    (layerId: GenIdType, markerId: MarkerIdType, isActivated: boolean) => void
  > = new EventListenerManager();
  private _markerSimplifyEventManager: EventListenerManager<
    string,
    (layerId: GenIdType, markerId: MarkerIdType, isSimplify: boolean) => void
  > = new EventListenerManager();
  private _markerClickEventManager: EventListenerManager<
    string,
    (layerId: GenIdType, markerId: MarkerIdType) => void
  > = new EventListenerManager();
  private _markerMouseEnterEventManager: EventListenerManager<
    string,
    (layerId: GenIdType, markerId: MarkerIdType) => void
  > = new EventListenerManager();
  private _markerMouseLeaveEventManager: EventListenerManager<
    string,
    (layerId: GenIdType, markerId: MarkerIdType) => void
  > = new EventListenerManager();
  private _markerChangePositionEventManager: EventListenerManager<
    string,
    (
      layerId: GenIdType,
      markerId: MarkerIdType,
      position: GeoLatLngType,
    ) => void
  > = new EventListenerManager();

  //lineSegment
  private _lineSegmentClickEventManager: EventListenerManager<
    string,
    (
      layerId: GenIdType,
      lineSegment: GeoLineSegment,
      event: google.maps.MapMouseEvent,
    ) => void
  > = new EventListenerManager();
  private _lineSegmentDirectionsVisibleChangeStickyEventListenerManager: EventListenerManager<
    string,
    (layerId: GenIdType, visibleNew: boolean) => void
  > = new EventListenerManager();

  //history
  private _isHistoryUndoEnabledChangedEventListenerManager: EventListenerManager<
    string,
    (layerId: GenIdType, isUndoEnabled: boolean) => void
  > = new EventListenerManager();
  private _isHistoryRedoEnabledChangedEventListenerManager: EventListenerManager<
    string,
    (layerId: GenIdType, isRedoEnabled: boolean) => void
  > = new EventListenerManager();

  invokeMapCenterChangedEventListener = (center: GeoLatLngType) => {
    this._mapCenterChangedEventManager.invokeEventListeners(center);
  };

  addMapCenterChangedEventListener = (
    listener: (center: GeoLatLngType) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.MAP_CENTER_CHANGED,
    );
    this._mapCenterChangedEventManager.addEventListener(eventId, listener);
    return eventId;
  };

  removeMapCenterChangedEventListener = (key: string) => {
    return this._mapCenterChangedEventManager.removeEventListener(key);
  };

  invokeMapHeadingChangedEventListener = (heading: number) => {
    this._mapHeadingChangedEventManager.invokeEventListeners(heading);
  };

  addMapHeadingChangedEventListener = (listener: (heading: number) => void) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.MAP_HEADING_CHANGED,
    );
    this._mapHeadingChangedEventManager.addEventListener(eventId, listener);
    return eventId;
  };

  removeMapHeadingChangedEventListener = (key: string) => {
    return this._mapHeadingChangedEventManager.removeEventListener(key);
  };

  invokeMapBoundsChangedDebounceEventListener = (
    googleBounds: google.maps.LatLngBounds,
  ) => {
    this._mapBoundsChangedDebounceEventManager.invokeDebounceEventListeners(
      googleBounds,
    );
  };

  addMapBoundsChangedDebounceEventListener = (
    listener: (googleBounds: google.maps.LatLngBounds) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.MAP_BOUNDS_CHANGED_DEBOUNCE,
    );
    this._mapBoundsChangedDebounceEventManager.addEventListener(
      eventId,
      listener,
    );
    return eventId;
  };

  removeMapBoundsChangedDebounceEventListener = (key: string) => {
    return this._mapBoundsChangedDebounceEventManager.removeEventListener(key);
  };

  invokeMapDragStartEventListener = (event: google.maps.MapMouseEvent) => {
    this._mapDragStartEventManager.invokeEventListeners(event);
  };

  addMapDragStartEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoNotificationEventEnum.MAP_DRAG);
    this._mapDragStartEventManager.addEventListener(eventId, listener);
    return eventId;
  };

  removeMapDragStartEventListener = (key: string) => {
    return this._mapDragStartEventManager.removeEventListener(key);
  };

  invokeMapDragEventListener = (event: google.maps.MapMouseEvent) => {
    this._mapDragEventManager.invokeEventListeners(event);
  };
  addMapDragEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoNotificationEventEnum.MAP_DRAG);
    this._mapDragEventManager.addEventListener(eventId, listener);
    return eventId;
  };
  removeMapDragEventListener = (key: string) => {
    return this._mapDragEventManager.removeEventListener(key);
  };

  invokeMapDragEndEventListener = (event: google.maps.MapMouseEvent) => {
    this._mapDragEndEventManager.invokeEventListeners(event);
  };
  addMapDragEndEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoNotificationEventEnum.MAP_DRAG);
    this._mapDragEndEventManager.addEventListener(eventId, listener);
    return eventId;
  };
  removeMapDragEndEventListener = (key: string) => {
    return this._mapDragEndEventManager.removeEventListener(key);
  };

  invokeMapClickEventListener = (event: google.maps.MapMouseEvent) => {
    this._mapClickEventManager.invokeEventListeners(event);
  };

  addMapClickEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    const eventId = this._createEventId(GeoNotificationEventEnum.MAP_CLICK);
    this._mapClickEventManager.addEventListener(eventId, listener);
    return eventId;
  };

  removeMapClickEventListener = (key: string) => {
    return this._mapClickEventManager.removeEventListener(key);
  };

  invokeStreetViewPositionChangedEventListener = (position: GeoLatLngType) => {
    this._streetViewPositionChangedEventListenerManager.invokeEventListeners(
      position,
    );
  };

  addStreetViewPositionChangedEventListener = (
    listener: (position: GeoLatLngType) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.STREET_VIEW_POSITION_CHANGED,
    );
    this._streetViewPositionChangedEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    return eventId;
  };

  removeStreetViewPositionChangedEventListener = (key: string) => {
    return this._streetViewPositionChangedEventListenerManager.removeEventListener(
      key,
    );
  };

  invokeStreetViewVisibleEventListener = (visible: boolean) => {
    this._streetViewVisibleEventListenerManager.invokeEventListeners(visible);
  };

  addStreetViewVisibleEventListener = (
    listener: (visible: boolean) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.STREET_VIEW_VISIBLE,
    );
    this._streetViewVisibleEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    return eventId;
  };

  removeStreetViewVisibleEventListener = (key: string) => {
    return this._streetViewVisibleEventListenerManager.removeEventListener(key);
  };

  invokeStreetViewNotFoundViewEventListener = () => {
    this._streetViewNotFoundViewEventListenerManager.invokeEventListeners();
  };

  addStreetViewViewNotFoundViewClickEventListener = (listener: () => void) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.STREET_VIEW_NOT_FOUND_VIEW,
    );
    this._streetViewNotFoundViewEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    return eventId;
  };

  removeStreetViewViewNotFoundViewClickEventListener = (key: string) => {
    return this._streetViewNotFoundViewEventListenerManager.removeEventListener(
      key,
    );
  };
  /**
   * ===============================================================================================
   * Layer
   * ===============================================================================================
   */
  invokeFeatureEditedEventListener = (
    layerId: GenIdType,
    isFeatureEdited: boolean,
  ) => {
    this._featureEditedEventListenerManager.invokeEventListeners(
      layerId,
      isFeatureEdited,
    );
  };
  addFeatureEditedEventListener = (
    listener: (layerId: GenIdType, isFeatureEdited: boolean) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.LAYER_IS_EDITED_CHANGED,
    );
    this._featureEditedEventListenerManager.addEventListener(eventId, listener);
  };
  removeFeatureEditedEventListener = (key: string) => {
    return this._featureEditedEventListenerManager.removeEventListener(key);
  };
  /**
   * ===============================================================================================
   * Marker
   * ===============================================================================================
   */
  addMarkerAddedEventListener = (
    listener: (layerId: GenIdType, markerId: MarkerIdType) => void,
  ) => {
    const eventId = this._createEventId(GeoNotificationEventEnum.MARKER_ADDED);
    this._markerAddedEventManager.addEventListener(eventId, listener);
    return eventId;
  };

  removeMarkerAddedEventListener = (key: string) => {
    return this._markerAddedEventManager.removeEventListener(key);
  };

  invokeMarkerAddedEventListener = (
    layerId: GenIdType,
    markerId: MarkerIdType,
  ) => {
    this._markerAddedEventManager.invokeEventListeners(layerId, markerId);
  };

  addMarkerDeletedEventListener = (
    listener: (layerId: GenIdType, markerId: MarkerIdType) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.MARKER_DELETED,
    );
    this._markerDeletedEventManager.addEventListener(eventId, listener);
    return eventId;
  };

  removeMarkerDeletedEventListener = (key: string) => {
    return this._markerDeletedEventManager.removeEventListener(key);
  };

  invokeMarkerDeletedEventListeners = (
    layerId: GenIdType,
    markerId: MarkerIdType,
  ) => {
    this._markerDeletedEventManager.invokeEventListeners(layerId, markerId);
  };

  invokeMarkerActivatedEventListener = (
    layerId: GenIdType,
    markerId: MarkerIdType,
    isActivated: boolean,
  ) => {
    this._markerActivatedEventManager.invokeEventListeners(
      layerId,
      markerId,
      isActivated,
    );
  };

  addMarkerActivatedEventListener = (
    listener: (
      layerId: GenIdType,
      markerId: MarkerIdType,
      isActivated: boolean,
    ) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.MARKER_ACTIVATED,
    );
    this._markerActivatedEventManager.addEventListener(eventId, listener);
    return eventId;
  };

  removeMarkerActivatedEventListener = (key: string) => {
    return this._markerActivatedEventManager.removeEventListener(key);
  };

  invokeMarkerSimplifyEventListener = (
    layerId: GenIdType,
    markerId: MarkerIdType,
    isSimplify: boolean,
  ) => {
    this._markerSimplifyEventManager.invokeEventListeners(
      layerId,
      markerId,
      isSimplify,
    );
  };

  addMarkerSimplifyEventListener = (
    listener: (
      layerId: GenIdType,
      markerId: MarkerIdType,
      isSimplify: boolean,
    ) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.MARKER_SIMPLIFY,
    );
    this._markerSimplifyEventManager.addEventListener(eventId, listener);
    return eventId;
  };

  removeMarkerSimplifyEventListener = (key: string) => {
    return this._markerSimplifyEventManager.removeEventListener(key);
  };

  invokeMarkerClickEventListener = (
    layerId: GenIdType,
    markerId: MarkerIdType,
  ) => {
    this._markerClickEventManager.invokeEventListeners(layerId, markerId);
  };

  addMarkerClickEventListener = (
    listener: (layerId: GenIdType, markerId: MarkerIdType) => void,
  ) => {
    const eventId = this._createEventId(GeoNotificationEventEnum.MARKER_CLICK);
    this._markerClickEventManager.addEventListener(eventId, listener);
    return eventId;
  };

  removeMarkerClickEventListener = (key: string) => {
    return this._markerClickEventManager.removeEventListener(key);
  };

  invokeMarkerMouseEnterEventListener = (
    layerId: GenIdType,
    markerId: MarkerIdType,
  ) => {
    this._markerMouseEnterEventManager.invokeEventListeners(layerId, markerId);
  };

  addMarkerMouseEnterEventListener = (
    listener: (layerId: GenIdType, markerId: MarkerIdType) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.MARKER_MOUSE_ENTER,
    );
    this._markerMouseEnterEventManager.addEventListener(eventId, listener);
    return eventId;
  };

  removeMarkerMouseEnterEventListener = (key: string) => {
    return this._markerMouseEnterEventManager.removeEventListener(key);
  };

  invokeMarkerMouseLeaveEventListener = (
    layerId: GenIdType,
    markerId: MarkerIdType,
  ) => {
    this._markerMouseLeaveEventManager.invokeEventListeners(layerId, markerId);
  };

  addMarkerMouseLeaveEventListener = (
    listener: (layerId: GenIdType, markerId: MarkerIdType) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.MARKER_MOUSE_LEAVE,
    );
    this._markerMouseLeaveEventManager.addEventListener(eventId, listener);
    return eventId;
  };

  removeMarkerMouseLeaveEventListener = (key: string) => {
    return this._markerMouseLeaveEventManager.removeEventListener(key);
  };

  invokeMarkerChangePositionEventListener = (
    layerId: GenIdType,
    markerId: MarkerIdType,
    position: GeoLatLngType,
  ) => {
    this._markerChangePositionEventManager.invokeEventListeners(
      layerId,
      markerId,
      position,
    );
  };

  addMarkerChangePositionEventListener = (
    listener: (
      layerId: GenIdType,
      markerId: MarkerIdType,
      position: GeoLatLngType,
    ) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.MARKER_CHANGE_POSITION,
    );
    this._markerChangePositionEventManager.addEventListener(eventId, listener);
    return eventId;
  };

  removeMarkerChangePositionEventListener = (key: string) => {
    return this._markerChangePositionEventManager.removeEventListener(key);
  };

  /**
   * ===============================================================================================
   * LineSegment
   * ===============================================================================================
   */
  invokeLineSegmentClickEventListener = (
    layerId: GenIdType,
    lineSegment: GeoLineSegment,
    event: google.maps.MapMouseEvent,
  ) => {
    this._lineSegmentClickEventManager.invokeEventListeners(
      layerId,
      lineSegment,
      event,
    );
  };
  addLineSegmentClickEventListener = (
    listener: (
      layerId: GenIdType,
      lineSegment: GeoLineSegment,
      event: google.maps.MapMouseEvent,
    ) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.LINE_SEGMENT_CLICK_POSITION,
    );
    this._lineSegmentClickEventManager.addEventListener(eventId, listener);
    return eventId;
  };
  removeLineSegmentClickEventListener = (key: string) => {
    return this._lineSegmentClickEventManager.removeEventListener(key);
  };

  invokeLineSegmentDirectionsVisibleChangeStickyEventListener = (
    layerId: GenIdType,
    visibleNew: boolean,
  ) => {
    this._lineSegmentDirectionsVisibleChangeStickyEventListenerManager.invokeEventListeners(
      layerId,
      visibleNew,
    );
  };
  addLineSegmentDirectionsVisibleChangeStickyEventListener = (
    listener: (layerId: GenIdType, visibleNew: boolean) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.LINE_SEGMENT_CLICK_POSITION,
    );
    this._lineSegmentDirectionsVisibleChangeStickyEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    return eventId;
  };
  removeLineSegmentDirectionsVisibleChangeStickyEventListener = (
    key: string,
  ) => {
    return this._lineSegmentDirectionsVisibleChangeStickyEventListenerManager.removeEventListener(
      key,
    );
  };

  /**
   * ===============================================================================================
   * Node
   * ===============================================================================================
   */
  /**
   * Node의 enabled가 변경되었을 때 발생하는 이벤트
   */
  private _nodeEnabledChangedEventManager: EventListenerManager<
    string,
    (layerId: GenIdType, node: GeoNode, enabledNew: boolean) => void
  > = new EventListenerManager();
  addNodeEnabledChangedEventListener = (
    listener: (layerId: GenIdType, node: GeoNode, enabledNew: boolean) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.WAY_TAGS_CHANGED,
    );
    this._nodeEnabledChangedEventManager.addEventListener(eventId, listener);
    return eventId;
  };
  removeNodeEnabledChangedEventListener = (key: string) => {
    return this._nodeEnabledChangedEventManager.removeEventListener(key);
  };
  invokeNodeEnabledChangedEventListener = (
    layerId: GenIdType,
    node: GeoNode,
    enabledNew: boolean,
  ) => {
    this._nodeEnabledChangedEventManager.invokeEventListeners(
      layerId,
      node,
      enabledNew,
    );
  };
  /**
   * Node들의 enabled가 변경되었을 때 발생하는 이벤트
   */
  private _nodesEnabledChangedDebounceEventListenerManager: EventListenerManager<
    string,
    (
      layerId: GenIdType,
      nodeMap: Readonly<Map<GeoNode, boolean>>,
      nodesEnabledSet: Readonly<Set<GeoNode>>,
    ) => void
  > = new EventListenerManager();
  addNodesEnabledChangedDebounceEventListener = (
    listener: (
      layerId: GenIdType,
      nodeMap: Readonly<Map<GeoNode, boolean>>,
      nodesEnabledSet: Readonly<Set<GeoNode>>,
    ) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.WAY_TAGS_CHANGED,
    );
    this._nodesEnabledChangedDebounceEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    return eventId;
  };
  removeNodesEnabledChangedDebounceEventListener = (key: string) => {
    return this._nodesEnabledChangedDebounceEventListenerManager.removeEventListener(
      key,
    );
  };
  invokeNodesEnabledChangedDebounceEventListener = (
    layerId: GenIdType,
    nodeMap: Readonly<Map<GeoNode, boolean>>,
    nodesEnabledSet: Readonly<Set<GeoNode>>,
  ) => {
    this._nodesEnabledChangedDebounceEventListenerManager.invokeEventListeners(
      layerId,
      nodeMap,
      nodesEnabledSet,
    );
  };

  /**
   * ===============================================================================================
   * Way
   * ===============================================================================================
   */
  /**
   * Way가 활성화 되었을 때 발생하는 이벤트
   */
  private _wayActivatedEventManager: EventListenerManager<
    string,
    (
      layerId: GenIdType,
      way: GeoWay,
      isActivated: boolean,
      waysActivated: GeoWay[],
    ) => void
  > = new EventListenerManager();
  addWayActivatedEventListener = (
    listener: (
      layerId: GenIdType,
      way: GeoWay,
      isActivated: boolean,
      waysActivated: GeoWay[],
    ) => void,
  ) => {
    const eventId = this._createEventId(GeoNotificationEventEnum.WAY_ACTIVATED);
    this._wayActivatedEventManager.addEventListener(eventId, listener);
    return eventId;
  };
  removeWayActivatedEventListener = (key: string) => {
    return this._wayActivatedEventManager.removeEventListener(key);
  };
  invokeWayActivatedEventListener = (
    layerId: GenIdType,
    way: GeoWay,
    isActivated: boolean,
    waysActivated: GeoWay[],
  ) => {
    this._wayActivatedEventManager.invokeEventListeners(
      layerId,
      way,
      isActivated,
      waysActivated,
    );
  };
  /**
   * Way의 tags가 변경되었을 때 발생하는 이벤트
   */
  private _wayTagsChangedEventManager: EventListenerManager<
    string,
    (layerId: GenIdType, way: GeoWay) => void
  > = new EventListenerManager();
  addWayTagsChangedEventListener = (
    listener: (layerId: GenIdType, way: GeoWay) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.WAY_TAGS_CHANGED,
    );
    this._wayTagsChangedEventManager.addEventListener(eventId, listener);
    return eventId;
  };
  removeWayTagsChangedEventListener = (key: string) => {
    return this._wayTagsChangedEventManager.removeEventListener(key);
  };
  invokeWayTagsChangedEventListener = (layerId: GenIdType, way: GeoWay) => {
    this._wayTagsChangedEventManager.invokeEventListeners(layerId, way);
  };
  /**
   * Way의 enabled가 변경되었을 때 발생하는 이벤트
   */
  private _wayEnabledChangedEventManager: EventListenerManager<
    string,
    (layerId: GenIdType, way: GeoWay, enabledNew: boolean) => void
  > = new EventListenerManager();
  addWayEnabledChangedEventListener = (
    listener: (layerId: GenIdType, way: GeoWay, enabledNew: boolean) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.WAY_TAGS_CHANGED,
    );
    this._wayEnabledChangedEventManager.addEventListener(eventId, listener);
    return eventId;
  };
  removeWayEnabledChangedEventListener = (key: string) => {
    return this._wayEnabledChangedEventManager.removeEventListener(key);
  };
  invokeWayEnabledChangedEventListener = (
    layerId: GenIdType,
    way: GeoWay,
    enabledNew: boolean,
  ) => {
    this._wayEnabledChangedEventManager.invokeEventListeners(
      layerId,
      way,
      enabledNew,
    );
  };
  /**
   * Way들의 enabled가 변경되었을 때 발생하는 이벤트
   */
  private _waysEnabledChangedDebounceEventListenerManager: EventListenerManager<
    string,
    (
      layerId: GenIdType,
      wayMap: Readonly<Map<GeoWay, boolean>>,
      waysEnabledSet: Readonly<Set<GeoWay>>,
    ) => void
  > = new EventListenerManager();
  addWaysEnabledChangedDebounceEventListener = (
    listener: (
      layerId: GenIdType,
      wayMap: Readonly<Map<GeoWay, boolean>>,
      waysEnabledSet: Readonly<Set<GeoWay>>,
    ) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.WAY_TAGS_CHANGED,
    );
    this._waysEnabledChangedDebounceEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    return eventId;
  };
  removeWaysEnabledChangedDebounceEventListener = (key: string) => {
    return this._waysEnabledChangedDebounceEventListenerManager.removeEventListener(
      key,
    );
  };
  invokeWaysEnabledChangedDebounceEventListener = (
    layerId: GenIdType,
    wayMap: Readonly<Map<GeoWay, boolean>>,
    waysEnabledSet: Readonly<Set<GeoWay>>,
  ) => {
    this._waysEnabledChangedDebounceEventListenerManager.invokeEventListeners(
      layerId,
      wayMap,
      waysEnabledSet,
    );
  };

  addIsHistoryUndoEnabledChangedEventListener = (
    listener: (layerId: GenIdType, isEnabled: boolean) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.HISTORY_IS_UNDO_ENABLED,
    );
    this._isHistoryUndoEnabledChangedEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    return eventId;
  };
  removeIsHistoryUndoEnabledChangedEventListener =
    this._isHistoryUndoEnabledChangedEventListenerManager.removeEventListener;
  invokeIsHistoryUndoEnabledChangedEventListener =
    this._isHistoryUndoEnabledChangedEventListenerManager.invokeEventListeners;

  addIsHistoryRedoEnabledChangedEventListener = (
    listener: (layerId: GenIdType, isEnabled: boolean) => void,
  ) => {
    const eventId = this._createEventId(
      GeoNotificationEventEnum.HISTORY_IS_REDO_ENABLED,
    );
    this._isHistoryRedoEnabledChangedEventListenerManager.addEventListener(
      eventId,
      listener,
    );
    return eventId;
  };
  removeIsHistoryRedoEnabledChangedEventListener =
    this._isHistoryRedoEnabledChangedEventListenerManager.removeEventListener;
  invokeIsHistoryRedoEnabledChangedEventListener =
    this._isHistoryRedoEnabledChangedEventListenerManager.invokeEventListeners;

  clearEventListeners = () => {
    this._mapHeadingChangedEventManager.clear();
    this._mapCenterChangedEventManager.clear();
    this._mapBoundsChangedDebounceEventManager.clear();
    this._streetViewPositionChangedEventListenerManager.clear();

    this._markerAddedEventManager.clear();
    this._markerDeletedEventManager.clear();
    this._mapDragStartEventManager.clear();
    this._mapDragEventManager.clear();
    this._mapDragEndEventManager.clear();
    this._mapClickEventManager.clear();

    this._featureEditedEventListenerManager.clear();

    this._markerActivatedEventManager.clear();
    this._markerSimplifyEventManager.clear();
    this._markerClickEventManager.clear();
    this._markerMouseEnterEventManager.clear();
    this._markerMouseLeaveEventManager.clear();
    this._markerChangePositionEventManager.clear();

    this._lineSegmentClickEventManager.clear();

    this._isHistoryRedoEnabledChangedEventListenerManager.clear();
    this._isHistoryUndoEnabledChangedEventListenerManager.clear();
  };

  destroy = () => {
    this.clearEventListeners();
  };
}

export default NotificationEventManager;
