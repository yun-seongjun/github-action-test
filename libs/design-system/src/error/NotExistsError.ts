class NotExistsError extends Error {
  constructor(value: any) {
    super(`Not Found. value: ${value}`);
  }
}

export default NotExistsError;
