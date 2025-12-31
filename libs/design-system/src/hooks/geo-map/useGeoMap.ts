import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import GeoMap, {
  DELAY_TIME_MAP_TYPE_ID_CHANGE,
  GeoMapExternalKeys,
  GeoMapGestureHandlingEnum,
  GeoMapOptionType,
} from '@design-system/geo-map/GeoMap';
import NotificationEventManager from '@design-system/geo-map/event/NotificationEventManager';
import { GeoFeaturesType } from '@design-system/geo-map/feature/GeoFeatureManager';
import GeoNode from '@design-system/geo-map/feature/GeoNode';
import GeoWay from '@design-system/geo-map/feature/GeoWay';
import { GeoLayerPolicy } from '@design-system/geo-map/layer/GeoLayer';
import GeoLineSegment from '@design-system/geo-map/line-segment/GeoLineSegment';
import { GeoMarkerOptionsType } from '@design-system/geo-map/marker/GeoMarker';
import useStateRef from '@design-system/hooks/useStateRef';
import useGeoMarker from '@design-system/hooks/geo-map/marker/useGeoMarker';
import { ChangeFields } from '@design-system/types/generic.type';
import {
  GEO_MAP_ZOOM_LEVEL_DEFAULT,
  GeoLatLngType,
  GeoMapBoundsType,
  GeoMapTypeEnum,
  GeoMapTypeIdEnum,
  GeoMapTypeImageEnum,
} from '@design-system/types/geoMap.type';
import { GenIdType } from '@design-system/utils/geo-map/IdGenerator';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';
import { EditToolMenuEnum } from '@design-system/components/geo-map/NodeContentsFuncFactory';

export interface MapInfoType {
  center: GeoLatLngType;
  countryCode?: string;
}

export type ImportMarkerOptionsType = ChangeFields<
  GeoMarkerOptionsType,
  { options: Omit<GeoMarkerOptionsType['options'], 'isSimplify'> }
>;

interface UseGeoMapProps
  extends Partial<GeoMapExternalKeys>, Partial<Omit<GeoMapOptionType, 'zoom'>> {
  mapInfo?: MapInfoType;
  mapTypeInit?: GeoMapTypeEnum;
  zoomInit?: number;
  onGeoMapInitialized?: (geoMap: GeoMap) => Promise<void> | void;
}

export type GeoMapControl = ReturnType<typeof useGeoMap>;

const useGeoMap = ({
  mapInfo,
  onGeoMapInitialized,
  mapId = process.env.GOOGLEMAP_ID,
  apiKey = process.env.GOOGLEMAP_KEY,
  locale,
  vworldKey = process.env.VWORLD_KEY,
  zoomInit = GEO_MAP_ZOOM_LEVEL_DEFAULT,
  mapTypeInit = GeoMapTypeEnum.ROADMAP,
  ...restOptions
}: UseGeoMapProps) => {
  const geoMapElementRef = useRef<HTMLDivElement>(null);
  const geoMapWrapperRef = useRef<HTMLDivElement>(null);
  const [geoMap, setGeoMap, getGeoMap] = useStateRef<GeoMap>();
  const [mapTypeId, setMapTypeId] = useState<GeoMapTypeIdEnum>();
  const mapType = mapTypeId && GeoMapUtils.getMapType(mapTypeId);
  const mapTypeImage = mapTypeId && GeoMapUtils.getMapTypeImage(mapTypeId);

  const initGeoMap = async (_mapInfo: MapInfoType) => {
    const mapElement = geoMapElementRef.current;
    if (!mapElement) {
      console.error('Error:: mapElement 가 없습니다.');
      return;
    }
    if (!_mapInfo.countryCode || !_mapInfo.center) {
      console.error('Error:: mapInfo 값이 없습니다.');
      return;
    }
    if (!apiKey || !mapId || !locale || !vworldKey) {
      console.error('Error:: apiKey, mapId, locale, vworldKey 값이 없습니다.');
      return;
    }
    const googleMap = await GeoMap.createGoogleMap({
      mapElement,
      center: _mapInfo.center,
      apiKey,
      mapId,
      locale,
      vworldKey,
      zoom: zoomInit,
      ...restOptions,
    });
    if (!googleMap || !zoomInit) return;
    const _geoMap = new GeoMap(
      googleMap,
      GeoMapUtils.getMapTypeId(
        zoomInit,
        _mapInfo.countryCode === 'KR'
          ? GeoMapTypeImageEnum.VWORLD
          : GeoMapTypeImageEnum.GOOGLE,
        mapTypeInit,
      ),
    );
    await _geoMapInitializeAsync(_geoMap, onGeoMapInitialized);

    flushSync(() => {
      setGeoMap(_geoMap);
    });
  };

  const _geoMapInitializeAsync = (
    geoMap: GeoMap,
    onGeoMapInitialized: ((geoMap: GeoMap) => Promise<void> | void) | undefined,
  ) => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        onGeoMapInitialized?.(geoMap);
        resolve(true);
      }, DELAY_TIME_MAP_TYPE_ID_CHANGE + 5);
    });
  };

  useEffect(() => {
    if (geoMapElementRef.current && mapInfo) {
      if (geoMap) {
        destroy();
      }
      initGeoMap(mapInfo);
    }
  }, [mapInfo]);

  useEffect(() => {
    if (geoMap) {
      geoMap.addMapTypeIdChangeStickyEventListener((mapTypeId) => {
        setMapTypeId(mapTypeId);
      });
    }
    return () => {
      if (geoMap) {
        geoMap.destroy();
      }
    };
  }, [geoMap]);

  const [isFullSize, setIsFullSize] = useState(false);

  useEffect(() => {
    const handleFullScreenChanged = () => {
      setIsFullSize(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChanged);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChanged);
    };
  }, []);

  /**
   * 아래 코드로 맵 확대 축소 가능
   */
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      geoMapWrapperRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const setMapGestureHandling = (
    gestureHandling: GeoMapGestureHandlingEnum,
  ) => {
    try {
      if (!geoMap) {
        throw new Error('geoMap이 없습니다.');
      }
      geoMap.setGestureHandling(gestureHandling);
      return true;
    } catch (error) {
      console.log('ERR:: GeoMap:: setGestureHandling::', error);
      return false;
    }
  };
  const getMapGestureHandling = () => geoMap?.getGestureHandling();

  const setMapDragBoxEnabled = (isEnabled: boolean) => {
    return !!geoMap?.setDragBoxEnabled(isEnabled);
  };
  const isMapDragBoxEnabled = () => !!geoMap?.isDragBoxEnabled();

  const isPositionInMapBounds = (
    latLng: GeoLatLngType,
    paddingXPixel = 0,
    paddingYPixel = 0,
  ) => {
    return !!geoMap?.isPositionInMapBounds(
      latLng,
      paddingXPixel,
      paddingYPixel,
    );
  };

  const getHeading = () => {
    return geoMap?.getHeading();
  };

  const setHeading = (heading: number) => {
    return geoMap?.setHeading(heading);
  };

  const setPencilGestureHandlingEnabled = (isEnabled: boolean) => {
    return !!geoMap?.setPencilGestureHandlingEnabled(isEnabled);
  };
  const isPencilGestureHandlingEnabled = () =>
    !!geoMap?.isPencilGestureHandlingEnabled();

  const setMapCenter = (latLng: GeoLatLngType) => {
    return !!geoMap?.setCenter(latLng);
  };

  const getMapCenter = () => {
    return geoMap?.getCenter();
  };

  const setLayerDragBoxEnabled = (layerId: GenIdType, isEnabled: boolean) => {
    return !!geoMap?.setLayerDragBoxEnabled(layerId, isEnabled);
  };
  const isLayerDragBoxEnabled = (layerId: GenIdType) =>
    !!geoMap?.isLayerDragBoxEnabled(layerId);

  const importJsonToLayer = (
    layerId: GenIdType,
    geoJson: FeatureCollection<Geometry, GeoJsonProperties>,
    isGenerateNewId?: boolean,
  ) => {
    return geoMap?.importJsonToLayer(layerId, geoJson, isGenerateNewId);
  };

  const importJsonToLayerList = (
    layerId: GenIdType,
    geoJson: FeatureCollection<Geometry, GeoJsonProperties>[],
    isGenerateNewId?: boolean,
  ) => {
    return geoMap?.importJsonListToLayer(layerId, geoJson, isGenerateNewId);
  };

  const deleteFeaturesFromLayer = (
    layerId: GenIdType,
    features: GeoFeaturesType,
  ) => {
    return geoMap?.deleteFeaturesFromLayer(layerId, features);
  };

  const splitByNodes = (layerId: GenIdType) => {
    return geoMap?.splitByNodes(layerId);
  };

  const exportJsonFromLayer = (layerId: GenIdType) => {
    return geoMap?.exportJsonFromLayer(layerId);
  };

  const setLayerPolicy = (layerId: GenIdType, policy: GeoLayerPolicy) => {
    return !!geoMap?.setLayerPolicy(layerId, policy);
  };
  const getLayerPolicy = (layerId: GenIdType) => {
    return geoMap?.getLayerPolicy(layerId);
  };

  const getMap = (): Readonly<GeoMap> | undefined => {
    return geoMap;
  };

  const setMapType = async (mapType: GeoMapTypeEnum) => {
    return geoMap?.setMapType(mapType);
  };
  const getMapType = () => geoMap?.getMapType();

  const createLayer = (policy?: GeoLayerPolicy) => {
    return geoMap?.createLayer(policy);
  };
  const deleteLayer = (layerId: GenIdType) => {
    return geoMap?.deleteLayer(layerId);
  };

  const getAllLayerIds = () => {
    return geoMap?.getAllLayerIds();
  };

  const getMapLayer = (layerId: GenIdType) => {
    return geoMap?.getMapLayer(layerId);
  };

  /**
   * ===============================================================================================
   * FeatureActivation 제어
   * ===============================================================================================
   */
  const activateNodes = (layerId: GenIdType, nodes: GeoNode[]) => {
    return !!geoMap?.activateNodes(layerId, nodes);
  };
  const deactivateNodes = (layerId: GenIdType, nodes: GeoNode[]) => {
    return !!geoMap?.deactivateNodes(layerId, nodes);
  };

  const activateWays = (layerId: GenIdType, ways: GeoWay[]) => {
    return !!geoMap?.activateWays(layerId, ways);
  };

  const deactivateWays = (layerId: GenIdType, ways: GeoWay[]) => {
    return !!geoMap?.deactivateWays(layerId, ways);
  };

  const getLineSegmentsOfWay = (layerId: GenIdType, way: GeoWay) => {
    return geoMap?.getLineSegmentsOfWay(layerId, way);
  };

  const activateLineSegments = (
    layerId: GenIdType,
    lineSegments: GeoLineSegment[],
  ) => {
    return !!geoMap?.activateLineSegments(layerId, lineSegments);
  };

  const deactivateLineSegments = (
    layerId: GenIdType,
    lineSegments: GeoLineSegment[],
  ) => {
    return !!geoMap?.deactivateLineSegments(layerId, lineSegments);
  };

  const deactivateAllFeatures = (layerId: GenIdType) => {
    return !!geoMap?.deactivateAllFeatures(layerId);
  };

  const getFeaturesActivated = (layerId: GenIdType) => {
    return geoMap?.getFeaturesActivated(layerId);
  };

  const markerControls = useGeoMarker({ geoMap });

  const getMarkerContent = (layerId: GenIdType, markerId: number) => {
    return geoMap?.getMarkerContent(layerId, markerId);
  };

  const setMarkerContent = (
    layerId: GenIdType,
    markerId: number,
    markerContentRenderFn: () => HTMLDivElement,
  ) => {
    return geoMap?.setMarkerContent(layerId, markerId, markerContentRenderFn);
  };

  const clearCandidateWhenWayCreating = (layerId: GenIdType) => {
    return geoMap?.clearCandidateWhenWayCreating(layerId);
  };

  /**
   * ===============================================================================================
   * EventListener
   * ===============================================================================================
   */
  const addToolBoxMenuButtonClickEventListener = (
    listener: (
      layerId: GenIdType,
      menu: EditToolMenuEnum,
      event?: Event,
    ) => void,
  ) => {
    return geoMap?.addToolBoxMenuButtonClickEventListener(listener);
  };
  const removeToolBoxMenuButtonClickEventListener = (key: string) => {
    geoMap?.removeToolBoxMenuButtonClickEventListener(key);
  };

  const addFeatureCopiedEventListener = (
    listener: (
      layerId: GenIdType,
      feature: FeatureCollection<Geometry, GeoJsonProperties>,
    ) => void,
  ) => {
    return geoMap?.addFeatureCopiedEventListener(listener);
  };
  const removeFeatureCopiedEventListener = (key: string) => {
    geoMap?.removeFeatureCopiedEventListener(key);
  };

  const destroy = () => {
    flushSync(() => {
      setGeoMap(undefined);
    });
  };

  const overlayImage = (bounds: GeoMapBoundsType, src: string) => {
    return geoMap?.overlayImage(bounds, src);
  };

  const getZoom = () => {
    return geoMap?.getZoom();
  };
  const setZoom = (zoom: number) => {
    return geoMap?.setZoom(zoom);
  };

  const panBy = (latLng: GeoLatLngType) => {
    return geoMap?.panBy(latLng);
  };

  const panTo = (latLng: GeoLatLngType) => {
    return geoMap?.panTo(latLng);
  };

  return {
    geoMapElementRef,
    geoMapWrapperRef,
    geoMap,
    isInitializedGeoMap: !!geoMap,
    mapType,
    mapTypeId,
    mapTypeImage,
    isLayerEdited: getGeoMap()?.isLayerEdited,
    setIsLayerEdited: getGeoMap()?.setIsLayerEdited,
    importJsonToLayer,
    importJsonToLayerList,
    deleteFeaturesFromLayer,
    exportJsonFromLayer,
    setMapGestureHandling,
    getMapGestureHandling,
    isPositionInMapBounds,
    setMapCenter,
    getMapCenter,
    setMapDragBoxEnabled,
    isMapDragBoxEnabled,
    setLayerDragBoxEnabled,
    isLayerDragBoxEnabled,
    setLayerPolicy,
    getLayerPolicy,
    getMapLayer,
    getMap,
    setMapType,
    getMapType,
    createLayer,
    deleteLayer,
    getAllLayerIds,
    activateNodes,
    deactivateNodes,
    activateWays,
    deactivateWays,
    getLineSegmentsOfWay,
    activateLineSegments,
    deactivateLineSegments,
    deactivateAllFeatures,
    overlayImage,
    getZoom,
    setZoom,
    panBy,
    panTo,
    getHeading,
    setHeading,
    setPencilGestureHandlingEnabled,
    isPencilGestureHandlingEnabled,
    notificationEventManager:
      geoMap?.notificationEventManager as NotificationEventManager,
    markerControls,
    addToolBoxMenuButtonClickEventListener,
    removeToolBoxMenuButtonClickEventListener,
    addFeatureCopiedEventListener,
    removeFeatureCopiedEventListener,
    setStreetViewPosition: geoMap?.setStreetViewPosition,
    setStreetViewVisible: geoMap?.setStreetViewVisible,
    isFullSize,
    toggleFullScreen,
    redo: geoMap?.redo,
    undo: geoMap?.undo,
    historyClear: geoMap?.historyClear,
    destroy,
    getFeaturesActivated,
    splitByNodes,
    clearCandidateWhenWayCreating,
  };
};

export default useGeoMap;
