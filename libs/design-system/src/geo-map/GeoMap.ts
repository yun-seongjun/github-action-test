import { Loader } from '@googlemaps/js-api-loader';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { BASE_MAP_STYLE } from '@design-system/constants/geo-map';
import EventListenerManager from '@design-system/geo-map/event/EventListenerManager';
import EventPreventer from '@design-system/geo-map/event/EventPreventer';
import GeoMapEventManager from '@design-system/geo-map/event/GeoMapEventManager';
import NotificationEventManager from '@design-system/geo-map/event/NotificationEventManager';
import GeoFeatureManager, {
  GeoFeaturesType,
} from '@design-system/geo-map/feature/GeoFeatureManager';
import GeoNode from '@design-system/geo-map/feature/GeoNode';
import GeoWay from '@design-system/geo-map/feature/GeoWay';
import GeoLayer, {
  GeoLayerPolicy,
} from '@design-system/geo-map/layer/GeoLayer';
import GeoLineSegment from '@design-system/geo-map/line-segment/GeoLineSegment';
import GeoMarker, {
  GeoMarkerOptionsType,
  MarkerIdType,
} from '@design-system/geo-map/marker/GeoMarker';
import { theme } from '@design-system/root/tailwind.config';
import {
  GeoLatLngType,
  GeoMapBoundsType,
  GeoMapTypeEnum,
  GeoMapTypeIdEnum,
  GeoMapTypeImageEnum,
  GeoMapZoomLevel,
  GoogleLatLngType,
} from '@design-system/types/geoMap.type';
import DataUtils from '@design-system/utils/dataUtils';
import EnvUtils from '@design-system/utils/envUtils';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';
import IdGenerator, {
  GenIdType,
} from '@design-system/utils/geo-map/IdGenerator';
import GeoPreset from '@design-system/geo-map/GeoPreset';
import { EditToolMenuEnum } from '@design-system/components/geo-map/NodeContentsFuncFactory';

export enum GeoMapGestureHandlingEnum {
  COOPERATIVE = 'cooperative',
  GREEDY = 'greedy',
  NONE = 'none',
  AUTO = 'auto',
}
export interface GeoMapOptionType extends Omit<
  google.maps.MapOptions,
  | 'mapTypeControlOptions'
  | 'backgroundColor'
  | 'clickableIcons'
  | 'controlSize'
  | 'center'
  | 'draggable'
  | 'disableDefaultUI'
  | 'disableDoubleClickZoom'
  | 'draggableCursor'
  | 'draggingCursor'
  | 'fullscreenControl'
  | 'fullscreenControlOptions'
  | 'isFractionalZoomEnabled'
  | 'keyboardShortcuts'
  | 'mapTypeControl'
  | 'noClear'
  | 'maxZoom'
  | 'minZoom'
  | 'panControl'
  | 'panControlOptions'
  | 'restriction'
  | 'rotateControl'
  | 'rotateControlOptions'
  | 'scaleControl'
  | 'scaleControlOptions'
  | 'scrollwheel'
  | 'streetView'
  | 'styles'
  | 'tilt'
  | 'zoomControl'
  | 'zoomControlOptions'
  | 'mapTypeId'
  | 'gestureHandling'
> {
  mapTypeId?: GeoMapTypeIdEnum;
  mapElement: HTMLElement;
  center: GeoLatLngType;
  gestureHandling?: GeoMapGestureHandlingEnum;
}

export interface GeoMapExternalKeys {
  apiKey: string;
  locale: string;
  vworldKey: string;
}

export const DELAY_TIME_MAP_TYPE_ID_CHANGE = 5;
/**
 * GeoMap
 */
class GeoMap {
  static DEFAULT_OPTIONS: google.maps.MapOptions = {
    tilt: 0,
    zoom: GeoMapZoomLevel.NORMAL,
    scaleControl: true,
    mapTypeControl: false,
    keyboardShortcuts: false,
    fullscreenControl: false,
    rotateControl: false,
    cameraControl: false,
    zoomControl: false,
    streetViewControl: false,
    gestureHandling: GeoMapGestureHandlingEnum.GREEDY,
    tiltInteractionEnabled: false,
    headingInteractionEnabled: false,
    mapTypeId: GeoMapTypeIdEnum.KOREA_BASE_MAP,
  };
  static createGoogleMap = async ({
    apiKey,
    mapId,
    mapElement,
    locale,
    vworldKey,
    ...restOptions
  }: GeoMapOptionType & GeoMapExternalKeys) => {
    if (!apiKey) {
      console.log('Error:: apiKey가 없습니다.');
      return;
    }
    const googleMapLibraryLoader = new Loader({
      apiKey,
      version: '3.57.2',
      language: locale,
    });
    const { Map, OverlayView } =
      await googleMapLibraryLoader.importLibrary('maps');
    const options = { ...GeoMap.DEFAULT_OPTIONS, mapId, ...restOptions };
    const map = new Map(mapElement, options);
    const overlayView = new OverlayView();
    overlayView.setMap(map);
    map.set('overlayView', overlayView);

    const baseMapType = new google.maps.StyledMapType(BASE_MAP_STYLE, {
      name: '지도',
      maxZoom: GeoMapZoomLevel.TILE_2048_MAX,
    });

    const vworldBaseMapType = new google.maps.ImageMapType({
      getTileUrl: (coords, zoom) => {
        const effectiveZoom = Math.min(zoom, GeoMapZoomLevel.TILE_256_IMG_MAX);
        return `https://api.vworld.kr/req/wmts/1.0.0/${vworldKey}/Base/${effectiveZoom}/${coords.y}/${coords.x}.png`;
      },
      tileSize: new google.maps.Size(256, 256),
      maxZoom: GeoMapZoomLevel.TILE_2048_MAX,
      minZoom: GeoMapZoomLevel.MIN,
      name: 'V지도',
    });

    const vworldSatelliteMapType = new google.maps.ImageMapType({
      getTileUrl: (coords, zoom) => {
        const effectiveZoom = Math.min(zoom, GeoMapZoomLevel.TILE_256_IMG_MAX);
        return `https://api.vworld.kr/req/wmts/1.0.0/${vworldKey}/Satellite/${effectiveZoom}/${coords.y}/${coords.x}.jpeg`;
      },
      tileSize: new google.maps.Size(256, 256),
      maxZoom: GeoMapZoomLevel.TILE_2048_MAX,
      minZoom: GeoMapZoomLevel.MIN,
      name: 'V위성',
    });

    const zoom20VworldBaseMap = new google.maps.ImageMapType({
      getTileUrl: (coords, zoom) => {
        const effectiveZoom = Math.min(zoom, GeoMapZoomLevel.TILE_256_IMG_MAX);
        return `https://api.vworld.kr/req/wmts/1.0.0/${vworldKey}/Base/${effectiveZoom}/${coords.y}/${coords.x}.png`;
      },
      tileSize: new google.maps.Size(512, 512),
      maxZoom: GeoMapZoomLevel.TILE_2048_MAX,
      minZoom: GeoMapZoomLevel.MIN,
      name: 'V지도',
    });

    const zoom20VworldSatelliteMapType = new google.maps.ImageMapType({
      getTileUrl: (coords, zoom) => {
        const effectiveZoom = Math.min(zoom, GeoMapZoomLevel.TILE_256_IMG_MAX);
        return `https://api.vworld.kr/req/wmts/1.0.0/${vworldKey}/Satellite/${effectiveZoom}/${coords.y}/${coords.x}.jpeg`;
      },
      tileSize: new google.maps.Size(512, 512),
      maxZoom: GeoMapZoomLevel.TILE_2048_MAX,
      minZoom: GeoMapZoomLevel.MIN,
      name: 'V지도',
    });

    const zoom21VworldBaseMap = new google.maps.ImageMapType({
      getTileUrl: (coords, zoom) => {
        const effectiveZoom = Math.min(zoom, GeoMapZoomLevel.TILE_256_IMG_MAX);
        return `https://api.vworld.kr/req/wmts/1.0.0/${vworldKey}/Base/${effectiveZoom}/${coords.y}/${coords.x}.png`;
      },
      tileSize: new google.maps.Size(1024, 1024),
      maxZoom: GeoMapZoomLevel.TILE_2048_MAX,
      minZoom: GeoMapZoomLevel.MIN,
      name: 'V지도',
    });

    const zoom21VworldSatelliteMapType = new google.maps.ImageMapType({
      getTileUrl: (coords, zoom) => {
        const effectiveZoom = Math.min(zoom, GeoMapZoomLevel.TILE_256_IMG_MAX);
        return `https://api.vworld.kr/req/wmts/1.0.0/${vworldKey}/Satellite/${effectiveZoom}/${coords.y}/${coords.x}.jpeg`;
      },
      tileSize: new google.maps.Size(1024, 1024),
      maxZoom: GeoMapZoomLevel.TILE_2048_MAX,
      minZoom: GeoMapZoomLevel.MIN,
      name: 'V지도',
    });

    const zoom22VworldBaseMap = new google.maps.ImageMapType({
      getTileUrl: (coords, zoom) => {
        const effectiveZoom = Math.min(zoom, GeoMapZoomLevel.TILE_256_IMG_MAX);
        return `https://api.vworld.kr/req/wmts/1.0.0/${vworldKey}/Base/${effectiveZoom}/${coords.y}/${coords.x}.png`;
      },
      tileSize: new google.maps.Size(2048, 2048),
      maxZoom: GeoMapZoomLevel.TILE_2048_MAX,
      minZoom: GeoMapZoomLevel.MIN,
      name: 'V지도',
    });

    const zoom22VworldSatelliteMapType = new google.maps.ImageMapType({
      getTileUrl: (coords, zoom) => {
        const effectiveZoom = Math.min(zoom, GeoMapZoomLevel.TILE_256_IMG_MAX);
        return `https://api.vworld.kr/req/wmts/1.0.0/${vworldKey}/Satellite/${effectiveZoom}/${coords.y}/${coords.x}.jpeg`;
      },
      tileSize: new google.maps.Size(2048, 2048),
      maxZoom: GeoMapZoomLevel.TILE_2048_MAX,
      minZoom: GeoMapZoomLevel.MIN,
      name: 'V지도',
    });

    const zoom23VworldBaseMap = new google.maps.ImageMapType({
      getTileUrl: (coords, zoom) => {
        const effectiveZoom = Math.min(zoom, GeoMapZoomLevel.TILE_256_IMG_MAX);
        return `https://api.vworld.kr/req/wmts/1.0.0/${vworldKey}/Base/${effectiveZoom}/${coords.y}/${coords.x}.png`;
      },
      tileSize: new google.maps.Size(4096, 4096),
      maxZoom: GeoMapZoomLevel.TILE_4096_MAX,
      minZoom: GeoMapZoomLevel.MIN,
      name: 'V지도',
    });

    const zoom23VworldSatelliteMapType = new google.maps.ImageMapType({
      getTileUrl: (coords, zoom) => {
        const effectiveZoom = Math.min(zoom, GeoMapZoomLevel.TILE_256_IMG_MAX);
        return `https://api.vworld.kr/req/wmts/1.0.0/${vworldKey}/Satellite/${effectiveZoom}/${coords.y}/${coords.x}.jpeg`;
      },
      tileSize: new google.maps.Size(4096, 4096),
      maxZoom: GeoMapZoomLevel.TILE_4096_MAX,
      minZoom: GeoMapZoomLevel.MIN,
      name: 'V지도',
    });

    map.mapTypes.set(GeoMapTypeIdEnum.FOREIGN_BASE_MAP, baseMapType);
    map.mapTypes.set(GeoMapTypeIdEnum.KOREA_BASE_MAP, vworldBaseMapType);
    map.mapTypes.set(
      GeoMapTypeIdEnum.KOREA_SATELLITE_MAP,
      vworldSatelliteMapType,
    );
    map.mapTypes.set(
      GeoMapTypeIdEnum.ZOOM_20_KOREA_BASE_MAP,
      zoom20VworldBaseMap,
    );
    map.mapTypes.set(
      GeoMapTypeIdEnum.ZOOM_20_KOREA_SATELLITE_MAP,
      zoom20VworldSatelliteMapType,
    );
    map.mapTypes.set(
      GeoMapTypeIdEnum.ZOOM_21_KOREA_BASE_MAP,
      zoom21VworldBaseMap,
    );
    map.mapTypes.set(
      GeoMapTypeIdEnum.ZOOM_21_KOREA_SATELLITE_MAP,
      zoom21VworldSatelliteMapType,
    );
    map.mapTypes.set(
      GeoMapTypeIdEnum.ZOOM_22_KOREA_BASE_MAP,
      zoom22VworldBaseMap,
    );
    map.mapTypes.set(
      GeoMapTypeIdEnum.ZOOM_22_KOREA_SATELLITE_MAP,
      zoom22VworldSatelliteMapType,
    );
    map.mapTypes.set(
      GeoMapTypeIdEnum.ZOOM_23_KOREA_BASE_MAP,
      zoom23VworldBaseMap,
    );
    map.mapTypes.set(
      GeoMapTypeIdEnum.ZOOM_23_KOREA_SATELLITE_MAP,
      zoom23VworldSatelliteMapType,
    );

    await google.maps.importLibrary('marker');
    await google.maps.importLibrary('drawing');
    await google.maps.importLibrary('geometry');

    // pupeteer 테스트시 해당 환경 브라우저에서 가져와야 테스트가 됩니다.
    if (EnvUtils.isTestMode() || EnvUtils.isQaMode()) {
      (window as any).test = {};
      // 테스트용 객체 확장
      Object.assign(window.test, {
        geoMap: map,
        GeoPreset,
        GeoMapUtils,
        GeoNode,
        GeoWay,
        GeoLineSegment,
        GeoMarker,
        GeoFeatureManager,
      });
    }

    return map;
  };

  /**
   * ID 생성기
   * @private
   */
  private _idGenerator = new IdGenerator();
  private _layerIdGenerator: IdGenerator;
  private _googleMap: google.maps.Map;
  private _geoMapLayerMap: Map<GenIdType, GeoLayer> = new Map();
  private _streetView: google.maps.StreetViewPanorama;
  private _streetViewPosition: GeoLatLngType;
  /**
   * GeoMap에서 map에 붙이는 모든 이벤트 리스너를 관리합니다.
   * @private
   */
  private readonly _eventPreventer: EventPreventer;
  private _gestureHandling: GeoMapOptionType['gestureHandling'];
  private readonly _mapElement: HTMLElement;
  private _mapTypeId: GeoMapTypeIdEnum;

  public readonly notificationEventManager: NotificationEventManager;
  private readonly _mapEventManager: GeoMapEventManager;
  private readonly _toolBoxMenuButtonEventManager: EventListenerManager<
    string,
    (layerId: GenIdType, menu: EditToolMenuEnum, event?: Event) => void
  > = new EventListenerManager();
  private readonly _featureCopiedEventManager: EventListenerManager<
    string,
    (
      layerId: GenIdType,
      feature: FeatureCollection<Geometry, GeoJsonProperties>,
    ) => void
  > = new EventListenerManager();
  /**
   * 생성자
   * 한개의 GeoMap은 하나의 googleMap instance를 갖습니다.
   * constructor 안에서 필드 값을 초기화하는 작업이 아닌 작업들을 넣는 것은 안티 패턴입니다. 따라서 createGeoMap을 외부에서 실행하여 GeoMap을 생성합니다.
   * @param googleMap
   * @param featureStylePolicy
   * @param mapTypeId
   */

  constructor(googleMap: google.maps.Map, mapTypeId: GeoMapTypeIdEnum) {
    this._layerIdGenerator = new IdGenerator();
    this._mapElement = googleMap.getDiv();
    this._googleMap = googleMap;
    this._eventPreventer = new EventPreventer();
    this.notificationEventManager = new NotificationEventManager();
    this._streetView = this._googleMap.getStreetView();
    this._streetView.setOptions({
      disableDefaultUI: true,
      addressControl: false,
      clickToGo: true,
      showRoadLabels: true,
      enableCloseButton: false,
      motionTracking: false,
      motionTrackingControl: false,
      zoomControl: true,
      scrollwheel: true,
      panControl: true,
    });
    this._streetViewPosition = this.getCenter();
    this._mapEventManager = new GeoMapEventManager(
      googleMap,
      this._eventPreventer,
      this.notificationEventManager,
    );

    this.setGestureHandling(GeoMapGestureHandlingEnum.GREEDY);
    this.setMapTypeId(mapTypeId);
    this._mapTypeId = mapTypeId;

    this._mapEventManager.addZoomChangedStickyEventListener(
      (
        event: google.maps.MapMouseEvent | undefined,
        zoomLevel: number,
        zoomLevelOld: number,
      ) => {
        const mapTypeIdChanged = GeoMapUtils.getMapTypeId(
          zoomLevel,
          GeoMapUtils.getMapTypeImage(this._mapTypeId),
          GeoMapUtils.getMapType(this._mapTypeId),
        );
        if (this._mapTypeId !== mapTypeIdChanged) {
          this.setMapTypeId(mapTypeIdChanged);
        }
      },
      false,
    );
    this._mapEventManager.addDragBoxDragStartEventListener(
      (event: google.maps.MapMouseEvent, latLng: GeoLatLngType) => {
        this._destroyLasso();
        this._createLasso(latLng);
      },
    );
    this._mapEventManager.addDragBoxDragEventListener(
      (
        event: google.maps.MapMouseEvent,
        latLng: GeoLatLngType,
        latLngBefore: GeoLatLngType,
        latLngStart: GeoLatLngType,
        dragBoxPath: GeoLatLngType[],
      ) => {
        this._addLassoPosition(latLng);
      },
    );
    this._mapEventManager.addDragBoxDragEndEventListener(() => {
      this._destroyLasso();
    });
    this._mapEventManager.addStreetViewPositionChangedEventListener(
      (position) => {
        this._streetViewPosition = position;
        this.notificationEventManager.invokeStreetViewPositionChangedEventListener(
          position,
        );
      },
    );
    this._mapEventManager.addStreetViewVisibleEventListener((visible) => {
      this.notificationEventManager.invokeStreetViewVisibleEventListener(
        visible,
      );
    });
  }

  /**
   * 소멸자
   */
  destroy = () => {
    this._geoMapLayerMap.forEach((layer) => {
      layer.destroy();
    });
    this._geoMapLayerMap.clear();
    this._toolBoxMenuButtonEventManager.destroy();
    this._mapEventManager.destroy();
    this.notificationEventManager.destroy();
    this._featureCopiedEventManager.destroy();
    this._eventPreventer.destroy();
    google.maps.event.clearInstanceListeners(this._googleMap);
    this._googleMap.setStreetView(null);
    this._googleMap?.unbindAll();
  };

  /**
   * ===============================================================================================
   * Map Options
   * ===============================================================================================
   */

  getGoogleMap = () => this._googleMap;

  getMapElement = () => this._mapElement;

  /**
   * Vworld, 구글지도, zoom20 지도 등 mapTypeId를 업데이트 합니다.
   * @param mapTypeId
   */
  setMapTypeId = (mapTypeId: GeoMapTypeIdEnum) => {
    return new Promise<boolean>((resolve, reject) => {
      if (this._mapTypeId === mapTypeId) {
        return reject(false);
      }
      // 구글 지도로 한번 번경을 해야 다른 vworld 지도로 변경이 가능합니다.
      this._googleMap.setMapTypeId(GeoMapTypeIdEnum.FOREIGN_BASE_MAP);
      // 구글 맵이 세팅될 때 텀을 두지 않으면 vworld의 맵끼리 서로 변경되지 않습니다.
      setTimeout(() => {
        this._googleMap.setMapTypeId(mapTypeId);
        this._mapEventManager.invokeMapTypeIdChangeStickyEventListener(
          mapTypeId,
        );
        this._mapTypeId = mapTypeId;
        resolve(true);
      }, DELAY_TIME_MAP_TYPE_ID_CHANGE);
    });
  };
  getMapTypeImage = () => {
    return GeoMapUtils.getMapTypeImage(this._mapTypeId);
  };
  setMapTypeImage = async (mapTypeImage: GeoMapTypeImageEnum) => {
    try {
      const mapTypeIdNew = GeoMapUtils.getMapTypeId(
        this.getZoom(),
        mapTypeImage,
        GeoMapUtils.getMapType(this._mapTypeId),
      );
      await this.setMapTypeId(mapTypeIdNew);
      return true;
    } catch (error) {
      console.log('ERR:: GeoMap:: setMapTypeImage::', error);
      return false;
    }
  };
  getMapType = () => {
    return GeoMapUtils.getMapType(this._mapTypeId);
  };
  setMapType = async (mapType: GeoMapTypeEnum) => {
    try {
      const mapTypeIdNew = GeoMapUtils.getMapTypeId(
        this.getZoom(),
        GeoMapUtils.getMapTypeImage(this._mapTypeId),
        mapType,
      );
      await this.setMapTypeId(mapTypeIdNew);
      return true;
    } catch (error) {
      console.log('ERR:: GeoMap:: setMapType::', error);
      return false;
    }
  };
  setHeading = (heading: number) => {
    this._googleMap.setHeading(heading);
  };
  getHeading = () => {
    return this._googleMap.getHeading();
  };
  setPencilGestureHandlingEnabled = (enabled: boolean) => {
    this._mapEventManager.setPencilGestureHandlingEnabled(enabled);
    return true;
  };
  isPencilGestureHandlingEnabled = () => {
    return this._mapEventManager.isPencilGestureHandlingEnabled();
  };
  setGestureHandling = (
    gestureHandling: GeoMapOptionType['gestureHandling'],
  ) => {
    if (!gestureHandling) {
      console.log(
        'ERR:: GeoMap:: setGestureHandling:: gestureHandling 값이 없습니다.',
      );
      return false;
    }
    this._gestureHandling = gestureHandling;
    this._googleMap.setOptions({ gestureHandling });
    return true;
  };
  getGestureHandling = () => {
    return this._gestureHandling;
  };
  setZoom = (zoom: GeoMapOptionType['zoom']) => {
    if (!DataUtils.isNullOrUndefined(zoom)) {
      this._googleMap.setZoom(zoom);
      return true;
    } else {
      console.log(
        'ERR:: GeoMap:: setZoom:: zoom값이 null 혹은 undefind 입니다.',
      );
      return false;
    }
  };
  getZoom = () => {
    return this._googleMap?.getZoom() as number;
  };
  setCenter = (center: GeoMapOptionType['center']) => {
    try {
      this._googleMap.setCenter(center);
      return true;
    } catch (error) {
      console.log('ERR:: GeoMap:: setCenter::', error);
      return false;
    }
  };
  getCenter = () => {
    return GeoMapUtils.toLatLng(
      this._googleMap.getCenter() as GoogleLatLngType,
    );
  };

  /**
   * options에 넣지 않는 값들은 기존 옵션 값을 유지한 채 적용됩니다.
   * @param options
   */
  setMapOptions = (
    options: Partial<Omit<GeoMapOptionType, 'mapId' | 'countryCode'>>,
  ) => {
    const { mapTypeId, heading, gestureHandling, zoom, center } = options;
    if (!DataUtils.isNullOrUndefined(mapTypeId)) {
      this.setMapTypeId(mapTypeId);
    }
    if (!DataUtils.isNullOrUndefined(heading)) {
      this.setHeading(heading);
    }
    if (!DataUtils.isNullOrUndefined(gestureHandling)) {
      this.setGestureHandling(gestureHandling);
    }
    if (!DataUtils.isNullOrUndefined(zoom)) {
      this.setZoom(zoom);
    }
    if (
      !DataUtils.isNullOrUndefined(center) &&
      !GeoMapUtils.isEmptyLatLng(center)
    ) {
      this.setCenter(center);
    }
  };

  getMapOptions = (): Omit<
    GeoMapOptionType,
    'mapId' | 'countryCode' | 'mapElement'
  > => {
    return {
      mapTypeId: this._mapTypeId,
      heading: this.getHeading(),
      gestureHandling: this.getGestureHandling(),
      zoom: this.getZoom(),
      center: this.getCenter(),
    };
  };

  isPositionInMapBounds = (
    latLng: GeoLatLngType,
    paddingXPixel = 0,
    paddingYPixel = 0,
  ) => {
    const bounds = this._googleMap.getBounds();
    const zoom = this._googleMap.getZoom();
    const projection = this._googleMap.getProjection();

    if (!bounds || !zoom || !projection) {
      return false;
    }

    const boundsNew =
      paddingXPixel === 0 && paddingYPixel === 0
        ? bounds
        : GeoMapUtils.makeBoundsWithPaddingPx(
            bounds,
            this._googleMap,
            paddingXPixel,
            paddingYPixel,
          );
    return !!boundsNew?.contains(latLng);
  };

  /**
   * ===============================================================================================
   * FeatureActivation 제어
   * ===============================================================================================
   */
  activateNodes = (layerId: GenIdType, nodes: GeoNode[]) => {
    const layer = this._geoMapLayerMap.get(layerId);
    if (!layer) {
      return false;
    }
    layer.activateNodes(nodes);
    return true;
  };
  deactivateNodes = (layerId: GenIdType, nodes: GeoNode[]) => {
    const layer = this._geoMapLayerMap.get(layerId);
    if (!layer) {
      return false;
    }
    layer.deactivateNodes(nodes);
    return true;
  };

  activateWays = (layerId: GenIdType, ways: GeoWay[]) => {
    const layer = this._geoMapLayerMap.get(layerId);
    if (!layer) {
      return false;
    }
    layer.activateWays(ways);
    return true;
  };
  deactivateWays = (layerId: GenIdType, ways: GeoWay[]) => {
    const layer = this._geoMapLayerMap.get(layerId);
    if (!layer) {
      return false;
    }
    layer.deactivateWays(ways);
    return true;
  };

  getLineSegmentsOfWay = (layerId: GenIdType, way: GeoWay) => {
    const layer = this._geoMapLayerMap.get(layerId);
    if (!layer) {
      return null;
    }
    return layer.getLineSegmentsOfWay(way);
  };

  activateLineSegments = (
    layerId: GenIdType,
    lineSegments: GeoLineSegment[],
  ) => {
    const layer = this._geoMapLayerMap.get(layerId);
    if (!layer) {
      return false;
    }
    layer.activateLineSegments(lineSegments);
    return true;
  };
  deactivateLineSegments = (
    layerId: GenIdType,
    lineSegments: GeoLineSegment[],
  ) => {
    const layer = this._geoMapLayerMap.get(layerId);
    if (!layer) {
      return false;
    }
    layer.deactivateLineSegments(lineSegments);
    return true;
  };

  deactivateAllFeatures = (layerId: GenIdType) => {
    const layer = this._geoMapLayerMap.get(layerId);
    if (!layer) {
      return false;
    }
    layer.deactivateAllFeatures();
    return true;
  };

  getFeaturesActivated = (layerId: GenIdType) => {
    const layer = this._geoMapLayerMap.get(layerId);
    if (!layer) {
      return;
    }
    return layer.getFeaturesActivated();
  };

  splitByNodes = (layerId: GenIdType) => {
    const layer = this._geoMapLayerMap.get(layerId);
    if (!layer) {
      return;
    }
    layer.splitByNodes();
  };

  /**
   * ===============================================================================================
   * GeoLineSegmentDirection
   * ===============================================================================================
   */
  /**
   * @see GeoLineSegmentManager.setLineSegmentDirectionsVisible
   */
  setLineSegmentDirectionsVisible = (layerId: GenIdType, visible: boolean) => {
    const layer = this._geoMapLayerMap.get(layerId);
    if (!layer) {
      return false;
    }
    return layer.setLineSegmentDirectionsVisible(visible);
  };

  /**
   * ===============================================================================================
   * Map 부가 기능들
   * ===============================================================================================
   */
  panTo = (latLng: GeoLatLngType) => {
    this._googleMap.panTo(latLng);
  };

  panBy = (latLng: GeoLatLngType) => {
    this._googleMap.panBy(latLng.lng, latLng.lat);
  };

  overlayImage = (bounds: GeoMapBoundsType, src: string) => {
    const northEast = new google.maps.LatLng(bounds.east, bounds.north);
    const southWest = new google.maps.LatLng(bounds.west, bounds.south);
    const googleMapBounds = new google.maps.LatLngBounds(northEast, southWest);
    return new google.maps.GroundOverlay(src, googleMapBounds, {
      clickable: false,
      map: this._googleMap,
    });
  };

  getNodeAndWayAndLineSegmentMaxZIndex = () => {
    let maxZIndex = 0;
    this._geoMapLayerMap.forEach((layer) => {
      maxZIndex = Math.max(
        maxZIndex,
        layer.getNodeAndWayAndLineSegmentMaxZIndex(),
      );
    });
    return maxZIndex;
  };

  /**
   * ===============================================================================================
   * DragBox 기능
   * ===============================================================================================
   */
  setDragBoxEnabled = (dragBoxEnabled: boolean) => {
    if (this._mapEventManager.isDragBoxEnabled() === dragBoxEnabled) {
      return false;
    }
    this._mapEventManager.setDragBoxEnabled(dragBoxEnabled);
    return true;
  };
  isDragBoxEnabled = () => {
    return this._mapEventManager.isDragBoxEnabled();
  };

  private _lassoPolyline: google.maps.Polyline | undefined;
  private _createLasso = (position: GeoLatLngType) => {
    const zIndex = this.getNodeAndWayAndLineSegmentMaxZIndex() + 1;

    const lineSymbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      strokeWeight: 3,
      scale: 1,
      zIndex,
    };
    this._lassoPolyline = new google.maps.Polyline({
      map: this._googleMap,
      path: [{ lng: position.lng, lat: position.lat }],
      strokeColor: theme.colors.secondary['500'],
      strokeOpacity: 0,
      clickable: false,
      draggable: false,
      zIndex,
      icons: [
        {
          icon: lineSymbol,
          offset: '0',
          repeat: '10px',
        },
      ],
    });
  };
  private _destroyLasso = () => {
    if (this._lassoPolyline) {
      this._lassoPolyline.setMap(null);
      this._lassoPolyline?.unbindAll();
      this._lassoPolyline = undefined;
    }
  };

  private _addLassoPosition = (position: GeoLatLngType) => {
    if (!this._lassoPolyline) {
      return false;
    }
    this._lassoPolyline.setPath([
      ...this._lassoPolyline.getPath().getArray(),
      { lng: position.lng, lat: position.lat },
    ]);
    return true;
  };

  /**
   * ===============================================================================================
   * Layer 기능
   * ===============================================================================================
   */
  getMapLayer = (id: GenIdType) => {
    return this._geoMapLayerMap.get(id);
  };

  createLayer = (policy?: GeoLayerPolicy) => {
    const layerId = this._layerIdGenerator.getNextId();
    const layer = new GeoLayer({
      id: layerId,
      map: this._googleMap,
      geoMapEventManager: this._mapEventManager,
      idGenerator: this._idGenerator,
      eventPreventer: this._eventPreventer,
      notificationEventManager: this.notificationEventManager,
      policy,
    });
    this._geoMapLayerMap.set(layerId, layer);
    const key = `GeoLayer-${layerId}`;
    layer.addToolBoxMenuButtonClickEventListener(key, (menu, event) => {
      this._toolBoxMenuButtonEventManager.invokeEventListeners(
        layerId,
        menu,
        event,
      );
    });
    layer.addFeatureCopiedEventListener(key, (feature) => {
      this._featureCopiedEventManager.invokeEventListeners(layerId, feature);
    });

    return layer;
  };

  deleteLayer = (layerId: GenIdType) => {
    const layer = this._geoMapLayerMap.get(layerId);
    if (!layer) {
      return false;
    }
    this._geoMapLayerMap.delete(layerId);

    const key = `GeoLayer-${layerId}`;
    layer.removeToolBoxMenuButtonClickEventListener(key);
    layer.removeFeatureCopiedEventListener(key);
    layer.destroy();
    return true;
  };

  getAllLayerIds = () => {
    return Array.from(this._geoMapLayerMap.keys());
  };

  setLayerPolicy = (layerId: GenIdType, policy: GeoLayerPolicy) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      return false;
    }
    layer.setPolicy(policy);
    return true;
  };
  getLayerPolicy = (layerId: GenIdType) => {
    return this.getMapLayer(layerId)?.getPolicy();
  };

  setLayerDragBoxEnabled = (layerId: GenIdType, dragBoxEnabled: boolean) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      return false;
    }
    layer.setDragBoxEnabled(dragBoxEnabled);
    return true;
  };
  isLayerDragBoxEnabled = (layerId: GenIdType) => {
    return this.getMapLayer(layerId)?.isDragBoxEnabled();
  };

  importJsonToLayer = (
    layerId: GenIdType,
    geoJson: FeatureCollection<Geometry, GeoJsonProperties>,
    isGenerateNewId?: boolean,
  ) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      return undefined;
    }
    return layer.importJson(geoJson, isGenerateNewId);
  };

  importJsonListToLayer = (
    layerId: GenIdType,
    geoJson: FeatureCollection<Geometry, GeoJsonProperties>[],
    isGenerateNewId?: boolean,
  ) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      return undefined;
    }
    return layer.importJsonList(geoJson, isGenerateNewId);
  };

  deleteFeaturesFromLayer = (layerId: GenIdType, features: GeoFeaturesType) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      return undefined;
    }
    layer.deleteFeatures(features);
  };

  exportJsonFromLayer = (layerId: GenIdType) => {
    return this.getMapLayer(layerId)?.exportJson();
  };

  isLayerEdited = (layerId: GenIdType) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      console.log(
        'INFO :: GeoMap :: isLayerEdited' +
          `${layerId} 레이어가 맵에 없습니다.`,
      );
      return false;
    }
    return layer.isEdited();
  };

  setIsLayerEdited = (layerId: GenIdType, isEdited: boolean) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      console.log(
        'INFO :: GeoMap :: setIsLayerEdited' +
          `${layerId} 레이어가 맵에 없습니다.`,
      );
      return false;
    }
    return layer.setIsEdited(isEdited);
  };

  /**
   * ===============================================================================================
   * 마커
   * ===============================================================================================
   */
  importMarker = (layerId: GenIdType, markerOptions: GeoMarkerOptionsType) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      console.log(
        'INFO :: GeoMap :: importMarker' + `${layerId} 레이어가 맵에 없습니다.`,
      );
      return false;
    }
    return layer.createMarker(markerOptions).getId();
  };

  deleteMarker = (layerId: GenIdType, markerId: MarkerIdType) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      console.log(
        'INFO :: GeoMap :: deleteMarkerFromLayer' +
          `${layerId} 레이어가 맵에 없습니다.`,
      );
      return false;
    }
    return layer.deleteMarker(markerId);
  };

  getMarkerZIndex = (layerId: GenIdType, markerId: MarkerIdType) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      console.log(
        'INFO :: GeoMap :: getMarkerZIndex' +
          `${layerId} 레이어가 맵에 없습니다.`,
      );
      return false;
    }
    return layer.getMarker(markerId)?.getZIndex();
  };

  setMarkerZIndex = (
    layerId: GenIdType,
    markerId: MarkerIdType,
    zIndex: number,
  ) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      console.log(
        'INFO :: GeoMap :: setMarkerZIndex' +
          `${layerId} 레이어가 맵에 없습니다.`,
      );
      return false;
    }
    return layer.getMarker(markerId)?.setZIndex(zIndex);
  };

  isMarkerSimplify = (layerId: GenIdType, markerId: MarkerIdType) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      console.log(
        'INFO :: GeoMap :: isMarkerSimplify' +
          `${layerId} 레이어가 맵에 없습니다.`,
      );
      return false;
    }
    return layer.isMarkerSimplify(markerId);
  };

  setMarkerSimplify = (
    layerId: GenIdType,
    markerId: MarkerIdType,
    isSimplify: boolean,
  ) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      console.log(
        'INFO :: GeoMap :: setMarkerSimplify' +
          `${layerId} 레이어가 맵에 없습니다.`,
      );
      return false;
    }
    return layer.setMarkerSimplify(markerId, isSimplify);
  };

  isMarkerActivated = (layerId: GenIdType, markerId: MarkerIdType) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      console.log(
        'INFO :: GeoMap :: isMarkerActivated' +
          `${layerId} 레이어가 맵에 없습니다.`,
      );
      return false;
    }
    return layer.isMarkerActivated(markerId);
  };

  setAllMarkerActivated = (layerId: GenIdType, isActivated: boolean) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      console.log(
        'INFO :: GeoMap :: setMarkerActivated' +
          `${layerId} 레이어가 맵에 없습니다.`,
      );
      return false;
    }
    return layer
      .getAllMarker()
      .forEach((marker) =>
        layer.setIsMarkerActivated(marker.getId(), isActivated),
      );
  };

  setIsMarkerActivated = (
    layerId: GenIdType,
    markerId: MarkerIdType,
    isActivated: boolean,
  ) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      console.log(
        'INFO :: GeoMap :: setMarkerActivated' +
          `${layerId} 레이어가 맵에 없습니다.`,
      );
      return false;
    }
    return layer.setIsMarkerActivated(markerId, isActivated);
  };

  setMarkerOptions = (
    layerId: GenIdType,
    markerId: MarkerIdType,
    markerOptions: GeoMarkerOptionsType,
  ) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      console.log(
        'INFO :: GeoMap :: setMarkerOptions' +
          `${layerId} 레이어가 맵에 없습니다.`,
      );
      return false;
    }
    return layer.setMarkerOptions(markerId, markerOptions);
  };

  getAllMarkerIds = (layerId: GenIdType) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      console.log(
        'INFO :: GeoMap :: getAllMarkerIds' +
          `${layerId} 레이어가 맵에 없습니다.`,
      );
      return undefined;
    }
    return layer.getAllMarker().map((marker) => marker.getId());
  };

  isMarkerFixingPosition = (layerId: GenIdType, markerId: MarkerIdType) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      console.log(
        'INFO :: GeoMap :: isMarkerFixingPosition' +
          `${layerId} 레이어가 맵에 없습니다.`,
      );
      return false;
    }
    return layer.getMarker(markerId)?.isFixingPosition();
  };

  setIsMarkerFixingPosition = (
    layerId: GenIdType,
    markerId: MarkerIdType,
    isFixingPosition: boolean,
  ) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      console.log(
        'INFO :: GeoMap :: setIsMarkerFixingPosition' +
          `${layerId} 레이어가 맵에 없습니다.`,
      );
      return false;
    }
    return layer.getMarker(markerId)?.setIsFixingPosition(isFixingPosition);
  };

  getMarkerPosition = (layerId: GenIdType, markerId: MarkerIdType) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      console.log(
        'INFO :: GeoMap :: getMarkerPosition' +
          `${layerId} 레이어가 맵에 없습니다.`,
      );
      return false;
    }
    return layer.getPosition(markerId);
  };

  setMarkerPosition = (
    layerId: GenIdType,
    markerId: MarkerIdType,
    position: GeoLatLngType,
  ) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      console.log(
        'INFO :: GeoMap :: setMarkerPosition' +
          `${layerId} 레이어가 맵에 없습니다.`,
      );
      return false;
    }
    return layer.setPosition(markerId, position);
  };

  getMarkerContent = (layerId: GenIdType, markerId: number) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      console.log(
        'INFO :: GeoMap :: getMarkerContent' +
          `${layerId} 레이어가 맵에 없습니다.`,
      );
      return false;
    }
    return layer.getMarkerContent(markerId);
  };

  setMarkerContent = (
    layerId: GenIdType,
    markerId: number,
    markerContentRenderFn: () => HTMLDivElement,
  ) => {
    const layer = this.getMapLayer(layerId);
    if (!layer) {
      console.log(
        'INFO :: GeoMap :: setMarkerContent' +
          `${layerId} 레이어가 맵에 없습니다.`,
      );
      return false;
    }
    return layer.setMarkerContent(markerId, markerContentRenderFn);
  };

  isExistStreetViewInPosition = async (position: GeoLatLngType) => {
    const streetViewService = new google.maps.StreetViewService();
    // 스트리트 뷰 파노라마의 존재 여부 확인
    const isExist = !!(await streetViewService.getPanorama(
      { location: position, radius: 50 },
      (data, status) => {
        return status === google.maps.StreetViewStatus.OK;
      },
    ));
    if (isExist) {
      return true;
    } else {
      this.notificationEventManager.invokeStreetViewNotFoundViewEventListener();
      return false;
    }
  };

  setStreetViewPosition = async (position: GeoLatLngType) => {
    // 스트리트 뷰 서비스 객체 생성
    const isExist = await this.isExistStreetViewInPosition(position);
    if (isExist) {
      this._streetView.setPosition(position);
      return true;
    } else {
      return false;
    }
  };

  setStreetViewVisible = async (
    isVisible: boolean,
    position?: GeoLatLngType,
  ) => {
    if (this._streetView.getVisible() === isVisible) {
      return false;
    }
    const viewPosition = position ?? this.getCenter();

    if (isVisible) {
      const isExist = await this.isExistStreetViewInPosition(viewPosition);
      if (isExist) {
        this._streetView.setVisible(true);
        this._streetView.setPosition(viewPosition);
        return true;
      } else {
        return false;
      }
    } else {
      const position = this._streetView.getPosition();
      if (!position) return false;
      this._streetViewPosition = GeoMapUtils.toLatLng(position);
      this._streetView.setVisible(false);
      return true;
    }
  };

  clearCandidateWhenWayCreating = (layerId: GenIdType) => {
    this.getMapLayer(layerId)?.clearCandidateWhenWayCreating();
  };

  /**
   * ===============================================================================================
   * EventListener
   * ===============================================================================================
   */
  addToolBoxMenuButtonClickEventListener = (
    listener: (
      layerId: GenIdType,
      menu: EditToolMenuEnum,
      event?: Event,
    ) => void,
  ) => {
    const key = `GeoMap-${this._idGenerator.getNextId()}`;
    if (this._toolBoxMenuButtonEventManager.addEventListener(key, listener)) {
      return key;
    }
    return undefined;
  };

  removeToolBoxMenuButtonClickEventListener = (key: string) => {
    return this._toolBoxMenuButtonEventManager.removeEventListener(key);
  };

  addFeatureCopiedEventListener = (
    listener: (
      layerId: GenIdType,
      feature: FeatureCollection<Geometry, GeoJsonProperties>,
    ) => void,
  ) => {
    const key = `GeoMap-${this._idGenerator.getNextId()}`;
    if (this._featureCopiedEventManager.addEventListener(key, listener)) {
      return key;
    }
    return undefined;
  };
  removeFeatureCopiedEventListener = (key: string) => {
    return this._featureCopiedEventManager.removeEventListener(key);
  };

  addMapTypeChangeStickyEventListener = (
    listener: (mapType: GeoMapTypeEnum) => void,
  ) => {
    return this._mapEventManager.addMapTypeChangeStickyEventListener(listener);
  };
  removeMapTypeChangeEventListener = (key: string) => {
    this._mapEventManager.removeEventListener(key);
  };

  addMapTypeIdChangeStickyEventListener = (
    listener: (mapTypeId: GeoMapTypeIdEnum) => void,
  ) => {
    return this._mapEventManager.addMapTypeIdChangeStickyEventListener(
      listener,
    );
  };
  removeMapTypeIdChangeEventListener = (key: string) => {
    this._mapEventManager.removeEventListener(key);
  };

  addMapTypeImageChangeStickyEventListener = (
    listener: (mapTypeImage: GeoMapTypeImageEnum) => void,
  ) => {
    return this._mapEventManager.addMapTypeImageChangeStickyEventListener(
      listener,
    );
  };
  removeMapTypeImageChangeEventListener = (key: string) => {
    this._mapEventManager.removeEventListener(key);
  };

  /**
   * ===============================================================================================
   * History
   * ===============================================================================================
   */
  redo = (layerId: GenIdType) => {
    this.getMapLayer(layerId)?.redo();
  };
  undo = (layerId: GenIdType) => {
    this.getMapLayer(layerId)?.undo();
  };
  historyClear = (layerId: GenIdType) => {
    this.getMapLayer(layerId)?.historyClear();
  };
}
export default GeoMap;
