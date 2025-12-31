import EventListenerManager from '@design-system/geo-map/event/EventListenerManager';
import GeoMapEventManager, {
  GeoMapEventRemover,
} from '@design-system/geo-map/event/GeoMapEventManager';
import GeoMarker, {
  GeoMarkerEventNameEnum,
  GeoMarkerOptionsType,
  MarkerIdType,
} from '@design-system/geo-map/marker/GeoMarker';
import { GeoLatLngType } from '@design-system/types/geoMap.type';
import IdGenerator from '@design-system/utils/geo-map/IdGenerator';
import { EnvUtils } from '@design-system/utils';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';

export interface GeoMarkerPolicy {
  // 아직 마커의 드래그 기능을 사용하는 곳이 없습니다.
  isDraggable: boolean;
  isClickable: boolean;
}

class GeoMarkerManager {
  static INIT_POLICY: GeoMarkerPolicy = {
    isDraggable: false,
    isClickable: false,
  };
  private _idGenerator: IdGenerator = new IdGenerator();
  private readonly _map: google.maps.Map;
  private readonly _mapEventManager: GeoMapEventManager;
  private _markerMap: Map<MarkerIdType, GeoMarker> = new Map();

  private _isClickable = GeoMarkerManager.INIT_POLICY.isClickable;
  private _isDraggable = false;

  private _markerMouseEnterEventManager: EventListenerManager<
    string,
    (marker: GeoMarker) => void
  > = new EventListenerManager();
  private _markerMouseLeaveEventManager: EventListenerManager<
    string,
    (marker: GeoMarker) => void
  > = new EventListenerManager();
  private _markerAddedEventManager: EventListenerManager<
    string,
    (marker: GeoMarker) => void
  > = new EventListenerManager();
  private _markerDeletedEventManager: EventListenerManager<
    string,
    (marker: GeoMarker) => void
  > = new EventListenerManager();
  private _markerActivatedEventManager: EventListenerManager<
    string,
    (marker: GeoMarker, isActivated: boolean) => void
  > = new EventListenerManager();
  private _markerIsSimplifyEventManager: EventListenerManager<
    string,
    (marker: GeoMarker, isSimplify: boolean) => void
  > = new EventListenerManager();
  private _markerClickEventManager: EventListenerManager<
    string,
    (marker: GeoMarker) => void
  > = new EventListenerManager();
  private _markerPositionChangeEventManager: EventListenerManager<
    string,
    (
      marker: GeoMarker,
      beforePosition: GeoLatLngType,
      newPosition: GeoLatLngType,
    ) => void
  > = new EventListenerManager();
  private _markerDragStartEventManager: EventListenerManager<
    string,
    (marker: GeoMarker, newPosition: GeoLatLngType) => void
  > = new EventListenerManager();
  private _markerDragEventManager: EventListenerManager<
    string,
    (
      marker: GeoMarker,
      beforePosition: GeoLatLngType,
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

  private _mapEventRemover: GeoMapEventRemover;

  constructor({
    mapEventManager,
    map,
    policy = GeoMarkerManager.INIT_POLICY,
  }: {
    map: google.maps.Map;
    mapEventManager: GeoMapEventManager;
    policy?: GeoMarkerPolicy;
  }) {
    this._map = map;
    this._mapEventManager = mapEventManager;
    this._mapEventRemover = new GeoMapEventRemover(this._mapEventManager);

    this.setPolicy(policy);
  }

  getMarker = (markerId: MarkerIdType) => {
    return this._markerMap.get(markerId);
  };

  getAllMarker = () => {
    return [...this._markerMap.values()];
  };

  isClickable = () => {
    return this._isClickable;
  };

  setClickable = (isClickable: boolean) => {
    if (this._isClickable === isClickable) return;
    if (!isClickable) {
      this.getAllMarker().map((marker) => marker.setIsClickable(isClickable));
    }
    this._isClickable = isClickable;
  };

  isDraggable = () => {
    return this._isDraggable;
  };

  setIsDraggable = (isDraggable: boolean) => {
    if (this._isDraggable === isDraggable) return;
    if (!isDraggable) {
      this.getAllMarker().map((marker) => marker.setIsDraggable(isDraggable));
    }
    this._isDraggable = isDraggable;
  };

  setPolicy = (policy: GeoMarkerPolicy) => {
    this.setClickable(policy.isClickable);
    this.setIsDraggable(policy.isDraggable);
  };

  getPolicy = (): GeoMarkerPolicy => {
    return {
      isClickable: this._isClickable,
      isDraggable: this._isDraggable,
    };
  };

  getMarkerContent = (markerId: MarkerIdType) => {
    const marker = this.getMarker(markerId);
    if (!marker) {
      console.log(
        'INFO:: GeoMarkerManager :: getMarkerContent ::' +
          `${markerId} 마커가 없습니다.`,
      );
      return;
    }
    return marker.getMarkerContent();
  };

  setMarkerContent = (
    markerId: MarkerIdType,
    markerContentRenderFn: () => HTMLDivElement,
  ) => {
    const marker = this.getMarker(markerId);
    if (!marker) {
      console.log(
        'INFO:: GeoMarkerManager :: setMarkerContent ::' +
          `${markerId} 마커가 없습니다.`,
      );
      return false;
    }
    marker.setMarkerContent(markerContentRenderFn);
  };

  createMarker = ({ id, position, options }: GeoMarkerOptionsType) => {
    const markerId = id ?? this._idGenerator.getNextId();
    const markerNew = new GeoMarker({
      id: markerId,
      map: this._map,
      position,
      mapEventManager: this._mapEventManager,
      options,
    });

    this._markerMap.set(markerId, markerNew);
    this._markerAddedEventManager.invokeEventListeners(markerNew);

    markerNew.addClickEventListener(GeoMarkerEventNameEnum.CLICK, (marker) => {
      this._markerClickEventManager.invokeEventListeners(marker);
    });
    markerNew.addDragEventListener(
      GeoMarkerEventNameEnum.DRAG,
      (marker, oldPosition, newPosition) => {
        this._markerDragEventManager.invokeEventListeners(
          marker,
          oldPosition,
          newPosition,
        );
      },
    );
    markerNew.addDragStartEventListener(
      GeoMarkerEventNameEnum.DRAG_START,
      (marker, newPosition) => {
        this._markerDragStartEventManager.invokeEventListeners(
          marker,
          newPosition,
        );
      },
    );
    markerNew.addDragEndEventListener(
      GeoMarkerEventNameEnum.DRAG_END,
      (marker, startPosition, newPosition) => {
        this._markerDragEndEventManager.invokeEventListeners(
          marker,
          startPosition,
          newPosition,
        );
      },
    );
    markerNew.addMouseEnterEventListener(
      GeoMarkerEventNameEnum.MOUSE_ENTER,
      (marker) => {
        this._markerMouseEnterEventManager.invokeEventListeners(marker);
      },
    );
    markerNew.addMouseLeaveEventListener(
      GeoMarkerEventNameEnum.MOUSE_LEAVE,
      (marker) => {
        this._markerMouseLeaveEventManager.invokeEventListeners(marker);
      },
    );
    markerNew.addPositionChangeEventListener(
      GeoMarkerEventNameEnum.POSITION_CHANGE,
      (marker, positionOld, positionNew) => {
        this._markerPositionChangeEventManager.invokeEventListeners(
          marker,
          positionOld,
          positionNew,
        );
      },
    );
    return markerNew;
  };

  deleteMarker = (markerId: MarkerIdType) => {
    const marker = this.getMarker(markerId);
    if (!marker) {
      EnvUtils.isDevMode() &&
        console.log(
          'INFO:: GeoMarkerManager :: deleteMarker ::' +
            `${markerId} 마커가 없습니다.`,
        );
      return false;
    }
    this._markerMap.delete(markerId);
    this._markerDeletedEventManager.invokeEventListeners(marker);
    marker.destroy();
    return true;
  };

  isSimplify = (markerId: MarkerIdType) => {
    const marker = this.getMarker(markerId);
    if (!marker) {
      EnvUtils.isDevMode() &&
        console.log(
          'INFO:: GeoMarkerManager :: setIsSimplify ::' +
            `${markerId} 마커가 없습니다.`,
        );
      return false;
    }
    return marker.isSimplify();
  };

  setIsSimplify = (markerId: MarkerIdType, isSimplify: boolean) => {
    const marker = this.getMarker(markerId);
    if (!marker) {
      EnvUtils.isDevMode() &&
        console.log(
          'INFO:: GeoMarkerManager :: setIsSimplify ::' +
            `${markerId} 마커가 없습니다.`,
        );
      return false;
    }
    marker.setIsSimplify(isSimplify);
    this._markerIsSimplifyEventManager.invokeEventListeners(marker, isSimplify);
    return true;
  };

  isActivated = (markerId: MarkerIdType) => {
    const marker = this.getMarker(markerId);
    if (!marker) {
      EnvUtils.isDevMode() &&
        console.log(
          'INFO:: GeoMarkerManager :: isActivated ::' +
            `${markerId} 마커가 없습니다.`,
        );
      return false;
    }
    return marker.isActivated();
  };

  setIsActivated = (markerId: MarkerIdType, isActivated: boolean) => {
    const marker = this.getMarker(markerId);
    if (!marker) {
      EnvUtils.isDevMode() &&
        console.log(
          'INFO:: GeoMarkerManager :: setIsActivated ::' +
            `${markerId} 마커가 없습니다.`,
        );
      return false;
    }
    if (marker.isActivated() === isActivated) {
      return false;
    }
    marker.setActivated(isActivated);
    this._markerActivatedEventManager.invokeEventListeners(marker, isActivated);
    return true;
  };

  setPosition = (markerId: MarkerIdType, position: GeoLatLngType) => {
    const marker = this.getMarker(markerId);
    if (!marker) {
      EnvUtils.isDevMode() &&
        console.log(
          'INFO:: GeoMarkerManager :: setPosition ::' +
            `${markerId} 마커가 없습니다.`,
        );
      return false;
    }
    if (GeoMapUtils.isLatLngEquals(marker.getPosition(), position)) return;
    const newPosition = GeoMapUtils.formatToFixedPosition(position);
    return marker.setPosition(newPosition);
  };

  getPosition = (markerId: MarkerIdType) => {
    const marker = this.getMarker(markerId);
    if (!marker) {
      EnvUtils.isDevMode() &&
        console.log(
          'INFO:: GeoMarkerManager :: getPosition ::' +
            `${markerId} 마커가 없습니다.`,
        );
      return;
    }
    return marker.getPosition();
  };

  setOptions = (markerId: MarkerIdType, options: GeoMarkerOptionsType) => {
    const marker = this.getMarker(markerId);
    if (!marker) {
      EnvUtils.isDevMode() &&
        console.log(
          'INFO:: GeoMarkerManager :: setOptions ::' +
            `${markerId} 마커가 없습니다.`,
        );
      return false;
    }
    return marker.setOptions(options);
  };

  /**
   * =========================================================================================================
   * EventListener
   * =========================================================================================================
   */
  addMarkerMouseLeaveEventListener = (
    key: string,
    listener: (marker: GeoMarker) => void,
  ) => {
    return this._markerMouseLeaveEventManager.addEventListener(key, listener);
  };

  removeMarkerMouseLeaveEventListener = (key: string) => {
    return this._markerMouseLeaveEventManager.removeEventListener(key);
  };

  addMarkerMouseEnterEventListener = (
    key: string,
    listener: (marker: GeoMarker) => void,
  ) => {
    return this._markerMouseEnterEventManager.addEventListener(key, listener);
  };

  removeMarkerMouseEnterEventListener = (key: string) => {
    return this._markerMouseEnterEventManager.removeEventListener(key);
  };
  addMarkerAddedEventListener = (
    key: string,
    listener: (marker: GeoMarker) => void,
  ) => {
    return this._markerAddedEventManager.addEventListener(key, listener);
  };

  removeMarkerAddedEventListener = (key: string) => {
    return this._markerAddedEventManager.removeEventListener(key);
  };

  addMarkerDeletedEventListener = (
    key: string,
    listener: (marker: GeoMarker) => void,
  ) => {
    return this._markerDeletedEventManager.addEventListener(key, listener);
  };

  removeMarkerDeletedEventListener = (key: string) => {
    return this._markerDeletedEventManager.removeEventListener(key);
  };

  addMarkerClickedEventListener = (
    key: string,
    listener: (marker: GeoMarker) => void,
  ) => {
    return this._markerClickEventManager.addEventListener(key, listener);
  };

  removeMarkerClickedEventListener = (key: string) => {
    return this._markerClickEventManager.removeEventListener(key);
  };

  addMarkerActivatedEventListener = (
    key: string,
    listener: (marker: GeoMarker, isActivated: boolean) => void,
  ) => {
    return this._markerActivatedEventManager.addEventListener(key, listener);
  };

  removeMarkerActivatedEventListener = (key: string) => {
    return this._markerActivatedEventManager.removeEventListener(key);
  };

  addMarkerIsSimplifyEventListener = (
    key: string,
    listener: (marker: GeoMarker, isSimplify: boolean) => void,
  ) => {
    return this._markerIsSimplifyEventManager.addEventListener(key, listener);
  };

  removeIsSimplifyEventListener = (key: string) => {
    return this._markerIsSimplifyEventManager.removeEventListener(key);
  };

  addMarkerPositionChangeEventListener = (
    key: string,
    listener: (
      marker: GeoMarker,
      before: GeoLatLngType,
      newPosition: GeoLatLngType,
    ) => void,
  ) => {
    return this._markerPositionChangeEventManager.addEventListener(
      key,
      listener,
    );
  };

  removeMarkerPositionChangeEventListener = (key: string) => {
    return this._markerPositionChangeEventManager.removeEventListener(key);
  };

  destroy = () => {
    this._markerMouseEnterEventManager.destroy();
    this._markerMouseLeaveEventManager.destroy();
    this._markerAddedEventManager.destroy();
    this._markerDeletedEventManager.destroy();
    this._markerClickEventManager.destroy();
    this._markerIsSimplifyEventManager.destroy();
    this._markerActivatedEventManager.destroy();
    this._markerPositionChangeEventManager.destroy();
    this._markerDragStartEventManager.destroy();
    this._markerDragEventManager.destroy();
    this._markerDragEndEventManager.destroy();

    this._markerMap.forEach((marker) => {
      marker.destroy();
    });
    this._markerMap.clear();
    this._mapEventRemover.destroy();
  };
}

export default GeoMarkerManager;
