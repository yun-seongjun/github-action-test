import { TagKeyEnum } from '@design-system/constants/map-tag';

const _name = 'TagsMergeExceededValuesMaxCountError';
class TagsMergeExceededValuesMaxCountError extends Error {
  private readonly _key: TagKeyEnum;
  private readonly _values: string[];

  constructor(key: TagKeyEnum, values: string[]) {
    super(_name);
    this.name = _name;
    this._key = key;
    this._values = values;
  }

  get key(): TagKeyEnum {
    return this._key;
  }

  get values(): string[] {
    return this._values;
  }
}

export default TagsMergeExceededValuesMaxCountError;
