const isUndefinedOrNull = <TValue = unknown>(
  value: TValue | undefined | null,
): value is undefined | null => {
  return value === undefined || value === null;
};

const isDefined = <T>(value: T | undefined): value is T => {
  return value !== undefined;
};

const isMouseEvent = (event: Event): event is MouseEvent => {
  return (event as MouseEvent).clientX !== undefined;
};

const isTouchEvent = (event: Event): event is TouchEvent => {
  return (event as TouchEvent).touches !== undefined;
};

const isType = <T>(value: any, checkFn: (val: T) => boolean): value is T => {
  return checkFn(value);
};

export const TypeUtils = {
  isUndefinedOrNull,
  isDefined,
  isMouseEvent,
  isTouchEvent,
  isType,
};
