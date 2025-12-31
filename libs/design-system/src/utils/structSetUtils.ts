/**
 * Set 자료구조의 util 함수
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 */

/**
 * set에 value를 추가
 * @param set
 * @param value
 */
const add = <TValue = number>(
  set: Set<NonNullable<TValue>>,
  value: NonNullable<TValue> | NonNullable<TValue>[],
) => {
  if (Array.isArray(value)) {
    value.forEach((v) => set.add(v));
  } else {
    set.add(value);
  }
};

/**
 * set에서 value를 삭제
 * @param set
 * @param value
 */
const remove = <TValue = number>(
  set: Set<NonNullable<TValue>>,
  value: NonNullable<TValue> | NonNullable<TValue>[],
): boolean => {
  const isValueArray = Array.isArray(value);
  if (
    (isValueArray && value.length === 0) ||
    (!isValueArray && !set.has(value))
  ) {
    return false;
  }
  if (isValueArray) {
    value.forEach((v) => set.delete(v));
  } else {
    set.delete(value);
  }
  return true;
};

/**
 * set1과 set2의 합칩합을 구함
 * @param set1
 * @param set2
 */
const union = <TValue = number>(
  set1: Set<NonNullable<TValue>>,
  set2: Set<NonNullable<TValue>>,
) => {
  const result = new Set<TValue>(set1);
  Array.from(set2).forEach((v) => result.add(v));
  return result;
};

/**
 * set1과 set2의 차집합을 구함
 * @param set1
 * @param set2
 */
const difference = <TValue = number>(
  set1: Set<NonNullable<TValue>>,
  set2: Set<NonNullable<TValue>>,
) => {
  const result = new Set<NonNullable<TValue>>();
  Array.from(set1).forEach((v) => {
    if (!set2.has(v)) {
      result.add(v);
    }
  });
  return result;
};

/**
 * set1과 set2의 교집합을 구함
 * @param set1
 * @param set2
 */
const intersection = <TValue = number>(
  set1: Set<NonNullable<TValue>>,
  set2: Set<NonNullable<TValue>>,
) => {
  const result = new Set<NonNullable<TValue>>();
  Array.from(set1).forEach((v) => {
    if (set2.has(v)) {
      result.add(v);
    }
  });
  Array.from(set2).forEach((v) => {
    if (set1.has(v)) {
      result.add(v);
    }
  });
  return result;
};

/**
 * set1과 set2의 대칭차집합을 구함
 * @param set1
 * @param set2
 */
const symmetricDifference = <TValue = number>(
  set1: Set<NonNullable<TValue>>,
  set2: Set<NonNullable<TValue>>,
) => {
  const result = new Set<NonNullable<TValue>>();
  Array.from(set1).forEach((v) => {
    if (!set2.has(v)) {
      result.add(v);
    }
  });
  Array.from(set2).forEach((v) => {
    if (!set1.has(v)) {
      result.add(v);
    }
  });
  return result;
};

/**
 * self가 set2에 포함안되어 있는지를 구함
 * @param self
 * @param set2
 */
const isDisjoint = <TValue = number>(
  self: Set<NonNullable<TValue>>,
  set2: Set<NonNullable<TValue>>,
) => {
  return Array.from(self).every((v) => !set2.has(v));
};

/**
 * self가 set2의 부분집합인지를 구함
 * @param self
 * @param set2
 */
const isSubset = <TValue = number>(
  self: Set<NonNullable<TValue>>,
  set2: Set<NonNullable<TValue>>,
) => {
  return Array.from(self).every((v) => set2.has(v));
};

/**
 * self가 set2의 초집합인지를 구함
 * @param self
 * @param set2
 */
const isSuperset = <TValue = number>(
  self: Set<NonNullable<TValue>>,
  set2: Set<NonNullable<TValue>>,
) => {
  return Array.from(set2).every((v) => self.has(v));
};

/**
 * set을 list로 변환
 * @param set
 */
const toList = <TValue = number>(set: Set<NonNullable<TValue>>) => {
  return Array.from(set);
};

/**
 * set이 비어있는지를 구함
 * @param set
 */
const isEmpty = <TValue = number>(set: Set<NonNullable<TValue>>) => {
  return set.size === 0;
};

/**
 * set1과 set2가 같은지를 구함
 * @param set1
 * @param set2
 */
const isSame = <TValue = number>(
  set1: Set<NonNullable<TValue>>,
  set2: Set<NonNullable<TValue>>,
) => {
  if (set1.size !== set2.size) {
    return false;
  }
  return isSubset(set1, set2);
};

const StructSetUtils = {
  add,
  remove,
  union,
  difference,
  intersection,
  symmetricDifference,
  isDisjoint,
  isSubset,
  isSuperset,
  toList,
  isEmpty,
  isSame,
};

export default StructSetUtils;
