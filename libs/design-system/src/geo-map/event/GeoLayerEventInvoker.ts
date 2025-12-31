import GeoMapEventManager, {
  GeoMapEventRemover,
} from '@design-system/geo-map/event/GeoMapEventManager';
import GeoNode from '@design-system/geo-map/feature/GeoNode';
import GeoWay from '@design-system/geo-map/feature/GeoWay';
import GeoLineSegment from '@design-system/geo-map/line-segment/GeoLineSegment';
import GeoLineSegmentManager from '@design-system/geo-map/line-segment/GeoLineSegmentManager';
import GeoMarker from '@design-system/geo-map/marker/GeoMarker';
import GeoFeatureVisibleManager from '@design-system/geo-map/optimizer/GeoFeatureVisibleManager';
import GeoPreNodeManager from '@design-system/geo-map/pre-node/GeoPreNodeManager';
import { GeoLatLngType } from '@design-system/types/geoMap.type';
import GeoEventMockerUtils, {
  MouseEventEnum,
} from '@design-system/utils/geo-map/GeoEventMockerUtils';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';

export interface GeoLayerEventInvokerPolicy {
  /**
   * 이벤트 활성화 여부. false인 경우, 다른 정책들도 모두 동작하지 않음
   */
  enabled: boolean;
  /**
   * 드래그 박스 활성화 여부. 하나의 레이어에만 true로 설정해야 함
   */
  dragBoxEnabled: boolean;
  /**
   * 펜슬 지원 여부
   * true: feature 선택 및 이동과 드래그 박스 생성 기능이 펜슬로만 가능. 지도 이동 및 확대/축소 기능이 손가락으로만 가능.
   * false: feature 선택 및 이동과 드래그 박스 생성을 펜슬 또는 손가락으로 가능. 지도 이동 및 확대/축소 기능이 펜슬 또는 손가락으로 가능.
   */
  pencilSupportedEnabled: boolean;
}

class GeoLayerEventInvoker {
  private readonly _googleMap: google.maps.Map;
  private readonly _mapEventManager: GeoMapEventManager;
  private readonly _mapEventRemover: GeoMapEventRemover;
  private readonly _lineSegmentManager: GeoLineSegmentManager;
  private readonly _preNodeManager: GeoPreNodeManager;
  private readonly _visibleManager: GeoFeatureVisibleManager;
  private _draggableMarker?: GeoMarker;
  private _enabled = false;
  private _dragBoxEnabled = false;
  private _pencilSupportedEnabled = false;

  constructor(
    googleMap: google.maps.Map,
    mapEventManager: GeoMapEventManager,
    lineSegmentManager: GeoLineSegmentManager,
    preNodeManager: GeoPreNodeManager,
    visibleManager: GeoFeatureVisibleManager,
    policy?: GeoLayerEventInvokerPolicy,
  ) {
    this._googleMap = googleMap;
    this._mapEventManager = mapEventManager;
    this._mapEventRemover = new GeoMapEventRemover(mapEventManager);
    this._lineSegmentManager = lineSegmentManager;
    this._preNodeManager = preNodeManager;
    this._visibleManager = visibleManager;

    policy && this.setPolicy(policy);

    let isMouseDown = false;
    let mapMouseDownEvent: google.maps.MapMouseEvent | undefined;
    let isDragging = false;
    let nodeClickableMouseDown: GeoNode | undefined;
    let nodeDraggableMouseDown: GeoNode | undefined;
    let preNodeMouseDown: GeoNode | undefined;
    let lineSegmentMouseDown: GeoLineSegment | undefined;
    let latLngDragBefore: GeoLatLngType | undefined;
    const resetState = () => {
      isMouseDown = false;
      isDragging = false;
      nodeClickableMouseDown = undefined;
      nodeDraggableMouseDown = undefined;
      preNodeMouseDown = undefined;
      lineSegmentMouseDown = undefined;
      latLngDragBefore = undefined;
    };

    const handleDownEvent = (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) {
        return;
      }

      if (isMouseDown) {
        return;
      }
      isMouseDown = true;
      mapMouseDownEvent = event;

      const latLng = GeoMapUtils.toLatLng(event.latLng);
      if (GeoMapUtils.IS_DEBUG) {
        console.log('mapMouseDownEvent, latLng', latLng, 'event', event);
      }
      const { nodeClickable, nodeDraggable } =
        this._visibleManager.getNodeClickableAndDraggableWithinPx(
          latLng,
          GeoNode.RADIUS_PX,
          { isNodeEnabled: true },
        );
      nodeClickableMouseDown = nodeClickable;
      nodeDraggableMouseDown = nodeDraggable;
      if (GeoMapUtils.IS_DEBUG) {
        console.log(
          'nodeClickableMouseDown',
          nodeClickableMouseDown?.getId(),
          'nodeDraggableMouseDown',
          nodeDraggableMouseDown?.getId(),
        );
      }
      if (nodeClickableMouseDown || nodeDraggableMouseDown) {
        return;
      }
      preNodeMouseDown = this._preNodeManager.getPreNodeWithinPx(
        latLng,
        GeoNode.RADIUS_PX,
      );
      if (GeoMapUtils.IS_DEBUG) {
        console.log('preNodeMouseDown', preNodeMouseDown?.getId());
      }
      if (preNodeMouseDown) {
        return;
      }
      lineSegmentMouseDown = this._lineSegmentManager.getLineSegmentWithinPx(
        latLng,
        GeoWay.STROKE_PX,
        {
          isClickable: true,
          isWayEnabled: true,
        },
      );
      if (GeoMapUtils.IS_DEBUG) {
        console.log('lineSegmentMouseDown', lineSegmentMouseDown?.getId());
      }
    };

    const handleMoveEvent = (event: google.maps.MapMouseEvent) => {
      if (
        !isMouseDown ||
        !mapMouseDownEvent ||
        !mapMouseDownEvent.latLng ||
        !event.latLng ||
        mapMouseDownEvent.latLng?.equals(event.latLng)
      ) {
        return;
      }

      // if (NextGeoMapUtils.IS_DEBUG) {
      //   console.log('mapMouseMoveEvent, event', event)
      // }

      const latLngDrag = GeoMapUtils.toLatLng(event.latLng);
      const latLngDragStart = GeoMapUtils.toLatLng(mapMouseDownEvent.latLng);

      if (this._draggableMarker) {
        // 마커의 포지션 변경
      }

      if (!isDragging) {
        const isDraggingInitialEventInvokable =
          this._isDraggingInitialEventInvokable(latLngDragStart, latLngDrag);
        const eventDragStart = GeoEventMockerUtils.createMapMouseEvent(
          MouseEventEnum.DRAG_START,
          latLngDragStart,
        );
        if (!isDraggingInitialEventInvokable) {
          if (nodeDraggableMouseDown) {
            nodeDraggableMouseDown.setPositionOnlyVisible(latLngDrag);
          } else if (preNodeMouseDown) {
            preNodeMouseDown.setPositionOnlyVisible(latLngDrag);
          } else if (lineSegmentMouseDown) {
            // lineSegment dragging not supported
          }
          return;
        }

        isDragging = true;
        if (nodeDraggableMouseDown) {
          nodeDraggableMouseDown.invokeDragStartEventListener(eventDragStart);
        } else if (preNodeMouseDown) {
          preNodeMouseDown.invokeDragStartEventListener(eventDragStart);
        } else if (lineSegmentMouseDown) {
          // lineSegment dragging not supported
        } else if (this._dragBoxEnabled) {
          this._mapEventManager.invokeDragBoxDragStartEventListener(
            eventDragStart,
            latLngDragStart,
          );
        }
      }

      const eventDrag = GeoEventMockerUtils.createMapMouseEvent(
        MouseEventEnum.DRAG,
        latLngDrag,
      );
      if (nodeDraggableMouseDown) {
        nodeDraggableMouseDown.invokeDragEventListener(eventDrag);
        nodeDraggableMouseDown.setPositionOnlyVisible(latLngDrag);
      } else if (preNodeMouseDown) {
        preNodeMouseDown.invokeDragEventListener(eventDrag);
        preNodeMouseDown.setPositionOnlyVisible(latLngDrag);
      } else if (lineSegmentMouseDown) {
        // lineSegment dragging not supported
      } else if (this._dragBoxEnabled) {
        this._mapEventManager.invokeDragBoxDragEventListeners(
          eventDrag,
          latLngDrag,
          latLngDragBefore || latLngDragStart,
          latLngDragStart,
        );
      }
      latLngDragBefore = latLngDrag;
    };

    const handleUpEvent = (event: google.maps.MapMouseEvent) => {
      if (!isMouseDown || !event.latLng || !mapMouseDownEvent?.latLng) {
        return;
      }

      if (GeoMapUtils.IS_DEBUG) {
        console.log('mapMouseUpEvent, event', event);
      }

      const latLngDragStart = GeoMapUtils.toLatLng(mapMouseDownEvent.latLng);
      if (isDragging) {
        const latLngDragEnd = GeoMapUtils.toLatLng(event.latLng);
        const eventDragEnd = GeoEventMockerUtils.createMapMouseEvent(
          MouseEventEnum.DRAG_END,
          latLngDragEnd,
        );
        if (nodeDraggableMouseDown) {
          nodeDraggableMouseDown.invokeDragEndEventListener(eventDragEnd);
        } else if (preNodeMouseDown) {
          preNodeMouseDown.invokeDragEndEventListener(eventDragEnd);
        } else if (lineSegmentMouseDown) {
          // lineSegment dragging not supported
        } else if (this._dragBoxEnabled) {
          this._mapEventManager.invokeDragBoxDragEndEventListeners(
            eventDragEnd,
            latLngDragEnd,
            latLngDragStart,
          );
        }
      } else if (mapMouseDownEvent && mapMouseDownEvent.latLng) {
        const clickEvent = GeoEventMockerUtils.createMapMouseEvent(
          MouseEventEnum.CLICK,
          latLngDragStart,
        );
        if (nodeClickableMouseDown) {
          nodeClickableMouseDown.invokeClickEventListener(clickEvent);
          nodeClickableMouseDown.clearPositionOnlyVisible();
        } else if (preNodeMouseDown) {
          preNodeMouseDown.invokeClickEventListener(clickEvent);
          preNodeMouseDown.clearPositionOnlyVisible();
        } else if (lineSegmentMouseDown) {
          this._lineSegmentManager.invokeLineSegmentClickEventListener(
            lineSegmentMouseDown,
            event,
          );
        }
      }

      resetState();
    };

    this._mapEventRemover.addEventId(
      this._mapEventManager.addMouseDownEventListener((event) => {
        if (!this._enabled || this._pencilSupportedEnabled) {
          return;
        }
        handleDownEvent(event);
      }),
    );
    this._mapEventRemover.addEventId(
      this._mapEventManager.addMouseMoveEventListener((event) => {
        if (!this._enabled || this._pencilSupportedEnabled) {
          return;
        }
        handleMoveEvent(event);
      }),
    );
    this._mapEventRemover.addEventId(
      this._mapEventManager.addMouseUpEventListener((event) => {
        if (!this._enabled || this._pencilSupportedEnabled) {
          return;
        }
        handleUpEvent(event);
      }),
    );

    this._mapEventRemover.addEventId(
      this._mapEventManager.addFingerDownEventListener((event) => {
        if (!this._enabled) {
          return;
        }
      }),
    );
    this._mapEventRemover.addEventId(
      this._mapEventManager.addFingerMoveEventListener((event) => {
        if (!this._enabled || !this._pencilSupportedEnabled) {
          return;
        }
      }),
    );
    this._mapEventRemover.addEventId(
      this._mapEventManager.addFingerUpEventListener((event) => {}),
    );
    this._mapEventRemover.addEventId(
      this._mapEventManager.addFingerMultipleDownEventListener((event) => {}),
    );
    this._mapEventRemover.addEventId(
      this._mapEventManager.addFingerMultipleMoveEventListener((event) => {}),
    );
    this._mapEventRemover.addEventId(
      this._mapEventManager.addFingerMultipleUpEventListener((event) => {}),
    );

    this._mapEventRemover.addEventId(
      this._mapEventManager.addPencilDownEventListener((event) => {
        if (!this._enabled || !this._pencilSupportedEnabled) {
          return;
        }
        handleDownEvent(event);
      }),
    );
    this._mapEventRemover.addEventId(
      this._mapEventManager.addPencilMoveEventListener((event) => {
        if (!this._enabled || !this._pencilSupportedEnabled) {
          return;
        }
        handleMoveEvent(event);
      }),
    );
    this._mapEventRemover.addEventId(
      this._mapEventManager.addPencilUpEventListener((event) => {
        if (!this._enabled || !this._pencilSupportedEnabled) {
          return;
        }
        handleUpEvent(event);
      }),
    );
  }

  setDraggableMarker = (marker?: GeoMarker) => {
    this._draggableMarker = marker;
  };

  getDraggableMarker = () => {
    return this._draggableMarker;
  };

  setEnabled = (enabled: boolean) => {
    this._enabled = enabled;
  };
  isEnabled = () => {
    return this._enabled;
  };
  setDragBoxEnabled = (enabled: boolean) => {
    this._dragBoxEnabled = enabled;
  };
  isDragBoxEnabled = () => {
    return this._dragBoxEnabled;
  };
  setPencilSupportedEnabled = (enabled: boolean) => {
    this._pencilSupportedEnabled = enabled;
  };
  getPencilSupportedEnabled = () => {
    return this._pencilSupportedEnabled;
  };
  setPolicy = (policy: GeoLayerEventInvokerPolicy) => {
    this.setEnabled(policy.enabled);
    this.setDragBoxEnabled(policy.dragBoxEnabled);
    this.setPencilSupportedEnabled(policy.pencilSupportedEnabled);
  };
  getPolicy = (): GeoLayerEventInvokerPolicy => {
    return {
      enabled: this.isEnabled(),
      dragBoxEnabled: this.isDragBoxEnabled(),
      pencilSupportedEnabled: this.getPencilSupportedEnabled(),
    };
  };

  private _isDraggingInitialEventInvokable = (
    latLng1: GeoLatLngType,
    latLng2: GeoLatLngType,
  ) => {
    const zoomLevel = this._googleMap.getZoom();
    if (zoomLevel === undefined) {
      return false;
    }
    const radius =
      GeoMapUtils.calculateDistance(
        latLng1,
        GeoNode.RADIUS_PX,
        this._googleMap,
      ) ?? 0;
    const distance = GeoMapUtils.getDistanceTwoPoint(latLng1, latLng2);
    const diff = distance - radius;
    return diff > 0;
  };

  destroy = () => {
    this._mapEventRemover.destroy();
  };
}

export default GeoLayerEventInvoker;
