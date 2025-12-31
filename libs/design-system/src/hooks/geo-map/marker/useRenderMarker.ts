import { useEffect, useRef } from 'react';
import {
  GeoMarkerOptionsType,
  MarkerIdType,
} from '@design-system/geo-map/marker/GeoMarker';
import useStateRef from '@design-system/hooks/useStateRef';
import { GeoMarkerControlType } from '@design-system/hooks/geo-map/marker/useGeoMarker';
import { PrimitiveType } from '@design-system/types/generic.type';
import { GeoLatLngType } from '@design-system/types/geoMap.type';
import DataUtils from '@design-system/utils/dataUtils';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';
import { GenIdType } from '@design-system/utils/geo-map/IdGenerator';
import { GeoMapControl } from '@design-system/hooks';

export interface MarkerInfoType {
  id: MarkerIdType;
  position: GeoLatLngType;
  markerTexts: string | string[];
}

export interface BaseUseRenderMarkerProps {
  lifeCycleKey?: PrimitiveType;
  layerId?: number;
  markerZIndexMap: Map<MarkerIdType, number>;
  geoMapControl: GeoMapControl;
  isActivateEnabled?: boolean;
}

interface UseRenderMarkerProps<
  TData extends MarkerInfoType = MarkerInfoType,
> extends BaseUseRenderMarkerProps {
  data?: TData[];
  getMarkerOption: (
    ...markerTexts: string[]
  ) => GeoMarkerOptionsType['options'];
}

export const importPopoverMarkerToLayer = ({
  layerId,
  markerOptions,
  markerZIndexMap,
  markerControls,
}: {
  layerId: GenIdType;
  markerOptions: GeoMarkerOptionsType;
  markerZIndexMap: Map<MarkerIdType, number>;
  markerControls: GeoMarkerControlType;
}) => {
  const zIndex = markerOptions.options.zIndex;
  const markerId = markerControls.importMarker(layerId, markerOptions);
  if (!markerId) return;
  markerZIndexMap.set(markerId, zIndex);
  return markerId;
};

const useRenderMarker = <TData extends MarkerInfoType>({
  lifeCycleKey,
  geoMapControl,
  markerZIndexMap,
  layerId,
  data,
  getMarkerOption,
  isActivateEnabled = false,
}: UseRenderMarkerProps<TData>) => {
  const { markerControls } = geoMapControl;
  const [dataSelected, setDataSelected, getDataSelected] = useStateRef<TData>();
  const markerIdFixingPositionRef = useRef<MarkerIdType>();
  // key:: dataId, value:: markerId
  const markersIdMapRef = useRef<Map<MarkerIdType, MarkerIdType>>(new Map());

  useEffect(() => {
    markersIdMapRef.current.forEach((markerId) => {
      if (!layerId) return;
      markerControls.deleteMarker(layerId, markerId);
    });
    markersIdMapRef.current.clear();
  }, [lifeCycleKey, layerId]);

  useEffect(() => {
    if (layerId) {
      // 새로운 데이터 목록이 들어오면 기존에 그려진 마커는 삭제되어야 합니다.
      const deletedMarkerDataId: MarkerIdType[] = [];
      markersIdMapRef.current.forEach((markerId, dataId) => {
        const isDrawnMarker = data?.some(
          (dataItem) => markerId === dataItem.id,
        );
        if (!isDrawnMarker) {
          markerControls.deleteMarker(layerId, markerId);
          deletedMarkerDataId.push(dataId);
        }
      });
      deletedMarkerDataId.forEach((dataId) => {
        markersIdMapRef.current.delete(dataId);
      });

      data?.forEach((dataItem) => {
        if (
          DataUtils.isNullOrUndefined(layerId) ||
          DataUtils.isNullOrUndefined(dataItem.id)
        )
          return;
        const markerId = markersIdMapRef.current.get(dataItem.id);
        const isMarkerTextsArray = Array.isArray(dataItem.markerTexts);
        if (markerId) {
          const markerOptions = {
            position: dataItem.position,
            options: isMarkerTextsArray
              ? getMarkerOption(...dataItem.markerTexts)
              : getMarkerOption(dataItem.markerTexts as string),
          };
          markerControls.setMarkerOptions(layerId, markerId, markerOptions);
        } else {
          const markerId = importPopoverMarkerToLayer({
            layerId: layerId,
            markerZIndexMap,
            markerControls,
            markerOptions: {
              id: dataItem.id,
              position: dataItem.position,
              options: isMarkerTextsArray
                ? getMarkerOption(...dataItem.markerTexts)
                : getMarkerOption(dataItem.markerTexts as string),
            },
          });

          if (markerId) {
            markersIdMapRef.current.set(dataItem.id, markerId);
            markerControls.addMarkerIdForCheckSimplify(markerId);
          }
        }
      });
    }
  }, [data, layerId]);

  const activateMarker = (layerId: number, markerId: MarkerIdType) => {
    const currentDataSelected = getDataSelected();
    let clickedDataId: string | number | undefined = undefined;

    markersIdMapRef.current.forEach((_markerId, nodeId) => {
      if (_markerId === markerId) {
        clickedDataId = nodeId;
      }
      markerControls.setIsMarkerActivated(layerId, _markerId, false);
    });

    if (clickedDataId !== currentDataSelected?.id) {
      markerControls.setIsMarkerActivated(layerId, markerId, true);
      setDataSelected(data?.find((dataItem) => dataItem.id === clickedDataId));
    } else {
      setDataSelected(undefined);
    }
  };

  const selectDataMarker = (layerId: number, data: TData) => {
    if (!isActivateEnabled) return;
    let clickedMarkerId: MarkerIdType | undefined = undefined;

    markersIdMapRef.current.forEach((_markerId, dataId) => {
      if (data.id === dataId) {
        clickedMarkerId = _markerId;
      }
      markerControls.setIsMarkerActivated(layerId, _markerId, false);
    });

    if (clickedMarkerId) {
      markerControls.setIsMarkerActivated(layerId, clickedMarkerId, true);
      setDataSelected(data);
    }

    if (
      !geoMapControl.isPositionInMapBounds(data.position, 120, 90) &&
      GeoMapUtils.isValidLatLng(data.position)
    ) {
      geoMapControl.setMapCenter(data.position);
    }
  };

  const initDataMarker = (layerId: number) => {
    markersIdMapRef.current.forEach((_markerId) => {
      markerControls.setIsMarkerActivated(layerId, _markerId, false);
    });
    setDataSelected(undefined);
  };

  useEffect(() => {
    let markerClickedEventKey: string | undefined;
    let mapClickedEventKey: string | undefined;

    if (layerId && isActivateEnabled) {
      markerClickedEventKey =
        markerControls.notificationEventManager?.addMarkerClickEventListener(
          (layerId, markerId) => {
            if (![...markersIdMapRef.current.values()].includes(markerId))
              return;
            activateMarker(layerId, markerId);
          },
        );
      mapClickedEventKey =
        geoMapControl.notificationEventManager?.addMapClickEventListener(() => {
          if (!markerIdFixingPositionRef.current) {
            initDataMarker(layerId);
          }
        });
    }

    if (layerId && !isActivateEnabled) {
      initDataMarker(layerId);
    }

    return () => {
      if (layerId) {
        markerClickedEventKey &&
          markerControls.notificationEventManager?.removeMarkerClickEventListener(
            markerClickedEventKey,
          );
        mapClickedEventKey &&
          geoMapControl.notificationEventManager?.removeMapClickEventListener(
            mapClickedEventKey,
          );
      }
    };
  }, [layerId, isActivateEnabled, data]);

  return {
    markerIdFixingPositionRef,
    markersIdMapRef,
    dataSelected,
    setDataSelected: isActivateEnabled ? setDataSelected : undefined,
    getDataSelected,
    selectDataMarker,
    initDataMarker,
  };
};

export default useRenderMarker;
