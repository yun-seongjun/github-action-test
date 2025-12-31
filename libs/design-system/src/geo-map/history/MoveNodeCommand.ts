import Command from './Command';
import {
  GeoFeatureTagsType,
  GeoLatLngType,
  Nullable,
} from '@design-system/types';
import GeoNode, {
  GeoNodeOptionType,
} from '@design-system/geo-map/feature/GeoNode';
import GeoFeatureManager from '@design-system/geo-map/feature/GeoFeatureManager';
import { GeoMapUtils } from '@design-system/utils/geo-map';
import GeoWay from '@design-system/geo-map/feature/GeoWay';
import GeoFeatureVisibleManager from '@design-system/geo-map/optimizer/GeoFeatureVisibleManager';

export type OldWaysValueType = {
  nodes: NodeSnapshot[];
};

type NodeSnapshot = {
  id: number;
  position: GeoLatLngType;
  options: GeoNodeOptionType;
  tags?: GeoFeatureTagsType;
};

interface MoveNodeCommandProps {
  nodes: GeoNode[];
  oldPositions: GeoLatLngType[];
  newPositions: GeoLatLngType[];
  oldWays: Map<GeoWay, OldWaysValueType>;
  isMerged?: boolean;
  featureManager: {
    featureManager: GeoFeatureManager;
    featureVisibleManager: GeoFeatureVisibleManager;
  };
  createNode: (
    id: number,
    position: GeoLatLngType,
    options?: Pick<GeoNodeOptionType, 'visible' | 'clickable' | 'draggable'>,
    tags?: GeoFeatureTagsType,
  ) => GeoNode;
  createWay: (
    id: number,
    nodeIds: number[],
    tags?: GeoFeatureTagsType,
    isVisible?: boolean,
  ) => GeoWay;
}

class MoveNodeCommand extends Command {
  private _nodes: MoveNodeCommandProps['nodes'];
  private _oldWays: Map<GeoWay, OldWaysValueType> = new Map();
  private _oldPositions: Map<number, GeoLatLngType> = new Map();
  private _newPositions: Map<number, GeoLatLngType> = new Map();
  private readonly _isMerged: boolean;
  private _currentCenterPosition: Nullable<GeoLatLngType> = null;
  private _featureManager: GeoFeatureManager;
  private _featureVisibleManager: GeoFeatureVisibleManager;
  private readonly _createNode: (
    id: number,
    position: GeoLatLngType,
    options?: Pick<GeoNodeOptionType, 'visible' | 'clickable' | 'draggable'>,
    tags?: GeoFeatureTagsType,
  ) => GeoNode;
  private readonly _createWay: (
    id: number,
    nodeIds: number[],
    tags?: GeoFeatureTagsType,
    isVisible?: boolean,
  ) => GeoWay;

  constructor({
    nodes,
    oldWays,
    oldPositions,
    newPositions,
    isMerged = false,
    featureManager,
    createNode,
    createWay,
  }: MoveNodeCommandProps) {
    super();
    this._nodes = nodes;
    this._oldWays = oldWays;
    this._isMerged = isMerged;
    this._featureManager = featureManager.featureManager;
    this._featureVisibleManager = featureManager.featureVisibleManager;
    this._createNode = createNode;
    this._createWay = createWay;
    nodes.forEach((node, index) => {
      this._oldPositions.set(node.getId(), oldPositions[index]);
      this._newPositions.set(node.getId(), newPositions[index]);
    });
  }

  private _updateNodeLatLng = (node: GeoNode, movedLatLng?: GeoLatLngType) => {
    if (
      !movedLatLng ||
      GeoMapUtils.isLatLngEquals(node.getPosition(), movedLatLng)
    ) {
      return;
    }
    return this._featureManager.updateNodeLatLng(node, movedLatLng);
  };

  private _undoMergedNode = (way: GeoWay, nodes: NodeSnapshot[]) => {
    const targetNodeIds = nodes.map((node) => node.id);

    if (this._featureManager.isWayContains(way.getId())) {
      this._featureManager.deleteWay(this._featureManager.getWay(way.getId()));
    }

    nodes.forEach((node) => {
      if (!this._featureManager.isNodeContains(node.id)) {
        const { position, options, tags, id } = node;
        this._createNode(id, position, options, tags);
      }
    });

    const newWay = this._createWay(
      way.getId(),
      targetNodeIds,
      way.getTags(),
      way.isVisible(),
    );

    newWay.updatePath();
  };

  private _doMergedNode(node: GeoNode, newPosition?: GeoLatLngType) {
    if (!newPosition) {
      return;
    }
    const nodeId = node.getId();
    const nodesIdExclude = this._featureManager.getWaysWithNode(node).reduce(
      (acc, way) => {
        way.getNotAdjacentNodesId(node).forEach((nodeId) => {
          acc.push(nodeId);
        });
        return acc;
      },
      [node.getId()] as number[],
    );

    const nodeSnapping = this._featureVisibleManager.getNodeVisibleWithinPx(
      newPosition,
      GeoNode.RADIUS_PX * 2,
      {
        nodesIdExclude,
      },
    );
    if (nodeSnapping) {
      this._updateNodeLatLng(
        this._featureManager.getNode(nodeId),
        nodeSnapping.getPosition(),
      );
      node.setInnerVisible(false);
      this._featureManager.mergeNode(
        this._featureManager.getNode(nodeId),
        nodeSnapping,
      );
    }
  }

  do() {
    this._nodes.forEach((node) => {
      const newPosition = this._newPositions.get(node.getId());
      const nodeId = node.getId();
      if (this._isMerged) {
        this._doMergedNode(node, newPosition);
      } else {
        this._updateNodeLatLng(
          this._featureManager.getNode(nodeId),
          newPosition,
        );
      }
    });
  }

  undo() {
    /**
     * snapping 으로 인해 노드가 하나로 합쳐진 경우
     */
    if (this._isMerged) {
      this._oldWays.forEach((nodeInfo, way) => {
        const { nodes } = nodeInfo;
        this._undoMergedNode(way, nodes);
      });
    } else {
      /**
       * 단순 이동
       */
      this._nodes.forEach((node) => {
        const oldPosition = this._oldPositions.get(node.getId());
        const nodeId = node.getId();
        if (this._featureManager.isNodeContains(nodeId))
          this._updateNodeLatLng(
            this._featureManager.getNode(nodeId),
            oldPosition,
          );
      });
    }
  }

  private setCurrentCenterPosition(position: GeoLatLngType) {
    this._currentCenterPosition = position;
  }

  getCurrentCenter() {
    return this._currentCenterPosition;
  }

  destroy() {
    this._nodes = [];
    this._oldWays.clear();
    this._oldPositions.clear();
    this._newPositions.clear();
  }
}

export default MoveNodeCommand;
