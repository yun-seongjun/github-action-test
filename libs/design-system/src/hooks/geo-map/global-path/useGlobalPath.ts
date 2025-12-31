import { useEffect, useRef } from 'react';
import { FeatureCollection } from 'geojson';
import { GeoFeaturesType } from '@design-system/geo-map/feature/GeoFeatureManager';
import { GeoMapControl } from '@design-system/hooks/geo-map/useGeoMap';
import useFetchGeoJson from '@design-system/hooks/query/useFetchGeoJson';
import { XOR } from '@design-system/types/generic.type';

export interface UseGlobalPathPropsBase {
  layerId?: number;
  geoMapControl: GeoMapControl;
}

interface WithGeoJsonUrl extends UseGlobalPathPropsBase {
  geoJsonUrl: string | null | undefined;
  injectedGeoJson?: never;
}

interface WithInjectedGeoJson extends UseGlobalPathPropsBase {
  geoJsonUrl?: never;
  injectedGeoJson: FeatureCollection | undefined;
}

type UseGlobalPathProps = XOR<WithGeoJsonUrl, WithInjectedGeoJson>;

const useGlobalPath = ({
  layerId,
  geoJsonUrl,
  geoMapControl,
  injectedGeoJson,
}: UseGlobalPathProps) => {
  const { geoJsons } = useFetchGeoJson(
    geoJsonUrl ? [geoJsonUrl] : [],
    !!geoJsonUrl,
  );
  const geoJson = geoJsonUrl ? geoJsons?.[0] : injectedGeoJson;
  const geoJsonFeaturesRef = useRef<GeoFeaturesType>();

  const clearGeoJsonFeatures = () => {
    if (geoJsonFeaturesRef.current && layerId) {
      geoMapControl.deleteFeaturesFromLayer(
        layerId,
        geoJsonFeaturesRef.current,
      );
      geoJsonFeaturesRef.current = undefined;
    }
  };

  useEffect(() => {
    if (layerId) {
      clearGeoJsonFeatures();
      if (geoJson) {
        geoJsonFeaturesRef.current = geoMapControl.importJsonToLayer(
          layerId,
          geoJson,
        );
      }
    }
  }, [geoJson, layerId]);

  return {
    geoJsonFeaturesRef,
  };
};

export default useGlobalPath;
