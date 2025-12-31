import {
  FEATURE_STYLE_POLICY,
  GeoFeatureStylePolicy,
  GeoLineSegmentDirectionIconColors,
  GeoLineSegmentIconColorTypeEnum,
  GeoLineStyle,
  SvgColorTypeEnum,
} from '@design-system/constants/geo-map';
import GeoFeatureActivationManager from '@design-system/geo-map/activation/GeoFeatureActivationManager';
import GeoMapEventManager, {
  GeoMapEventRemover,
} from '@design-system/geo-map/event/GeoMapEventManager';
import GeoFeatureManager, {
  GeoNodeTypeEnum,
} from '@design-system/geo-map/feature/GeoFeatureManager';
import GeoNode, {
  GeoNodeOptionType,
} from '@design-system/geo-map/feature/GeoNode';
import GeoWay from '@design-system/geo-map/feature/GeoWay';
import GeoLineSegment from '@design-system/geo-map/line-segment/GeoLineSegment';
import GeoLineSegmentDirection from '@design-system/geo-map/line-segment/GeoLineSegmentDirection';
import GeoLineSegmentManager from '@design-system/geo-map/line-segment/GeoLineSegmentManager';
import GeoNodeCandidate from '@design-system/geo-map/node-candidate/GeoNodeCandidate';
import GeoNodeCandidateManager from '@design-system/geo-map/node-candidate/GeoNodeCandidateManager';
import GeoFeatureVisibleManager from '@design-system/geo-map/optimizer/GeoFeatureVisibleManager';
import GeoPreNodeManager from '@design-system/geo-map/pre-node/GeoPreNodeManager';
import { GeoMapTypeEnum } from '@design-system/types/geoMap.type';
import DataUtils from '@design-system/utils/dataUtils';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';

const KEY = 'GeoFeatureStyleManager';

// Todo::rdh markerCursor
export interface GeoNodeInnerContentStyle extends Pick<
  GeoNodeOptionType,
  'zIndex'
> {
  bgColor?: string;
  borderColor?: string;
  strokeWidth?: number;
  d?: string;
  opacity: number;
}

class GeoFeatureStyleManager {
  private readonly _featureManager: GeoFeatureManager;
  private readonly _featureVisibleManager: GeoFeatureVisibleManager;
  private readonly _nodeCandidateManager: GeoNodeCandidateManager;
  private readonly _preNodeManager: GeoPreNodeManager;
  private readonly _lineSegmentManager: GeoLineSegmentManager;
  private readonly _featureActivationManager: GeoFeatureActivationManager;
  private readonly _mapEventManager: GeoMapEventManager;
  private readonly _mapEventRemover: GeoMapEventRemover;
  private _mapType: GeoMapTypeEnum;
  private _policy: GeoFeatureStylePolicy = { ...FEATURE_STYLE_POLICY };

  constructor(
    featureManager: GeoFeatureManager,
    featureVisibleManager: GeoFeatureVisibleManager,
    nodeCandidateManager: GeoNodeCandidateManager,
    preNodeManager: GeoPreNodeManager,
    lineSegmentManager: GeoLineSegmentManager,
    featureActivationManager: GeoFeatureActivationManager,
    mapEventManager: GeoMapEventManager,
    policy: GeoFeatureStylePolicy = { ...FEATURE_STYLE_POLICY },
  ) {
    this._featureManager = featureManager;
    this._featureVisibleManager = featureVisibleManager;
    this._nodeCandidateManager = nodeCandidateManager;
    this._preNodeManager = preNodeManager;
    this._lineSegmentManager = lineSegmentManager;
    this._featureActivationManager = featureActivationManager;
    this._mapEventManager = mapEventManager;
    this._mapEventRemover = new GeoMapEventRemover(mapEventManager);
    this._mapType = GeoMapUtils.getMapType(
      this._mapEventManager.getMapTypeId(),
    );
    this.setPolicy(policy);

    // Event, Node
    this._featureVisibleManager.addNodeVisibleChangedListener(
      KEY,
      (node, visible, nodeTypes) => {
        if (!visible) {
          return;
        }
        this._updateNodeStyle(
          node,
          nodeTypes,
          this._featureActivationManager.isNodeActivated(node),
        );
      },
    );
    this._featureManager.addNodeAddedToWayListener(KEY, (way) => {
      this._updateLineSegmentDirectionsStyleOfWay(way);
    });
    this._featureManager.addNodeTypesChangedListener(KEY, (node, nodeTypes) => {
      if (!node.isVisible()) {
        return;
      }
      const isNodeActivated =
        this._featureActivationManager.isNodeActivated(node);
      this._updateNodeStyle(node, nodeTypes, isNodeActivated);
    });
    this._featureActivationManager.addNodeActivatedEventListener(
      KEY,
      (node, isActivated: boolean) => {
        if (!node.isVisible()) {
          return;
        }
        this._updateNodeStyle(
          node,
          this._featureManager.getNodeTypes(node),
          isActivated,
        );
      },
    );
    this._featureManager.addNodesEnabledChangedDebounceListener(
      KEY,
      (nodeMap) => {
        nodeMap.forEach((enabled, node) => {
          if (!node.isVisible()) {
            return;
          }
          this._updateNodeStyle(
            node,
            this._featureManager.getNodeTypes(node),
            this._featureActivationManager.isNodeActivated(node),
          );
        });
      },
    );
    // Event, NodeCandidate
    this._nodeCandidateManager.addNodeCandidateAddedEventListener(
      KEY,
      (nodeCandidate) => {
        this._updateNodeCandidateStyle(nodeCandidate);
      },
    );
    // Event, PreNode
    this._preNodeManager.addPreNodeAddedEventListener(KEY, (preNode) => {
      this._updatePreNodeStyle(preNode);
    });
    // Event, Way
    this._featureManager.addWayAddedListener(KEY, (way) => {
      if (!way.isVisible()) {
        return;
      }
      this._updateWayStyle(
        way,
        this._featureActivationManager.isWayActivated(way),
        this._mapType,
      );
    });
    this._featureActivationManager.addWayActivatedEventListener(
      KEY,
      (way, isActivated: boolean) => {
        if (!way.isVisible()) {
          return;
        }
        this._updateWayStyle(way, isActivated, this._mapType);
        this._updateLineSegmentDirectionsStyleOfWay(way);
      },
    );
    this._featureVisibleManager.addWayVisibleChangedListener(
      KEY,
      (way, visible) => {
        if (!visible) {
          return;
        }
        this._updateWayStyle(
          way,
          this._featureActivationManager.isWayActivated(way),
          this._mapType,
        );
        this._updateLineSegmentDirectionsStyleOfWay(way);
      },
    );
    this._featureManager.addWaysEnabledChangedDebounceListener(
      KEY,
      (wayMap) => {
        wayMap.forEach((enabled, way) => {
          if (!way.isVisible()) {
            return;
          }
          this._updateWayStyle(
            way,
            this._featureActivationManager.isWayActivated(way),
            this._mapType,
          );
          this._updateLineSegmentDirectionsStyleOfWay(way);
        });
      },
    );
    // Event, LineSegment
    this._featureActivationManager.addLineSegmentActivatedEventListener(
      KEY,
      (lineSegment, isActivated) => {
        this._updateLineSegmentStyle(lineSegment, isActivated, this._mapType);
        const lineSegmentDirection =
          this._lineSegmentManager.getLineSegmentDirectionByLineSegment(
            lineSegment,
          );
        lineSegmentDirection &&
          this._updateLineSegmentDirectionStyle(lineSegmentDirection);
      },
    );
    this._lineSegmentManager.addLineSegmentDirectionAddEventListener(
      KEY,
      (lineSegmentDirection) => {
        this._updateLineSegmentDirectionStyle(lineSegmentDirection);
      },
    );
    this._lineSegmentManager.addLineSegmentDirectionVisibleChangeEventListener(
      KEY,
      (lineSegmentDirection) => {
        this._updateLineSegmentDirectionStyle(lineSegmentDirection);
      },
    );
    // Event, Map
    this._mapEventRemover.addEventId(
      this._mapEventManager.addMapTypeChangeStickyEventListener(
        (mapType: GeoMapTypeEnum) => {
          this._mapType = mapType;
          this._featureVisibleManager.getWaysVisible().forEach((way) => {
            this._updateWayStyle(
              way,
              this._featureActivationManager.isWayActivated(way),
              this._mapType,
            );
          });
          this._featureManager.getAllWays().forEach((way) => {
            this._updateLineSegmentDirectionsStyleOfWay(way);
          });
          this._featureActivationManager
            .getLineSegmentsActivated()
            .forEach((lineSegment) => {
              this._updateLineSegmentStyle(lineSegment, true, this._mapType);
            });
        },
      ),
    );
  }

  /**
   * =========================================================================================================
   * Policy
   * =========================================================================================================
   */
  getLineSegmentZIndexAboveWay = () => {
    return 20;
  };
  getLineSegmentDirectionZIndexAboveWay = () => {
    return 10;
  };
  getOpacityLayerPolicy = () => {
    return this._policy.opacityLayer;
  };
  setOpacityLayerPolicy = (opacity: number) => {
    if (this.getOpacityLayerPolicy() === opacity) {
      return;
    }
    this._policy.opacityLayer = opacity;
    this._featureManager
      .getAllWays()
      .forEach((way) => way.setStrokeOpacity(opacity));
    this._featureManager
      .getAllNodes()
      .forEach((node) => node.setOpacity(opacity));
    // 선, 예비점은 불투명한 경우가 없습니다.
  };
  getStylePresetPolicy = (): GeoFeatureStylePolicy => {
    return DataUtils.deepCopy(this._policy);
  };
  setStylePresetPolicy = (
    styles: NonNullable<Omit<GeoFeatureStylePolicy, 'opacityLayer'>>,
  ) => {
    const isChangeWayStyle = () => {
      return (
        this._policy.iconsWay !== styles.iconsWay ||
        this._policy.strokeWeightWay !== styles.strokeWeightWay ||
        this._policy.zIndexWay !== styles.zIndexWay ||
        this._policy.strokeColorWayForRoadMap !==
          styles.strokeColorWayForRoadMap ||
        this._policy.strokeColorWayForSatellite !==
          styles.strokeColorWayForSatellite ||
        this._policy.strokeColorCenterLineOfWayActivated !==
          styles.strokeColorCenterLineOfWayActivated ||
        this._policy.strokeWeightCenterLineOfWayActivated !==
          styles.strokeWeightCenterLineOfWayActivated ||
        this._policy.opacityWayDisabled !== styles.opacityWayDisabled
      );
    };

    if (isChangeWayStyle()) {
      this._policy.iconsWay = styles.iconsWay;
      this._policy.strokeWeightWay = styles.strokeWeightWay;
      this._policy.zIndexWay = styles.zIndexWay;
      this._policy.strokeColorWayForRoadMap = styles.strokeColorWayForRoadMap;
      this._policy.strokeColorWayForSatellite =
        styles.strokeColorWayForSatellite;
      this._policy.strokeColorCenterLineOfWayActivated =
        styles.strokeColorCenterLineOfWayActivated;
      this._policy.strokeWeightCenterLineOfWayActivated =
        styles.strokeWeightCenterLineOfWayActivated;
      this._policy.opacityWayDisabled = styles.opacityWayDisabled;
      this._featureVisibleManager
        .getWaysVisible()
        .forEach((way) =>
          this._updateWayStyle(
            way,
            this._featureActivationManager.isWayActivated(way),
            this._mapType,
          ),
        );
    }

    const isChangeLineSegmentStyle = () => {
      const { directionIcons, directionIconsColors } =
        styles.lineSegmentDirection;
      return (
        this._policy.strokeColorLineSegmentActivatedForRoadMap !==
          styles.strokeColorLineSegmentActivatedForRoadMap ||
        this._policy.strokeColorLineSegmentActivatedForSatellite !==
          styles.strokeColorLineSegmentActivatedForSatellite ||
        this._policy.strokeWeightLineSegmentActivated !==
          styles.strokeWeightLineSegmentActivated ||
        !DataUtils.isEquals(
          this._policy.lineSegmentDirection.directionIcons,
          directionIcons,
        ) ||
        !DataUtils.isEquals(
          this._policy.lineSegmentDirection.directionIconsColors,
          directionIconsColors,
        )
      );
    };

    if (isChangeLineSegmentStyle()) {
      this._policy.strokeColorLineSegmentActivatedForRoadMap =
        styles.strokeColorLineSegmentActivatedForRoadMap;
      this._policy.strokeColorLineSegmentActivatedForSatellite =
        styles.strokeColorLineSegmentActivatedForSatellite;
      this._policy.strokeWeightLineSegmentActivated =
        styles.strokeWeightLineSegmentActivated;
      this._policy.lineSegmentDirection.directionIcons = DataUtils.deepCopy(
        styles.lineSegmentDirection.directionIcons,
      );
      this._policy.lineSegmentDirection.directionIconsColors =
        DataUtils.deepCopy(styles.lineSegmentDirection.directionIconsColors);

      this._featureActivationManager
        .getLineSegmentsActivated()
        .forEach((lineSegment) =>
          this._updateLineSegmentStyle(lineSegment, true, this._mapType),
        );
    }

    const isChangeNodeStyle = () => {
      return (
        this._policy.bgColorSingleNodeActivated !==
          styles.bgColorSingleNodeActivated ||
        this._policy.bgColorSingleNodeDeactivated !==
          styles.bgColorSingleNodeDeactivated ||
        this._policy.borderColorSingleNodeActivated !==
          styles.borderColorSingleNodeActivated ||
        this._policy.borderColorSingleNodeDeactivated !==
          styles.borderColorSingleNodeDeactivated ||
        this._policy.bgColorMultiNodeActivated !==
          styles.bgColorMultiNodeActivated ||
        this._policy.bgColorMultiNodeDeactivated !==
          styles.bgColorMultiNodeDeactivated ||
        this._policy.borderColorMultiNodeActivated !==
          styles.borderColorMultiNodeActivated ||
        this._policy.borderColorMultiNodeDeactivated !==
          styles.borderColorMultiNodeDeactivated ||
        this._policy.shapeEndPointNode !== styles.shapeEndPointNode ||
        this._policy.shapeSegmentNode !== styles.shapeSegmentNode ||
        this._policy.shapePreNode !== styles.shapePreNode ||
        this._policy.strokeWidthEndPointNode !==
          styles.strokeWidthEndPointNode ||
        this._policy.strokeWidthSegmentNode !== styles.strokeWidthSegmentNode ||
        this._policy.zIndexNode !== styles.zIndexNode
      );
    };

    if (isChangeNodeStyle()) {
      this._policy.bgColorSingleNodeActivated =
        styles.bgColorSingleNodeActivated;
      this._policy.bgColorSingleNodeDeactivated =
        styles.bgColorSingleNodeDeactivated;
      this._policy.borderColorSingleNodeActivated =
        styles.borderColorSingleNodeActivated;
      this._policy.borderColorSingleNodeDeactivated =
        styles.borderColorSingleNodeDeactivated;
      this._policy.bgColorMultiNodeActivated = styles.bgColorMultiNodeActivated;
      this._policy.bgColorMultiNodeDeactivated =
        styles.bgColorMultiNodeDeactivated;
      this._policy.borderColorMultiNodeActivated =
        styles.borderColorMultiNodeActivated;
      this._policy.borderColorMultiNodeDeactivated =
        styles.borderColorMultiNodeDeactivated;
      this._policy.shapeEndPointNode = styles.shapeEndPointNode;
      this._policy.shapeSegmentNode = styles.shapeSegmentNode;
      this._policy.shapePreNode = styles.shapePreNode;
      this._policy.strokeWidthEndPointNode = styles.strokeWidthEndPointNode;
      this._policy.strokeWidthSegmentNode = styles.strokeWidthSegmentNode;
      this._policy.zIndexNode = styles.zIndexNode;

      this._featureVisibleManager
        .getNodesVisible()
        .forEach((node) =>
          this._updateNodeStyle(
            node,
            this._featureManager.getNodeTypes(node),
            this._featureActivationManager.isNodeActivated(node),
          ),
        );
      this._nodeCandidateManager
        .getAllNodeCandidates()
        .forEach((nodeCandidate) => {
          nodeCandidate.setNodeInnerContentStyle(
            this._getNodeStyle({
              nodeTypes: new Set<GeoNodeTypeEnum>([GeoNodeTypeEnum.START]),
              isActivated: false,
            }),
          );
        });
    }

    const isChangeLineOfNodeCandidateStyle = () => {
      return (
        this._policy.strokeColorLineOfNodeCandidate !==
          styles.strokeColorLineOfNodeCandidate ||
        this._policy.strokeWeightLineOfNodeCandidate !==
          styles.strokeWeightLineOfNodeCandidate ||
        this._policy.strokeColorCenterLineOfNodeCandidate !==
          styles.strokeColorCenterLineOfNodeCandidate ||
        this._policy.strokeWeightCenterLineOfNodeCandidate !==
          styles.strokeWeightCenterLineOfNodeCandidate
      );
    };

    if (isChangeLineOfNodeCandidateStyle()) {
      this._policy.strokeColorLineOfNodeCandidate =
        styles.strokeColorLineOfNodeCandidate;
      this._policy.strokeWeightLineOfNodeCandidate =
        styles.strokeWeightLineOfNodeCandidate;
      this._policy.strokeColorCenterLineOfNodeCandidate =
        styles.strokeColorCenterLineOfNodeCandidate;
      this._policy.strokeWeightCenterLineOfNodeCandidate =
        styles.strokeWeightCenterLineOfNodeCandidate;
    }
  };
  getPolicy = () => {
    return { ...this._policy };
  };
  setPolicy = (policy: GeoFeatureStylePolicy) => {
    this.setStylePresetPolicy({
      // way
      iconsWay: policy.iconsWay,
      strokeWeightWay: policy.strokeWeightWay,
      zIndexWay: policy.zIndexWay,
      strokeColorWayForRoadMap: policy.strokeColorWayForRoadMap,
      strokeColorWayForSatellite: policy.strokeColorWayForSatellite,
      opacityWayDisabled: policy.opacityWayDisabled,
      // centerWay
      strokeColorCenterLineOfWayActivated:
        policy.strokeColorCenterLineOfWayActivated,
      strokeWeightCenterLineOfWayActivated:
        policy.strokeWeightCenterLineOfWayActivated,
      // lineSegment
      lineSegmentDirection: {
        directionIcons: policy.lineSegmentDirection.directionIcons,
        directionIconsColors: policy.lineSegmentDirection.directionIconsColors,
      },
      strokeColorLineSegmentActivatedForRoadMap:
        policy.strokeColorLineSegmentActivatedForRoadMap,
      strokeColorLineSegmentActivatedForSatellite:
        policy.strokeColorLineSegmentActivatedForSatellite,
      strokeWeightLineSegmentActivated: policy.strokeWeightLineSegmentActivated,
      // node
      bgColorSingleNodeActivated: policy.bgColorSingleNodeActivated,
      bgColorSingleNodeDeactivated: policy.bgColorSingleNodeDeactivated,
      borderColorSingleNodeActivated: policy.borderColorSingleNodeActivated,
      borderColorSingleNodeDeactivated: policy.borderColorSingleNodeDeactivated,
      bgColorMultiNodeActivated: policy.bgColorMultiNodeActivated,
      bgColorMultiNodeDeactivated: policy.bgColorMultiNodeDeactivated,
      borderColorMultiNodeActivated: policy.borderColorMultiNodeActivated,
      borderColorMultiNodeDeactivated: policy.borderColorMultiNodeDeactivated,
      zIndexNode: policy.zIndexNode,
      opacityNodeDisabled: policy.opacityNodeDisabled,
      // endPointNode
      shapeEndPointNode: policy.shapeEndPointNode,
      strokeWidthEndPointNode: policy.strokeWidthEndPointNode,
      // segmentNode
      shapeSegmentNode: policy.shapeSegmentNode,
      strokeWidthSegmentNode: policy.strokeWidthSegmentNode,
      // preNode
      shapePreNode: policy.shapePreNode,
      bgColorPreNode: policy.bgColorPreNode,
      // LineOfNodeCandidate
      strokeColorLineOfNodeCandidate: policy.strokeColorLineOfNodeCandidate,
      strokeWeightLineOfNodeCandidate: policy.strokeWeightLineOfNodeCandidate,
      strokeColorCenterLineOfNodeCandidate:
        policy.strokeColorCenterLineOfNodeCandidate,
      strokeWeightCenterLineOfNodeCandidate:
        policy.strokeWeightCenterLineOfNodeCandidate,
    });
    this.setOpacityLayerPolicy(policy.opacityLayer);
  };

  /**
   * =========================================================================================================
   * 노드 스타일 기능
   * =========================================================================================================
   */
  private _getNodeStyle = (props?: {
    nodeTypes?: Set<GeoNodeTypeEnum>;
    isActivated?: boolean;
    isEnabled?: boolean;
  }): GeoNodeInnerContentStyle => {
    const { nodeTypes, isActivated = false, isEnabled = true } = props || {};
    const styleSet = this.getStylePresetPolicy();
    const nodeInnerContentStyle: GeoNodeInnerContentStyle = {
      opacity: isEnabled
        ? this.getOpacityLayerPolicy()
        : styleSet.opacityNodeDisabled,
    };
    if (
      nodeTypes?.has(GeoNodeTypeEnum.START) ||
      nodeTypes?.has(GeoNodeTypeEnum.END)
    ) {
      const isNodeConnectedMultipleWays =
        nodeTypes.has(GeoNodeTypeEnum.START_MULTIPLE) ||
        nodeTypes.has(GeoNodeTypeEnum.END_MULTIPLE) ||
        nodeTypes.has(GeoNodeTypeEnum.SEGMENTAL) ||
        (nodeTypes.has(GeoNodeTypeEnum.START) &&
          nodeTypes.has(GeoNodeTypeEnum.END));
      nodeInnerContentStyle.d = styleSet.shapeEndPointNode;
      nodeInnerContentStyle.strokeWidth = styleSet.strokeWidthEndPointNode;
      if (isNodeConnectedMultipleWays) {
        nodeInnerContentStyle.bgColor = isActivated
          ? styleSet.bgColorMultiNodeActivated
          : styleSet.bgColorMultiNodeDeactivated;
        nodeInnerContentStyle.borderColor = isActivated
          ? styleSet.borderColorMultiNodeActivated
          : styleSet.borderColorMultiNodeDeactivated;
      } else {
        nodeInnerContentStyle.bgColor = isActivated
          ? styleSet.bgColorSingleNodeActivated
          : styleSet.bgColorSingleNodeDeactivated;
        nodeInnerContentStyle.borderColor = isActivated
          ? styleSet.borderColorSingleNodeActivated
          : styleSet.borderColorSingleNodeDeactivated;
      }
    } else if (nodeTypes?.has(GeoNodeTypeEnum.SEGMENTAL)) {
      nodeInnerContentStyle.d = styleSet.shapeSegmentNode;
      nodeInnerContentStyle.strokeWidth = styleSet.strokeWidthSegmentNode;
      nodeInnerContentStyle.bgColor = isActivated
        ? styleSet.bgColorMultiNodeActivated
        : styleSet.bgColorMultiNodeDeactivated;
      nodeInnerContentStyle.borderColor = isActivated
        ? styleSet.borderColorMultiNodeActivated
        : styleSet.borderColorMultiNodeDeactivated;
    } else {
      nodeInnerContentStyle.d = styleSet.shapeEndPointNode;
      nodeInnerContentStyle.strokeWidth = styleSet.strokeWidthEndPointNode;
      nodeInnerContentStyle.bgColor = isActivated
        ? styleSet.bgColorSingleNodeActivated
        : styleSet.bgColorSingleNodeDeactivated;
      nodeInnerContentStyle.borderColor = isActivated
        ? styleSet.borderColorSingleNodeActivated
        : styleSet.borderColorSingleNodeDeactivated;
    }
    nodeInnerContentStyle.zIndex = styleSet.zIndexNode;
    return nodeInnerContentStyle;
  };

  private _updateNodeStyle = (
    node: GeoNode,
    nodeTypes: Set<GeoNodeTypeEnum>,
    isActivated: boolean,
  ) => {
    const { zIndex, opacity, ...nodeInnerContentStyle } = this._getNodeStyle({
      nodeTypes,
      isActivated,
      isEnabled: node.isEnabled(),
    });
    node.setNodeInnerContentStyle(nodeInnerContentStyle);
    node.setZIndex(zIndex);
    node.setOpacity(opacity);
  };

  /**
   * =========================================================================================================
   * PreNode 스타일 기능
   * =========================================================================================================
   */
  private _updatePreNodeStyle = (preNode: GeoNode) => {
    const styleSet = this.getStylePresetPolicy();
    preNode.setNodeInnerContentStyle({
      d: styleSet.shapePreNode,
      bgColor: styleSet.bgColorPreNode,
    });
    preNode.setZIndex(styleSet.zIndexNode - 10);
  };

  /**
   * =========================================================================================================
   * Way 스타일 기능
   * =========================================================================================================
   */
  private _getWayStyle = (
    mapType: GeoMapTypeEnum,
    isWayEnabled: boolean,
  ): GeoLineStyle => {
    const styleSet = this.getStylePresetPolicy();
    const wayStyle: GeoLineStyle = {};
    wayStyle.zIndex = styleSet.zIndexWay;
    wayStyle.icons = styleSet.iconsWay;
    wayStyle.strokeWeight = styleSet.strokeWeightWay;
    wayStyle.strokeOpacity = isWayEnabled
      ? this.getOpacityLayerPolicy()
      : styleSet.opacityWayDisabled;
    wayStyle.strokeColor =
      mapType === GeoMapTypeEnum.ROADMAP
        ? styleSet.strokeColorWayForRoadMap
        : styleSet.strokeColorWayForSatellite;
    return wayStyle;
  };

  setVisibleCenterLine = (way: GeoWay, visibleCenterLine: boolean) => {
    const styleSet = this.getStylePresetPolicy();
    if (visibleCenterLine) {
      way.showCenterLine({
        strokeColor: styleSet.strokeColorCenterLineOfWayActivated,
        strokeWeight: styleSet.strokeWeightCenterLineOfWayActivated,
        zIndex: styleSet.zIndexWay + 10,
      });
    } else {
      way.hideCenterLine();
    }
  };

  private _updateWayStyle = (
    way: GeoWay,
    isActivated: boolean,
    mapType: GeoMapTypeEnum,
  ) => {
    const wayStyle = this._getWayStyle(mapType, way.isEnabled());
    way.setPolylineOptions({
      strokeWeight: wayStyle.strokeWeight,
      strokeColor: wayStyle.strokeColor,
      strokeOpacity: wayStyle.strokeOpacity,
      zIndex: wayStyle.zIndex,
      icons: wayStyle.icons,
    });
    this.setVisibleCenterLine(way, isActivated);
  };

  /**
   * =========================================================================================================
   * LineSegment 스타일 기능
   * =========================================================================================================
   */
  private _getLineSegmentStyle = (mapType: GeoMapTypeEnum): GeoLineStyle => {
    const styleSet = this.getStylePresetPolicy();
    const lineSegmentStyle: GeoLineStyle = {};
    lineSegmentStyle.strokeWeight = styleSet.strokeWeightLineSegmentActivated;
    lineSegmentStyle.strokeOpacity = this.getOpacityLayerPolicy();
    lineSegmentStyle.strokeColor =
      mapType === GeoMapTypeEnum.ROADMAP
        ? styleSet.strokeColorLineSegmentActivatedForRoadMap
        : styleSet.strokeColorLineSegmentActivatedForSatellite;
    lineSegmentStyle.zIndex =
      styleSet.zIndexWay + this.getLineSegmentZIndexAboveWay();
    return lineSegmentStyle;
  };

  private _updateLineSegmentStyle = (
    lineSegment: GeoLineSegment,
    isActivated: boolean,
    mapType: GeoMapTypeEnum,
  ) => {
    const lineStyle = this._getLineSegmentStyle(mapType);
    lineSegment.setLineSegmentOptions({ ...lineStyle });
    lineSegment.setVisible(isActivated);
  };

  /**
   * =========================================================================================================
   * LineSegmentDirection 스타일 기능
   * =========================================================================================================
   */
  private _getSvgColors = (
    iconColors: GeoLineSegmentDirectionIconColors,
    isLineSegmentActivated: boolean,
    isWayActivated: boolean,
  ) => {
    if (isLineSegmentActivated) {
      return iconColors[GeoLineSegmentIconColorTypeEnum.ACTIVATED];
    }
    if (isWayActivated) {
      return iconColors[GeoLineSegmentIconColorTypeEnum.WAY_ACTIVATED];
    }
    return iconColors[GeoLineSegmentIconColorTypeEnum.DEFAULT];
  };
  private _getLineSegmentDirectionStyle = (
    mapType: GeoMapTypeEnum,
    isLineSegmentActivated: boolean,
    isWayActivated: boolean,
    isWayEnabled: boolean,
  ): GeoLineStyle => {
    const {
      lineSegmentDirection: { directionIcons, directionIconsColors },
      zIndexWay,
      opacityWayDisabled,
    } = this.getStylePresetPolicy();
    const opacity = isWayEnabled
      ? this.getOpacityLayerPolicy()
      : opacityWayDisabled;
    const lineSegmentDirectionStyle: GeoLineStyle = {
      strokeColor: 'transparent',
      strokeWeight: 0,
      strokeOpacity: opacity,
      zIndex: zIndexWay + this.getLineSegmentDirectionZIndexAboveWay(),
      icons: directionIcons,
    };
    if (lineSegmentDirectionStyle.icons && directionIconsColors) {
      const iconColors =
        mapType === GeoMapTypeEnum.ROADMAP
          ? directionIconsColors.roadmap
          : directionIconsColors.satellite;
      const svgColors = this._getSvgColors(
        iconColors,
        isLineSegmentActivated,
        isWayActivated,
      );
      if (svgColors) {
        lineSegmentDirectionStyle.icons.forEach((icon) => {
          if (!icon.icon) {
            return;
          }
          icon.icon.fillColor = svgColors[SvgColorTypeEnum.FILL];
          icon.icon.fillOpacity = opacity;
          icon.icon.strokeColor = svgColors[SvgColorTypeEnum.STROKE];
          icon.icon.strokeOpacity = opacity;
        });
      }
    }
    return lineSegmentDirectionStyle;
  };

  private _updateLineSegmentDirectionStyle = (
    lineSegmentDirection: GeoLineSegmentDirection,
  ) => {
    const lineSegment =
      this._lineSegmentManager.getLineSegmentByLineSegmentDirection(
        lineSegmentDirection,
      );
    const isLineSegmentActivated =
      !!lineSegment &&
      this._featureActivationManager.isLineSegmentActivated(lineSegment);
    const way = lineSegmentDirection.getWay();
    const isWayActivated = this._featureActivationManager.isWayActivated(way);

    const lineSegmentDirectionStyle = this._getLineSegmentDirectionStyle(
      this._mapType,
      isLineSegmentActivated,
      isWayActivated,
      way.isEnabled(),
    );
    lineSegmentDirection.setIcons(lineSegmentDirectionStyle.icons || null);
    lineSegmentDirection.setZIndex(lineSegmentDirectionStyle.zIndex);
    return true;
  };

  private _updateLineSegmentDirectionsStyleOfWay = (way: GeoWay) => {
    const lineSegmentDirections =
      this._lineSegmentManager.getLineSegmentDirectionsOfWay(way);
    lineSegmentDirections.forEach((lineSegmentDirection) => {
      lineSegmentDirection &&
        this._updateLineSegmentDirectionStyle(lineSegmentDirection);
    });
  };

  /**
   * =========================================================================================================
   * NodeCandidate
   * =========================================================================================================
   */
  private _updateNodeCandidateStyle = (nodeCandidate: GeoNodeCandidate) => {
    const styleSet = this.getStylePresetPolicy();
    nodeCandidate.setOpacity(this._policy.opacityLayer);
    nodeCandidate.setNodeInnerContentStyle(
      this._getNodeStyle({
        nodeTypes: new Set<GeoNodeTypeEnum>([GeoNodeTypeEnum.START]),
        isActivated: true,
      }),
    );
    nodeCandidate.setPolyLineStyle({
      strokeColor: styleSet.strokeColorLineOfNodeCandidate,
      strokeWeight: styleSet.strokeWeightLineOfNodeCandidate,
      zIndex: styleSet.zIndexWay,
    });
    nodeCandidate.setCenterLineStyle({
      strokeColor: styleSet.strokeColorCenterLineOfNodeCandidate,
      strokeWeight: styleSet.strokeWeightCenterLineOfNodeCandidate,
      zIndex: styleSet.zIndexWay + 10,
    });
    nodeCandidate.showPolyLine();
    nodeCandidate.showCenterLine();
  };

  destroy = () => {
    this._featureVisibleManager.removeNodeVisibleChangedListener(KEY);
    this._featureVisibleManager.removeWayVisibleChangedListener(KEY);
    this._nodeCandidateManager.removeNodeCandidateAddedEventListener(KEY);
    this._preNodeManager.removePreNodeAddedEventListener(KEY);
    this._featureActivationManager.removeNodeActivatedEventListener(KEY);
    this._featureActivationManager.removeWayActivatedEventListener(KEY);
    this._featureActivationManager.removeLineSegmentActivatedEventListener(KEY);
    this._featureManager.removeNodeTypesChangedListener(KEY);
    this._mapEventRemover.destroy();
  };
}

export default GeoFeatureStyleManager;
