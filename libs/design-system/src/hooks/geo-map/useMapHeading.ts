import { useEffect, useState } from 'react';
import { GeoMapControl } from '@design-system/hooks/geo-map/useGeoMap';

interface UseMapHeadingProps {
  geoMapControl: GeoMapControl;
}

const useMapHeading = ({ geoMapControl }: UseMapHeadingProps) => {
  const [mapHeading, setMapHeading] = useState<number>(0);

  useEffect(() => {
    let eventKeyHeadingChanged: string | undefined;
    if (geoMapControl.isInitializedGeoMap) {
      eventKeyHeadingChanged =
        geoMapControl.notificationEventManager?.addMapHeadingChangedEventListener(
          (heading) => {
            setMapHeading(heading * -1);
          },
        );
    }
    return () => {
      if (geoMapControl.isInitializedGeoMap) {
        eventKeyHeadingChanged &&
          geoMapControl.notificationEventManager?.removeMapHeadingChangedEventListener(
            eventKeyHeadingChanged,
          );
      }
    };
  }, [geoMapControl.isInitializedGeoMap]);

  return {
    mapHeading,
  };
};

export default useMapHeading;
