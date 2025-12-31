import { useEffect, useRef } from 'react';
import {
  GeoMapTypeEnum,
  GeoMapZoomLevel,
} from '@design-system/types/geoMap.type';
import { GeoMapControl } from '@design-system/hooks';

interface UseTempIndoorMapProps {
  siteNumber?: string | null;
  geoMapControl: GeoMapControl;
}

/**
 * Todo:
 * 앞으로 실내맵 서비스를 하는 방향과는 무관하여 일회성의 코드입니다.
 */
const useTempIndoorMap = ({
  siteNumber,
  geoMapControl,
}: UseTempIndoorMapProps) => {
  const { isInitializedGeoMap, mapType, overlayImage, setZoom } = geoMapControl;
  const overlayImageRef = useRef<google.maps.GroundOverlay>();

  /**
   * 용산구
   */
  useEffect(() => {
    if (isInitializedGeoMap && siteNumber === 'NB_YONGSAN_00') {
      setZoom(GeoMapZoomLevel.TILE_256_MAX);
      overlayImage(
        {
          east: 37.5322284,
          west: 37.5349407,
          south: 126.9634514,
          north: 126.9573817,
        },
        'https://neubie-common.s3.ap-northeast-2.amazonaws.com/image/map_image/yongsan_indoor_map.png',
      );
    }
  }, [isInitializedGeoMap, siteNumber]);

  /**
   * 부천 위브, neomhospital
   */
  useEffect(() => {
    const setIndoorMapImage = async () => {
      if (mapType === GeoMapTypeEnum.ROADMAP && isInitializedGeoMap) {
        switch (siteNumber) {
          case 'NB_SKT_WEVE_00':
            overlayImageRef.current = overlayImage(
              {
                east: 37.4951036,
                west: 37.5022041,
                south: 126.7824714,
                north: 126.7740321,
              },
              'https://neubie-common.s3.ap-northeast-2.amazonaws.com/image/map_image/bucheon-indoor-map.jpg',
            );
            break;
          case 'NEOM_HOSPITAL_00':
            overlayImageRef.current = overlayImage(
              {
                east: 28.018207,
                west: 28.020565,
                south: 35.233597,
                north: 35.2309606,
              },
              'https://neubie-common.s3.ap-northeast-2.amazonaws.com/image/map_image/neomhospital_map.png',
            );
            break;
          default:
            break;
        }
      } else {
        overlayImageRef.current?.setMap(null);
        overlayImageRef.current = undefined;
      }
    };

    setIndoorMapImage();
  }, [isInitializedGeoMap, siteNumber, mapType]);

  /**
   * 부천 위브
   */
  useEffect(() => {
    if (siteNumber === 'NB_SKT_WEVE_00') {
      setZoom(18);
    }
  }, [isInitializedGeoMap, siteNumber]);
};

export default useTempIndoorMap;
