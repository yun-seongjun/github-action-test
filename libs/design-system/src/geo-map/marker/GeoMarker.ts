import EventListenerManager from '@design-system/geo-map/event/EventListenerManager';
import GeoMapEventManager from '@design-system/geo-map/event/GeoMapEventManager';
import GeoNode from '@design-system/geo-map/feature/GeoNode';
import { theme } from '@design-system/root/tailwind.config';
import { GeoLatLngType } from '@design-system/types/geoMap.type';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';
import { EnvUtils } from '@design-system/utils';

export type MarkerIdType = number | string;
export enum MarkerStatusEnum {
  FIX_ING = 'FIX_ING',
  ACTIVATE = 'ACTIVATE',
  NORMAL = 'NORMAL',
  SIMPLIFY = 'SIMPLIFY',
  SIMPLIFY_FIXING = 'SIMPLIFY_FIXING',
}

export interface GeoMarkerConstructorType {
  id: MarkerIdType;
  map: google.maps.Map;
  position: GeoLatLngType;
  options: {
    isClickable?: boolean;
    isDraggable?: boolean;
    isSimplify?: boolean;
    visible?: boolean;
    markerContentRenderFn: () => HTMLDivElement;
    zIndex: number;
    simplifyContentRenderFn?: () => HTMLDivElement;
    simplifyZIndex?: number;
    markerFixingPositionContentRenderFn?: () => HTMLDivElement;
    fixingPositionPointContentRenderFn?: () => HTMLDivElement;
    fixingPositionZIndex?: number;
    markerActivatedContentRenderFn?: () => HTMLDivElement;
    pointContentRenderFn?: () => HTMLDivElement;
    streetViewNormalMarkerOptions?: Partial<google.maps.MarkerOptions>;
    streetViewFixingMarkerOptions?: Partial<google.maps.MarkerOptions>;
    streetViewActivateMarkerOptions?: Partial<google.maps.MarkerOptions>;
  };
  mapEventManager: GeoMapEventManager;
}

export interface GeoMarkerOptionsType extends Omit<
  GeoMarkerConstructorType,
  'map' | 'notificationEventManager' | 'id' | 'mapEventManager'
> {
  id?: MarkerIdType;
}

export enum GeoMarkerEventNameEnum {
  DRAG_START = 'dragstart',
  DRAG = 'drag',
  DRAG_END = 'dragend',
  CLICK = 'click',
  MOUSE_DOWN = 'mousedown',
  MOUSE_UP = 'mouseup',
  TOUCH_START = 'touchstart',
  TOUCH_END = 'touchend',
  MOUSE_LEAVE = 'mouseleave',
  MOUSE_ENTER = 'mouseenter',
  // CUSTOM event
  POSITION_CHANGE = 'positionchange',
}

/**
 * simplifyContentRenderFn이 없으면, isSimplify와 관계 없이 항상 markerContentRenderFn 형상으로 보여짐
 */
class GeoMarker {
  private readonly _id: MarkerIdType;
  private readonly _map: google.maps.Map;
  private _marker: GeoNode;
  private _visible?: boolean;
  private _point?: google.maps.marker.AdvancedMarkerElement;
  private _pointContent?: HTMLDivElement;
  private _isSimplify = false;
  private _isDragging = false;
  private _isActivated = false;
  private _isFixingPosition = false;
  private _isClickable: GeoMarkerConstructorType['options']['isClickable'];
  private _isDraggable: GeoMarkerConstructorType['options']['isDraggable'];
  private _markerContentRenderFn: GeoMarkerConstructorType['options']['markerContentRenderFn'];
  private _zIndex: GeoMarkerConstructorType['options']['zIndex'];
  private _pointContentRenderFn: GeoMarkerConstructorType['options']['pointContentRenderFn'];
  private _simplifyContentRenderFn: GeoMarkerConstructorType['options']['simplifyContentRenderFn'];
  private _simplifyZIndex: GeoMarkerConstructorType['options']['simplifyZIndex'];
  private _markerActivatedContentRenderFn: GeoMarkerConstructorType['options']['markerActivatedContentRenderFn'];
  private _streetViewNormalMarkerOptions: GeoMarkerConstructorType['options']['streetViewNormalMarkerOptions'];
  private _streetViewFixingMarkerOptions: GeoMarkerConstructorType['options']['streetViewFixingMarkerOptions'];
  private _streetViewActivateMarkerOptions: GeoMarkerConstructorType['options']['streetViewActivateMarkerOptions'];

  // Todo :: rdh :: 아래 마커의 구조는 외부에서 마커의 모양 구조를 주입해서 렌더링 되도록 수정되어야 합니다.
  private _markerFixingPositionContentRenderFn: GeoMarkerConstructorType['options']['markerFixingPositionContentRenderFn'];
  private _fixingPositionZIndex: GeoMarkerConstructorType['options']['fixingPositionZIndex'];
  private _fixingPositionPointContentRenderFn: GeoMarkerConstructorType['options']['fixingPositionPointContentRenderFn'];
  private _dragStartPosition: GeoLatLngType;

  private readonly _mapEventManager: GeoMapEventManager;

  private _markerMouseEnterEventManager: EventListenerManager<
    string,
    (marker: GeoMarker) => void
  > = new EventListenerManager();
  private _markerMouseLeaveEventManager: EventListenerManager<
    string,
    (marker: GeoMarker) => void
  > = new EventListenerManager();
  private _markerClickEventManager: EventListenerManager<
    string,
    (marker: GeoMarker) => void
  > = new EventListenerManager();
  private _markerDragStartEventManager: EventListenerManager<
    string,
    (marker: GeoMarker, newPosition: GeoLatLngType) => void
  > = new EventListenerManager();
  private _markerDragEventManager: EventListenerManager<
    string,
    (
      marker: GeoMarker,
      oldPosition: GeoLatLngType,
      newPosition: GeoLatLngType,
    ) => void
  > = new EventListenerManager();
  private _markerDragEndEventManager: EventListenerManager<
    string,
    (
      marker: GeoMarker,
      startPosition: GeoLatLngType,
      newPosition: GeoLatLngType,
    ) => void
  > = new EventListenerManager();
  private _markerPositionChangeEventManager: EventListenerManager<
    string,
    (
      marker: GeoMarker,
      positionOld: GeoLatLngType,
      positionNew: GeoLatLngType,
    ) => void
  > = new EventListenerManager();

  // Todo:: rdh :: googleMapStreetView 환경에서 마커를 보여달라는 요청에 의해 급하게 staging에만 돌아갈 기능입니다. 추후 삭제가 필요합니다.
  public overlayMarker: google.maps.Marker;

  private _isMarkerClickEventAdded = false;
  constructor({
    id,
    map,
    position,
    options,
    mapEventManager,
  }: GeoMarkerConstructorType) {
    const {
      isDraggable = false,
      isClickable = true,
      visible = true,
      markerContentRenderFn,
      markerActivatedContentRenderFn,
      markerFixingPositionContentRenderFn,
      fixingPositionZIndex,
      fixingPositionPointContentRenderFn,
      pointContentRenderFn,
      zIndex,
      simplifyZIndex,
      isSimplify = false,
      simplifyContentRenderFn,
      streetViewNormalMarkerOptions,
      streetViewActivateMarkerOptions,
      streetViewFixingMarkerOptions,
    } = options;
    this._map = map;
    this._mapEventManager = mapEventManager;
    this._zIndex = zIndex;
    this._simplifyZIndex = simplifyZIndex;
    this._id = id;
    this._marker = new GeoNode({
      position,
      id: 0,
      options: {
        contentRenderFn:
          isSimplify && simplifyContentRenderFn
            ? simplifyContentRenderFn
            : markerContentRenderFn,
        zIndex: this._zIndex,
        visible,
        opacity: 1,
      },
      googleMap: map,
    });

    this.setVisible(visible);
    this.setIsClickable(isClickable);
    this.setIsDraggable(isDraggable);
    this.setMarkerContent(
      isSimplify && simplifyContentRenderFn
        ? simplifyContentRenderFn
        : markerContentRenderFn,
    );
    this._isSimplify = isSimplify;
    this._markerContentRenderFn = markerContentRenderFn;
    this._markerActivatedContentRenderFn = markerActivatedContentRenderFn;
    this._markerFixingPositionContentRenderFn =
      markerFixingPositionContentRenderFn;
    this._fixingPositionZIndex = fixingPositionZIndex;
    this._fixingPositionPointContentRenderFn =
      fixingPositionPointContentRenderFn;
    this._simplifyContentRenderFn = simplifyContentRenderFn;
    this._pointContentRenderFn = pointContentRenderFn;
    this._streetViewNormalMarkerOptions = streetViewNormalMarkerOptions;
    this._streetViewFixingMarkerOptions = streetViewFixingMarkerOptions;
    this._streetViewActivateMarkerOptions = streetViewActivateMarkerOptions;

    this.overlayMarker = new google.maps.Marker();
    this._streetViewNormalMarkerOptions &&
      this.setStreetViewMarkerContent(this._streetViewNormalMarkerOptions);

    if (this._pointContentRenderFn) {
      this._point = new google.maps.marker.AdvancedMarkerElement({
        position,
        map,
        zIndex: theme.zIndex.map.point,
      });
      this.setPointContent(this._pointContentRenderFn);
    }
    this._dragStartPosition = position;
    const marker = this._marker.getMarker();
    if (!marker) {
      this._isMarkerClickEventAdded = false;
    }

    // 드래그 될 때
    this._mapEventManager.addMouseMoveEventListener((event) => {
      if (!event.latLng || !this._isDragging) return;
      const newPosition = GeoMapUtils.toLatLng(event.latLng);
      this._markerDragEventManager.invokeEventListeners(
        this,
        this.getPosition(),
        newPosition,
      );
      this.setPosition(newPosition);
    });
  }

  private _setMarkerEvents = () => {
    const markerContent = this.getMarkerContent();
    if (!markerContent) return;
    this._addBaseClickEventListener();
    this._isMarkerClickEventAdded = true;
    markerContent.addEventListener(GeoMarkerEventNameEnum.MOUSE_ENTER, () => {
      this._markerMouseEnterEventManager.invokeEventListeners(this);
    });
    markerContent.addEventListener(GeoMarkerEventNameEnum.MOUSE_LEAVE, () => {
      this._markerMouseLeaveEventManager.invokeEventListeners(this);
    });

    const dragStartListener = (event: Event) => {
      if (!this._isDraggable) return;
      this.setIsDragging(true);
      const newPosition = GeoMapUtils.eventToLatLng(event, this._map);
      if (newPosition) {
        this.setDragStartPosition(newPosition);
        this._markerDragStartEventManager.invokeEventListeners(
          this,
          newPosition,
        );
      }
    };
    // dragEnd시 GeoMarkerManager에게 현재 드래깅 중인 노드 초기화
    const dragEndListener = (event: Event) => {
      if (!this._isDraggable) return;
      this.setIsDragging(false);
      const newPosition = GeoMapUtils.eventToLatLng(event, this._map);
      if (newPosition) {
        this._markerDragEndEventManager.invokeEventListeners(
          this,
          this.getDragStartPosition(),
          newPosition,
        );
      }
    };

    markerContent.addEventListener(
      GeoMarkerEventNameEnum.TOUCH_START,
      dragStartListener,
    );
    markerContent.addEventListener(
      GeoMarkerEventNameEnum.MOUSE_DOWN,
      dragStartListener,
    );
    markerContent.addEventListener(
      GeoMarkerEventNameEnum.TOUCH_END,
      dragEndListener,
    );
    markerContent.addEventListener(
      GeoMarkerEventNameEnum.MOUSE_UP,
      dragEndListener,
    );
  };

  getMarkerContent = () => {
    return this._marker.getMarkerContent();
  };

  setMarkerContent = (markerContentRenderFn: () => HTMLDivElement) => {
    this._marker.setContent({ contentRenderFn: markerContentRenderFn });
    this._setMarkerEvents();
    return;
  };

  getZIndex = () => {
    return this._marker.getZIndex();
  };

  setZIndex = (zIndex: number) => {
    this._marker.setZIndex(zIndex);
  };

  getPointContent = () => {
    return this._pointContent;
  };

  setPointContent = (pointContentRenderFn: () => HTMLDivElement) => {
    if (!this._point) {
      console.log('INFO:: this._point가 없습니다.');
      return;
    }
    this._pointContent = pointContentRenderFn();
    this._point.content = this._pointContent;
  };

  setPointZIndex = (pointZIndex: number) => {
    if (!this._point) {
      console.log('INFO:: this._point가 없습니다.');
      return;
    }
    this._point.zIndex = pointZIndex;
  };

  setOptions = (options: Omit<GeoMarkerOptionsType, 'id'>) => {
    const {
      position,
      options: {
        isDraggable = this._isDraggable,
        isClickable = this._isClickable,
        visible = this._visible,
        markerContentRenderFn = this._markerContentRenderFn,
        zIndex = this._zIndex,
        simplifyZIndex = this._simplifyZIndex,
        isSimplify = this._isSimplify,
        simplifyContentRenderFn = this._simplifyContentRenderFn,
        markerActivatedContentRenderFn = this._markerActivatedContentRenderFn,
        markerFixingPositionContentRenderFn = this
          ._markerFixingPositionContentRenderFn,
        fixingPositionZIndex = this._fixingPositionZIndex,
        fixingPositionPointContentRenderFn = this
          ._fixingPositionPointContentRenderFn,
        pointContentRenderFn = this._pointContentRenderFn,
      },
    } = options;
    this.setPosition(position);
    isClickable !== undefined && this.setIsClickable(isClickable);
    isDraggable !== undefined && this.setIsDraggable(isDraggable);
    visible !== undefined && this.setVisible(visible);
    this.setMarkerContent(
      isSimplify && simplifyContentRenderFn
        ? simplifyContentRenderFn
        : markerContentRenderFn,
    );
    this.setZIndex(zIndex);
    pointContentRenderFn && this.setPointContent(pointContentRenderFn);
    this.setPointZIndex(theme.zIndex.map.point);
    this._isSimplify = isSimplify;
    this._simplifyZIndex = simplifyZIndex;
    this._simplifyContentRenderFn = simplifyContentRenderFn;
    this._markerContentRenderFn = markerContentRenderFn;
    this._markerActivatedContentRenderFn = markerActivatedContentRenderFn;
    this._markerFixingPositionContentRenderFn =
      markerFixingPositionContentRenderFn;
    this._fixingPositionZIndex = fixingPositionZIndex;
    this._fixingPositionPointContentRenderFn =
      fixingPositionPointContentRenderFn;
    this._pointContentRenderFn = pointContentRenderFn;
    return true;
  };

  setStreetViewMarkerContent = (
    streetViewMarkerOption: Partial<google.maps.MarkerOptions>,
  ) => {
    this.overlayMarker.setOptions({
      position: this.getPosition(),
      ...streetViewMarkerOption,
    });
  };

  getId = () => {
    return this._id;
  };

  /**
   * =========================================================================================================
   * EventListener
   * =========================================================================================================
   */

  invokeClickEventListener = () => {
    if (EnvUtils.isQaMode() || EnvUtils.isDevMode()) {
      this._markerClickLogger(this);
    }
    if (this._isClickable) {
      this._markerClickEventManager.invokeEventListeners(this);
    }
  };

  addMouseLeaveEventListener = (
    key: string,
    listener: (marker: GeoMarker) => void,
  ) => {
    return this._markerMouseLeaveEventManager.addEventListener(key, listener);
  };

  removeMouseLeaveEventListener = (key: string) => {
    this._markerMouseLeaveEventManager.removeEventListener(key);
  };

  addMouseEnterEventListener = (
    key: string,
    listener: (marker: GeoMarker) => void,
  ) => {
    return this._markerMouseEnterEventManager.addEventListener(key, listener);
  };

  removeMouseEnterEventListener = (key: string) => {
    this._markerMouseEnterEventManager.removeEventListener(key);
  };

  addClickEventListener = (
    key: string,
    listener: (marker: GeoMarker) => void,
  ) => {
    return this._markerClickEventManager.addEventListener(key, listener);
  };

  removeClickEventListener = (key: string) => {
    this._markerClickEventManager.removeEventListener(key);
  };

  addDragStartEventListener = (
    key: string,
    listener: (marker: GeoMarker, newPosition: GeoLatLngType) => void,
  ) => {
    return this._markerDragStartEventManager.addEventListener(key, listener);
  };

  removeDragStartEventListener = (key: string) => {
    this._markerDragStartEventManager.removeEventListener(key);
  };

  addDragEventListener = (
    key: string,
    listener: (
      marker: GeoMarker,
      oldPosition: GeoLatLngType,
      newPosition: GeoLatLngType,
    ) => void,
  ) => {
    return this._markerDragEventManager.addEventListener(key, listener);
  };

  removeDragEventListener = (key: string) => {
    this._markerDragEventManager.removeEventListener(key);
  };

  addDragEndEventListener = (
    key: string,
    listener: (
      marker: GeoMarker,
      startPosition: GeoLatLngType,
      newPosition: GeoLatLngType,
    ) => void,
  ) => {
    return this._markerDragEndEventManager.addEventListener(key, listener);
  };

  removeDragEndEventListener = (key: string) => {
    this._markerDragEndEventManager.removeEventListener(key);
  };

  addPositionChangeEventListener = (
    key: string,
    listener: (
      marker: GeoMarker,
      positionOld: GeoLatLngType,
      positionNew: GeoLatLngType,
    ) => void,
  ) => {
    return this._markerPositionChangeEventManager.addEventListener(
      key,
      listener,
    );
  };

  removePositionChangeEventListener = (key: string) => {
    this._markerPositionChangeEventManager.removeEventListener(key);
  };

  /**
   * =========================================================================================================
   * Functions
   * =========================================================================================================
   */

  setVisible = (isVisible: boolean) => {
    if (this._visible === isVisible) return false;
    if (this._point) {
      this._point.map = isVisible ? this._map : null;
    }
    this._visible = isVisible;
    const result = this._marker.setVisible(isVisible);
    if (result) {
      const markerStatus = this._getWillChangeMarkerStatus();
      const renderFn =
        markerStatus && this._getWillChangeMarkerContentFn(markerStatus);
      renderFn && this.setMarkerContent(renderFn);
    }
    return result;
  };

  private _addBaseClickEventListener = () => {
    const marker = this._marker.getMarker();
    if (!marker) return;

    marker.addListener('click', () => {
      const empty = undefined;
    });
    const markerElement = marker.content as HTMLElement;

    const listener = (event?: Event) => {
      const mouseEvent = event as MouseEvent;
      mouseEvent?.stopPropagation();
      mouseEvent?.preventDefault();
      const activeElement = document?.activeElement as HTMLDivElement | null;
      activeElement?.blur();
      this.invokeClickEventListener();
    };

    markerElement?.addEventListener(
      GeoMarkerEventNameEnum.TOUCH_START,
      listener,
    );
    markerElement?.addEventListener(
      GeoMarkerEventNameEnum.MOUSE_DOWN,
      listener,
    );
  };

  isVisible = () => {
    return this._visible;
  };

  setOpacity = (opacity: number) => {
    this._marker.setOpacity(opacity);
    if (this._pointContent) {
      this._pointContent.style.opacity = String(opacity);
    }
  };

  getOpacity = () => {
    return this._marker.getOpacity();
  };

  setPosition = (positionNew: GeoLatLngType) => {
    const positionOld = this._marker.getPosition();
    this._marker.setPosition(positionNew);
    this.overlayMarker.setPosition(positionNew);
    this._markerPositionChangeEventManager.invokeEventListeners(
      this,
      positionOld,
      positionNew,
    );
    if (this._point) {
      this._point.position = positionNew;
    }
  };

  getPosition = () => {
    return this._marker.getPosition();
  };

  setIsClickable = (isClickable: boolean) => {
    if (this._isClickable === isClickable) {
      return;
    }
    this._isClickable = isClickable;
  };

  isClickable = () => {
    return this._marker.isClickable();
  };

  setIsDraggable = (isDraggable: boolean) => {
    if (this._isDraggable === isDraggable) {
      return;
    }
    this._isDraggable = isDraggable;
    if (!isDraggable) {
      this._isDragging = false;
    }
  };

  isDraggable = () => {
    return this._isDraggable;
  };

  isDragging = () => {
    return this._isDragging;
  };

  setIsDragging = (isDragging: boolean) => {
    if (this._isDragging === isDragging) return;
    this._isDragging = isDragging;
  };

  getDragStartPosition = () => {
    return this._dragStartPosition;
  };

  setDragStartPosition = (position: GeoLatLngType) => {
    this._dragStartPosition = position;
  };

  private _getWillChangeMarkerStatus = () => {
    if (this._isActivated && this._isSimplify && !this._isFixingPosition) {
      return MarkerStatusEnum.ACTIVATE;
    }
    if (this._isActivated && this._isSimplify && this._isFixingPosition) {
      return MarkerStatusEnum.SIMPLIFY_FIXING;
    }
    if (this._isActivated && !this._isSimplify && !this._isFixingPosition) {
      return MarkerStatusEnum.ACTIVATE;
    }
    if (this._isActivated && !this._isSimplify && this._isFixingPosition) {
      return MarkerStatusEnum.FIX_ING;
    }
    if (!this._isActivated && this._isSimplify && !this._isFixingPosition) {
      return MarkerStatusEnum.SIMPLIFY;
    }
    if (!this._isActivated && this._isSimplify && this._isFixingPosition) {
      return MarkerStatusEnum.SIMPLIFY_FIXING;
    }
    if (!this._isActivated && !this._isSimplify && !this._isFixingPosition) {
      return MarkerStatusEnum.NORMAL;
    }
    if (!this._isActivated && !this._isSimplify && this._isFixingPosition) {
      return MarkerStatusEnum.FIX_ING;
    }
  };

  private _getWillChangeMarkerContentFn = (markerStatus: MarkerStatusEnum) => {
    if (markerStatus === MarkerStatusEnum.FIX_ING) {
      return this._markerFixingPositionContentRenderFn;
    }
    if (markerStatus === MarkerStatusEnum.ACTIVATE) {
      return this._markerActivatedContentRenderFn;
    }
    if (markerStatus === MarkerStatusEnum.NORMAL) {
      return this._markerContentRenderFn;
    }
    if (markerStatus === MarkerStatusEnum.SIMPLIFY) {
      return this._simplifyContentRenderFn;
    }
    if (markerStatus === MarkerStatusEnum.SIMPLIFY_FIXING) {
      return this._markerFixingPositionContentRenderFn;
    }
  };

  private _getWillChangeMarkerZIndex = (markerStatus: MarkerStatusEnum) => {
    if (markerStatus === MarkerStatusEnum.FIX_ING) {
      return theme.zIndex.map.marker.custom;
    }
    if (markerStatus === MarkerStatusEnum.ACTIVATE) {
      return this._zIndex;
    }
    if (markerStatus === MarkerStatusEnum.NORMAL) {
      return this._zIndex;
    }
    if (markerStatus === MarkerStatusEnum.SIMPLIFY) {
      return this._simplifyZIndex;
    }
    if (markerStatus === MarkerStatusEnum.SIMPLIFY_FIXING) {
      return theme.zIndex.map.marker.custom;
    }
  };

  private _getWillChangeStreetViewMarkerOptions = (
    markerStatus: MarkerStatusEnum,
  ) => {
    if (markerStatus === MarkerStatusEnum.FIX_ING) {
      return this._streetViewFixingMarkerOptions;
    }
    if (markerStatus === MarkerStatusEnum.ACTIVATE) {
      return this._streetViewActivateMarkerOptions;
    }
    if (markerStatus === MarkerStatusEnum.NORMAL) {
      return this._streetViewNormalMarkerOptions;
    }
    if (markerStatus === MarkerStatusEnum.SIMPLIFY) {
      return this._streetViewNormalMarkerOptions;
    }
    if (markerStatus === MarkerStatusEnum.SIMPLIFY_FIXING) {
      return this._streetViewFixingMarkerOptions;
    }
  };

  private _getWillChangePointContentFn = (markerStatus: MarkerStatusEnum) => {
    if (markerStatus === MarkerStatusEnum.FIX_ING) {
      return this._fixingPositionPointContentRenderFn;
    }
    if (markerStatus === MarkerStatusEnum.ACTIVATE) {
      return this._pointContentRenderFn;
    }
    if (markerStatus === MarkerStatusEnum.NORMAL) {
      return this._pointContentRenderFn;
    }
    if (markerStatus === MarkerStatusEnum.SIMPLIFY) {
      return;
    }
    if (markerStatus === MarkerStatusEnum.SIMPLIFY_FIXING) {
      return this._fixingPositionPointContentRenderFn;
    }
  };

  private _getWillChangePointZIndex = (markerStatus: MarkerStatusEnum) => {
    if (markerStatus === MarkerStatusEnum.FIX_ING) {
      return theme.zIndex.map.marker['simplify-custom'];
    }
    if (markerStatus === MarkerStatusEnum.ACTIVATE) {
      return theme.zIndex.map.point;
    }
    if (markerStatus === MarkerStatusEnum.NORMAL) {
      return theme.zIndex.map.point;
    }
    if (markerStatus === MarkerStatusEnum.SIMPLIFY) {
      return theme.zIndex.map.point;
    }
    if (markerStatus === MarkerStatusEnum.SIMPLIFY_FIXING) {
      return theme.zIndex.map.marker['simplify-custom'];
    }
  };

  private _setMarkerStatusCondition = () => {
    const markerStatus = this._getWillChangeMarkerStatus();
    const renderFn =
      markerStatus && this._getWillChangeMarkerContentFn(markerStatus);
    const zIndex =
      markerStatus && this._getWillChangeMarkerZIndex(markerStatus);
    const streetViewOptions =
      markerStatus && this._getWillChangeStreetViewMarkerOptions(markerStatus);
    const pointRenderFn =
      markerStatus && this._getWillChangePointContentFn(markerStatus);
    const pointZIndex =
      markerStatus && this._getWillChangePointZIndex(markerStatus);
    streetViewOptions && this.setStreetViewMarkerContent(streetViewOptions);
    renderFn && this.setMarkerContent(renderFn);
    zIndex && this.setZIndex(zIndex);
    streetViewOptions && this.setStreetViewMarkerContent(streetViewOptions);
    if (this._point) {
      this._point.map = pointRenderFn ? this._map : null;
      pointRenderFn && this.setPointContent(pointRenderFn);
      pointZIndex && this.setPointZIndex(pointZIndex);
    }
  };

  setIsSimplify = (isSimplify: boolean) => {
    if (
      this._isSimplify === isSimplify ||
      !this._simplifyContentRenderFn ||
      !this._simplifyZIndex
    ) {
      return false;
    }
    this._isSimplify = isSimplify;
    this._setMarkerStatusCondition();
  };

  isSimplify = () => {
    return this._isSimplify;
  };

  setActivated = (isActivated: boolean) => {
    if (
      this._isActivated === isActivated ||
      !this._markerActivatedContentRenderFn ||
      !this._simplifyContentRenderFn ||
      !this._simplifyZIndex
    ) {
      return false;
    }

    this._isActivated = isActivated;
    this._setMarkerStatusCondition();
    return true;
  };

  isActivated = () => {
    return this._isActivated;
  };

  setIsFixingPosition = (isFixingPosition: boolean) => {
    if (this._isFixingPosition === isFixingPosition) return;
    if (
      !this._markerFixingPositionContentRenderFn ||
      !this._fixingPositionZIndex ||
      !this._fixingPositionPointContentRenderFn ||
      !this._pointContentRenderFn
    )
      return;
    this._isFixingPosition = isFixingPosition;
    this._setMarkerStatusCondition();
  };

  isFixingPosition = () => {
    return this._isFixingPosition;
  };

  destroy = () => {
    this._markerMouseEnterEventManager.destroy();
    this._markerMouseLeaveEventManager.destroy();
    this._markerClickEventManager.destroy();
    this._markerDragStartEventManager.destroy();
    this._markerDragEventManager.destroy();
    this._markerDragEndEventManager.destroy();
    this._markerPositionChangeEventManager.destroy();

    // Todo:: rdh :: googleMapStreetView 환경에서 마커를 보여달라는 요청에 의해 급하게 staging에만 돌아갈 기능입니다. 추후 삭제가 필요합니다.
    this.overlayMarker.setMap(null);
    this._marker.destroy();
    if (this._point) {
      this._point.map = null;
    }
  };

  private _markerClickLogger = (marker: GeoMarker) => {
    console.log('GeoMap:: Marker Clicked');
    console.table({
      markerId: this.getId(),
      lat: this.getPosition().lat,
      lng: this.getPosition().lng,
    });
  };
}

export default GeoMarker;
