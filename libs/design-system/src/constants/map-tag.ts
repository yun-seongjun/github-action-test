export enum TagKeyEnum {
  BUILDING = 'building',
  BUILDING_ID = 'building_id',
  CLASS = 'class',
  DIRECTION = 'direction',
  DRIVING_RULE = 'driving_rule',
  EXISTENCE = 'existence',
  FLOOR = 'floor',
  MAX_SPEED = 'max_speed',
  ONEWAY = 'oneway',
  ROAD_TYPE = 'road_type',
  UNDRIVABLE_CLASS = 'undrivable_class',
}

export enum TagValueTypeEnum {
  STRING = 'STRING',
  CSV = 'CSV',
  DECIMAL = 'DECIMAL',
  YES = 'YES',
}

export enum TagLoadTypeValueEnum {
  CROSSWALK = 'crosswalk',
  DRIVEWAY = 'driveway',
  INDOOR = 'indoor',
  SIDEROAD = 'sideroad',
  SIDEWALK = 'sidewalk',
  WHEELCHAIR_AISLE = 'wheelchair_aisle',
}

export enum TagClassValueEnum {
  ARTIFICIAL_TURF = 'artificial_turf',
  UNLABELED = 'unlabeled',
  BLOCKS = 'blocks',
  CEMENT_ASPHALT = 'cement_asphalt',
  COLORED_ROAD = 'colored_road',
  CROSSWALK = 'crosswalk',
  CURBS = 'curbs',
  GRATING = 'grating',
  GRASS = 'grass',
  GUIDE_BLOCKS = 'guide_blocks',
  GUIDE_BLOCKS_STOP = 'guide_blocks_stop',
  MANHOLE = 'manhole',
  ROCK = 'rock',
  SOIL_GRAVEL = 'soil_gravel',
  SPEED_BUMPS = 'speed_bumps',
  ACCIDENT_ZONE = 'accident_zone',
  WOOD = 'wood',
  IRON = 'iron',
  WATER = 'water',
  MAT = 'mat',
  LANE_STRAIGHT_WHITE = 'lane_straight_white',
}

export enum TagBuildingValueEnum {
  YES = 'yes',
}

export enum TagDirectionValueEnum {
  BACKWARD = 'backward',
  BIDIRECTIONAL = 'bidirectional',
  FORBIDDEN = 'forbidden',
  FORWARD = 'forward',
}

export enum TagDrivingRuleValueEnum {
  DRIVE_ON_LEFT = 'drive_on_left',
  DRIVE_ON_MIDDLE = 'drive_on_middle',
  DRIVE_ON_RIGHT = 'drive_on_right',
  PROTECTED_ZONE = 'protected_zone',
  ENABLE_YIELD = 'enable_yield',
}

export enum TagOnewayValueEnum {
  BACKWARD = 'backward',
  FORWARD = 'forward',
}

export enum TagExistenceValueEnum {
  TRAFFIC_LIGHT = 'traffic_light',
}

export type TagValueType =
  | TagLoadTypeValueEnum
  | TagClassValueEnum
  | TagDirectionValueEnum
  | TagDrivingRuleValueEnum
  | TagOnewayValueEnum
  | TagExistenceValueEnum
  | string
  | number;

export const getValueType = (key: TagKeyEnum): TagValueTypeEnum => {
  if (
    key === TagKeyEnum.CLASS ||
    key === TagKeyEnum.ROAD_TYPE ||
    key === TagKeyEnum.UNDRIVABLE_CLASS
  ) {
    return TagValueTypeEnum.CSV;
  }
  if (key === TagKeyEnum.MAX_SPEED) {
    return TagValueTypeEnum.DECIMAL;
  }
  return TagValueTypeEnum.STRING;
};

export interface TagOptionInterface<TValue> {
  label: string;
  value: TValue;
}

export interface TagMetaBuildingInterface {
  tagKey: TagKeyEnum.BUILDING;
  valueType: TagValueTypeEnum.STRING;
  valuesMaxCount: 1;
  options?: TagOptionInterface<TagBuildingValueEnum>[];
  unit?: never;
}
export interface TagMetaBuildingIdInterface {
  tagKey: TagKeyEnum.BUILDING_ID;
  valueType: TagValueTypeEnum.STRING;
  valuesMaxCount: 1;
  options?: never;
  unit?: never;
}
export interface TagMetaClassInterface {
  tagKey: TagKeyEnum.CLASS;
  valueType: TagValueTypeEnum.CSV;
  valuesMaxCount: 300;
  options: TagOptionInterface<TagClassValueEnum>[];
  unit?: never;
}
export interface TagMetaDirectionInterface {
  tagKey: TagKeyEnum.DIRECTION;
  valueType: TagValueTypeEnum.STRING;
  valuesMaxCount: 1;
  options: TagOptionInterface<TagDirectionValueEnum>[];
  unit?: never;
}
export interface TagMetaDrivingRuleInterface {
  tagKey: TagKeyEnum.DRIVING_RULE;
  valueType: TagValueTypeEnum.STRING;
  valuesMaxCount: 1;
  options: TagOptionInterface<TagDrivingRuleValueEnum>[];
  unit?: never;
}
export interface TagMetaExistenceInterface {
  tagKey: TagKeyEnum.EXISTENCE;
  valueType: TagValueTypeEnum.STRING;
  valuesMaxCount: 1;
  options: TagOptionInterface<TagExistenceValueEnum>[];
  unit?: never;
}
export interface TagMetaFloorInterface {
  tagKey: TagKeyEnum.FLOOR;
  valueType: TagValueTypeEnum.STRING;
  valuesMaxCount: 1;
  options?: never;
  unit?: never;
}
export interface TagMetaMaxSpeedInterface {
  tagKey: TagKeyEnum.MAX_SPEED;
  valueType: TagValueTypeEnum.DECIMAL;
  valuesMaxCount: 1;
  options?: never;
  unit?: 'm/s';
}
export interface TagMetaOnewayInterface {
  tagKey: TagKeyEnum.ONEWAY;
  valueType: TagValueTypeEnum.STRING;
  valuesMaxCount: 1;
  options: TagOptionInterface<TagOnewayValueEnum>[];
  unit?: never;
}
export interface TagMetaRoadTypeInterface {
  tagKey: TagKeyEnum.ROAD_TYPE;
  valueType: TagValueTypeEnum.CSV;
  valuesMaxCount: 1;
  options: TagOptionInterface<TagLoadTypeValueEnum>[];
  unit?: never;
}
export interface TagMetaUndrivableClassInterface {
  tagKey: TagKeyEnum.UNDRIVABLE_CLASS;
  valueType: TagValueTypeEnum.CSV;
  valuesMaxCount: 300;
  options: TagOptionInterface<TagClassValueEnum>[];
  unit?: never;
}

export type TagMetaInterface =
  | TagMetaBuildingInterface
  | TagMetaBuildingIdInterface
  | TagMetaClassInterface
  | TagMetaDirectionInterface
  | TagMetaDrivingRuleInterface
  | TagMetaExistenceInterface
  | TagMetaFloorInterface
  | TagMetaMaxSpeedInterface
  | TagMetaOnewayInterface
  | TagMetaRoadTypeInterface
  | TagMetaUndrivableClassInterface;

const optionsSortPredicate = (
  a: TagOptionInterface<any>,
  b: TagOptionInterface<any>,
) => {
  return a.label.localeCompare(b.label);
};

export const TagMetaBuilding: TagMetaBuildingInterface = {
  tagKey: TagKeyEnum.BUILDING,
  valueType: TagValueTypeEnum.STRING,
  valuesMaxCount: 1,
  options: Object.entries(TagBuildingValueEnum)
    .map(([key, value]) => ({ label: key.toLowerCase(), value }))
    .sort(optionsSortPredicate),
} as const;
export const TagMetaBuildingId: TagMetaBuildingIdInterface = {
  tagKey: TagKeyEnum.BUILDING_ID,
  valueType: TagValueTypeEnum.STRING,
  valuesMaxCount: 1,
} as const;
export const TagMetaClass: TagMetaClassInterface = {
  tagKey: TagKeyEnum.CLASS,
  valueType: TagValueTypeEnum.CSV,
  valuesMaxCount: 300,
  options: Object.entries(TagClassValueEnum)
    .map(([key, value]) => ({ label: key.toLowerCase(), value }))
    .sort(optionsSortPredicate),
} as const;
export const TagMetaDirection: TagMetaDirectionInterface = {
  tagKey: TagKeyEnum.DIRECTION,
  valueType: TagValueTypeEnum.STRING,
  valuesMaxCount: 1,
  options: Object.entries(TagDirectionValueEnum)
    .map(([key, value]) => ({ label: key.toLowerCase(), value }))
    .sort(optionsSortPredicate),
} as const;
export const TagMetaDrivingRule: TagMetaDrivingRuleInterface = {
  tagKey: TagKeyEnum.DRIVING_RULE,
  valueType: TagValueTypeEnum.STRING,
  valuesMaxCount: 1,
  options: Object.entries(TagDrivingRuleValueEnum)
    .map(([key, value]) => ({ label: key.toLowerCase(), value }))
    .sort(optionsSortPredicate),
} as const;
export const TagMetaExistence: TagMetaExistenceInterface = {
  tagKey: TagKeyEnum.EXISTENCE,
  valueType: TagValueTypeEnum.STRING,
  valuesMaxCount: 1,
  options: Object.entries(TagExistenceValueEnum)
    .map(([key, value]) => ({ label: key.toLowerCase(), value }))
    .sort(optionsSortPredicate),
} as const;
export const TagMetaFloor: TagMetaFloorInterface = {
  tagKey: TagKeyEnum.FLOOR,
  valueType: TagValueTypeEnum.STRING,
  valuesMaxCount: 1,
} as const;
export const TagMetaMaxSpeed: TagMetaMaxSpeedInterface = {
  tagKey: TagKeyEnum.MAX_SPEED,
  valueType: TagValueTypeEnum.DECIMAL,
  valuesMaxCount: 1,
  unit: 'm/s',
} as const;
export const TagMetaOneway: TagMetaOnewayInterface = {
  tagKey: TagKeyEnum.ONEWAY,
  valueType: TagValueTypeEnum.STRING,
  valuesMaxCount: 1,
  options: Object.entries(TagOnewayValueEnum)
    .map(([key, value]) => ({ label: key.toLowerCase(), value }))
    .sort(optionsSortPredicate),
} as const;
export const TagMetaRoadType: TagMetaRoadTypeInterface = {
  tagKey: TagKeyEnum.ROAD_TYPE,
  valueType: TagValueTypeEnum.CSV,
  valuesMaxCount: 1,
  options: Object.entries(TagLoadTypeValueEnum)
    .map(([key, value]) => ({ label: key.toLowerCase(), value }))
    .sort(optionsSortPredicate),
} as const;
export const TagMetaUndrivableClass: TagMetaUndrivableClassInterface = {
  tagKey: TagKeyEnum.UNDRIVABLE_CLASS,
  valueType: TagValueTypeEnum.CSV,
  valuesMaxCount: 300,
  options: Object.entries(TagClassValueEnum)
    .map(([key, value]) => ({ label: key.toLowerCase(), value }))
    .sort(optionsSortPredicate),
} as const;

const tagMap: Map<TagKeyEnum, TagMetaInterface> = new Map([
  [TagKeyEnum.BUILDING, { ...TagMetaBuilding }],
  [TagKeyEnum.BUILDING_ID, { ...TagMetaBuildingId }],
  [
    TagKeyEnum.CLASS,
    {
      ...TagMetaClass,
    },
  ],
  [
    TagKeyEnum.DIRECTION,
    {
      ...TagMetaDirection,
    },
  ],
  [
    TagKeyEnum.DRIVING_RULE,
    {
      ...TagMetaDrivingRule,
    },
  ],
  [
    TagKeyEnum.EXISTENCE,
    {
      ...TagMetaExistence,
    },
  ],
  [TagKeyEnum.FLOOR, { ...TagMetaFloor }],
  [TagKeyEnum.MAX_SPEED, { ...TagMetaMaxSpeed }],
  [
    TagKeyEnum.ONEWAY,
    {
      ...TagMetaOneway,
    },
  ],
  [
    TagKeyEnum.ROAD_TYPE,
    {
      ...TagMetaRoadType,
    },
  ],
  [
    TagKeyEnum.UNDRIVABLE_CLASS,
    {
      ...TagMetaUndrivableClass,
    },
  ],
]);

export const getTagMetaInterface = (
  key: TagKeyEnum | string,
): TagMetaInterface | undefined => {
  return tagMap.get(key as TagKeyEnum);
};

export enum TagPresetTypeEnum {
  /**
   * 건널목
   */
  CROSSWALK = 'crosswalk',
  /**
   * 신호등
   */
  TRAFFIC_LIGHT = 'traffic_light',
}

export const getTagPreset = (
  key: TagPresetTypeEnum,
): Partial<Record<TagKeyEnum, TagValueType>> | undefined => {
  switch (key) {
    case TagPresetTypeEnum.CROSSWALK:
      return {
        [TagKeyEnum.ROAD_TYPE]: TagLoadTypeValueEnum.CROSSWALK,
      };
    case TagPresetTypeEnum.TRAFFIC_LIGHT:
      return {
        [TagKeyEnum.ROAD_TYPE]: TagLoadTypeValueEnum.CROSSWALK,
        [TagKeyEnum.CLASS]: TagClassValueEnum.CROSSWALK,
        [TagKeyEnum.EXISTENCE]: TagExistenceValueEnum.TRAFFIC_LIGHT,
      };
    default:
      return undefined;
  }
};

export interface TagTypeStringList {
  tagKey: Extract<
    TagKeyEnum,
    TagKeyEnum.ROAD_TYPE | TagKeyEnum.CLASS | TagKeyEnum.UNDRIVABLE_CLASS
  >;
  value: string | undefined;
  valueList: string[];
  meta: Extract<
    TagMetaInterface,
    | TagMetaRoadTypeInterface
    | TagMetaClassInterface
    | TagMetaUndrivableClassInterface
  >;
}

export interface TagTypeString {
  tagKey: Exclude<
    TagKeyEnum,
    | TagKeyEnum.ROAD_TYPE
    | TagKeyEnum.CLASS
    | TagKeyEnum.UNDRIVABLE_CLASS
    | TagKeyEnum.MAX_SPEED
  >;
  value: string | undefined;
  valueList?: never;
  meta: Exclude<
    TagMetaInterface,
    | TagMetaMaxSpeedInterface
    | TagMetaRoadTypeInterface
    | TagMetaClassInterface
    | TagMetaUndrivableClassInterface
  >;
}

export interface TagTypeNumber {
  tagKey: TagKeyEnum.MAX_SPEED;
  value: number | undefined;
  valueList?: never;
  meta: TagMetaMaxSpeedInterface;
}

export type TagType = TagTypeStringList | TagTypeString | TagTypeNumber;
