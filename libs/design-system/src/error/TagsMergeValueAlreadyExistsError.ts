import { TagKeyEnum, TagValueType } from '@design-system/constants/map-tag';

const _name = 'TagsMergeValueAlreadyExistsError';
class TagsMergeValueAlreadyExistsError extends Error {
  private readonly _key: TagKeyEnum;
  private readonly _value: TagValueType;

  constructor(key: TagKeyEnum, value: TagValueType) {
    super(_name);
    this.name = _name;
    this._key = key;
    this._value = value;
  }

  get key(): TagKeyEnum {
    return this._key;
  }

  get value(): TagValueType {
    return this._value;
  }
}

export default TagsMergeValueAlreadyExistsError;
