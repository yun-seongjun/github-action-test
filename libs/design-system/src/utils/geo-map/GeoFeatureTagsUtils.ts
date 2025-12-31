import {
  getTagMetaInterface,
  getValueType,
  TagKeyEnum,
  TagType,
  TagTypeNumber,
  TagTypeString,
  TagTypeStringList,
  TagValueType,
  TagValueTypeEnum,
} from '@design-system/constants';
import TagsMergeExceededValuesMaxCountError from '@design-system/error/TagsMergeExceededValuesMaxCountError';
import TagsMergeValueAlreadyExistsError from '@design-system/error/TagsMergeValueAlreadyExistsError';
import { GeoFeatureTagsType, PrimitiveType } from '@design-system/types';
import DataUtils from '@design-system/utils/dataUtils';

/**
 * value를 value list로 변환. CSV 타입의 value를 처리하기 위함
 * @param value CSV 타입의 value(예: 'a,b,c')
 */
const toValueList = (value: PrimitiveType): string[] => {
  const valueString = String(value || '');
  return valueString ? valueString.split(',') : [];
};
/**
 * value list를 value로 변환. CSV 타입의 value를 처리하기 위함
 * @param valueList CSV 타입의 value list(예: ['a', 'b', 'c'])
 */
const fromValueList = (valueList: string[]): string => {
  return valueList.join(',');
};

/**
 * 태그를 추가
 * @param tags
 * @param key
 * @param value
 */
const addTags = (
  tags: Readonly<GeoFeatureTagsType>,
  key: TagKeyEnum,
  value: TagValueType,
): GeoFeatureTagsType => {
  const valueType = getValueType(key);
  if (valueType === TagValueTypeEnum.CSV) {
    const valueSet = new Set(toValueList(tags[key]));
    if (!valueSet.has(String(value))) {
      valueSet.add(String(value));
    }

    return {
      ...DataUtils.deepCopy(tags),
      [key]: fromValueList(Array.from(valueSet)),
    };
  }

  return {
    ...DataUtils.deepCopy(tags),
    [key]: value,
  };
};

/**
 * 태그의 값을 변경
 * @param tags
 * @param key
 * @param value
 */
const setTagValue = (
  tags: Readonly<GeoFeatureTagsType>,
  key: TagKeyEnum,
  value: TagValueType,
): GeoFeatureTagsType => {
  return {
    ...DataUtils.deepCopy(tags),
    [key]: value,
  };
};

/**
 * key에 해당하는 태그를 삭제
 * @param tags
 * @param key
 */
const deleteTagsKey = (
  tags: Readonly<GeoFeatureTagsType>,
  key: TagKeyEnum,
): GeoFeatureTagsType => {
  const result = DataUtils.deepCopy(tags) as GeoFeatureTagsType;
  delete result[key];
  return result;
};

/**
 * key에 해당하는 태그들을 삭제
 * @param tags
 * @param keys
 */
const deleteTagsKeys = (
  tags: Readonly<GeoFeatureTagsType>,
  keys: TagKeyEnum[],
): GeoFeatureTagsType => {
  const result = DataUtils.deepCopy(tags) as GeoFeatureTagsType;
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
};

/**
 * key에 해당하는 태그의 values를 삭제
 * @param tags
 * @param key
 * @param values
 */
const deleteTagsValues = (
  tags: Readonly<GeoFeatureTagsType>,
  key: TagKeyEnum,
  values: TagValueType[],
): GeoFeatureTagsType => {
  const valueType = getValueType(key);
  if (valueType === TagValueTypeEnum.CSV) {
    const valueSet = new Set(toValueList(tags[key]));
    values.forEach((value) => {
      valueSet.delete(String(value));
    });

    return {
      ...DataUtils.deepCopy(tags),
      [key]: fromValueList(Array.from(valueSet)),
    };
  }

  const valueSet = new Set(tags[key] ? [tags[key]] : []);
  values.forEach((value) => {
    valueSet.delete(String(value));
  });

  return {
    ...DataUtils.deepCopy(tags),
    [key]: valueSet.size > 0 ? valueSet.values().next().value : undefined,
  };
};

/**
 * 태그의 값이 존재하는지 확인
 * @param tags
 * @param key
 * @param value
 */
const isTagValueExist = (
  tags: Readonly<GeoFeatureTagsType>,
  key: TagKeyEnum,
  value: TagValueType,
): boolean => {
  const valueType = getValueType(key);
  if (valueType === TagValueTypeEnum.CSV) {
    const tagsValueList = toValueList(tags[key]);
    const valuesList = toValueList(value);
    return valuesList.every((v) => tagsValueList.includes(v));
  }

  return tags[key] === value;
};

/**
 * tagsTarget에 tags가 포함되는지 확인
 * @param tagsTarget
 * @param tags
 */
const isTagsContains = (
  tagsTarget: Readonly<GeoFeatureTagsType>,
  tags: Partial<Record<TagKeyEnum, TagValueType>>,
): boolean => {
  return Object.entries(tags).every(([key, value]) => {
    return isTagValueExist(tagsTarget, key as TagKeyEnum, value);
  });
};

/**
 * tagsTarget에 key 태그를 추가할 수 있는지 확인
 * @param tagsTarget
 * @param key
 */
const isTagsAddable = (
  tagsTarget: Readonly<GeoFeatureTagsType>,
  key: TagKeyEnum,
): boolean => {
  const meta = getTagMetaInterface(key);
  const value = tagsTarget[key];
  if (meta?.valueType === TagValueTypeEnum.CSV) {
    const valueList = toValueList(value);
    return valueList.length < meta.valuesMaxCount;
  }
  return value === undefined;
};

/**
 * tagsTarget에 tags를 추가할 수 있는지 확인
 * @param tagsTarget
 * @param tags
 */
const isTagsMergeable = (
  tagsTarget: Readonly<GeoFeatureTagsType>,
  tags: Partial<Record<TagKeyEnum, TagValueType>>,
): boolean => {
  return Object.entries(tags).every(([key, value]) => {
    const meta = getTagMetaInterface(key);
    if (meta?.valueType === TagValueTypeEnum.CSV) {
      const tagsTargetValueList = toValueList(tagsTarget[key]);
      const valuesList = toValueList(value);
      const includesCount = valuesList.filter((value) =>
        tagsTargetValueList.includes(value),
      ).length;
      return (
        tagsTargetValueList.length + valuesList.length - includesCount <=
        meta.valuesMaxCount
      );
    }
    const tagsTargetValue = tagsTarget[key];
    return tagsTargetValue === undefined || tagsTargetValue === value;
  });
};

/**
 * tagsTarget에 tags를 추가
 * @exception TagsMergeExceededValuesMaxCountError 태그 값이 최대 개수를 초과할 때(태그값 유형이 CSV인 경우)
 * @exception TagsMergeValueAlreadyExistsError 태그 값이 이미 존재하거나 추가하려는 값과 다를 때
 */
const mergeTags = (
  tagsTarget: Readonly<GeoFeatureTagsType>,
  tags: Partial<Record<TagKeyEnum, TagValueType>>,
): GeoFeatureTagsType => {
  const result = DataUtils.deepCopy(tagsTarget) as GeoFeatureTagsType;
  return Object.entries(tags).reduce((acc, [key, value]) => {
    const meta = getTagMetaInterface(key);
    const tagsValue = result[key] as TagValueType;
    if (meta?.valueType === TagValueTypeEnum.CSV) {
      const tagsValueList = toValueList(tagsValue);
      const valuesSetNew = new Set(tagsValueList);
      toValueList(value).forEach((v) => valuesSetNew.add(v));

      if (valuesSetNew.size > meta.valuesMaxCount) {
        throw new TagsMergeExceededValuesMaxCountError(
          key as TagKeyEnum,
          tagsValueList,
        );
      }
      result[key] = fromValueList(Array.from(valuesSetNew));
    } else {
      if (tagsValue !== undefined && tagsValue !== value) {
        throw new TagsMergeValueAlreadyExistsError(
          key as TagKeyEnum,
          tagsValue,
        );
      }
      result[key] = value;
    }
    return result;
  }, result);
};

const differenceTags = (
  one: Partial<Record<TagKeyEnum, TagValueType>>,
  other: Partial<Record<TagKeyEnum, TagValueType>>,
): Partial<Record<TagKeyEnum, TagValueType>> => {
  return Object.entries(one).reduce(
    (acc, [key, value]) => {
      if (value !== other[key as TagKeyEnum]) {
        acc[key as TagKeyEnum] = value;
      }
      return acc;
    },
    {} as Partial<Record<TagKeyEnum, TagValueType>>,
  );
};

const isTagValueTypeCsv = (tag: TagType): tag is TagTypeStringList => {
  return tag.meta.valueType === TagValueTypeEnum.CSV;
};

const isTagValueTypeString = (tag: TagType): tag is TagTypeString => {
  return tag.meta.valueType === TagValueTypeEnum.STRING;
};

const isTagValueTypeNumber = (tag: TagType): tag is TagTypeNumber => {
  return tag.meta.valueType === TagValueTypeEnum.DECIMAL;
};

const isTagValueContains = (tag: TagType, tagValue: string): boolean => {
  if (isTagValueTypeCsv(tag)) {
    return tag.valueList.includes(tagValue);
  }
  if (isTagValueTypeString(tag)) {
    return tag.value === tagValue;
  }
  if (isTagValueTypeNumber(tag)) {
    return tag.value === Number(tagValue);
  }
  return false;
};

const isTagValuesSomeExists = (
  tags: Readonly<GeoFeatureTagsType> | undefined,
): boolean => {
  return !!tags && Object.values(tags).some((tag) => !!tag);
};

const isTagValueMaxCountReached = (tag: TagTypeStringList): boolean => {
  if (isTagValueTypeCsv(tag)) {
    return tag.valueList.length >= tag.meta.valuesMaxCount;
  }
  return false;
};

const TAG_KEYS_DEFAULT: Readonly<TagKeyEnum[]> = [
  TagKeyEnum.ROAD_TYPE,
  TagKeyEnum.CLASS,
] as const;
const getTagKeysDefault = (): TagKeyEnum[] => {
  return [...TAG_KEYS_DEFAULT];
};
const isTagKeyDefault = (key: TagKeyEnum): boolean => {
  return TAG_KEYS_DEFAULT.includes(key);
};

const tagsSortCompare = (a: TagType, b: TagType): number => {
  if (a.tagKey === TagKeyEnum.ROAD_TYPE) {
    return -1;
  }
  if (a.tagKey === TagKeyEnum.CLASS) {
    return b.tagKey === TagKeyEnum.ROAD_TYPE ? 1 : -1;
  }
  if (b.tagKey === TagKeyEnum.ROAD_TYPE) {
    return 1;
  }
  if (b.tagKey === TagKeyEnum.CLASS) {
    return 1;
  }
  return String(a.tagKey).localeCompare(String(b.tagKey));
};

export const GeoFeatureTagsUtils = {
  toValueList,
  fromValueList,
  addTags,
  setTagValue,
  deleteTagsKey,
  deleteTagsKeys,
  deleteTagsValues,
  isTagValueExist,
  isTagsContains,
  isTagsAddable,
  isTagsMergeable,
  mergeTags,
  differenceTags,
  isTagValueTypeCsv,
  isTagValueTypeString,
  isTagValueTypeNumber,
  isTagValueContains,
  isTagValuesSomeExists,
  isTagValueMaxCountReached,
  getTagKeysDefault,
  isTagKeyDefault,
  tagsSortCompare,
};
