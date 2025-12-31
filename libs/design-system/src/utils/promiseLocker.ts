/**
 * lockKey와 lockToken이 각각 키와 자물쇠 입니다.
 */
export const PromiseLocker = () => {
  const lockList: (() => void)[] = [];
  let isLocked = false;

  /**
   * lock을 거는 함수
   * @return true: lock을 걸음(기존에 lock이 안걸려 있는 상태)
   *         false: lock을 거는데 실패함(이미 lock이 걸려 있는 상태)
   */
  const lock = () => {
    // ERR:: 이미 잠겨있습니다.
    if (isLocked) {
      return false;
    }
    isLocked = true;
    return true;
  };

  // 잠김이 풀릴 때 까지 락을 검
  const waitUnLock = () => {
    if (!isLocked) {
      throw new Error('ERR:: 잠겨있지 않습니다.');
    }

    return new Promise((resolve) => {
      lockList.push(() => resolve(''));
    });
  };

  const release = () => {
    if (!isLocked) {
      throw new Error('ERR:: 잠겨있지 않습니다.');
    }

    lockList.forEach((resolve) => {
      resolve();
    });
    lockList.length = 0;
    isLocked = false;
  };

  return { waitUnLock, release, lock };
};
