export type GenIdType = number;

class IdGenerator {
  static START_ID_NUMBER = 10000;
  private _id: GenIdType = IdGenerator.START_ID_NUMBER;

  constructor(numberStart?: number) {
    if (numberStart) {
      this._id = numberStart;
    }
  }
  getNextId() {
    return this._id++;
  }
}

export default IdGenerator;
