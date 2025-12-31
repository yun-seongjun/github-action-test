// @link https://developers.google.com/maps/documentation/javascript/reference/map?hl=ko#Map.center_changed

export enum GeoMapEventNameEnum {
  BOUNDS_CHANGED = 'bounds_changed',
  CENTER_CHANGED = 'center_changed',
  CLICK = 'click',
  DOUBLE_CLICK = 'dblclick',
  CONTEXT_MENU = 'contextmenu',
  DRAG = 'drag',
  DRAG_END = 'dragend',
  DRAG_START = 'dragstart',
  HEADING_CHANGED = 'heading_changed',
  IDLE = 'idle',
  IS_FRACTIONAL_ZOOM_ENABLED_CHANGED = 'isfractionalzoomenabled_changed',
  MAP_CAPABILITIES_CHANGED = 'mapcapabilities_changed',
  MAP_TYPE_ID_CHANGED = 'maptypeid_changed',
  MOUSE_MOVE = 'mousemove',
  MOUSE_OUT = 'mouseout',
  MOUSE_OVER = 'mouseover',
  PROJECTION_CHANGED = 'projection_changed',
  RENDERING_TYPE_CHANGED = 'renderingtype_changed',
  TILES_LOADED = 'tilesloaded',
  TILT_CHANGED = 'tilt_changed',
  ZOOM_CHANGED = 'zoom_changed',
  ZOOM_CHANGED_DEBOUNCE = 'zoom_changed_debounce',
  // custom events
  FINGER_DOWN = 'fingerdown',
  FINGER_MOVE = 'fingermove',
  FINGER_UP = 'fingerup',
  FINGER_MULTIPLE_DOWN = 'fingermultipledown',
  FINGER_MULTIPLE_MOVE = 'fingermultiplemove',
  FINGER_MULTIPLE_UP = 'fingermultipleup',
  PENCIL_DOWN = 'pencildown',
  PENCIL_MOVE = 'pencilmove',
  PENCIL_UP = 'pencilup',
}

export enum StreetViewEventNameEnum {
  POSITION_CHANGED = 'position_changed',
  POV_CHANGED = 'pov_changed',
  PANO_CHANGED = 'pano_changed',
  LINKS_CHANGED = 'links_changed',
  VISIBLE_CHANGED = 'visible_changed',
}

export enum GeoMapElementEventNameEnum {
  TOUCH_START = 'touchstart',
  TOUCH_MOVE = 'touchmove',
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

// 테스트 필요
class EventListenerManager<
  TKey,
  TCallbackArgs extends (...args: any[]) => ReturnType<TCallbackArgs>,
> {
  private _eventListenerMap: Map<TKey, TCallbackArgs> = new Map();
  private _debounceTimeMs: number;
  private _debounceTimeoutId: NodeJS.Timeout | null = null;
  private _debounceEventInvokedListenerMap: Map<TKey, TCallbackArgs> =
    new Map();

  constructor(debounceTimeMs = 100) {
    this._debounceTimeMs = debounceTimeMs;
  }

  isEventListening = (key: TKey): boolean => {
    return this._eventListenerMap.has(key);
  };

  addEventListener = (key: TKey, listener: TCallbackArgs): boolean => {
    if (this.isEventListening(key)) {
      return false;
    }
    this._eventListenerMap.set(key, listener);
    return true;
  };

  removeEventListener = (key: TKey): boolean => {
    return this._eventListenerMap.delete(key);
  };

  invokeEventListeners = (...args: Parameters<TCallbackArgs>) => {
    this._eventListenerMap.forEach((listener) => {
      listener(...args);
    });
  };

  // 이벤트가 같은시간 내 너무 여러번 발생할 때 마지막 한번만 이벤트가 발생하도록 debounce를 겁니다.
  invokeDebounceEventListeners = (...args: Parameters<TCallbackArgs>) => {
    this._clearDebounceTimeout();
    this._debounceTimeoutId = setTimeout(() => {
      this.invokeEventListeners(...args);
      this._debounceEventInvokedListenerMap.forEach((listener) => {
        listener(...args);
      });
      this._debounceTimeoutId = null;
    }, this._debounceTimeMs);
  };

  isInvokeDebounced = () => {
    return this._debounceTimeoutId !== null;
  };

  private _clearDebounceTimeout = () => {
    if (this._debounceTimeoutId) {
      clearTimeout(this._debounceTimeoutId);
      this._debounceTimeoutId = null;
    }
  };

  addDebounceEventInvokedListener = (
    key: TKey,
    listener: TCallbackArgs,
  ): boolean => {
    if (this._debounceEventInvokedListenerMap.has(key)) {
      return false;
    }
    this._debounceEventInvokedListenerMap.set(key, listener);
    return true;
  };

  removeDebounceEventInvokedListener = (key: TKey): boolean => {
    return this._debounceEventInvokedListenerMap.delete(key);
  };

  clear = () => {
    this._clearDebounceTimeout();
    this._eventListenerMap.clear();
    this._debounceEventInvokedListenerMap.clear();
  };

  destroy = () => {
    this.clear();
  };
}

export default EventListenerManager;
