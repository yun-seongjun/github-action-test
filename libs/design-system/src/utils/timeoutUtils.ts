import debounce from 'lodash/debounce';
const throttle = (func: (args?: any) => void, limit: number) => {
  let inThrottle = false;
  let timerId: NodeJS.Timeout;
  const clear = () => {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
  };

  const throttleFunc = (args?: any) => {
    if (!inThrottle) {
      func(args);
      inThrottle = true;
      timerId = setTimeout(() => (inThrottle = false), limit);
    }
  };

  throttleFunc.clear = clear;
  return throttleFunc;
};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const TimeoutUtils = {
  throttle,
  debounce,
  sleep,
};

export default TimeoutUtils;
