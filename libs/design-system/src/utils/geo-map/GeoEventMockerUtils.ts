import { TypeUtils } from '@design-system/utils';
import { GeoLatLngType } from '@design-system/types';

export enum MouseEventEnum {
  DRAG_END = 'dragend',
  DRAG = 'drag',
  DRAG_START = 'dragstart',
  CLICK = 'click',
  DBLCLICK = 'dblclick',
  MOUSEDOWN = 'mousedown',
  MOUSEUP = 'mouseup',
  MOUSEOVER = 'mouseover',
  MOUSEOUT = 'mouseout',
  MOUSEMOVE = 'mousemove',
  MOUSEENTER = 'mouseenter',
  MOUSELEAVE = 'mouseleave',
}

const createMouseEvent = (eventType: MouseEventEnum) => {
  return new MouseEvent(eventType, {});
};

const createMapMouseEvent = (
  eventType: MouseEventEnum,
  latLng: GeoLatLngType,
): google.maps.MapMouseEvent => {
  const { lat, lng } = latLng;
  return {
    domEvent: createMouseEvent(eventType),
    stop: () => {
      return;
    },
    latLng: new google.maps.LatLng(lat, lng),
  };
};

const createMapMouseEventFromDomEvent = (
  map: google.maps.Map,
  event: MouseEvent | TouchEvent,
): google.maps.MapMouseEvent | undefined => {
  const clientRect = map.getDiv().getBoundingClientRect();
  const clientX =
    (TypeUtils.isMouseEvent(event)
      ? event.clientX
      : event.touches[0]?.clientX) - clientRect.x;
  const clientY =
    (TypeUtils.isMouseEvent(event)
      ? event.clientY
      : event.touches[0]?.clientY) - clientRect.y;

  const overlayView: google.maps.OverlayView = map.get('overlayView');
  const latLng = overlayView
    ?.getProjection()
    .fromContainerPixelToLatLng(new google.maps.Point(clientX, clientY));
  if (!latLng) {
    return undefined;
  }

  return {
    domEvent: event,
    stop: () => {
      event.stopPropagation();
      event.preventDefault();
    },
    latLng: new google.maps.LatLng(latLng),
  };
};

const GeoEventMockerUtils = {
  createMapMouseEvent,
  createMouseEvent,
  createMapMouseEventFromDomEvent,
};

export default GeoEventMockerUtils;
