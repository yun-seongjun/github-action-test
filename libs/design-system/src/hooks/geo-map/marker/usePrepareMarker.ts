import { useEffect, useRef } from 'react';
import { MarkerIdType } from '@design-system/geo-map/marker/GeoMarker';
import { BaseUseRenderMarkerProps } from '@design-system/hooks/geo-map/marker/useRenderMarker';
import { theme } from '@design-system/root/tailwind.config';
import { GenIdType } from '@design-system/utils/geo-map/IdGenerator';

interface UsePrepareMarkerProps extends Omit<
  BaseUseRenderMarkerProps,
  'markerZIndexMap' | 'lifeCycleKey'
> {}

const usePrepareMarker = ({
  geoMapControl,
  layerId,
}: UsePrepareMarkerProps) => {
  const { markerControls } = geoMapControl;
  const markerZIndexMapRef = useRef<Map<MarkerIdType, number>>(new Map());
  const getMarkerZIndex = (layerId: GenIdType, markerId: MarkerIdType) => {
    const isMarkerActivated = markerControls.isMarkerActivated(
      layerId,
      markerId,
    );
    const isMarkerFixingPosition = markerControls.isMarkerFixingPosition(
      layerId,
      markerId,
    );
    if (isMarkerActivated && isMarkerFixingPosition) {
      return theme.zIndex.map.marker.custom;
    }
    if (isMarkerActivated && !isMarkerFixingPosition) {
      return theme.zIndex.map.marker.activated;
    }
    if (!isMarkerActivated && isMarkerFixingPosition) {
      return theme.zIndex.map.marker.custom;
    }
    if (!isMarkerActivated && !isMarkerFixingPosition) {
      return markerZIndexMapRef.current.get(markerId);
    }
  };

  // mouse enter, leave시 호버 하면 zIndex가 바뀌는 이벤트
  useEffect(() => {
    let eventKeyMarkerMouseEnter: string | undefined;
    let eventKeyMarkerMouseLeave: string | undefined;
    let eventKeyMarkerActivated: string | undefined;

    const setPrepareMarkerEvent = () => {
      markerControls.clearMarkerAllIdRefs();

      eventKeyMarkerMouseEnter =
        markerControls.notificationEventManager?.addMarkerMouseEnterEventListener(
          (layerId, markerId) => {
            markerControls.setMarkerZIndex(
              layerId,
              markerId,
              theme.zIndex.map.marker.hover,
            );
          },
        );
      eventKeyMarkerMouseLeave =
        markerControls.notificationEventManager?.addMarkerMouseLeaveEventListener(
          (layerId, markerId) => {
            const zIndex = getMarkerZIndex(layerId, markerId);
            zIndex && markerControls.setMarkerZIndex(layerId, markerId, zIndex);
          },
        );
      eventKeyMarkerActivated =
        markerControls.notificationEventManager?.addMarkerActivatedEventListener(
          (layerId, markerId, isActivated) => {
            const zIndex = isActivated
              ? theme.zIndex.map.marker.activated
              : markerZIndexMapRef.current.get(markerId);
            zIndex && markerControls.setMarkerZIndex(layerId, markerId, zIndex);
          },
        );
    };

    if (layerId) {
      setPrepareMarkerEvent();
    }

    return () => {
      if (layerId) {
        eventKeyMarkerMouseEnter &&
          markerControls.notificationEventManager?.removeMarkerMouseEnterEventListener(
            eventKeyMarkerMouseEnter,
          );
        eventKeyMarkerMouseLeave &&
          markerControls.notificationEventManager?.removeMarkerMouseLeaveEventListener(
            eventKeyMarkerMouseLeave,
          );
        eventKeyMarkerActivated &&
          markerControls.notificationEventManager?.removeMarkerActivatedEventListener(
            eventKeyMarkerActivated,
          );
      }
    };
  }, [layerId]);

  useEffect(() => {
    markerControls.clearMarkersIdForCheckSimplify();
    markerControls.clearMarkerIdsSimplifyMap();
    if (markerControls.isAllMarkersSimplify) {
      markerControls.toggleMarkerSimplify();
    }
  }, [layerId]);

  return {
    markerZIndexMapRef,
  };
};

export default usePrepareMarker;
