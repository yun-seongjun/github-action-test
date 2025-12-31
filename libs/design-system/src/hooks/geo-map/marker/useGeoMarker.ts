import { useRef, useState } from 'react';
import GeoMap from '@design-system/geo-map/GeoMap';
import {
  GeoMarkerOptionsType,
  MarkerIdType,
} from '@design-system/geo-map/marker/GeoMarker';
import { GeoLatLngType } from '@design-system/types/geoMap.type';
import StructSetUtils from '@design-system/utils/structSetUtils';
import { GenIdType } from '@design-system/utils/geo-map/IdGenerator';

interface UseGeoMarkerProps {
  geoMap?: GeoMap;
}

export interface GeoMarkerControlType extends ReturnType<typeof useGeoMarker> {}

/**
 * 순회 코스 생성 및 조회에서 사용되는 id.
 * marker id에 해당 id가 있으면 현재 선택되어있는 마커이므로 simplify 무시
 */
export const ACTIVATE_NODE_COURSE_NODE_ID = 'activated-node-course-node-';

const useGeoMarker = ({ geoMap }: UseGeoMarkerProps) => {
  // 마커의 타입으로 마커 Id Map에 접근합니다.
  const [isAllMarkersSimplify, setIsAllMarkersSimplify] = useState(false);
  // Todo:: rdh :: marker는 layer에 따라 만들어짐으로 useRef<Map<number,Set<number>>>(new Map(new Set())) 이렇게 되어야 하지 않을까요?
  const markersIdForCheckSimplifyRef = useRef<Set<MarkerIdType>>(new Set());
  const markersIdSetRef = useRef<Set<MarkerIdType>>(new Set());

  const clearMarkerAllIdRefs = () => {
    markersIdSetRef.current.clear();
  };

  const addMarkerIdForCheckSimplify = (markerId: MarkerIdType) => {
    markersIdForCheckSimplifyRef.current.add(markerId);
  };
  const deleteMarkerIdForCheckSimplify = (markerId: MarkerIdType) => {
    markersIdForCheckSimplifyRef.current.delete(markerId);
  };
  const clearMarkersIdForCheckSimplify = () => {
    markersIdForCheckSimplifyRef.current.clear();
  };

  const [markerIdsSimplifyMap, setMarkerIdsSimplifyMap] = useState<
    Map<GenIdType, Set<MarkerIdType>>
  >(new Map());
  const clearMarkerIdsSimplifyMap = () => {
    setMarkerIdsSimplifyMap(new Map());
  };
  const setMarkerSimplify = (
    layerId: GenIdType,
    markerId: MarkerIdType,
    isSimplify: boolean,
  ) => {
    setMarkerIdsSimplifyMap((prev) => {
      const mapNew = new Map(prev);
      const setNew = mapNew.get(layerId) || new Set<number>();
      mapNew.set(layerId, setNew);
      if (isSimplify) {
        setNew.add(markerId);
      } else {
        setNew.delete(markerId);
      }

      if (isAllMarkersSimplify) {
        const markersIds = Array.from(setNew.values()).filter((id) =>
          markersIdForCheckSimplifyRef.current.has(id),
        );
        markersIds.length === 0 && setAllMarkersSimplify(layerId, false);
      } else {
        const allMarkerIds = geoMap
          ?.getAllMarkerIds(layerId)
          ?.filter((id) => markersIdForCheckSimplifyRef.current.has(id));
        !!allMarkerIds &&
          StructSetUtils.isSame(setNew, new Set<MarkerIdType>(allMarkerIds)) &&
          setAllMarkersSimplify(layerId, true);
      }
      return mapNew;
    });
    return !!geoMap?.setMarkerSimplify(layerId, markerId, isSimplify);
  };
  const setAllMarkersSimplify = (layerId: GenIdType, isSimplify: boolean) => {
    const allMarkerIds = geoMap?.getAllMarkerIds(layerId);
    if (!allMarkerIds) return;
    setMarkerIdsSimplifyMap((prev) => {
      const mapNew = new Map(prev);
      const setNew = mapNew.get(layerId) || new Set<number>();
      mapNew.set(layerId, setNew);
      allMarkerIds.forEach((markerId) => {
        if (!String(markerId).includes(ACTIVATE_NODE_COURSE_NODE_ID)) {
          if (isSimplify) {
            setNew.add(markerId);
          } else {
            setNew.delete(markerId);
          }
          geoMap?.setMarkerSimplify(layerId, markerId, isSimplify);
        }
      });
      return mapNew;
    });
    setIsAllMarkersSimplify(isSimplify);
  };
  const isMarkerSimplify = (layerId: GenIdType, markerId: MarkerIdType) => {
    return !!markerIdsSimplifyMap.get(layerId)?.has(markerId);
  };

  const setIsMarkerActivated = (
    layerId: GenIdType,
    markerId: MarkerIdType,
    isActivated: boolean,
  ) => {
    return geoMap?.setIsMarkerActivated(layerId, markerId, isActivated);
  };

  const setAllMarkerActivated = (layerId: GenIdType, isActivated: boolean) => {
    return geoMap?.setAllMarkerActivated(layerId, isActivated);
  };

  const isMarkerActivated = (layerId: GenIdType, markerId: MarkerIdType) => {
    return !!geoMap?.isMarkerActivated(layerId, markerId);
  };

  const isMarkerFixingPosition = (
    layerId: GenIdType,
    markerId: MarkerIdType,
  ) => {
    return geoMap?.isMarkerFixingPosition(layerId, markerId);
  };

  const setIsMarkerFixingPosition = (
    layerId: GenIdType,
    markerId: MarkerIdType,
    isFixingPosition: boolean,
  ) => {
    return geoMap?.setIsMarkerFixingPosition(
      layerId,
      markerId,
      isFixingPosition,
    );
  };

  const importMarker = (
    layerId: GenIdType,
    markerOptions: GeoMarkerOptionsType,
  ) => {
    const markerId = geoMap?.importMarker(layerId, {
      ...markerOptions,
      options: {
        ...markerOptions.options,
        ...(markerOptions.id
          ? { isSimplify: isMarkerSimplify(layerId, markerOptions.id) }
          : {}),
      },
    });
    if (markerId) {
      markersIdSetRef.current.add(markerId);
    }
    return markerId;
  };

  const deleteMarker = (layerId: GenIdType, markerId: MarkerIdType) => {
    markersIdSetRef.current.delete(markerId);
    return geoMap?.deleteMarker(layerId, markerId);
  };

  const setMarkerPosition = (
    layerId: GenIdType,
    markerId: MarkerIdType,
    position: GeoLatLngType,
  ) => {
    return geoMap?.setMarkerPosition(layerId, markerId, position);
  };

  const getMarkerPosition = (layerId: GenIdType, markerId: MarkerIdType) => {
    return geoMap?.getMarkerPosition(layerId, markerId);
  };

  const getMarkerZIndex = (layerId: GenIdType, markerId: MarkerIdType) => {
    return geoMap?.getMarkerZIndex(layerId, markerId);
  };

  const setMarkerZIndex = (
    layerId: GenIdType,
    markerId: MarkerIdType,
    zIndex: number,
  ) => {
    return geoMap?.setMarkerZIndex(layerId, markerId, zIndex);
  };

  const setMarkerOptions = (
    layerId: GenIdType,
    markerId: MarkerIdType,
    markerOptions: GeoMarkerOptionsType,
  ) => {
    return geoMap?.setMarkerOptions(layerId, markerId, markerOptions);
  };

  const toggleMarkerSimplify = () => {
    if (!geoMap) {
      return;
    }
    const isAllMarkersSimplifyNew = !isAllMarkersSimplify;
    setIsAllMarkersSimplify(isAllMarkersSimplifyNew);
    geoMap.getAllLayerIds().forEach((layerId) => {
      setAllMarkersSimplify(layerId, isAllMarkersSimplifyNew);
    });
  };

  return {
    isMarkerFixingPosition,
    setIsMarkerFixingPosition,
    addMarkerIdForCheckSimplify,
    deleteMarkerIdForCheckSimplify,
    clearMarkersIdForCheckSimplify,
    clearMarkerIdsSimplifyMap,
    clearMarkerAllIdRefs,
    setAllMarkersSimplify,
    toggleMarkerSimplify,
    isAllMarkersSimplify,
    setMarkerSimplify,
    isMarkerSimplify,
    setAllMarkerActivated,
    setIsMarkerActivated,
    isMarkerActivated,
    importMarker,
    deleteMarker,
    setMarkerPosition,
    getMarkerPosition,
    getMarkerZIndex,
    setMarkerZIndex,
    setMarkerOptions,
    notificationEventManager: geoMap?.notificationEventManager,
  };
};

export default useGeoMarker;
