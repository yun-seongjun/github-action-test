import { ReactElement } from 'react';
import { Feature, Point } from 'geojson';
import { renderToStaticMarkup } from 'react-dom/server';
import GeoNodeEventManager, {
  GeoNodeDragEndEventType,
  GeoNodeDragEventType,
} from '@design-system/geo-map/feature/GeoNodeEventManager';
import {
  GeoFeaturePointPropertyType,
  GeoFeatureTagsType,
  GeoLatLngType,
  GeometryTypeEnum,
  GoogleLatLngType,
} from '@design-system/types/geoMap.type';
import DataUtils from '@design-system/utils/dataUtils';
import EnvUtils from '@design-system/utils/envUtils';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';
import { GenIdType } from '@design-system/utils/geo-map/IdGenerator';

export interface GeoNodeConstructType {
  position: GoogleLatLngType;
  id: number;
  googleMap: google.maps.Map;
  options: GeoNodeOptionType;
  tags?: GeoFeatureTagsType;
}

export type GeoNodeOptionType = Omit<
  google.maps.marker.AdvancedMarkerElementOptions,
  | 'content'
  | 'title'
  | 'collisionBehavior'
  | 'gmpClickable'
  | 'gmpDraggable'
  | 'position'
  | 'map'
> & {
  contentRenderFn: () => HTMLDivElement;
  visible?: boolean;
  enabled?: boolean;
  draggable?: boolean;
  clickable?: boolean;
  opacity?: number;
};

/**
 * Node
 */
class GeoNode {
  private _drawMarker = (
    options: google.maps.marker.AdvancedMarkerElementOptions,
  ) => {
    return new google.maps.marker.AdvancedMarkerElement(options);
  };

  static RADIUS_PX = 7;

  static makeMarkerContentFunc = (marker: ReactElement) => {
    const renderFunc = () => {
      const content = document.createElement('div');
      content.innerHTML = renderToStaticMarkup(marker);
      return content;
    };
    return renderFunc;
  };

  // 아이디
  private _id: GenIdType;
  private _visible: GeoNodeOptionType['visible'];
  private _enabled: GeoNodeOptionType['enabled'];
  private _clickable: GeoNodeOptionType['clickable'];
  private _draggbale: GeoNodeOptionType['draggable'];
  private _opacity: GeoNodeOptionType['opacity'];
  // 구글맵의 marker
  private _marker: google.maps.marker.AdvancedMarkerElement | undefined;
  // 구글맵
  private _map: google.maps.Map;
  /**
   * Node의 isVisible은 marker의 content가 NONE 컴포넌트이면 false 입니다.
   * visible로 바꾸면 마커가 원래 가지고 있는 content로 스왑하는 것으로 보이거나 안보이게 하거나 합니다.
   */
  private _markerContent?: HTMLDivElement;
  /**
   * Snapping 시 내부 컨텐츠만 안보이게 할 필요가 있습니다. 그냥 visible 로 컨텐츠를
   * @private
   */
  private _position?: GeoLatLngType;
  private _tags?: GeoFeatureTagsType;
  private _options: GeoNodeOptionType;
  eventManager: GeoNodeEventManager;

  private _drawMarkerOptionsPending:
    | google.maps.marker.AdvancedMarkerElementOptions
    | undefined = undefined;

  constructor(props: GeoNodeConstructType) {
    const { position, tags, id, options, googleMap } = props;
    this._options = options;
    const {
      visible = true,
      opacity = 1,
      contentRenderFn,
      enabled = true,
      draggable = false,
      clickable = false,
      ...googleMarkerOptions
    } = options;
    const { zIndex } = googleMarkerOptions;
    const defaultOptions: google.maps.marker.AdvancedMarkerElementOptions = {
      position,
      map: visible ? googleMap : null,
      ...googleMarkerOptions,
    };
    if (visible) {
      this._marker = this._drawMarker(defaultOptions);
    } else {
      this._drawMarkerOptionsPending = defaultOptions;
    }
    this._map = googleMap;
    this._id = id;
    this.eventManager = new GeoNodeEventManager(id);
    this.setMarkerOptions({
      contentRenderFn,
      zIndex,
      position: GeoMapUtils.toLatLng(position),
      visible,
      opacity,
      clickable: false,
      draggable: false,
    });
    this.setEnabled(enabled);
    this.setClickable(clickable);
    this.setDraggable(draggable);
    tags && this.setTags(tags);
  }
  private _setMapNull = () => {
    if (this._marker) {
      this._marker.map = null;
    }
    this._marker = undefined;
    this._markerContent = undefined;
  };

  getId = () => {
    return this._id;
  };
  getMarker = () => this._marker;
  getGoogleMap = () => this._map;
  /**
   * ===============================================================================================
   * Options
   * ===============================================================================================
   */

  getMarkerContent = () => this._markerContent;

  setTags = (tags: GeoFeatureTagsType) => {
    this._tags = tags;
  };
  getTags = () => this._tags;

  getOpacity = () => this._opacity;

  private opacityPending: number | undefined;
  setOpacity = (opacity: number) => {
    if (!this._visible) {
      this.opacityPending = opacity;
      return;
    }
    if (this.getOpacity() === opacity) {
      return;
    }
    this._opacity = opacity;

    //⚠️markerContent는 div element 입니다. div에 opacity를 주면 ipad에서 div 안에 들어있는 자식 svg에 opacity가 안먹습니다. :: 이유는 모르겠음
    // 따라서 svgElement를 직접 찾아 본체에 opacity를 먹입니다.
    if (this._markerContent) {
      const svgElement = this._markerContent.querySelector('svg');
      if (!svgElement) return;
      svgElement.style.opacity = String(opacity);
    }
  };
  /**
   * Visible 설정
   * @param visible
   */
  setVisible = (visible: GeoNodeOptionType['visible']) => {
    if (this._visible === visible) {
      return false;
    }
    this._visible = visible;
    if (visible) {
      if (this._drawMarkerOptionsPending) {
        this._marker = this._drawMarker(this._drawMarkerOptionsPending);
        this._drawMarkerOptionsPending = undefined;
      }
      if (this._contentPending) {
        this.setContent(this._contentPending);
        this._contentPending = undefined;
      }
      if (this._markerPositionPending) {
        this.setPosition(this._markerPositionPending);
        this._markerPositionPending = undefined;
      }
      if (this._isUpdateMarkerCursorPending) {
        this._updateMarkerCursor();
        this._isUpdateMarkerCursorPending = false;
      }
      if (this._positionOnlyVisiblePending) {
        this.setPositionOnlyVisible(this._positionOnlyVisiblePending);
        this._positionOnlyVisiblePending = undefined;
      }
      if (this._isClearPositionOnlyVisiblePending) {
        this.clearPositionOnlyVisible();
        this._isClearPositionOnlyVisiblePending = false;
      }
      if (this.opacityPending !== undefined) {
        this.setOpacity(this.opacityPending);
        this.opacityPending = undefined;
      }
      if (this._zIndexPending !== undefined) {
        this.setZIndex(this._zIndexPending);
        this._zIndexPending = undefined;
      }
    }

    if (this._marker) {
      this._marker.map = visible ? this._map : null;
    }
    return true;
  };

  setInnerVisible = (innerVisible: boolean) => {
    if (this.isInnerVisible() === innerVisible) return;
    this.setOpacity(innerVisible ? 1 : 0);
  };

  /**
   * Visible 확인
   */
  isVisible = () => !!this._visible;
  isInnerVisible = () => this._opacity !== 0;
  /**
   * Enabled 설정
   */
  setEnabled = (enabled: boolean) => {
    if (this._enabled === enabled) {
      return false;
    }
    this._enabled = enabled;
    this.eventManager.invokeEnabledChangeEventListener(enabled);
    return true;
  };
  isEnabled = () => this._enabled;
  /**
   * Clickable 설정
   */
  setClickable = (clickable: boolean) => {
    if (this._clickable === clickable) {
      return false;
    }
    this._clickable = clickable;
    this._updateMarkerCursor();
    return true;
  };
  isClickable = () => this._clickable;
  /**
   * Draggable 설정
   * @param draggable
   */
  setDraggable = (draggable: boolean) => {
    if (this.isDraggable() == draggable) return;
    this._draggbale = draggable;
    this._updateMarkerCursor();
    this.eventManager.invokeDraggableChangeEventListener(draggable);
  };

  /**
   * Draggable 확인
   */
  isDraggable = () => this._draggbale;

  private _isUpdateMarkerCursorPending = false;
  private _updateMarkerCursor = () => {
    if (!this._visible || !this._marker) {
      this._isUpdateMarkerCursorPending = true;
      return;
    }
    const markerContent = this._marker.content as HTMLDivElement;
    if (this._clickable) {
      markerContent.style.cursor = 'pointer';
      return;
    }
    if (this._draggbale) {
      markerContent.style.cursor = 'grab';
      return;
    }
    markerContent.style.cursor = 'default';
  };

  private _markerPositionPending: GeoLatLngType | undefined = undefined;
  setPosition = (position: GeoLatLngType) => {
    if (this._visible && this._marker) {
      this._marker.position = position;
    } else {
      this._markerPositionPending = position;
    }
    this._position = GeoMapUtils.toLatLng(position);
  };
  getPosition = () => {
    return { ...this._position } as GeoLatLngType;
  };
  private _positionOnlyVisible: GeoLatLngType | undefined = undefined;
  private _positionOnlyVisiblePending: GeoLatLngType | undefined = undefined;
  setPositionOnlyVisible = (position: GeoLatLngType) => {
    if (!this._visible || !this._marker) {
      this._positionOnlyVisiblePending = position;
      return;
    }
    this._marker.position = position;
    this._positionOnlyVisible = position;
  };
  getPositionOnlyVisible = () => this._positionOnlyVisible;
  private _isClearPositionOnlyVisiblePending = false;
  clearPositionOnlyVisible = () => {
    if (!this._visible || !this._marker) {
      this._isClearPositionOnlyVisiblePending = true;
      this._positionOnlyVisiblePending = undefined;
      return;
    }
    this._positionOnlyVisible = undefined;
    this._marker.position = this._position;
  };

  private _contentPending:
    | Pick<GeoNodeOptionType, 'contentRenderFn'>
    | undefined = undefined;
  setContent = (content: Pick<GeoNodeOptionType, 'contentRenderFn'>) => {
    if (!this._visible || !this._marker) {
      this._contentPending = content;
      return;
    }
    const { contentRenderFn } = content;
    this._markerContent = contentRenderFn();
    this._marker.content = this._markerContent;
  };
  getContent = () => {
    return this._markerContent as HTMLDivElement;
  };
  private _zIndexPending: GeoNodeOptionType['zIndex'] | undefined = undefined;
  setZIndex = (zIndex: GeoNodeOptionType['zIndex']) => {
    if (!this._visible || !this._marker) {
      this._zIndexPending = zIndex;
      return;
    }
    if (zIndex === this._marker.zIndex) return;
    this._marker.zIndex = zIndex;
  };
  getZIndex = () => {
    if (!this._marker || this._zIndexPending !== undefined) {
      return this._zIndexPending;
    }
    return this._marker.zIndex;
  };
  /**
   * options에 넣지 않는 값들은 기존 옵션 값을 유지한 채 적용됩니다.
   */
  setMarkerOptions = (
    options: Partial<
      Omit<GeoNodeOptionType, 'map'> & { position: GeoLatLngType }
    >,
  ) => {
    const { position, opacity, contentRenderFn, visible, zIndex, draggable } =
      options;
    if (!DataUtils.isNullOrUndefined(zIndex)) {
      this.setZIndex(zIndex);
    }
    if (!DataUtils.isNullOrUndefined(position)) {
      this.setPosition(position);
    }
    if (!DataUtils.isNullOrUndefined(contentRenderFn)) {
      this.setContent({ contentRenderFn });
    }
    if (!DataUtils.isNullOrUndefined(visible)) {
      this.setVisible(visible);
    }
    if (!DataUtils.isNullOrUndefined(draggable)) {
      this.setDraggable(draggable);
    }
    if (!DataUtils.isNullOrUndefined(opacity)) {
      this.setOpacity(opacity);
    }
  };
  getMarkerOptions = (): Omit<
    GeoNodeOptionType,
    'map' | 'pointBorderColor' | 'isNodePopover' | 'contentRenderFn'
  > & {
    content: HTMLDivElement;
    position: GeoLatLngType;
  } => {
    return {
      content: this.getContent() as HTMLDivElement,
      zIndex: this.getZIndex(),
      position: this.getPosition(),
      visible: this.isVisible(),
      draggable: this.isDraggable(),
      clickable: this.isClickable(),
      opacity: this.getOpacity(),
    };
  };

  getOptions = () => {
    return this._options;
  };

  setNodeInnerContentStyle = ({
    bgColor,
    borderColor,
    strokeWidth,
    d,
  }: {
    bgColor?: string;
    borderColor?: string;
    strokeWidth?: number;
    d?: string;
  }) => {
    const svgElement = this._markerContent?.querySelector('svg');
    if (!svgElement) return;

    const pathElement = svgElement.querySelector('path');
    if (!pathElement) return;

    if (bgColor) {
      pathElement.setAttribute('fill', bgColor);
    } else {
      pathElement.removeAttribute('fill');
    }

    if (borderColor && strokeWidth) {
      pathElement.setAttribute('stroke', borderColor);
      pathElement.setAttribute('stroke-width', String(strokeWidth));
    } else {
      pathElement.removeAttribute('stroke');
      pathElement.removeAttribute('stroke-width');
    }

    if (d) {
      pathElement.setAttribute('d', d);
    } else {
      pathElement.removeAttribute('d');
    }
  };

  /**
   * ===============================================================================================
   * Event
   * ===============================================================================================
   */

  addClickEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    return this.eventManager.addClickEventListener(listener);
  };
  invokeClickEventListener = (event: google.maps.MapMouseEvent) => {
    if (EnvUtils.isDevMode() || EnvUtils.isQaMode()) {
      this._nodeClickLogger(this);
    }
    this.eventManager.invokeClickEventListener(event);
  };
  addDragStartEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    return this.eventManager.addDragStartEventListener(listener);
  };
  invokeDragStartEventListener = (event: google.maps.MapMouseEvent) => {
    this.eventManager.invokeDragStartEventListener(event);
  };
  addDragEventListener = (listener: (event: GeoNodeDragEventType) => void) => {
    return this.eventManager.addDragEventListener(listener);
  };
  invokeDragEventListener = (event: google.maps.MapMouseEvent) => {
    this.eventManager.invokeDragEventListener(event);
  };
  addDragEndEventListener = (
    listener: (event: GeoNodeDragEndEventType) => void,
  ) => {
    return this.eventManager.addDragEndEventListener(listener);
  };
  invokeDragEndEventListener = (event: google.maps.MapMouseEvent) => {
    this.eventManager.invokeDragEndEventListener(event);
  };
  addDraggableChangeEventListener = (
    listener: (draggable: boolean) => void,
  ) => {
    return this.eventManager.addDraggableChangeEventListener(listener);
  };
  addEnabledChangeEventListener = (listener: (enabled: boolean) => void) => {
    return this.eventManager.addEnabledChangeEventListener(listener);
  };
  removeEventListener = (eventId: string) => {
    this.eventManager.removeEventListener(eventId);
  };
  isEventListening = (eventId: string) => {
    return this.eventManager.isEventListening(eventId);
  };
  clearAllEventListeners = () => {
    this.eventManager.clearAllEventListeners();
  };

  /**
   * ===============================================================================================
   * ETC 기타 기능들
   * ===============================================================================================
   */
  toJson = (): Feature<Point, GeoFeaturePointPropertyType> => {
    return {
      type: GeometryTypeEnum.Feature,
      geometry: {
        type: GeometryTypeEnum.Point,
        coordinates: [this.getPosition().lng, this.getPosition().lat],
      },
      properties: {
        type: 'node',
        id: this.getId(),
        tags: this.getTags(),
      },
    };
  };

  /**
   * 소멸자
   */
  destroy = () => {
    const marker = this.getMarker();
    this.clearAllEventListeners();
    marker && google.maps.event.clearInstanceListeners(marker);
    this._setMapNull();
    this.eventManager.destroy();
  };

  private _nodeClickLogger = (node: GeoNode) => {
    console.log('GeoMap:: Node Clicked');
    console.table({
      nodeId: node.getId(),
      lat: node.getPosition().lat,
      lng: node.getPosition().lng,
    });
  };
}

export default GeoNode;
