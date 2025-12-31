import GeoWay from '@design-system/geo-map/feature/GeoWay';
import { theme } from '@design-system/root/tailwind.config';
import { GeoMapTypeEnum, PolylineEnum } from '@design-system/types/geoMap.type';

const OptionsFactory = {
  [PolylineEnum.CUSTOM_PATH]: () => ({
    strokeColor: theme.colors.red['400'],
    strokeWeight: GeoWay.StrokeWeight.NORMAL,
    zIndex: theme.zIndex.map.polyline.custom,
  }),
  [PolylineEnum.DRIVING_PATH]: () => ({
    strokeColor: theme.colors.primary['500'],
    strokeWeight: GeoWay.StrokeWeight.NORMAL,
    zIndex: theme.zIndex.map.polyline.normal,
  }),
  [PolylineEnum.CURRENT_PATH]: () => ({
    strokeColor: theme.colors.primary['500'],
    strokeWeight: GeoWay.StrokeWeight.NORMAL,
    zIndex: theme.zIndex.map.polyline.currentPath,
  }),
  [PolylineEnum.GLOBAL_PATH]: () => ({
    strokeColor: theme.colors.primary['500'],
    strokeWeight: GeoWay.StrokeWeight.NORMAL,
    zIndex: theme.zIndex.map.polyline.normal,
  }),
  [PolylineEnum.MOBILE_REAL_TIME_PATH]: () => ({
    strokeColor: theme.colors.secondary['100'],
    strokeWeight: GeoWay.StrokeWeight.MOBILE_PATH,
    zIndex: theme.zIndex.map.polyline.normal,
  }),
  [PolylineEnum.MOBILE_PREV_PATH]: () => ({
    strokeColor: theme.colors.secondary['100'],
    strokeWeight: GeoWay.StrokeWeight.MOBILE_PATH,
    zIndex: theme.zIndex.map.polyline.normal,
  }),
  [PolylineEnum.EDIT_PATH]: (mapType: GeoMapTypeEnum) => ({
    strokeColor:
      mapType === GeoMapTypeEnum.ROADMAP ? theme.colors.mono['800'] : '#58FF21',
    strokeWeight: GeoWay.StrokeWeight.NORMAL,
    zIndex: theme.zIndex.map.polyline.normal,
  }),
};
export default OptionsFactory;
