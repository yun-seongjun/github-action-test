import GeoNode from '@design-system/geo-map/feature/GeoNode';
import { GeoWayOptionType } from '@design-system/geo-map/feature/GeoWay';
import { GeoLayerPolicy } from '@design-system/geo-map/layer/GeoLayer';
import { GeoLineSegmentOptionType } from '@design-system/geo-map/line-segment/GeoLineSegment';
import { theme } from '@design-system/root/tailwind.config';
import {
  GeoMapTypeEnum,
  GeoMapZoomLevel,
} from '@design-system/types/geoMap.type';
import DataUtils from '@design-system/utils/dataUtils';

export const TOAST_DURATION_SAVE_PATH = 8000;

export enum MainLayerModeEnum {
  TAG_EDIT = 'TAG_EDIT',
  EDIT = 'EDIT',
  APPEND = 'APPEND',
  LAYER = 'LAYER',
}

export const BASE_MAP_STYLE = [
  {
    featureType: 'administrative.neighborhood',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.business',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'transit',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
];

export enum GeoLineSegmentIconColorTypeEnum {
  /**
   * 기본값
   */
  DEFAULT = 'DEFAULT',
  /**
   * LineSegment가 활성화 된 상태
   */
  ACTIVATED = 'ACTIVATED',
  /**
   * Way만 활성화 된 상태
   */
  WAY_ACTIVATED = 'WAY_ACTIVATED',
}

export enum SvgColorTypeEnum {
  STROKE = 'STROKE',
  FILL = 'FILL',
}

export interface SvgColors {
  [SvgColorTypeEnum.FILL]: string;
  [SvgColorTypeEnum.STROKE]: string;
}

export interface GeoLineSegmentDirectionIconColors {
  [GeoLineSegmentIconColorTypeEnum.DEFAULT]: SvgColors | undefined;
  [GeoLineSegmentIconColorTypeEnum.ACTIVATED]: SvgColors | undefined;
  [GeoLineSegmentIconColorTypeEnum.WAY_ACTIVATED]: SvgColors | undefined;
}

export interface GeoLineSegmentIconColors {
  [GeoMapTypeEnum.ROADMAP]: GeoLineSegmentDirectionIconColors;
  [GeoMapTypeEnum.SATELLITE]: GeoLineSegmentDirectionIconColors;
}

export interface GeoLineStyle extends Pick<
  GeoLineSegmentOptionType,
  'strokeWeight' | 'strokeColor' | 'strokeOpacity' | 'zIndex' | 'icons'
> {}

export interface GeoFeatureStylePolicy {
  // way
  iconsWay?: GeoWayOptionType['icons'];
  strokeWeightWay: number;
  zIndexWay: number;
  strokeColorWayForRoadMap: string;
  strokeColorWayForSatellite: string;
  opacityWayDisabled: number;
  // centerWay
  strokeColorCenterLineOfWayActivated: string;
  strokeWeightCenterLineOfWayActivated: number;
  // lineSegmentDirection
  lineSegmentDirection: {
    directionIcons?: GeoLineSegmentOptionType['icons'];
    directionIconsColors?: GeoLineSegmentIconColors;
  };
  strokeColorLineSegmentActivatedForRoadMap: string;
  strokeColorLineSegmentActivatedForSatellite: string;
  strokeWeightLineSegmentActivated: number;
  // node
  bgColorSingleNodeActivated: string;
  bgColorSingleNodeDeactivated: string;
  borderColorSingleNodeActivated?: string;
  borderColorSingleNodeDeactivated?: string;
  bgColorMultiNodeActivated: string;
  bgColorMultiNodeDeactivated: string;
  borderColorMultiNodeActivated?: string;
  borderColorMultiNodeDeactivated?: string;
  zIndexNode: number;
  opacityNodeDisabled: number;
  // endPoint
  shapeEndPointNode: string;
  strokeWidthEndPointNode: number;
  // segmentNode
  shapeSegmentNode: string;
  strokeWidthSegmentNode: number;
  // preNode
  shapePreNode: string;
  bgColorPreNode: string;
  // layer
  opacityLayer: number;
  // LineOfNodeCandidate
  strokeColorLineOfNodeCandidate: string;
  strokeWeightLineOfNodeCandidate: number;
  strokeColorCenterLineOfNodeCandidate: string;
  strokeWeightCenterLineOfNodeCandidate: number;
}

const STROKE_COLOR_WAY_FOR_SATELLITE = '#58FF21';

export const FEATURE_STYLE_POLICY: GeoFeatureStylePolicy = {
  // way
  strokeWeightWay: 4,
  zIndexWay: theme.zIndex.map.polyline.normal,
  strokeColorWayForRoadMap: theme.colors.mono['800'],
  strokeColorWayForSatellite: STROKE_COLOR_WAY_FOR_SATELLITE,
  opacityWayDisabled: 0.3,
  // centerWay
  strokeColorCenterLineOfWayActivated: theme.colors.white,
  strokeWeightCenterLineOfWayActivated: 2,
  // lineSegment
  lineSegmentDirection: {
    directionIcons: [
      {
        icon: {
          path: 'm4.3,10l-4.3,-8.85l-4.3,8.85c-0.2,0.4 0.2,0.84 0.62,0.69l3.16,-1.17c0.34,-0.12 0.7,-0.12 1.04,0l3.16,1.17c0.42,0.15 0.82,-0.29 0.62,-0.69z',
          fillOpacity: 1,
          fillColor: theme.colors.transparent,
          strokeOpacity: 1,
          strokeColor: theme.colors.transparent,
          strokeWeight: 1,
          scale: 1.5,
        },
        offset: '100%',
      },
    ],
    directionIconsColors: {
      [GeoMapTypeEnum.ROADMAP]: {
        [GeoLineSegmentIconColorTypeEnum.DEFAULT]: {
          [SvgColorTypeEnum.FILL]: theme.colors.black,
          [SvgColorTypeEnum.STROKE]: theme.colors.black,
        },
        [GeoLineSegmentIconColorTypeEnum.ACTIVATED]: {
          [SvgColorTypeEnum.FILL]: theme.colors.secondary['300'],
          [SvgColorTypeEnum.STROKE]: theme.colors.black,
        },
        [GeoLineSegmentIconColorTypeEnum.WAY_ACTIVATED]: {
          [SvgColorTypeEnum.FILL]: theme.colors.white,
          [SvgColorTypeEnum.STROKE]: theme.colors.black,
        },
      },
      [GeoMapTypeEnum.SATELLITE]: {
        [GeoLineSegmentIconColorTypeEnum.DEFAULT]: {
          [SvgColorTypeEnum.FILL]: STROKE_COLOR_WAY_FOR_SATELLITE,
          [SvgColorTypeEnum.STROKE]: STROKE_COLOR_WAY_FOR_SATELLITE,
        },
        [GeoLineSegmentIconColorTypeEnum.ACTIVATED]: {
          [SvgColorTypeEnum.FILL]: theme.colors.secondary['500'],
          [SvgColorTypeEnum.STROKE]: STROKE_COLOR_WAY_FOR_SATELLITE,
        },
        [GeoLineSegmentIconColorTypeEnum.WAY_ACTIVATED]: {
          [SvgColorTypeEnum.FILL]: theme.colors.white,
          [SvgColorTypeEnum.STROKE]: STROKE_COLOR_WAY_FOR_SATELLITE,
        },
      },
    },
  },
  strokeColorLineSegmentActivatedForRoadMap: theme.colors.secondary['300'],
  strokeColorLineSegmentActivatedForSatellite: theme.colors.secondary['500'],
  strokeWeightLineSegmentActivated: 2,
  // node
  bgColorSingleNodeActivated: theme.colors.red[500],
  bgColorSingleNodeDeactivated: theme.colors.red[100],
  borderColorSingleNodeActivated: undefined,
  borderColorSingleNodeDeactivated: theme.colors.red[500],
  bgColorMultiNodeActivated: theme.colors.secondary[500],
  bgColorMultiNodeDeactivated: theme.colors.white,
  borderColorMultiNodeActivated: undefined,
  borderColorMultiNodeDeactivated: theme.colors.secondary[500],
  zIndexNode: theme.zIndex.map.marker.normal,
  opacityNodeDisabled: 0.3,
  // endPointNode
  shapeEndPointNode: 'M 12 0 A 12 12 0 1 0 12 24 A 12 12 0 1 0 12 0',
  strokeWidthEndPointNode: 2,
  // segmentNode
  shapeSegmentNode: 'M0 0H24V24H0Z',
  strokeWidthSegmentNode: 4,
  // preNode
  shapePreNode: 'M13 11V4H11V11H4V13H11V20H13V13H20V11H13Z',
  bgColorPreNode: theme.colors.tertiary[300],
  // layer
  opacityLayer: 1,
  // LineOfNodeCandidate
  strokeColorLineOfNodeCandidate: theme.colors.mono['800'],
  strokeWeightLineOfNodeCandidate: 4,
  strokeColorCenterLineOfNodeCandidate: theme.colors.secondary['300'],
  strokeWeightCenterLineOfNodeCandidate: 2,
};

export const MAP_INSET_BOUNDS_PADDING = 16;
const ZOOM_LEVEL_FOR_EDIT = GeoMapZoomLevel.TILE_256_MAX;

export const MAIN_LAYER_VIEWER_POLICY: GeoLayerPolicy = {
  featureActivationPolicy: {
    isEndpointNodeActivateEnabled: false,
    isEndpointNodeMultipleActivateEnabled: false,
    isSegmentNodeActivateEnabled: false,
    isSegmentNodeMultipleActivateEnabled: false,
    isNodeSingleActivateEnabled: false,
    isNodeAndLineSegmentSingleActivateByClickEnabled: false,
    isNodeActivateByDragBoxEnabled: false,
    isNodeAddedToWaySingleActivateEnabled: false,
    isNodeDeletedFromWayDeactivateEnabled: false,
    isWayActivateEnabled: false,
    isLineSegmentActivateEnabledByDragBox: false,
    isLineSegmentActivateEnabled: false,
    isWayLineSegmentsActivateEnabled: false,
    isWaySingleActivateEnabled: false,
  },
  layerDelegatorPolicy: {
    isEndpointNodeClickable: false,
    isSegmentalNodeClickable: false,
    isEndpointNodeDraggable: false,
    isSegmentalNodeDraggable: false,
    isNodeSnappingEnabled: false,
    isDivideWayWhenToolBoxDivideButtonClick: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    isCopyActivatedWhenToolBoxCopyButtonClick: false,
    isDeactivateAllWhenToolBoxClosed: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
  },
  nodeCandidatePolicy: {
    isCreatable: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
    pencilSupportedEnabled: false,
  },
  preNodePolicy: {
    isPreNodeEnable: false,
    isPreNodeDragEnable: false,
    isPreNodeClickEnable: false,
    isPreNodeRemoveOnClick: false,
    isPreNodeRemoveOnDragStart: false,
    preNodeEnabledZoomLevel: undefined,
  },
  toolBoxPolicy: {
    isToolBoxEnabled: false,
    isToolBoxShowingOnDragging: false,
    isCloseButtonEnabled: false,
    isDeleteButtonEnabled: false,
    isDivideWaysButtonEnabled: false,
    isCopyButtonEnabled: false,
    isEditModeButtonEnabled: false,
    isAppendModeButtonEnabled: false,
    isTagEditModeButtonEnabled: false,
    isPencilOnlyEnabled: false,
  },
  featureStylePolicy: {
    ...FEATURE_STYLE_POLICY,
    strokeWeightWay: 4,
    zIndexWay: theme.zIndex.map.polyline.normal,
    strokeColorWayForRoadMap: theme.colors.primary['500'],
    strokeColorWayForSatellite: theme.colors.primary['500'],
  },
  lineSegmentPolicy: {
    isLineSegmentEnable: false,
    isLineSegmentClickable: false,
    isLineSegmentDirectionEnable: false,
  },
  markerPolicy: {
    // 아직 까지 마커의 드래그 기능을 사용하는 케이스가 없습니다.
    isDraggable: false,
    isClickable: true,
  },
  featureVisiblePolicy: {
    isEndpointNodeVisible: false,
    isSegmentNodeVisible: false,
    isWayVisible: true,
    nodeHideZoomLevel: undefined,
    isMarkerVisible: true,
  },
  layerEventInvokerPolicy: {
    enabled: false,
    dragBoxEnabled: false,
    pencilSupportedEnabled: false,
  },
} as const;

export const MOBILE_PATH_GENERATION_MAIN_LAYER_POLICY: GeoLayerPolicy = {
  featureActivationPolicy: {
    isEndpointNodeActivateEnabled: false,
    isEndpointNodeMultipleActivateEnabled: false,
    isSegmentNodeActivateEnabled: false,
    isSegmentNodeMultipleActivateEnabled: false,
    isNodeSingleActivateEnabled: false,
    isNodeAndLineSegmentSingleActivateByClickEnabled: false,
    isNodeActivateByDragBoxEnabled: false,
    isNodeAddedToWaySingleActivateEnabled: false,
    isNodeDeletedFromWayDeactivateEnabled: false,
    isWayActivateEnabled: false,
    isLineSegmentActivateEnabledByDragBox: false,
    isLineSegmentActivateEnabled: false,
    isWayLineSegmentsActivateEnabled: false,
    isWaySingleActivateEnabled: false,
  },
  layerDelegatorPolicy: {
    isEndpointNodeClickable: true,
    isSegmentalNodeClickable: true,
    isEndpointNodeDraggable: false,
    isSegmentalNodeDraggable: false,
    isNodeSnappingEnabled: false,
    isDivideWayWhenToolBoxDivideButtonClick: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    isCopyActivatedWhenToolBoxCopyButtonClick: false,
    isDeactivateAllWhenToolBoxClosed: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
  },
  nodeCandidatePolicy: {
    isCreatable: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
    pencilSupportedEnabled: false,
  },
  preNodePolicy: {
    isPreNodeEnable: false,
    isPreNodeDragEnable: false,
    isPreNodeClickEnable: false,
    isPreNodeRemoveOnClick: false,
    isPreNodeRemoveOnDragStart: false,
    preNodeEnabledZoomLevel: undefined,
  },
  toolBoxPolicy: {
    isToolBoxEnabled: false,
    isToolBoxShowingOnDragging: false,
    isCloseButtonEnabled: false,
    isDeleteButtonEnabled: false,
    isDivideWaysButtonEnabled: false,
    isCopyButtonEnabled: false,
    isEditModeButtonEnabled: false,
    isAppendModeButtonEnabled: false,
    isTagEditModeButtonEnabled: false,
    isPencilOnlyEnabled: false,
  },
  featureStylePolicy: {
    ...FEATURE_STYLE_POLICY,
    strokeWidthSegmentNode: 8,
    strokeWeightWay: 6,
    zIndexWay: theme.zIndex.map.polyline.normal,
    strokeColorWayForRoadMap: theme.colors.secondary['100'],
    strokeColorWayForSatellite: theme.colors.secondary['100'],
  },
  lineSegmentPolicy: {
    isLineSegmentClickable: false,
    isLineSegmentEnable: false,
    isLineSegmentDirectionEnable: false,
  },
  markerPolicy: {
    // 아직 까지 마커의 드래그 기능을 사용하는 케이스가 없습니다.
    isDraggable: false,
    isClickable: false,
  },
  featureVisiblePolicy: {
    isEndpointNodeVisible: true,
    isSegmentNodeVisible: true,
    isWayVisible: true,
    nodeHideZoomLevel: 16,
    isMarkerVisible: true,
  },
  layerEventInvokerPolicy: {
    enabled: true,
    dragBoxEnabled: false,
    pencilSupportedEnabled: false,
  },
} as const;

export const MAIN_LAYER_TAG_EDIT_POLICY: GeoLayerPolicy = {
  featureActivationPolicy: {
    isEndpointNodeActivateEnabled: false,
    isEndpointNodeMultipleActivateEnabled: false,
    isSegmentNodeActivateEnabled: false,
    isSegmentNodeMultipleActivateEnabled: false,
    isNodeSingleActivateEnabled: false,
    isNodeAndLineSegmentSingleActivateByClickEnabled: true,
    isNodeActivateByDragBoxEnabled: false,
    isNodeAddedToWaySingleActivateEnabled: false,
    isNodeDeletedFromWayDeactivateEnabled: false,
    isWayActivateEnabled: true,
    isLineSegmentActivateEnabledByDragBox: false,
    isLineSegmentActivateEnabled: true,
    isWayLineSegmentsActivateEnabled: true,
    isWaySingleActivateEnabled: true,
  },
  layerDelegatorPolicy: {
    isEndpointNodeClickable: false,
    isSegmentalNodeClickable: false,
    isEndpointNodeDraggable: false,
    isSegmentalNodeDraggable: false,
    isNodeSnappingEnabled: false,
    isDivideWayWhenToolBoxDivideButtonClick: true,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    isCopyActivatedWhenToolBoxCopyButtonClick: false,
    isDeactivateAllWhenToolBoxClosed: true,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
  },
  nodeCandidatePolicy: {
    isCreatable: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
    pencilSupportedEnabled: false,
  },
  preNodePolicy: {
    isPreNodeEnable: false,
    isPreNodeDragEnable: false,
    isPreNodeClickEnable: false,
    isPreNodeRemoveOnClick: false,
    isPreNodeRemoveOnDragStart: false,
    preNodeEnabledZoomLevel: undefined,
  },
  toolBoxPolicy: {
    isToolBoxEnabled: true,
    isToolBoxShowingOnDragging: false,
    isCloseButtonEnabled: true,
    isDeleteButtonEnabled: false,
    isDivideWaysButtonEnabled: true,
    isCopyButtonEnabled: false,
    isEditModeButtonEnabled: true,
    isAppendModeButtonEnabled: true,
    isTagEditModeButtonEnabled: false,
    isPencilOnlyEnabled: false,
  },
  featureStylePolicy: {
    ...FEATURE_STYLE_POLICY,
    opacityLayer: 1,
  },
  lineSegmentPolicy: {
    isLineSegmentEnable: true,
    isLineSegmentClickable: true,
    isLineSegmentDirectionEnable: true,
  },
  markerPolicy: {
    isDraggable: false,
    isClickable: false,
  },
  featureVisiblePolicy: {
    isEndpointNodeVisible: true,
    isSegmentNodeVisible: false,
    isWayVisible: true,
    nodeHideZoomLevel: ZOOM_LEVEL_FOR_EDIT,
    isMarkerVisible: true,
  },
  layerEventInvokerPolicy: {
    enabled: true,
    dragBoxEnabled: false,
    pencilSupportedEnabled: false,
  },
} as const;

export const MAIN_LAYER_TAG_EDIT_PENCIL_POLICY: GeoLayerPolicy = {
  ...MAIN_LAYER_TAG_EDIT_POLICY,
  layerEventInvokerPolicy: {
    ...MAIN_LAYER_TAG_EDIT_POLICY.layerEventInvokerPolicy,
    pencilSupportedEnabled: true,
  },
  toolBoxPolicy: {
    ...MAIN_LAYER_TAG_EDIT_POLICY.toolBoxPolicy,
    isPencilOnlyEnabled: true,
  },
} as const;

export const MAIN_LAYER_TAG_EDIT_MOVEMENT_POLICY: GeoLayerPolicy = {
  featureActivationPolicy: {
    isEndpointNodeActivateEnabled: false,
    isEndpointNodeMultipleActivateEnabled: false,
    isSegmentNodeActivateEnabled: false,
    isSegmentNodeMultipleActivateEnabled: false,
    isNodeSingleActivateEnabled: false,
    isNodeAndLineSegmentSingleActivateByClickEnabled: true,
    isNodeActivateByDragBoxEnabled: false,
    isNodeAddedToWaySingleActivateEnabled: false,
    isNodeDeletedFromWayDeactivateEnabled: false,
    isWayActivateEnabled: true,
    isLineSegmentActivateEnabledByDragBox: true,
    isLineSegmentActivateEnabled: true,
    isWayLineSegmentsActivateEnabled: true,
    isWaySingleActivateEnabled: true,
  },
  layerDelegatorPolicy: {
    isEndpointNodeClickable: false,
    isSegmentalNodeClickable: false,
    isEndpointNodeDraggable: false,
    isSegmentalNodeDraggable: false,
    isNodeSnappingEnabled: false,
    isDivideWayWhenToolBoxDivideButtonClick: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    isCopyActivatedWhenToolBoxCopyButtonClick: false,
    isDeactivateAllWhenToolBoxClosed: true,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
  },
  nodeCandidatePolicy: {
    isCreatable: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
    pencilSupportedEnabled: false,
  },
  preNodePolicy: {
    isPreNodeEnable: false,
    isPreNodeDragEnable: false,
    isPreNodeClickEnable: false,
    isPreNodeRemoveOnClick: false,
    isPreNodeRemoveOnDragStart: false,
    preNodeEnabledZoomLevel: undefined,
  },
  toolBoxPolicy: {
    isToolBoxEnabled: false,
    isToolBoxShowingOnDragging: false,
    isCloseButtonEnabled: false,
    isDeleteButtonEnabled: false,
    isDivideWaysButtonEnabled: false,
    isCopyButtonEnabled: false,
    isEditModeButtonEnabled: false,
    isAppendModeButtonEnabled: false,
    isTagEditModeButtonEnabled: false,
    isPencilOnlyEnabled: false,
  },
  featureStylePolicy: {
    ...FEATURE_STYLE_POLICY,
    opacityLayer: 1,
  },
  lineSegmentPolicy: {
    isLineSegmentEnable: true,
    isLineSegmentClickable: false,
    isLineSegmentDirectionEnable: true,
  },
  markerPolicy: {
    isDraggable: false,
    isClickable: false,
  },
  featureVisiblePolicy: {
    isEndpointNodeVisible: true,
    isSegmentNodeVisible: false,
    isWayVisible: true,
    nodeHideZoomLevel: ZOOM_LEVEL_FOR_EDIT,
    isMarkerVisible: true,
  },
  layerEventInvokerPolicy: {
    enabled: true,
    dragBoxEnabled: false,
    pencilSupportedEnabled: false,
  },
} as const;

export const MAIN_LAYER_EDIT_POLICY: GeoLayerPolicy = {
  featureActivationPolicy: {
    isEndpointNodeActivateEnabled: true,
    isEndpointNodeMultipleActivateEnabled: true,
    isSegmentNodeActivateEnabled: true,
    isSegmentNodeMultipleActivateEnabled: true,
    isNodeSingleActivateEnabled: false,
    isNodeAndLineSegmentSingleActivateByClickEnabled: true,
    isNodeActivateByDragBoxEnabled: true,
    isNodeAddedToWaySingleActivateEnabled: false,
    isNodeDeletedFromWayDeactivateEnabled: false,
    isWayActivateEnabled: true,
    isLineSegmentActivateEnabledByDragBox: true,
    isLineSegmentActivateEnabled: true,
    isWayLineSegmentsActivateEnabled: false,
    isWaySingleActivateEnabled: false,
  },
  layerDelegatorPolicy: {
    isEndpointNodeClickable: true,
    isSegmentalNodeClickable: true,
    isEndpointNodeDraggable: true,
    isSegmentalNodeDraggable: true,
    isNodeSnappingEnabled: true,
    isDivideWayWhenToolBoxDivideButtonClick: true,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: true,
    isCopyActivatedWhenToolBoxCopyButtonClick: true,
    isDeactivateAllWhenToolBoxClosed: true,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
  },
  nodeCandidatePolicy: {
    isCreatable: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
    pencilSupportedEnabled: false,
  },
  preNodePolicy: {
    isPreNodeEnable: true,
    isPreNodeDragEnable: true,
    isPreNodeClickEnable: true,
    isPreNodeRemoveOnClick: true,
    isPreNodeRemoveOnDragStart: true,
    preNodeEnabledZoomLevel: ZOOM_LEVEL_FOR_EDIT,
  },
  toolBoxPolicy: {
    isToolBoxEnabled: true,
    isToolBoxShowingOnDragging: false,
    isCloseButtonEnabled: true,
    isDeleteButtonEnabled: true,
    isDivideWaysButtonEnabled: true,
    isCopyButtonEnabled: false,
    isEditModeButtonEnabled: false,
    isAppendModeButtonEnabled: true,
    isTagEditModeButtonEnabled: true,
    isPencilOnlyEnabled: false,
  },
  featureStylePolicy: {
    ...FEATURE_STYLE_POLICY,
    opacityLayer: 1,
  },
  lineSegmentPolicy: {
    isLineSegmentEnable: true,
    isLineSegmentClickable: true,
    isLineSegmentDirectionEnable: true,
  },
  markerPolicy: {
    isDraggable: false,
    isClickable: false,
  },
  featureVisiblePolicy: {
    isEndpointNodeVisible: true,
    isSegmentNodeVisible: true,
    isWayVisible: true,
    nodeHideZoomLevel: ZOOM_LEVEL_FOR_EDIT,
    isMarkerVisible: true,
  },
  layerEventInvokerPolicy: {
    enabled: true,
    dragBoxEnabled: true,
    pencilSupportedEnabled: false,
  },
} as const;

export const MAIN_LAYER_EDIT_PENCIL_POLICY: GeoLayerPolicy = {
  ...MAIN_LAYER_EDIT_POLICY,
  layerEventInvokerPolicy: {
    ...MAIN_LAYER_EDIT_POLICY.layerEventInvokerPolicy,
    pencilSupportedEnabled: true,
  },
  toolBoxPolicy: {
    ...MAIN_LAYER_EDIT_POLICY.toolBoxPolicy,
    isPencilOnlyEnabled: true,
  },
} as const;

export const MAIN_LAYER_EDIT_MOVEMENT_POLICY: GeoLayerPolicy = {
  featureActivationPolicy: {
    isEndpointNodeActivateEnabled: true,
    isEndpointNodeMultipleActivateEnabled: true,
    isSegmentNodeActivateEnabled: true,
    isSegmentNodeMultipleActivateEnabled: true,
    isNodeSingleActivateEnabled: false,
    isNodeAndLineSegmentSingleActivateByClickEnabled: true,
    isNodeActivateByDragBoxEnabled: true,
    isNodeAddedToWaySingleActivateEnabled: false,
    isNodeDeletedFromWayDeactivateEnabled: false,
    isWayActivateEnabled: true,
    isLineSegmentActivateEnabledByDragBox: true,
    isLineSegmentActivateEnabled: true,
    isWayLineSegmentsActivateEnabled: false,
    isWaySingleActivateEnabled: false,
  },
  layerDelegatorPolicy: {
    isEndpointNodeClickable: false,
    isSegmentalNodeClickable: false,
    isEndpointNodeDraggable: false,
    isSegmentalNodeDraggable: false,
    isNodeSnappingEnabled: false,
    isDivideWayWhenToolBoxDivideButtonClick: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    isCopyActivatedWhenToolBoxCopyButtonClick: false,
    isDeactivateAllWhenToolBoxClosed: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
  },
  nodeCandidatePolicy: {
    isCreatable: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
    pencilSupportedEnabled: false,
  },
  preNodePolicy: {
    isPreNodeEnable: true,
    isPreNodeDragEnable: false,
    isPreNodeClickEnable: false,
    isPreNodeRemoveOnClick: false,
    isPreNodeRemoveOnDragStart: false,
    preNodeEnabledZoomLevel: ZOOM_LEVEL_FOR_EDIT,
  },
  toolBoxPolicy: {
    isToolBoxEnabled: false,
    isToolBoxShowingOnDragging: false,
    isCloseButtonEnabled: true,
    isDeleteButtonEnabled: true,
    isDivideWaysButtonEnabled: true,
    isCopyButtonEnabled: false,
    isEditModeButtonEnabled: false,
    isAppendModeButtonEnabled: true,
    isTagEditModeButtonEnabled: true,
    isPencilOnlyEnabled: false,
  },
  featureStylePolicy: {
    ...FEATURE_STYLE_POLICY,
    opacityLayer: 1,
  },
  lineSegmentPolicy: {
    isLineSegmentEnable: true,
    isLineSegmentClickable: false,
    isLineSegmentDirectionEnable: true,
  },
  markerPolicy: {
    isDraggable: false,
    isClickable: false,
  },
  featureVisiblePolicy: {
    isEndpointNodeVisible: true,
    isSegmentNodeVisible: true,
    isWayVisible: true,
    nodeHideZoomLevel: ZOOM_LEVEL_FOR_EDIT,
    isMarkerVisible: true,
  },
  layerEventInvokerPolicy: {
    enabled: true,
    dragBoxEnabled: false,
    pencilSupportedEnabled: false,
  },
} as const;

export const MAIN_LAYER_APPEND_MOVEMENT_POLICY: GeoLayerPolicy = {
  featureActivationPolicy: {
    isEndpointNodeActivateEnabled: true,
    isEndpointNodeMultipleActivateEnabled: true,
    isSegmentNodeActivateEnabled: true,
    isSegmentNodeMultipleActivateEnabled: true,
    isNodeSingleActivateEnabled: false,
    isNodeAndLineSegmentSingleActivateByClickEnabled: false,
    isNodeActivateByDragBoxEnabled: true,
    isNodeAddedToWaySingleActivateEnabled: false,
    isNodeDeletedFromWayDeactivateEnabled: false,
    isWayActivateEnabled: true,
    isLineSegmentActivateEnabledByDragBox: true,
    isLineSegmentActivateEnabled: true,
    isWayLineSegmentsActivateEnabled: false,
    isWaySingleActivateEnabled: false,
  },
  layerDelegatorPolicy: {
    isEndpointNodeClickable: false,
    isSegmentalNodeClickable: false,
    isEndpointNodeDraggable: false,
    isSegmentalNodeDraggable: false,
    isNodeSnappingEnabled: false,
    isDivideWayWhenToolBoxDivideButtonClick: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    isCopyActivatedWhenToolBoxCopyButtonClick: false,
    isDeactivateAllWhenToolBoxClosed: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
  },
  nodeCandidatePolicy: {
    isCreatable: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
    pencilSupportedEnabled: false,
  },
  preNodePolicy: {
    isPreNodeEnable: false,
    isPreNodeDragEnable: false,
    isPreNodeClickEnable: false,
    isPreNodeRemoveOnClick: false,
    isPreNodeRemoveOnDragStart: false,
    preNodeEnabledZoomLevel: undefined,
  },
  toolBoxPolicy: {
    isToolBoxEnabled: false,
    isToolBoxShowingOnDragging: false,
    isCloseButtonEnabled: true,
    isDeleteButtonEnabled: true,
    isDivideWaysButtonEnabled: true,
    isCopyButtonEnabled: false,
    isEditModeButtonEnabled: false,
    isAppendModeButtonEnabled: true,
    isTagEditModeButtonEnabled: true,
    isPencilOnlyEnabled: false,
  },
  featureStylePolicy: {
    ...FEATURE_STYLE_POLICY,
    opacityLayer: 1,
  },
  lineSegmentPolicy: {
    isLineSegmentEnable: false,
    isLineSegmentClickable: false,
    isLineSegmentDirectionEnable: true,
  },
  markerPolicy: {
    isDraggable: false,
    isClickable: false,
  },
  featureVisiblePolicy: {
    isEndpointNodeVisible: true,
    isSegmentNodeVisible: true,
    isWayVisible: true,
    nodeHideZoomLevel: ZOOM_LEVEL_FOR_EDIT,
    isMarkerVisible: true,
  },
  layerEventInvokerPolicy: {
    enabled: true,
    dragBoxEnabled: false,
    pencilSupportedEnabled: false,
  },
} as const;

export const MAIN_LAYER_APPEND_POLICY: GeoLayerPolicy = {
  featureActivationPolicy: {
    isEndpointNodeActivateEnabled: true,
    isEndpointNodeMultipleActivateEnabled: false,
    isSegmentNodeActivateEnabled: true,
    isSegmentNodeMultipleActivateEnabled: false,
    isNodeSingleActivateEnabled: true,
    isNodeAndLineSegmentSingleActivateByClickEnabled: false,
    isNodeActivateByDragBoxEnabled: false,
    isNodeAddedToWaySingleActivateEnabled: true,
    isNodeDeletedFromWayDeactivateEnabled: true,
    isWayActivateEnabled: false,
    isLineSegmentActivateEnabledByDragBox: false,
    isLineSegmentActivateEnabled: false,
    isWayLineSegmentsActivateEnabled: false,
    isWaySingleActivateEnabled: false,
  },
  layerDelegatorPolicy: {
    isEndpointNodeClickable: false,
    isSegmentalNodeClickable: false,
    isEndpointNodeDraggable: false,
    isSegmentalNodeDraggable: false,
    isNodeSnappingEnabled: false,
    isDivideWayWhenToolBoxDivideButtonClick: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    isCopyActivatedWhenToolBoxCopyButtonClick: false,
    isDeactivateAllWhenToolBoxClosed: true,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
  },
  nodeCandidatePolicy: {
    isCreatable: true,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: true,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
    pencilSupportedEnabled: false,
  },
  preNodePolicy: {
    isPreNodeEnable: false,
    isPreNodeDragEnable: false,
    isPreNodeClickEnable: false,
    isPreNodeRemoveOnClick: false,
    isPreNodeRemoveOnDragStart: false,
    preNodeEnabledZoomLevel: undefined,
  },
  featureStylePolicy: {
    ...FEATURE_STYLE_POLICY,
    opacityLayer: 1,
  },
  toolBoxPolicy: {
    isToolBoxEnabled: true,
    isToolBoxShowingOnDragging: false,
    isCloseButtonEnabled: true,
    isDeleteButtonEnabled: true,
    isDivideWaysButtonEnabled: false,
    isAppendModeButtonEnabled: false,
    isTagEditModeButtonEnabled: true,
    isCopyButtonEnabled: false,
    isEditModeButtonEnabled: true,
    isPencilOnlyEnabled: false,
  },
  lineSegmentPolicy: {
    isLineSegmentEnable: false,
    isLineSegmentClickable: false,
    isLineSegmentDirectionEnable: true,
  },
  markerPolicy: {
    isDraggable: false,
    isClickable: false,
  },
  featureVisiblePolicy: {
    isEndpointNodeVisible: true,
    isSegmentNodeVisible: true,
    isWayVisible: true,
    nodeHideZoomLevel: ZOOM_LEVEL_FOR_EDIT,
    isMarkerVisible: true,
  },
  layerEventInvokerPolicy: {
    enabled: false,
    dragBoxEnabled: false,
    pencilSupportedEnabled: false,
  },
} as const;

export const MAIN_LAYER_APPEND_PENCIL_POLICY: GeoLayerPolicy = {
  ...MAIN_LAYER_APPEND_POLICY,
  nodeCandidatePolicy: {
    ...MAIN_LAYER_APPEND_POLICY.nodeCandidatePolicy,
    pencilSupportedEnabled: true,
  },
  layerEventInvokerPolicy: {
    ...MAIN_LAYER_APPEND_POLICY.layerEventInvokerPolicy,
    pencilSupportedEnabled: true,
  },
  toolBoxPolicy: {
    ...MAIN_LAYER_APPEND_POLICY.toolBoxPolicy,
    isPencilOnlyEnabled: true,
  },
} as const;

export const MAIN_LAYER_SELECTED_POLICY: GeoLayerPolicy = {
  featureActivationPolicy: {
    isEndpointNodeActivateEnabled: false,
    isEndpointNodeMultipleActivateEnabled: false,
    isSegmentNodeActivateEnabled: false,
    isSegmentNodeMultipleActivateEnabled: false,
    isNodeSingleActivateEnabled: false,
    isNodeAndLineSegmentSingleActivateByClickEnabled: false,
    isNodeAddedToWaySingleActivateEnabled: false,
    isNodeDeletedFromWayDeactivateEnabled: false,
    isNodeActivateByDragBoxEnabled: false,
    isWayActivateEnabled: false,
    isLineSegmentActivateEnabledByDragBox: false,
    isLineSegmentActivateEnabled: false,
    isWayLineSegmentsActivateEnabled: false,
    isWaySingleActivateEnabled: false,
  },
  layerDelegatorPolicy: {
    isEndpointNodeClickable: false,
    isSegmentalNodeClickable: false,
    isEndpointNodeDraggable: false,
    isSegmentalNodeDraggable: false,
    isNodeSnappingEnabled: false,
    isDivideWayWhenToolBoxDivideButtonClick: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    isCopyActivatedWhenToolBoxCopyButtonClick: false,
    isDeactivateAllWhenToolBoxClosed: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
  },
  nodeCandidatePolicy: {
    isCreatable: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
    pencilSupportedEnabled: false,
  },
  preNodePolicy: {
    isPreNodeEnable: false,
    isPreNodeDragEnable: false,
    isPreNodeClickEnable: false,
    isPreNodeRemoveOnClick: false,
    isPreNodeRemoveOnDragStart: false,
    preNodeEnabledZoomLevel: undefined,
  },
  toolBoxPolicy: {
    isToolBoxEnabled: false,
    isToolBoxShowingOnDragging: false,
    isCloseButtonEnabled: false,
    isDeleteButtonEnabled: false,
    isDivideWaysButtonEnabled: false,
    isCopyButtonEnabled: false,
    isEditModeButtonEnabled: false,
    isAppendModeButtonEnabled: false,
    isTagEditModeButtonEnabled: false,
    isPencilOnlyEnabled: false,
  },
  featureStylePolicy: {
    ...FEATURE_STYLE_POLICY,
    opacityLayer: 1,
  },
  lineSegmentPolicy: {
    isLineSegmentEnable: false,
    isLineSegmentClickable: false,
    isLineSegmentDirectionEnable: true,
  },
  markerPolicy: {
    isDraggable: false,
    isClickable: false,
  },
  featureVisiblePolicy: {
    isEndpointNodeVisible: true,
    isSegmentNodeVisible: true,
    isWayVisible: true,
    nodeHideZoomLevel: ZOOM_LEVEL_FOR_EDIT,
    isMarkerVisible: true,
  },
  layerEventInvokerPolicy: {
    enabled: true,
    dragBoxEnabled: true,
    pencilSupportedEnabled: false,
  },
} as const;

export const MAIN_LAYER_SELECTED_PENCIL_POLICY: GeoLayerPolicy = {
  ...MAIN_LAYER_SELECTED_POLICY,
  layerEventInvokerPolicy: {
    ...MAIN_LAYER_SELECTED_POLICY.layerEventInvokerPolicy,
    pencilSupportedEnabled: true,
  },
  toolBoxPolicy: {
    ...MAIN_LAYER_SELECTED_POLICY.toolBoxPolicy,
    isCopyButtonEnabled: true,
  },
} as const;

export const SUB_LAYER_POLICY: GeoLayerPolicy = {
  featureActivationPolicy: {
    isEndpointNodeActivateEnabled: false,
    isEndpointNodeMultipleActivateEnabled: false,
    isSegmentNodeActivateEnabled: false,
    isSegmentNodeMultipleActivateEnabled: false,
    isNodeSingleActivateEnabled: false,
    isNodeAndLineSegmentSingleActivateByClickEnabled: false,
    isNodeAddedToWaySingleActivateEnabled: false,
    isNodeDeletedFromWayDeactivateEnabled: false,
    isNodeActivateByDragBoxEnabled: false,
    isWayActivateEnabled: true,
    isLineSegmentActivateEnabledByDragBox: true,
    isLineSegmentActivateEnabled: true,
    isWayLineSegmentsActivateEnabled: false,
    isWaySingleActivateEnabled: false,
  },
  layerDelegatorPolicy: {
    isEndpointNodeClickable: true,
    isSegmentalNodeClickable: true,
    isEndpointNodeDraggable: false,
    isSegmentalNodeDraggable: false,
    isNodeSnappingEnabled: false,
    isDivideWayWhenToolBoxDivideButtonClick: true,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: true,
    isCopyActivatedWhenToolBoxCopyButtonClick: true,
    isDeactivateAllWhenToolBoxClosed: true,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
  },
  nodeCandidatePolicy: {
    isCreatable: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
    pencilSupportedEnabled: false,
  },
  preNodePolicy: {
    isPreNodeEnable: false,
    isPreNodeDragEnable: false,
    isPreNodeClickEnable: false,
    isPreNodeRemoveOnClick: false,
    isPreNodeRemoveOnDragStart: false,
    preNodeEnabledZoomLevel: undefined,
  },
  toolBoxPolicy: {
    isToolBoxEnabled: true,
    isToolBoxShowingOnDragging: false,
    isCloseButtonEnabled: false,
    isDeleteButtonEnabled: false,
    isDivideWaysButtonEnabled: false,
    isCopyButtonEnabled: true,
    isEditModeButtonEnabled: false,
    isAppendModeButtonEnabled: false,
    isTagEditModeButtonEnabled: false,
    isPencilOnlyEnabled: false,
  },
  featureStylePolicy: {
    ...FEATURE_STYLE_POLICY,
    opacityLayer: 1,
  },
  lineSegmentPolicy: {
    isLineSegmentEnable: true,
    isLineSegmentClickable: true,
    isLineSegmentDirectionEnable: false,
  },
  markerPolicy: {
    isDraggable: false,
    isClickable: false,
  },
  featureVisiblePolicy: {
    isEndpointNodeVisible: true,
    isSegmentNodeVisible: true,
    isWayVisible: true,
    nodeHideZoomLevel: ZOOM_LEVEL_FOR_EDIT,
    isMarkerVisible: true,
  },
  layerEventInvokerPolicy: {
    enabled: true,
    dragBoxEnabled: true,
    pencilSupportedEnabled: false,
  },
} as const;

export const SUB_LAYER_PENCIL_POLICY: GeoLayerPolicy = {
  ...SUB_LAYER_POLICY,
  layerEventInvokerPolicy: {
    ...SUB_LAYER_POLICY.layerEventInvokerPolicy,
    pencilSupportedEnabled: true,
  },
  toolBoxPolicy: {
    ...SUB_LAYER_POLICY.toolBoxPolicy,
    isPencilOnlyEnabled: true,
  },
} as const;

export const SUB_LAYER_MOVEMENT_POLICY: GeoLayerPolicy = {
  featureActivationPolicy: {
    isEndpointNodeActivateEnabled: false,
    isEndpointNodeMultipleActivateEnabled: false,
    isSegmentNodeActivateEnabled: false,
    isSegmentNodeMultipleActivateEnabled: false,
    isNodeSingleActivateEnabled: false,
    isNodeAndLineSegmentSingleActivateByClickEnabled: false,
    isNodeAddedToWaySingleActivateEnabled: false,
    isNodeDeletedFromWayDeactivateEnabled: false,
    isNodeActivateByDragBoxEnabled: false,
    isWayActivateEnabled: true,
    isLineSegmentActivateEnabledByDragBox: true,
    isLineSegmentActivateEnabled: true,
    isWayLineSegmentsActivateEnabled: false,
    isWaySingleActivateEnabled: false,
  },
  layerDelegatorPolicy: {
    isEndpointNodeClickable: false,
    isSegmentalNodeClickable: false,
    isEndpointNodeDraggable: false,
    isSegmentalNodeDraggable: false,
    isNodeSnappingEnabled: false,
    isDivideWayWhenToolBoxDivideButtonClick: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    isCopyActivatedWhenToolBoxCopyButtonClick: false,
    isDeactivateAllWhenToolBoxClosed: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
  },
  nodeCandidatePolicy: {
    isCreatable: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
    pencilSupportedEnabled: false,
  },
  preNodePolicy: {
    isPreNodeEnable: false,
    isPreNodeDragEnable: false,
    isPreNodeClickEnable: false,
    isPreNodeRemoveOnClick: false,
    isPreNodeRemoveOnDragStart: false,
    preNodeEnabledZoomLevel: undefined,
  },
  toolBoxPolicy: {
    isToolBoxEnabled: false,
    isToolBoxShowingOnDragging: false,
    isCloseButtonEnabled: false,
    isDeleteButtonEnabled: false,
    isDivideWaysButtonEnabled: false,
    isCopyButtonEnabled: true,
    isEditModeButtonEnabled: false,
    isAppendModeButtonEnabled: false,
    isTagEditModeButtonEnabled: false,
    isPencilOnlyEnabled: false,
  },
  featureStylePolicy: {
    ...FEATURE_STYLE_POLICY,
    opacityLayer: 1,
  },
  lineSegmentPolicy: {
    isLineSegmentEnable: true,
    isLineSegmentClickable: false,
    isLineSegmentDirectionEnable: false,
  },
  markerPolicy: {
    isDraggable: false,
    isClickable: false,
  },
  featureVisiblePolicy: {
    isEndpointNodeVisible: true,
    isSegmentNodeVisible: true,
    isWayVisible: true,
    nodeHideZoomLevel: ZOOM_LEVEL_FOR_EDIT,
    isMarkerVisible: true,
  },
  layerEventInvokerPolicy: {
    enabled: true,
    dragBoxEnabled: false,
    pencilSupportedEnabled: false,
  },
} as const;

export const LAYER_INVISIBLE_POLICY: GeoLayerPolicy = {
  featureActivationPolicy: {
    isEndpointNodeActivateEnabled: false,
    isEndpointNodeMultipleActivateEnabled: false,
    isSegmentNodeActivateEnabled: false,
    isSegmentNodeMultipleActivateEnabled: false,
    isNodeSingleActivateEnabled: false,
    isNodeAndLineSegmentSingleActivateByClickEnabled: false,
    isNodeActivateByDragBoxEnabled: false,
    isNodeAddedToWaySingleActivateEnabled: false,
    isNodeDeletedFromWayDeactivateEnabled: false,
    isWayActivateEnabled: false,
    isLineSegmentActivateEnabledByDragBox: false,
    isLineSegmentActivateEnabled: false,
    isWayLineSegmentsActivateEnabled: false,
    isWaySingleActivateEnabled: false,
  },
  layerDelegatorPolicy: {
    isEndpointNodeClickable: false,
    isSegmentalNodeClickable: false,
    isEndpointNodeDraggable: false,
    isSegmentalNodeDraggable: false,
    isNodeSnappingEnabled: false,
    isDivideWayWhenToolBoxDivideButtonClick: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    isCopyActivatedWhenToolBoxCopyButtonClick: false,
    isDeactivateAllWhenToolBoxClosed: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
  },
  nodeCandidatePolicy: {
    isCreatable: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
    pencilSupportedEnabled: false,
  },
  preNodePolicy: {
    isPreNodeEnable: false,
    isPreNodeDragEnable: false,
    isPreNodeClickEnable: false,
    isPreNodeRemoveOnClick: false,
    isPreNodeRemoveOnDragStart: false,
    preNodeEnabledZoomLevel: undefined,
  },
  toolBoxPolicy: {
    isToolBoxEnabled: false,
    isToolBoxShowingOnDragging: false,
    isCloseButtonEnabled: false,
    isDeleteButtonEnabled: false,
    isDivideWaysButtonEnabled: false,
    isCopyButtonEnabled: false,
    isEditModeButtonEnabled: false,
    isAppendModeButtonEnabled: false,
    isTagEditModeButtonEnabled: false,
    isPencilOnlyEnabled: false,
  },
  featureStylePolicy: {
    ...FEATURE_STYLE_POLICY,
    opacityLayer: 0,
  },
  lineSegmentPolicy: {
    isLineSegmentEnable: true,
    isLineSegmentClickable: false,
    isLineSegmentDirectionEnable: false,
  },
  markerPolicy: {
    isDraggable: false,
    isClickable: false,
  },
  featureVisiblePolicy: {
    isEndpointNodeVisible: true,
    isSegmentNodeVisible: true,
    isWayVisible: true,
    nodeHideZoomLevel: ZOOM_LEVEL_FOR_EDIT,
    isMarkerVisible: true,
  },
  layerEventInvokerPolicy: {
    enabled: true,
    dragBoxEnabled: true,
    pencilSupportedEnabled: false,
  },
} as const;

export const LAYER_INVISIBLE_PENCIL_POLICY = {
  ...LAYER_INVISIBLE_POLICY,
  layerEventInvokerPolicy: {
    ...LAYER_INVISIBLE_POLICY.layerEventInvokerPolicy,
    pencilSupportedEnabled: true,
  },
  toolBoxPolicy: {
    ...LAYER_INVISIBLE_POLICY.toolBoxPolicy,
    isPencilOnlyEnabled: true,
  },
} as const;

export const MAIN_LAYER_OPAQUE_POLICY: GeoLayerPolicy = {
  featureActivationPolicy: {
    isEndpointNodeActivateEnabled: false,
    isEndpointNodeMultipleActivateEnabled: false,
    isSegmentNodeActivateEnabled: false,
    isSegmentNodeMultipleActivateEnabled: false,
    isNodeSingleActivateEnabled: false,
    isNodeAndLineSegmentSingleActivateByClickEnabled: false,
    isNodeActivateByDragBoxEnabled: false,
    isNodeAddedToWaySingleActivateEnabled: false,
    isNodeDeletedFromWayDeactivateEnabled: false,
    isWayActivateEnabled: false,
    isLineSegmentActivateEnabledByDragBox: false,
    isLineSegmentActivateEnabled: false,
    isWayLineSegmentsActivateEnabled: false,
    isWaySingleActivateEnabled: false,
  },
  layerDelegatorPolicy: {
    isEndpointNodeClickable: false,
    isSegmentalNodeClickable: false,
    isEndpointNodeDraggable: false,
    isSegmentalNodeDraggable: false,
    isNodeSnappingEnabled: false,
    isDivideWayWhenToolBoxDivideButtonClick: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    isCopyActivatedWhenToolBoxCopyButtonClick: false,
    isDeactivateAllWhenToolBoxClosed: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
  },
  nodeCandidatePolicy: {
    isCreatable: false,
    isDeleteActivatedWhenToolBoxDeleteButtonClick: false,
    nodeSnappingPx: GeoNode.RADIUS_PX * 2,
    pencilSupportedEnabled: false,
  },
  preNodePolicy: {
    isPreNodeEnable: false,
    isPreNodeDragEnable: false,
    isPreNodeClickEnable: false,
    isPreNodeRemoveOnClick: false,
    isPreNodeRemoveOnDragStart: false,
    preNodeEnabledZoomLevel: undefined,
  },
  toolBoxPolicy: {
    isToolBoxEnabled: false,
    isToolBoxShowingOnDragging: false,
    isCloseButtonEnabled: false,
    isDeleteButtonEnabled: false,
    isDivideWaysButtonEnabled: false,
    isCopyButtonEnabled: false,
    isEditModeButtonEnabled: false,
    isAppendModeButtonEnabled: false,
    isTagEditModeButtonEnabled: false,
    isPencilOnlyEnabled: false,
  },
  featureStylePolicy: {
    ...FEATURE_STYLE_POLICY,
    zIndexNode: FEATURE_STYLE_POLICY.zIndexNode - 10,
    zIndexWay: FEATURE_STYLE_POLICY.zIndexWay - 10,
    opacityLayer: 0.3,
  },
  lineSegmentPolicy: {
    isLineSegmentEnable: false,
    isLineSegmentClickable: false,
    isLineSegmentDirectionEnable: true,
  },
  markerPolicy: {
    isDraggable: false,
    isClickable: false,
  },
  featureVisiblePolicy: {
    isEndpointNodeVisible: true,
    isSegmentNodeVisible: true,
    isWayVisible: true,
    nodeHideZoomLevel: ZOOM_LEVEL_FOR_EDIT,
    isMarkerVisible: true,
  },
  layerEventInvokerPolicy: {
    enabled: false,
    dragBoxEnabled: false,
    pencilSupportedEnabled: false,
  },
} as const;

export const SUB_LAYER_OPAQUE_POLICY: GeoLayerPolicy = {
  ...DataUtils.deepCopy(MAIN_LAYER_OPAQUE_POLICY),
  lineSegmentPolicy: {
    ...DataUtils.deepCopy(MAIN_LAYER_OPAQUE_POLICY.lineSegmentPolicy),
    isLineSegmentDirectionEnable: false,
  },
};

export const LAYER_OPAQUE_PENCIL_POLICY: GeoLayerPolicy = {
  ...MAIN_LAYER_OPAQUE_POLICY,
  layerEventInvokerPolicy: {
    ...MAIN_LAYER_OPAQUE_POLICY.layerEventInvokerPolicy,
    pencilSupportedEnabled: false,
  },
  toolBoxPolicy: {
    ...MAIN_LAYER_OPAQUE_POLICY.toolBoxPolicy,
    isPencilOnlyEnabled: true,
  },
} as const;
