import { useEffect, useRef } from 'react';
import { FeatureCollection } from 'geojson';
import { GeoFeaturesType } from '@design-system/geo-map/feature/GeoFeatureManager';
import { GeoMapControl } from '@design-system/hooks/geo-map/useGeoMap';

export interface UseGlobalPathProps {
  layerId?: number;
  geoMapControl: GeoMapControl;
  injectedGeoJson: FeatureCollection[] | undefined;
}

const useGlobalPathByTag = ({
  layerId,
  geoMapControl,
  injectedGeoJson,
}: UseGlobalPathProps) => {
  const geoJson = injectedGeoJson;
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
        geoJsonFeaturesRef.current = geoMapControl.importJsonToLayerList(
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

export default useGlobalPathByTag;
