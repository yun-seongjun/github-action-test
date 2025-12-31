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

export interface UsePathOnlyLineStringProps extends UseGlobalPathPropsBase {
  rawPathGeoJson?: FeatureCollection<Geometry, GeoJsonProperties> | undefined;
}

/**
 * 로봇이 움직이고 있는 현재씬의 globalPath GeoJson정보는 point가 없고 lineString만 있어,
 * 아래왜 같이 geoJson으로 한번 더 자료구조를 가공하여 그립니다.
 *
 * @param geoJsonUrl
 * @param layerId
 * @param GeoMapControl
 */
const usePathOnlyLineString = ({
  rawPathGeoJson,
  layerId,
  geoMapControl,
}: UsePathOnlyLineStringProps) => {
  const pathGeoJson = useMemo(() => {
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

export default usePathOnlyLineString;
