import { useMemo } from 'react';
import {
  GeoLatLngType,
  TagClassValueEnum,
  UsePathOnlyLineStringProps,
} from '@neubie/design-system/src';
import { GeoMapUtils } from '@design-system/utils/geo-map';
import useGlobalPathByTag from '@design-system/hooks/geo-map/global-path/useGlobalPathByTag';

interface UsePathOnlyLineStringByTagProps extends UsePathOnlyLineStringProps {
  tag: TagClassValueEnum;
}

export const convertToPathWayPositions = (
  paths: number[][][],
): GeoLatLngType[][] => {
  return paths.map((way) =>
    way?.map((coordinate) => ({
      lat: coordinate[1],
      lng: coordinate[0],
    })),
  );
};

/**
 *
 *
 * @param rawPathGeoJson
 * @param layerId
 * @param GeoMapControl
 */
const usePathOnlyLineStringByTag = ({
  rawPathGeoJson,
  layerId,
  geoMapControl,
  tag,
}: UsePathOnlyLineStringByTagProps) => {
  const pathGeoJson = useMemo(() => {
    if (!rawPathGeoJson) return undefined;

    const validCoordinates = rawPathGeoJson.features
      .map((feature) =>
        GeoMapUtils.filterValidLineStringCoordinates(feature, tag),
      )
      .filter((coords): coords is number[][] => coords !== null);

    const pathWayPositions = convertToPathWayPositions(validCoordinates);

    return pathWayPositions
      ? pathWayPositions.map((position, index) =>
          GeoMapUtils.positionsToGeoJson(position, (index + 1) * 1000),
        )
      : undefined;
  }, [rawPathGeoJson, tag]);

  const { geoJsonFeaturesRef: pathFeaturesRef } = useGlobalPathByTag({
    layerId,
    geoMapControl,
    injectedGeoJson: pathGeoJson,
  });

  return {
    pathFeaturesRef,
    rawPathGeoJson,
  };
};

export default usePathOnlyLineStringByTag;
