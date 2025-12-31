import Command from '@design-system/geo-map/history/Command';
import GeoWay from '@design-system/geo-map/feature/GeoWay';
import GeoNode, {
  GeoNodeOptionType,
} from '@design-system/geo-map/feature/GeoNode';
import {
  GeoFeatureTagsType,
  GeoLatLngType,
  Nullable,
} from '@design-system/types';
import GeoFeatureManager, {
  GeoFeaturesType,
} from '@design-system/geo-map/feature/GeoFeatureManager';
import { GenIdType } from '@design-system/utils/geo-map';
import GeoLineSegmentManager from '@design-system/geo-map/line-segment/GeoLineSegmentManager';
import GeoLineSegment from '@design-system/geo-map/line-segment/GeoLineSegment';

type featuresDeletedType = Omit<GeoFeaturesType, 'ways'> & {
  ways: Map<GeoWay, GeoNode[]>;
};

export type LineSegmentUndoDataType = {
  waysCreated: GeoWay[];
  previousNodes: {
    id: GenIdType;
    position: GeoLatLngType;
    options?: Pick<GeoNodeOptionType, 'visible' | 'clickable' | 'draggable'>;
    tags?: GeoFeatureTagsType;
  }[];
};

export interface FeatureCommandProps {
  featureManager: GeoFeatureManager;
  featuresDeleted: featuresDeletedType;
  lineSegmentManager: GeoLineSegmentManager;
  lineSegmentUndoData: Array<LineSegmentUndoDataType>;
  createWay: (
    id: number,
    nodeIds: number[],
    tags?: GeoFeatureTagsType,
    isVisible?: boolean,
  ) => GeoWay;
  createNode: (
    id: number,
    position: GeoLatLngType,
    options?: Pick<GeoNodeOptionType, 'visible' | 'clickable' | 'draggable'>,
    tags?: GeoFeatureTagsType,
  ) => GeoNode;
  deleteFeaturesCore: (
    nodes: GeoNode[],
    lineSegments: GeoLineSegment[],
  ) => Array<LineSegmentUndoDataType>;
}

class FeatureCommand extends Command {
  private _currentCenterPosition: Nullable<GeoLatLngType> = null;
  private _featureManager: GeoFeatureManager;
  private readonly _featuresDeleted: featuresDeletedType;
  private _lineSegmentManager: GeoLineSegmentManager;
  private _lineSegmentUndoData: Array<LineSegmentUndoDataType>;
  private readonly _createWay: (
    id: number,
    nodeIds: number[],
    tags?: GeoFeatureTagsType,
    isVisible?: boolean,
  ) => GeoWay;
  private readonly _createNode: (
    id: number,
    position: GeoLatLngType,
    options?: Pick<GeoNodeOptionType, 'visible' | 'clickable' | 'draggable'>,
    tags?: GeoFeatureTagsType,
  ) => GeoNode;
  private readonly _deleteFeaturesCore: (
    nodes: GeoNode[],
    lineSegments: GeoLineSegment[],
  ) => Array<LineSegmentUndoDataType>;

  constructor({
    featureManager,
    lineSegmentManager,
    featuresDeleted,
    lineSegmentUndoData,
    createWay,
    createNode,
    deleteFeaturesCore,
  }: FeatureCommandProps) {
    super();
    this._featuresDeleted = featuresDeleted;
    this._featureManager = featureManager;
    this._lineSegmentManager = lineSegmentManager;
    this._lineSegmentUndoData = lineSegmentUndoData;
    this._createNode = createNode;
    this._createWay = createWay;
    this._deleteFeaturesCore = deleteFeaturesCore;
  }

  setCurrentCenter(way: GeoWay) {
    this._currentCenterPosition = way.getCenterPosition();
  }

  getCurrentCenter(): GeoLatLngType | null {
    return this._currentCenterPosition;
  }

  /**
   * node 및 way 다이렉트 삭제시 undo 실행 함수
   */
  private undoDeleteFeatures() {
    const { ways, nodes, lineSegments } = this._featuresDeleted;

    /**
     * lineSegment 분할로 인해 생성된 way/node 상태 복원
     */
    this._lineSegmentUndoData.forEach((lineSegment) => {
      const { waysCreated, previousNodes } = lineSegment;

      waysCreated.forEach((wayCreated) => {
        if (this._featureManager.isWayContains(wayCreated.getId())) {
          this._featureManager.deleteWay(
            this._featureManager.getWay(wayCreated.getId()),
          );
        }
      });

      previousNodes.forEach(({ id, position, options, tags }) => {
        if (!this._featureManager.isNodeContains(id)) {
          this._createNode(id, position, options, tags);
        }
      });
    });

    /**
     * 직접 삭제했던 node/way/lineSegment 복원
     */
    ways.forEach((nodesOfWay, way) => {
      const wayId = way.getId();
      if (this._featureManager.isWayContains(wayId)) {
        this._featureManager.deleteWay(this._featureManager.getWay(wayId));
      }
      nodesOfWay.forEach((node) => {
        const nodeId = node.getId();
        if (!this._featureManager.isNodeContains(nodeId)) {
          this._createNode(
            nodeId,
            node.getPosition(),
            node.getOptions(),
            node.getTags(),
          );
        }
      });
    });

    nodes.forEach((node) => {
      const nodeId = node.getId();
      if (!this._featureManager.isNodeContains(nodeId)) {
        this._createNode(
          nodeId,
          node.getPosition(),
          node.getOptions(),
          node.getTags(),
        );
      }
    });

    ways.forEach((nodesOfWay, way) => {
      const nodeId = nodesOfWay.map((node) => node.getId());
      if (!this._featureManager.isWayContains(way.getId())) {
        this._createWay(way.getId(), nodeId, way.getTags(), way.isVisible());
      }
    });

    lineSegments.forEach((lineSegment) => {
      const nodeStart = this._featureManager.getNode(
        lineSegment.getNodeStart().getId(),
      );
      const nodeEnd = this._featureManager.getNode(
        lineSegment.getNodeEnd().getId(),
      );

      const way = this._featureManager.getWay(lineSegment.getWay().getId());
      if (!this._lineSegmentManager.getLineSegment(way, nodeStart, nodeEnd)) {
        this._lineSegmentManager.createLineSegment(way, nodeStart, nodeEnd);
      }
    });
  }

  undo() {
    this.undoDeleteFeatures();
  }

  do() {
    const { nodes, lineSegments } = this._featuresDeleted;
    const currentNodes = this._featureManager.getNodes(
      nodes.map((node) => node.getId()),
    );
    const currentLineSegments = lineSegments.reduce<GeoLineSegment[]>(
      (acc, line) => {
        const way = this._featureManager.getWay(line.getWay().getId());
        const nodeStart = this._featureManager.getNode(
          line.getNodeStart().getId(),
        );
        const nodeEnd = this._featureManager.getNode(line.getNodeEnd().getId());
        const currentLineSegment = this._lineSegmentManager.getLineSegment(
          way,
          nodeStart,
          nodeEnd,
        );

        if (currentLineSegment) {
          acc.push(currentLineSegment);
        }

        return acc;
      },
      [],
    );

    this._lineSegmentUndoData = this._deleteFeaturesCore(
      currentNodes,
      currentLineSegments,
    );
  }

  destroy() {}
}

export default FeatureCommand;
