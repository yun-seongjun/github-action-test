class MaxRetryError extends Error {
  constructor(value: any) {
    super(`Max retry error: ${value}`);
  }
}

export default MaxRetryError;
