import { useMemo } from 'react';
import useGlobalPath, {
  UseGlobalPathPropsBase,
} from '@design-system/hooks/geo-map/global-path/useGlobalPath';
import {
  GeoLatLngType,
  GeometryTypeEnum,
} from '@design-system/types/geoMap.type';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';
import {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from 'geojson';
import { GeoLayerPolicy } from '@design-system/geo-map';

export interface UsePathOnlyLineStringProps extends UseGlobalPathPropsBase {
  rawPathGeoJson?: FeatureCollection<Geometry, GeoJsonProperties> | undefined;
  layerPolicy?: GeoLayerPolicy;
  updateLayerId: () => void;
}

/**
 * Todo wdj deleteFeaturesFromLayer 함수에서 faeture가 완전 삭제가 안되는 문제가 있어 임시로 만든 훅입니다.
 * deleteFeaturesFromLayer 함수 문제가 해결되면 이 훅은 삭제되어야합니다.
 * @param rawPathGeoJson
 * @param layerId
 * @param geoMapControl
 * @param updateLayerId
 */
const usePathOnlyLineStringNodeCourse = ({
  rawPathGeoJson,
  layerId,
  geoMapControl,
  updateLayerId,
}: UsePathOnlyLineStringProps) => {
  const pathGeoJson = useMemo(() => {
    layerId && geoMapControl.deleteLayer(layerId);
    updateLayerId();
    if (!rawPathGeoJson) {
      return undefined;
    }

    const getCoordinatesIfMatchesCondition = (
      feature: Feature,
    ): number[][] | null => {
      if (feature.geometry.type !== GeometryTypeEnum.LineString) {
        return null;
      }

      return feature.geometry.coordinates;
    };

    const validCoordinates = rawPathGeoJson.features
      ?.map(getCoordinatesIfMatchesCondition)
      .filter(Boolean);

    if (!validCoordinates || validCoordinates.length === 0) {
      return;
    }

    const convertedCoordinates = Array.from(
      validCoordinates.flat().map((coord) => JSON.stringify(coord)),
    ).map((coordStr) => JSON.parse(coordStr) as [number, number]);

    const pathWayPositions: GeoLatLngType[] = convertedCoordinates.map(
      (coordinate) => ({
        lat: coordinate[1],
        lng: coordinate[0],
      }),
    );

    return pathWayPositions
      ? GeoMapUtils.positionsToGeoJson(pathWayPositions)
      : undefined;
  }, [rawPathGeoJson]);

  const { geoJsonFeaturesRef: pathFeaturesRef } = useGlobalPath({
    layerId,
    geoMapControl,
    injectedGeoJson: pathGeoJson,
  });

  return {
    pathFeaturesRef,
  };
};

export default usePathOnlyLineStringNodeCourse;
