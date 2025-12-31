import {
  LAYER_INVISIBLE_POLICY,
  MAIN_LAYER_OPAQUE_POLICY,
  MAIN_LAYER_APPEND_MOVEMENT_POLICY,
  MAIN_LAYER_APPEND_PENCIL_POLICY,
  MAIN_LAYER_APPEND_POLICY,
  MAIN_LAYER_EDIT_MOVEMENT_POLICY,
  MAIN_LAYER_EDIT_PENCIL_POLICY,
  MAIN_LAYER_EDIT_POLICY,
  MAIN_LAYER_SELECTED_PENCIL_POLICY,
  MAIN_LAYER_SELECTED_POLICY,
  MAIN_LAYER_TAG_EDIT_MOVEMENT_POLICY,
  MAIN_LAYER_TAG_EDIT_PENCIL_POLICY,
  MAIN_LAYER_TAG_EDIT_POLICY,
  MainLayerModeEnum,
  SUB_LAYER_MOVEMENT_POLICY,
  SUB_LAYER_PENCIL_POLICY,
  SUB_LAYER_POLICY,
  SUB_LAYER_OPAQUE_POLICY,
} from '@design-system/constants/geo-map';
import { GeoLayerPolicy } from '@design-system/geo-map/layer/GeoLayer';
import DataUtils from '@design-system/utils/dataUtils';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';

const isMapDragBoxEnable = ({
  mainLayerMode,
  isPencilUsing,
  isMovement,
  isMainLayerSelected,
}: {
  mainLayerMode: MainLayerModeEnum;
  isPencilUsing: boolean;
  isMovement: boolean;
  isMainLayerSelected: boolean;
}): boolean => {
  if (!isPencilUsing && isMovement) {
    return false;
  }
  switch (mainLayerMode) {
    case MainLayerModeEnum.TAG_EDIT:
      return false;
    case MainLayerModeEnum.EDIT:
      return true;
    case MainLayerModeEnum.APPEND:
      return false;
    case MainLayerModeEnum.LAYER:
      return !isMainLayerSelected;
  }
};

const getMainLayerPolicy = ({
  mode,
  isSelected,
  isMovement,
  isVisible,
  isPencilUsing,
}: {
  mode: MainLayerModeEnum;
  isSelected: boolean;
  isMovement: boolean;
  isVisible: boolean;
  isPencilUsing: boolean;
}): GeoLayerPolicy => {
  switch (mode) {
    // TODO: change SELECT policy
    case MainLayerModeEnum.TAG_EDIT:
      if (isPencilUsing) {
        GeoMapUtils.IS_DEBUG &&
          console.log('getMainLayerPolicy, MAIN_LAYER_TAG_EDIT_PENCIL_POLICY');
        return DataUtils.deepCopy(MAIN_LAYER_TAG_EDIT_PENCIL_POLICY);
      }
      if (isMovement) {
        GeoMapUtils.IS_DEBUG &&
          console.log(
            'getMainLayerPolicy, MAIN_LAYER_TAG_EDIT_MOVEMENT_POLICY',
          );
        return DataUtils.deepCopy(MAIN_LAYER_TAG_EDIT_MOVEMENT_POLICY);
      }
      GeoMapUtils.IS_DEBUG &&
        console.log('getMainLayerPolicy, MAIN_LAYER_TAG_EDIT_POLICY');
      return DataUtils.deepCopy(MAIN_LAYER_TAG_EDIT_POLICY);
    case MainLayerModeEnum.EDIT:
      if (isPencilUsing) {
        GeoMapUtils.IS_DEBUG &&
          console.log('getMainLayerPolicy, MAIN_LAYER_EDIT_PENCIL_POLICY');
        return DataUtils.deepCopy(MAIN_LAYER_EDIT_PENCIL_POLICY);
      }
      if (isMovement) {
        GeoMapUtils.IS_DEBUG &&
          console.log('getMainLayerPolicy, MAIN_LAYER_EDIT_MOVEMENT_POLICY');
        return DataUtils.deepCopy(MAIN_LAYER_EDIT_MOVEMENT_POLICY);
      }
      GeoMapUtils.IS_DEBUG &&
        console.log('getMainLayerPolicy, MAIN_LAYER_EDIT_POLICY');
      return DataUtils.deepCopy(MAIN_LAYER_EDIT_POLICY);
    case MainLayerModeEnum.APPEND:
      if (isPencilUsing) {
        GeoMapUtils.IS_DEBUG &&
          console.log('getMainLayerPolicy, MAIN_LAYER_APPEND_PENCIL_POLICY');
        return DataUtils.deepCopy(MAIN_LAYER_APPEND_PENCIL_POLICY);
      }
      if (isMovement) {
        GeoMapUtils.IS_DEBUG &&
          console.log('getMainLayerPolicy, MAIN_LAYER_APPEND_MOVEMENT_POLICY');
        return DataUtils.deepCopy(MAIN_LAYER_APPEND_MOVEMENT_POLICY);
      }
      GeoMapUtils.IS_DEBUG &&
        console.log('getMainLayerPolicy, MAIN_LAYER_APPEND_POLICY');
      return DataUtils.deepCopy(MAIN_LAYER_APPEND_POLICY);
    case MainLayerModeEnum.LAYER:
      if (!isVisible) {
        GeoMapUtils.IS_DEBUG &&
          console.log('getMainLayerPolicy, LAYER_INVISIBLE_POLICY');
        return DataUtils.deepCopy(LAYER_INVISIBLE_POLICY);
      }
      if (!isSelected) {
        GeoMapUtils.IS_DEBUG &&
          console.log('getMainLayerPolicy, LAYER_OPAQUE_POLICY');
        return DataUtils.deepCopy(MAIN_LAYER_OPAQUE_POLICY);
      }
      if (isPencilUsing) {
        GeoMapUtils.IS_DEBUG &&
          console.log('getMainLayerPolicy, MAIN_LAYER_SELECTED_PENCIL_POLICY');
        return DataUtils.deepCopy(MAIN_LAYER_SELECTED_PENCIL_POLICY);
      }
      GeoMapUtils.IS_DEBUG &&
        console.log('getMainLayerPolicy, MAIN_LAYER_SELECTED_POLICY');
      return DataUtils.deepCopy(MAIN_LAYER_SELECTED_POLICY);
  }
};

const getSubLayerPolicy = ({
  isSelected,
  isMovement,
  isVisible,
  isPencilUsing,
}: {
  isSelected: boolean;
  isMovement: boolean;
  isVisible: boolean;
  isPencilUsing: boolean;
}): GeoLayerPolicy => {
  if (!isVisible) {
    GeoMapUtils.IS_DEBUG &&
      console.log('getSubLayerPolicy, LAYER_INVISIBLE_POLICY');
    return DataUtils.deepCopy(LAYER_INVISIBLE_POLICY);
  }
  if (!isSelected) {
    GeoMapUtils.IS_DEBUG &&
      console.log('getSubLayerPolicy, LAYER_OPAQUE_POLICY');
    return DataUtils.deepCopy(SUB_LAYER_OPAQUE_POLICY);
  }
  if (isPencilUsing) {
    GeoMapUtils.IS_DEBUG &&
      console.log('getSubLayerPolicy, SUB_LAYER_PENCIL_POLICY');
    return DataUtils.deepCopy(SUB_LAYER_PENCIL_POLICY);
  }
  if (isMovement) {
    GeoMapUtils.IS_DEBUG &&
      console.log('getSubLayerPolicy, SUB_LAYER_MOVEMENT_POLICY');
    return DataUtils.deepCopy(SUB_LAYER_MOVEMENT_POLICY);
  }
  GeoMapUtils.IS_DEBUG && console.log('getSubLayerPolicy, SUB_LAYER_POLICY');
  return DataUtils.deepCopy(SUB_LAYER_POLICY);
};

export const GeoMapEditorUtils = {
  isMapDragBoxEnable,
  getMainLayerPolicy,
  getSubLayerPolicy,
};
