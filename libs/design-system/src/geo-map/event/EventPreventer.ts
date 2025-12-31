export enum EventPreventerTypeEnum {
  CLICK = 'CLICK',
  MAP_TYPE_ID = 'MAP_TYPE_ID',
}

export interface EventPreventerInfo {
  preventNextEvent: boolean;
  eventPreventTimeMs: number;
  eventAtMs: number;
}

const EVENT_PREVENTER_INFO_DEFAULT = {
  preventNextEvent: false,
  eventPreventTimeMs: 100,
  eventAtMs: 0,
};

class EventPreventer<TEvent extends PropertyKey = EventPreventerTypeEnum> {
  private _eventPreventMap: Map<TEvent, EventPreventerInfo> = new Map();

  constructor(
    eventPrevneterInfos?: Partial<Record<TEvent, EventPreventerInfo>>,
  ) {
    eventPrevneterInfos &&
      Object.keys(eventPrevneterInfos).forEach((key) => {
        const eventPreventType = key as TEvent;
        const { preventNextEvent, eventPreventTimeMs, eventAtMs } =
          eventPrevneterInfos?.[eventPreventType] ||
          EVENT_PREVENTER_INFO_DEFAULT;
        this._eventPreventMap.set(eventPreventType, {
          preventNextEvent,
          eventPreventTimeMs,
          eventAtMs,
        });
      });
  }

  updateEventAtToNow = (type: TEvent) => {
    const now = Date.now();
    const eventPreventInfo = this._eventPreventMap.get(type);
    if (!eventPreventInfo) {
      this._eventPreventMap.set(type, {
        ...EVENT_PREVENTER_INFO_DEFAULT,
        eventAtMs: now,
      });
      return false;
    }
    eventPreventInfo.eventAtMs = now;
    return true;
  };

  isPrevent = (type: TEvent) => {
    const eventPreventInfo = this._eventPreventMap.get(type);
    if (!eventPreventInfo) {
      return false;
    }

    if (eventPreventInfo.preventNextEvent) {
      return true;
    }
    return (
      Date.now() - eventPreventInfo.eventAtMs <
      eventPreventInfo.eventPreventTimeMs
    );
  };

  preventAtOnce = (type: TEvent) => {
    const eventPreventInfo = this._eventPreventMap.get(type);
    if (!eventPreventInfo) {
      return false;
    }
    eventPreventInfo.preventNextEvent = true;
    return true;
  };

  releasePreventAtOnce = (type: TEvent) => {
    const eventPreventInfo = this._eventPreventMap.get(type);
    if (!eventPreventInfo) {
      return false;
    }
    eventPreventInfo.preventNextEvent = false;
    return true;
  };

  destroy = () => {
    this._eventPreventMap.clear();
  };
}

export default EventPreventer;
