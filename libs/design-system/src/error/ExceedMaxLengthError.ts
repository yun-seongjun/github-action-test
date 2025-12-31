class ExceedMaxLengthError extends Error {
  constructor(currentLength: number, maxLength: number) {
    super(
      `Exceeds maxLength. current length: ${currentLength}, maxLength: ${maxLength}`,
    );
  }
}

export default ExceedMaxLengthError;
