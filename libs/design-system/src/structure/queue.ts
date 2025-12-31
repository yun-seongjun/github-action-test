/**
 * Circular Queue
 */
class Queue<TData> {
  /**
   * @param size The size of the queue
   * @private
   */
  private list: TData[];
  private length: number;
  private count: number;
  private indexOfHead: number;
  private indexOfTail: number;

  constructor(size: number = 10) {
    this.list = new Array(size);
    this.length = size;
    this.count = 0;
    this.indexOfHead = 0;
    this.indexOfTail = 0;
  }

  public offer(data: TData): boolean {
    if (this.isFull()) {
      return false;
    }
    this.list[this.indexOfTail] = data;
    this.count += 1;
    this.indexOfTail = (this.indexOfTail + 1) % this.length;
    return true;
  }

  public poll(): TData | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    const data = this.list[this.indexOfHead];
    this.count -= 1;
    this.indexOfHead = (this.indexOfHead + 1) % this.length;
    return data;
  }

  public peek(): TData | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.list[this.indexOfHead];
  }

  public isEmpty(): boolean {
    return this.count === 0;
  }

  public isFull(): boolean {
    return this.count === this.length;
  }

  public getCount(): number {
    return this.count;
  }

  public clear(): void {
    this.count = 0;
    this.indexOfHead = 0;
    this.indexOfTail = 0;
  }
}

export default Queue;
