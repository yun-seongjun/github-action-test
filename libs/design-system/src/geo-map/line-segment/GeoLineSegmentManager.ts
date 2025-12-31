import GeoRectangle from '@design-system/geo-map/GeoRectangle';
import EventListenerManager from '@design-system/geo-map/event/EventListenerManager';
import GeoFeatureManager from '@design-system/geo-map/feature/GeoFeatureManager';
import GeoNode from '@design-system/geo-map/feature/GeoNode';
import GeoWay from '@design-system/geo-map/feature/GeoWay';
import GeoLineSegment from '@design-system/geo-map/line-segment/GeoLineSegment';
import GeoLineSegmentDirection from '@design-system/geo-map/line-segment/GeoLineSegmentDirection';
import { GeoLatLngType } from '@design-system/types/geoMap.type';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';
import { theme } from '@design-system/root/tailwind.config';
import StructSetUtils from '@design-system/utils/structSetUtils';
import { EnvUtils } from '@design-system/utils';

const KEY = 'GeoLineSegmentManager';

export interface GeoLineSegmentPolicy {
  isLineSegmentEnable: boolean;
  isLineSegmentClickable: boolean;
  isLineSegmentDirectionEnable: boolean;
}

type LineSegmentKeyType = `line-segment-key-${number}-${number}`;
const getLineSegmentKey = (
  nodeStart: GeoNode,
  nodeEnd: GeoNode,
): LineSegmentKeyType => {
  return `line-segment-key-${nodeStart.getId()}-${nodeEnd.getId()}`;
};

class GeoLineSegmentManager {
  private _lineSegmentsSet: Set<GeoLineSegment> = new Set();
  private _lineSegmentsMapOfWay: Map<GeoWay, Set<GeoLineSegment>> = new Map();
  private _lineSegmentsMapOfNodeStart: Map<GeoNode, Set<GeoLineSegment>> =
    new Map();
  private _lineSegmentsMapOfNodeEnd: Map<GeoNode, Set<GeoLineSegment>> =
    new Map();
  private _lineSegmentsEventListenersKeyMap: Map<GeoLineSegment, string[]> =
    new Map();

  private _lineSegmentDirectionsSet: Set<GeoLineSegmentDirection> = new Set();
  private _lineSegmentDirectionsMapOfWay: Map<
    GeoWay,
    Set<GeoLineSegmentDirection>
  > = new Map();
  private _lineSegmentDirectionsMapOfLineSegmentKey: Map<
    LineSegmentKeyType,
    GeoLineSegmentDirection
  > = new Map();
  private _lineSegmentsMapOfLineSegmentKey: Map<
    LineSegmentKeyType,
    GeoLineSegment
  > = new Map();
  private _lineSegmentDirectionEventListenersKeyMap: Map<
    GeoLineSegmentDirection,
    string[]
  > = new Map();

  private readonly _map: google.maps.Map;
  private readonly _featureManager: GeoFeatureManager;

  private _isLineSegmentEnable = false;
  private _isLineSegmentClickable = false;
  private _isLineSegmentDirectionEnable = false;

  private _isLineSegmentDirectionsVisible = false;
  private _lineSegmentDirectionsVisibleChangeStickyEventListenerManager: EventListenerManager<
    string,
    (visible: boolean) => void
  > = new EventListenerManager();
  private _lineSegmentDirectionAddEventListenerManager: EventListenerManager<
    string,
    (lineSegmentDirection: GeoLineSegmentDirection) => void
  > = new EventListenerManager();
  private _lineSegmentDirectionDeleteEventListenerManager: EventListenerManager<
    string,
    (lineSegmentDirection: GeoLineSegmentDirection) => void
  > = new EventListenerManager();
  private _lineSegmentDirectionVisibleChangeEventListenerManager: EventListenerManager<
    string,
    (lineSegmentDirection: GeoLineSegmentDirection, visible: boolean) => void
  > = new EventListenerManager();

  private _lineSegmentAddedEventListenerManager: EventListenerManager<
    string,
    (lineSegmentAdded: GeoLineSegment) => void
  > = new EventListenerManager();
  private _lineSegmentDeletedEventListenerManager: EventListenerManager<
    string,
    (lineSegmentDeleted: GeoLineSegment) => void
  > = new EventListenerManager();
  private _lineSegmentDivideEventListenerManager: EventListenerManager<
    string,
    (
      lineSegmentsAdded: GeoLineSegment[],
      lineSegmentDeleted: GeoLineSegment,
    ) => void
  > = new EventListenerManager();
  private _lineSegmentReplacedEventListenerManager: EventListenerManager<
    string,
    (
      lineSegmentAdded: GeoLineSegment,
      lineSegmentDeleted: GeoLineSegment,
    ) => void
  > = new EventListenerManager();
  private _lineSegmentMergedEventListenerManager: EventListenerManager<
    string,
    (
      lineSegmentAdded: GeoLineSegment,
      lineSegmentDeleted1: GeoLineSegment,
      lineSegmentDeleted2: GeoLineSegment,
    ) => void
  > = new EventListenerManager();
  private _lineSegmentPositionChangedEventListenerManager: EventListenerManager<
    string,
    (lineSegment: GeoLineSegment) => void
  > = new EventListenerManager();
  private _lineSegmentClickEventListenerManager: EventListenerManager<
    string,
    (lineSegment: GeoLineSegment, event: google.maps.MapMouseEvent) => void
  > = new EventListenerManager();
  private _lineSegmentVisibleChangedEventListenerManager: EventListenerManager<
    string,
    (lineSegment: GeoLineSegment, visible: boolean) => void
  > = new EventListenerManager();

  constructor(
    map: google.maps.Map,
    featureManager: GeoFeatureManager,
    policy?: GeoLineSegmentPolicy,
  ) {
    this._map = map;
    this._featureManager = featureManager;

    policy && this.setPolicy(policy);

    this._featureManager.addNodePositionChangedListener(KEY, (node) => {
      if (!this._isLineSegmentEnable) {
        return;
      }
      this.updatePosition(node);
    });
    this._featureManager.addNodeAddedToWayListener(
      KEY,
      (way, node, indexOfNodeAdded) => {
        if (this._isLineSegmentEnable) {
          const nodeStart = way.getNodeOfIndex(indexOfNodeAdded - 1);
          const nodeEnd = way.getNodeOfIndex(indexOfNodeAdded + 1);

          const lineSegmentCreated: GeoLineSegment[] = [];
          const lineSegmentDeleted: GeoLineSegment[] = [];

          if (nodeStart && nodeEnd) {
            const lineSegment = this.getLineSegment(way, nodeStart, nodeEnd);
            if (!lineSegment) {
              const message = 'lineSegment is not exists';
              if (GeoMapUtils.IS_DEBUG) {
                throw new Error(message);
              } else {
                console.error(message);
              }
              return;
            }
            const result = this.divideLineSegment(lineSegment, node);
            result?.lineSegmentCreated.forEach((lineSegment) => {
              lineSegmentCreated.push(lineSegment);
            });
            result?.lineSegmentDeleted &&
              lineSegmentDeleted.push(result?.lineSegmentDeleted);
          } else if (nodeStart) {
            const result = this.createLineSegment(way, nodeStart, node);
            result && lineSegmentCreated.push(result);
          } else if (nodeEnd) {
            const result = this.createLineSegment(way, node, nodeEnd);
            result && lineSegmentCreated.push(result);
          }
          lineSegmentCreated.forEach((lineSegment) => {
            this.createLineSegmentDirection(
              lineSegment.getWay(),
              lineSegment.getNodeStart(),
              lineSegment.getNodeEnd(),
            );
          });
          lineSegmentDeleted.forEach((lineSegment) => {
            this.deleteLineSegmentDirection(
              lineSegment.getWay(),
              lineSegment.getNodeStart(),
              lineSegment.getNodeEnd(),
            );
          });
        } else if (this._isLineSegmentDirectionEnable) {
          this.deleteLineSegmentDirectionsOfWay(way);
          this.createLineSegmentDirectionOfWay(way);
        }
      },
    );
    this._featureManager.addNodeDeletedFromWayListener(
      KEY,
      (way, node, indexAtOfNodeDeleted) => {
        if (this._isLineSegmentEnable) {
          const lineSegmentCreated: GeoLineSegment[] = [];
          const lineSegmentDeleted: GeoLineSegment[] = [];

          const nodeStart = way.getNodeOfIndex(indexAtOfNodeDeleted - 1);
          const nodeEnd = way.getNodeOfIndex(indexAtOfNodeDeleted);
          if (nodeStart && nodeEnd) {
            const lineSegment1 = this.getLineSegment(way, nodeStart, node);
            const lineSegment2 = this.getLineSegment(way, node, nodeEnd);
            if (!lineSegment1) {
              const message = 'lineSegment1 is not exists';
              if (GeoMapUtils.IS_DEBUG) {
                throw new Error(message);
              } else {
                console.error(message);
              }
              return;
            }
            if (!lineSegment2) {
              const message = 'lineSegment2 is not exists';
              if (GeoMapUtils.IS_DEBUG) {
                throw new Error(message);
              } else {
                console.error(message);
              }
              return;
            }
            const result = this.mergeLineSegments(lineSegment1, lineSegment2);
            result?.lineSegmentCreated &&
              lineSegmentCreated.push(result.lineSegmentCreated);
            result?.lineSegmentsDeleted.forEach((lineSegment) => {
              lineSegmentDeleted.push(lineSegment);
            });
          } else if (nodeStart) {
            const lineSegment = this.getLineSegment(way, nodeStart, node);
            if (!lineSegment) {
              const message = 'lineSegment is not exists';
              if (GeoMapUtils.IS_DEBUG) {
                throw new Error(message);
              } else {
                console.error(message);
              }
              return;
            }
            const result = this.deleteLineSegment(lineSegment);
            result && lineSegmentDeleted.push(lineSegment);
          } else if (nodeEnd) {
            const lineSegment = this.getLineSegment(way, node, nodeEnd);
            if (!lineSegment) {
              const message = 'lineSegment is not exists';
              if (GeoMapUtils.IS_DEBUG) {
                throw new Error(message);
              } else {
                console.error(message);
              }
              return;
            }
            const result = this.deleteLineSegment(lineSegment);
            result && lineSegmentDeleted.push(lineSegment);
          }

          lineSegmentCreated.forEach((lineSegment) => {
            this.createLineSegmentDirection(
              lineSegment.getWay(),
              lineSegment.getNodeStart(),
              lineSegment.getNodeEnd(),
            );
          });
          lineSegmentDeleted.forEach((lineSegment) => {
            this.deleteLineSegmentDirection(
              lineSegment.getWay(),
              lineSegment.getNodeStart(),
              lineSegment.getNodeEnd(),
            );
          });
          const lineSegments = this.getLineSegmentsOfNode(node);
          lineSegments
            .filter((lineSegment) => lineSegment.getWay() === way)
            .forEach((lineSegment) => {
              this.deleteLineSegment(lineSegment);
            });
        } else if (this._isLineSegmentDirectionEnable) {
          this.deleteLineSegmentDirectionsOfWay(way);
          this.createLineSegmentDirectionOfWay(way);
        }
      },
    );
    this._featureManager.addWayNodesMergedListener(
      KEY,
      (
        way,
        nodeDeleted,
        node,
        nodeDeletedIndexAtBeforeMerged,
        nodeIndexAtBeforeMerged,
        wayLengthBeforeMerged,
      ) => {
        if (this._isLineSegmentEnable) {
          const lineSegmentCreated: GeoLineSegment[] = [];
          const lineSegmentDeleted: GeoLineSegment[] = [];

          const nodes: [GeoNode | undefined, GeoNode | undefined] = [
            undefined,
            undefined,
          ];
          const isReplaced = wayLengthBeforeMerged === way.getNodes().length;
          if (isReplaced) {
            nodes[0] = way.getNodeOfIndex(nodeDeletedIndexAtBeforeMerged - 1);
            nodes[1] = way.getNodeOfIndex(nodeDeletedIndexAtBeforeMerged + 1);
          } else {
            if (
              nodeDeletedIndexAtBeforeMerged === nodeIndexAtBeforeMerged ||
              nodeDeletedIndexAtBeforeMerged - 1 === nodeIndexAtBeforeMerged
            ) {
              nodes[0] = way.getNodeOfIndex(nodeDeletedIndexAtBeforeMerged - 1);
              nodes[1] = way.getNodeOfIndex(nodeDeletedIndexAtBeforeMerged);
            } else if (
              nodeDeletedIndexAtBeforeMerged < nodeIndexAtBeforeMerged
            ) {
              nodes[0] = way.getNodeOfIndex(nodeDeletedIndexAtBeforeMerged);
            } else {
              nodes[1] = way.getNodeOfIndex(nodeDeletedIndexAtBeforeMerged);
            }
          }

          const [nodeStart, nodeEnd] = nodes;
          if (nodeStart) {
            const lineSegment = this.getLineSegment(
              way,
              nodeStart,
              nodeDeleted,
            );
            if (!lineSegment) {
              const message = 'lineSegment is not exists';
              if (GeoMapUtils.IS_DEBUG) {
                throw new Error(message);
              } else {
                console.error(message);
              }
              return;
            }
            if (nodeStart === node) {
              const result = this.deleteLineSegment(lineSegment);
              result && lineSegmentDeleted.push(lineSegment);
            } else {
              const result = this.replaceLineSegment(
                nodeStart,
                node,
                lineSegment,
              );
              result?.lineSegmentCreated &&
                lineSegmentCreated.push(result.lineSegmentCreated);
              result?.lineSegmentDeleted &&
                lineSegmentDeleted.push(result.lineSegmentDeleted);
            }
          }
          if (nodeEnd) {
            const lineSegment = this.getLineSegment(way, nodeDeleted, nodeEnd);
            if (!lineSegment) {
              const message = 'lineSegment2 is not exists';
              if (GeoMapUtils.IS_DEBUG) {
                throw new Error(message);
              } else {
                console.error(message);
              }
              return;
            }
            if (node === nodeEnd) {
              const result = this.deleteLineSegment(lineSegment);
              result && lineSegmentDeleted.push(lineSegment);
            } else {
              const result = this.replaceLineSegment(
                node,
                nodeEnd,
                lineSegment,
              );
              result?.lineSegmentCreated &&
                lineSegmentCreated.push(result.lineSegmentCreated);
              result?.lineSegmentDeleted &&
                lineSegmentDeleted.push(result.lineSegmentDeleted);
            }
          }

          lineSegmentCreated.forEach((lineSegment) => {
            this.createLineSegmentDirection(
              lineSegment.getWay(),
              lineSegment.getNodeStart(),
              lineSegment.getNodeEnd(),
            );
          });
          lineSegmentDeleted.forEach((lineSegment) => {
            this.deleteLineSegmentDirection(
              lineSegment.getWay(),
              lineSegment.getNodeStart(),
              lineSegment.getNodeEnd(),
            );
          });
        } else if (this._isLineSegmentDirectionEnable) {
          this.deleteLineSegmentDirectionsOfWay(way);
          this.createLineSegmentDirectionOfWay(way);
        }
      },
    );
    this._featureManager.addWayAddedListener(KEY, (way) => {
      if (this._isLineSegmentEnable) {
        this.createLineSegmentOfWay(way);
      }
      if (this._isLineSegmentDirectionEnable) {
        this.createLineSegmentDirectionOfWay(way);
      }
    });
    this._featureManager.addWayDeletedListener(KEY, (way) => {
      if (this._isLineSegmentEnable) {
        this.deleteLineSegmentsOfWay(way);
      }
      if (this._isLineSegmentDirectionEnable) {
        this.deleteLineSegmentDirectionsOfWay(way);
      }
    });
  }

  getAllLineSegments = () => {
    return Array.from(this._lineSegmentsSet);
  };

  getLineSegment = (way: GeoWay, node1: GeoNode, node2: GeoNode) => {
    const lineSegments = this._lineSegmentsMapOfWay.get(way);
    if (!lineSegments) {
      return undefined;
    }
    for (const lineSegment of lineSegments) {
      if (
        (lineSegment.getNodeStart() === node1 &&
          lineSegment.getNodeEnd() === node2) ||
        (lineSegment.getNodeStart() === node2 &&
          lineSegment.getNodeEnd() === node1)
      ) {
        return lineSegment;
      }
    }
    return undefined;
  };

  getLineSegmentsOfWay = (way: GeoWay) => {
    return Array.from(this._lineSegmentsMapOfWay.get(way) || []);
  };

  getLineSegmentsOfNode = (node: GeoNode) => {
    const lineSegmentSet = new Set<GeoLineSegment>();
    this._lineSegmentsMapOfNodeStart.get(node)?.forEach((lineSegment) => {
      lineSegmentSet.add(lineSegment);
    });
    this._lineSegmentsMapOfNodeEnd.get(node)?.forEach((lineSegment) => {
      lineSegmentSet.add(lineSegment);
    });
    return Array.from(lineSegmentSet);
  };

  getLineSegmentByLatLng = (
    way: GeoWay,
    latLng: GeoLatLngType | google.maps.LatLngLiteral,
  ) => {
    const nodesClosest = this.getLineNodesClosest(way, latLng);
    if (!nodesClosest) {
      return undefined;
    }
    return (
      this.getLineSegment(way, nodesClosest.nodeStart, nodesClosest.nodeEnd) ||
      this.getLineSegment(way, nodesClosest.nodeEnd, nodesClosest.nodeStart)
    );
  };

  getLineNodesClosest = (
    way: GeoWay,
    latLng: GeoLatLngType | google.maps.LatLngLiteral,
  ) => {
    let lineNodesCandidate: GeoNode[] | undefined = undefined;
    let distanceCandidate = Number.MAX_VALUE;
    let nodeBefore: GeoNode | undefined;
    for (const node of way.getNodes()) {
      if (nodeBefore) {
        const distance = GeoMapUtils.getDistanceToLine(
          latLng,
          nodeBefore.getPosition(),
          node.getPosition(),
        );
        if (distance < distanceCandidate) {
          lineNodesCandidate = [nodeBefore, node];
          distanceCandidate = distance;
        }
      }
      nodeBefore = node;
    }
    if (!lineNodesCandidate) {
      return undefined;
    }
    const lineNodes = lineNodesCandidate?.sort(
      (a, b) => a.getPosition().lat - b.getPosition().lat,
    );
    return { nodeStart: lineNodes[0], nodeEnd: lineNodes[1] };
  };

  private boxDebug: GeoRectangle | undefined = undefined;
  getLineSegmentWithinPx = (
    latLng: GeoLatLngType,
    px: number,
    options?: {
      isClickable?: boolean;
      isDraggable?: boolean;
      isWayEnabled?: boolean;
    },
  ): GeoLineSegment | undefined => {
    if (this.boxDebug) {
      this.boxDebug.destroy();
      this.boxDebug = undefined;
    }

    const zoomLevel = this._map.getZoom();
    if (zoomLevel === undefined) {
      return undefined;
    }

    const { isClickable, isDraggable, isWayEnabled } = options || {};

    let lineSegmentClosest: GeoLineSegment | undefined = undefined;
    let lineSegmentClosestDistance = 0;
    const bounds = GeoMapUtils.makeBoundsFromPositionAndDistance(
      latLng,
      GeoMapUtils.calculateDistance(latLng, px, this._map) ?? 0,
    );

    if (GeoMapUtils.IS_DEBUG) {
      this.boxDebug = new GeoRectangle({
        id: 0,
        bounds,
        googleMap: this._map,
        options: {
          fillOpacity: 0.3,
          fillColor: theme.colors.secondary['800'],
          strokeOpacity: 0,
          zIndex: theme.zIndex.map.rectangle.dragBox,
        },
      });
    }
    this._lineSegmentsSet.forEach((lineSegment) => {
      if (
        (isClickable !== undefined &&
          lineSegment.isClickable() !== isClickable) ||
        (isDraggable !== undefined &&
          lineSegment.isDraggable() !== isDraggable) ||
        (isWayEnabled !== undefined &&
          lineSegment.getWay().isEnabled() !== isWayEnabled)
      ) {
        return;
      }

      GeoMapUtils.getLineCrossBoundValues(
        {
          start: lineSegment.getNodeStart().getPosition(),
          end: lineSegment.getNodeEnd().getPosition(),
        },
        bounds,
      ).forEach(({ isLineCrossBound, crossProduct1, crossProduct2 }) => {
        if (!isLineCrossBound) {
          return;
        }
        const crossProduct = crossProduct1 + crossProduct2;
        if (crossProduct <= lineSegmentClosestDistance) {
          lineSegmentClosest = lineSegment;
          lineSegmentClosestDistance = crossProduct;
        }
      });
    });

    return lineSegmentClosest;
  };

  /**
   * ===============================================================================================
   * LineSegment
   * ===============================================================================================
   */

  getLineSegmentDirection = (nodeStart: GeoNode, nodeEnd: GeoNode) => {
    const lineSegmentKey = getLineSegmentKey(nodeStart, nodeEnd);
    return this._lineSegmentDirectionsMapOfLineSegmentKey.get(lineSegmentKey);
  };

  getLineSegmentDirectionByLineSegment = (lineSegment: GeoLineSegment) => {
    const lineSegmentKey = getLineSegmentKey(
      lineSegment.getNodeStart(),
      lineSegment.getNodeEnd(),
    );
    return this._lineSegmentDirectionsMapOfLineSegmentKey.get(lineSegmentKey);
  };

  createLineSegmentOfWay = (way: GeoWay) => {
    if (this._lineSegmentsMapOfWay.has(way)) {
      return [];
    }
    let nodeStart: GeoNode | undefined;
    const lineSegmentsCreated: GeoLineSegment[] = [];
    way.getNodes().forEach((node) => {
      if (nodeStart) {
        const lineSegment = this.createLineSegment(way, nodeStart, node);
        lineSegment && lineSegmentsCreated.push(lineSegment);
      }
      nodeStart = node;
    });
    return lineSegmentsCreated;
  };
  deleteLineSegmentsOfWay = (way: GeoWay) => {
    const result: GeoLineSegment[] = [];
    this._lineSegmentsMapOfWay.get(way)?.forEach((lineSegment) => {
      const isDeleted = this.deleteLineSegment(lineSegment);
      isDeleted && result.push(lineSegment);
    });
    return result;
  };

  createLineSegment = (way: GeoWay, nodeStart: GeoNode, nodeEnd: GeoNode) => {
    if (this.getLineSegment(way, nodeStart, nodeEnd)) {
      return undefined;
    }
    const lineSegment = new GeoLineSegment(this._map, way, nodeStart, nodeEnd, {
      visible: false,
      clickable: this._isLineSegmentClickable,
    });
    this._lineSegmentsSet.add(lineSegment);
    this._lineSegmentsMapOfLineSegmentKey.set(
      getLineSegmentKey(nodeStart, nodeEnd),
      lineSegment,
    );
    const lineSegmentsOfWay = this._lineSegmentsMapOfWay.get(way) || new Set();
    lineSegmentsOfWay.add(lineSegment);
    this._lineSegmentsMapOfWay.set(way, lineSegmentsOfWay);

    const lineSegmentsOfNodeStart =
      this._lineSegmentsMapOfNodeStart.get(nodeStart);
    if (lineSegmentsOfNodeStart) {
      lineSegmentsOfNodeStart.add(lineSegment);
    } else {
      this._lineSegmentsMapOfNodeStart.set(nodeStart, new Set([lineSegment]));
    }

    const lineSegmentsOfNodeEnd = this._lineSegmentsMapOfNodeEnd.get(nodeEnd);
    if (lineSegmentsOfNodeEnd) {
      lineSegmentsOfNodeEnd.add(lineSegment);
    } else {
      this._lineSegmentsMapOfNodeEnd.set(nodeEnd, new Set([lineSegment]));
    }

    const visibleChangeEventKey = lineSegment.addVisibleChangeListener(
      (visible) => {
        this.invokeLineSegmentVisibleChangedEventListener(lineSegment, visible);
      },
    );
    const eventListenerKeys: string[] =
      this._lineSegmentsEventListenersKeyMap.get(lineSegment) || [];
    eventListenerKeys.push(visibleChangeEventKey);
    this._lineSegmentsEventListenersKeyMap.set(lineSegment, eventListenerKeys);

    this._lineSegmentAddedEventListenerManager.invokeEventListeners(
      lineSegment,
    );
    return lineSegment;
  };

  deleteLineSegment = (lineSegment: GeoLineSegment) => {
    if (!this._lineSegmentsSet.has(lineSegment)) {
      return false;
    }
    this._lineSegmentsSet.delete(lineSegment);
    this._lineSegmentsMapOfLineSegmentKey.delete(
      getLineSegmentKey(lineSegment.getNodeStart(), lineSegment.getNodeEnd()),
    );
    const way = lineSegment.getWay();
    const lineSegmentsOfWay = this._lineSegmentsMapOfWay.get(way);
    if (lineSegmentsOfWay) {
      lineSegmentsOfWay.delete(lineSegment);
      if (lineSegmentsOfWay.size === 0) {
        this._lineSegmentsMapOfWay.delete(way);
      }
    }

    const lineSegmentsOfNodeStart = this._lineSegmentsMapOfNodeStart.get(
      lineSegment.getNodeStart(),
    );
    if (lineSegmentsOfNodeStart) {
      lineSegmentsOfNodeStart.delete(lineSegment);
      if (lineSegmentsOfNodeStart.size === 0) {
        this._lineSegmentsMapOfNodeStart.delete(lineSegment.getNodeStart());
      }
    }
    const lineSegmentsOfNodeEnd = this._lineSegmentsMapOfNodeEnd.get(
      lineSegment.getNodeEnd(),
    );
    if (lineSegmentsOfNodeEnd) {
      lineSegmentsOfNodeEnd.delete(lineSegment);
      if (lineSegmentsOfNodeEnd.size === 0) {
        this._lineSegmentsMapOfNodeEnd.delete(lineSegment.getNodeEnd());
      }
    }
    this._lineSegmentDeletedEventListenerManager.invokeEventListeners(
      lineSegment,
    );

    const eventListenerKeys =
      this._lineSegmentsEventListenersKeyMap.get(lineSegment);
    eventListenerKeys?.forEach((key) => {
      lineSegment.removeEventListener(key);
    });
    this._lineSegmentsEventListenersKeyMap.delete(lineSegment);
    lineSegment.destroy();
    return true;
  };

  divideLineSegment = (lineSegment: GeoLineSegment, nodeNew: GeoNode) => {
    const way = lineSegment.getWay();
    if (!way.hasNode(nodeNew)) {
      return undefined;
    }
    const nodeStart = lineSegment.getNodeStart();
    const nodeEnd = lineSegment.getNodeEnd();
    const lineSegmentNew1 = this.createLineSegment(way, nodeStart, nodeNew);
    const lineSegmentNew2 = this.createLineSegment(way, nodeNew, nodeEnd);

    if (!lineSegmentNew1 || !lineSegmentNew2) {
      return undefined;
    }

    this._lineSegmentDivideEventListenerManager.invokeEventListeners(
      [lineSegmentNew1, lineSegmentNew2],
      lineSegment,
    );
    this.deleteLineSegment(lineSegment);
    return {
      lineSegmentCreated: [lineSegmentNew1, lineSegmentNew2],
      lineSegmentDeleted: lineSegment,
    };
  };

  replaceLineSegment = (
    nodeStart: GeoNode,
    nodeEnd: GeoNode,
    lineSegment: GeoLineSegment,
  ) => {
    const way = lineSegment.getWay();
    if (!way.hasNode(nodeStart) || !way.hasNode(nodeEnd)) {
      return undefined;
    }
    const lineSegmentNew = this.createLineSegment(way, nodeStart, nodeEnd);
    if (!lineSegmentNew) {
      return undefined;
    }
    this._lineSegmentReplacedEventListenerManager.invokeEventListeners(
      lineSegmentNew,
      lineSegment,
    );
    this.deleteLineSegment(lineSegment);
    return {
      lineSegmentCreated: lineSegmentNew,
      lineSegmentDeleted: lineSegment,
    };
  };

  private _getNotConnectedNodes = (
    lineSegment1: GeoLineSegment,
    lineSegment2: GeoLineSegment,
  ) => {
    const nodeStart1 = lineSegment1.getNodeStart();
    const nodeEnd1 = lineSegment1.getNodeEnd();
    const nodeStart2 = lineSegment2.getNodeStart();
    const nodeEnd2 = lineSegment2.getNodeEnd();

    if (nodeStart1 === nodeStart2) {
      return [nodeEnd1, nodeEnd2];
    }
    if (nodeStart1 === nodeEnd2) {
      return [nodeEnd1, nodeStart2];
    }
    if (nodeEnd1 === nodeStart2) {
      return [nodeStart1, nodeEnd2];
    }
    if (nodeEnd1 === nodeEnd2) {
      return [nodeStart1, nodeStart2];
    }
    return undefined;
  };

  mergeLineSegments = (
    lineSegment1: GeoLineSegment,
    lineSegment2: GeoLineSegment,
  ) => {
    if (lineSegment1.getWay() !== lineSegment2.getWay()) {
      return undefined;
    }
    const nodesNotConnected = this._getNotConnectedNodes(
      lineSegment1,
      lineSegment2,
    );
    if (!nodesNotConnected) {
      return undefined;
    }
    const [nodeStart, nodeEnd] = nodesNotConnected;
    const lineSegmentNew = this.createLineSegment(
      lineSegment1.getWay(),
      nodeStart,
      nodeEnd,
    );
    if (!lineSegmentNew) {
      return undefined;
    }
    this._lineSegmentMergedEventListenerManager.invokeEventListeners(
      lineSegmentNew,
      lineSegment1,
      lineSegment2,
    );
    this.deleteLineSegment(lineSegment1);
    this.deleteLineSegment(lineSegment2);
    return {
      lineSegmentCreated: lineSegmentNew,
      lineSegmentsDeleted: [lineSegment1, lineSegment2],
    };
  };

  /**
   * ===============================================================================================
   * LineSegmentDirection
   * ===============================================================================================
   */

  getLineSegmentByLineSegmentDirection = (
    lineSegmentDirection: GeoLineSegmentDirection,
  ) => {
    const lineSegmentKey = getLineSegmentKey(
      lineSegmentDirection.getNodeStart(),
      lineSegmentDirection.getNodeEnd(),
    );
    return this._lineSegmentsMapOfLineSegmentKey.get(lineSegmentKey);
  };

  getLineSegmentDirectionsOfWay = (way: GeoWay) => {
    const lineSegmentDirections: GeoLineSegmentDirection[] = [];
    let nodeStart: GeoNode | undefined;
    way.getNodes().forEach((node) => {
      if (nodeStart) {
        const lineSegmentDirection = this.getLineSegmentDirection(
          nodeStart,
          node,
        );
        lineSegmentDirection &&
          lineSegmentDirections.push(lineSegmentDirection);
      }
      nodeStart = node;
    });
    return lineSegmentDirections;
  };

  createLineSegmentDirectionOfWay = (way: GeoWay) => {
    let nodeStart: GeoNode | undefined;
    const lineSegmentDirectionsCreated: GeoLineSegmentDirection[] = [];
    way.getNodes().forEach((node) => {
      if (nodeStart) {
        const lineSegmentDirection = this.createLineSegmentDirection(
          way,
          nodeStart,
          node,
        );
        lineSegmentDirection &&
          lineSegmentDirectionsCreated.push(lineSegmentDirection);
      }
      nodeStart = node;
    });
    return lineSegmentDirectionsCreated;
  };

  deleteLineSegmentDirectionsOfWay = (way: GeoWay) => {
    const lineSegmentsSet = this._lineSegmentDirectionsMapOfWay.get(way);
    if (!lineSegmentsSet) {
      return [];
    }

    const lineSegmentDirectionsDeleted: GeoLineSegmentDirection[] = [];
    Array.from(lineSegmentsSet).forEach((lineSegmentDirection) => {
      this._deleteLineSegmentDirection(lineSegmentDirection);
    });

    return lineSegmentDirectionsDeleted;
  };

  createLineSegmentDirection = (
    way: GeoWay,
    nodeStart: GeoNode,
    nodeEnd: GeoNode,
  ) => {
    const lineSegmentKey = getLineSegmentKey(nodeStart, nodeEnd);
    if (this._lineSegmentDirectionsMapOfLineSegmentKey.has(lineSegmentKey)) {
      return undefined;
    }
    const lineSegmentDirection = new GeoLineSegmentDirection(
      this._map,
      way,
      nodeStart,
      nodeEnd,
      {
        visible: this._isLineSegmentDirectionsVisible,
      },
    );
    this._lineSegmentDirectionsSet.add(lineSegmentDirection);
    const lineSegmentDirectionsOfWay =
      this._lineSegmentDirectionsMapOfWay.get(way) || new Set();
    lineSegmentDirectionsOfWay.add(lineSegmentDirection);
    this._lineSegmentDirectionsMapOfWay.set(way, lineSegmentDirectionsOfWay);
    this._lineSegmentDirectionsMapOfLineSegmentKey.set(
      lineSegmentKey,
      lineSegmentDirection,
    );
    const visibleChangeEventKey = lineSegmentDirection.addVisibleChangeListener(
      (visibleDirection) => {
        this.invokeLineSegmentDirectionVisibleChangeEventListener(
          lineSegmentDirection,
          visibleDirection,
        );
      },
    );
    const eventListenerKeys: string[] =
      this._lineSegmentDirectionEventListenersKeyMap.get(
        lineSegmentDirection,
      ) || [];
    eventListenerKeys.push(visibleChangeEventKey);
    this._lineSegmentDirectionEventListenersKeyMap.set(
      lineSegmentDirection,
      eventListenerKeys,
    );
    this.invokeLineSegmentDirectionAddEventListener(lineSegmentDirection);
    this.invokeLineSegmentDirectionVisibleChangeEventListener(
      lineSegmentDirection,
      lineSegmentDirection.isVisible(),
    );
    return lineSegmentDirection;
  };

  deleteLineSegmentDirection = (
    way: GeoWay,
    nodeStart: GeoNode,
    nodeEnd: GeoNode,
  ) => {
    const lineSegmentKey = getLineSegmentKey(nodeStart, nodeEnd);
    const lineSegmentDirection =
      this._lineSegmentDirectionsMapOfLineSegmentKey.get(lineSegmentKey);
    if (!lineSegmentDirection) {
      return undefined;
    }

    return this._deleteLineSegmentDirection(lineSegmentDirection);
  };

  private _deleteLineSegmentDirection = (
    lineSegmentDirection: GeoLineSegmentDirection,
  ) => {
    const way = lineSegmentDirection.getWay();
    const lineSegmentKey = getLineSegmentKey(
      lineSegmentDirection.getNodeStart(),
      lineSegmentDirection.getNodeEnd(),
    );
    this._lineSegmentDirectionsSet.delete(lineSegmentDirection);
    const lineSegmentDirectionsOfWay =
      this._lineSegmentDirectionsMapOfWay.get(way);
    if (lineSegmentDirectionsOfWay) {
      lineSegmentDirectionsOfWay.delete(lineSegmentDirection);
      if (lineSegmentDirectionsOfWay.size === 0) {
        this._lineSegmentDirectionsMapOfWay.delete(way);
      }
    }
    this._lineSegmentDirectionsMapOfLineSegmentKey.delete(lineSegmentKey);
    this._lineSegmentDirectionEventListenersKeyMap
      .get(lineSegmentDirection)
      ?.forEach((key) => {
        lineSegmentDirection.removeEventListener(key);
      });
    this._lineSegmentDirectionEventListenersKeyMap.delete(lineSegmentDirection);
    this.invokeLineSegmentDirectionDeleteEventListener(lineSegmentDirection);
    lineSegmentDirection.destroy();
    return lineSegmentDirection;
  };

  /**
   * ===============================================================================================
   * Etc
   * ===============================================================================================
   */

  updatePosition = (node: GeoNode) => {
    const lineSegmentsOfNodeStart = this._lineSegmentsMapOfNodeStart.get(node);
    const lineSegmentsOfNodeEnd = this._lineSegmentsMapOfNodeEnd.get(node);
    const lineSegments = StructSetUtils.union(
      lineSegmentsOfNodeStart || new Set<GeoLineSegment>(),
      lineSegmentsOfNodeEnd || new Set<GeoLineSegment>(),
    );

    lineSegments.forEach((lineSegment) => {
      lineSegment.updatePath();
      const lineSegmentKey = getLineSegmentKey(
        lineSegment.getNodeStart(),
        lineSegment.getNodeEnd(),
      );
      this._lineSegmentDirectionsMapOfLineSegmentKey
        .get(lineSegmentKey)
        ?.updatePath();
      this._lineSegmentPositionChangedEventListenerManager.invokeEventListeners(
        lineSegment,
      );
    });
  };

  updatePositionAllLineSegments = () => {
    this._lineSegmentsSet.forEach((lineSegment) => {
      const { start: startLatLng, end: endLatLng } = lineSegment.getPath();
      const lineSegmentNodeStartLatLng = lineSegment
        .getNodeStart()
        .getPosition();
      const lineSegmentNodeEndLatLng = lineSegment.getNodeEnd().getPosition();
      if (
        startLatLng.lat() !== lineSegmentNodeStartLatLng.lat ||
        startLatLng.lng() !== lineSegmentNodeStartLatLng.lng ||
        endLatLng.lat() !== lineSegmentNodeEndLatLng.lat ||
        endLatLng.lng() !== lineSegmentNodeEndLatLng.lng
      ) {
        lineSegment.updatePath();
        this._lineSegmentPositionChangedEventListenerManager.invokeEventListeners(
          lineSegment,
        );
      }
    });
  };

  /**
   * ===============================================================================================
   * Policy
   * ===============================================================================================
   */
  setLineSegmentEnable = (isLineSegmentEnable: boolean) => {
    if (this._isLineSegmentEnable === isLineSegmentEnable) {
      return false;
    }
    this._isLineSegmentEnable = isLineSegmentEnable;
    this._featureManager.getAllWays().forEach((way) => {
      if (isLineSegmentEnable) {
        this.createLineSegmentOfWay(way);
      } else {
        this.deleteLineSegmentsOfWay(way);
      }
    });
    return true;
  };
  isLineSegmentEnable = () => {
    return this._isLineSegmentEnable;
  };
  setLineSegmentClickable = (isLineSegmentClickable: boolean) => {
    if (this._isLineSegmentClickable === isLineSegmentClickable) {
      return false;
    }
    this._isLineSegmentClickable = isLineSegmentClickable;
    this._lineSegmentsSet.forEach((lineSegment) => {
      lineSegment.setClickable(isLineSegmentClickable);
    });
    return true;
  };
  isLineSegmentClickable = () => {
    return this._isLineSegmentClickable;
  };
  setLineSegmentDirectionEnable = (isLineSegmentDirectionEnable: boolean) => {
    if (this._isLineSegmentDirectionEnable === isLineSegmentDirectionEnable) {
      return false;
    }
    this._isLineSegmentDirectionEnable = isLineSegmentDirectionEnable;
    this._featureManager.getAllWays().forEach((way) => {
      if (isLineSegmentDirectionEnable) {
        this.createLineSegmentDirectionOfWay(way);
      } else {
        this.deleteLineSegmentDirectionsOfWay(way);
      }
    });
    return true;
  };
  isLineSegmentDirectionEnable = () => {
    return this._isLineSegmentDirectionEnable;
  };
  setPolicy = (policy: GeoLineSegmentPolicy) => {
    this.setLineSegmentEnable(policy.isLineSegmentEnable);
    this.setLineSegmentClickable(policy.isLineSegmentClickable);
    this.setLineSegmentDirectionEnable(policy.isLineSegmentDirectionEnable);
  };
  getPolicy = (): GeoLineSegmentPolicy => {
    return {
      isLineSegmentEnable: this.isLineSegmentEnable(),
      isLineSegmentClickable: this.isLineSegmentClickable(),
      isLineSegmentDirectionEnable: this.isLineSegmentDirectionEnable(),
    };
  };

  /**
   * LineSegment의 방향을 표시하는 화살표를 보이거나 숨김
   * GeoLayerPolicy.lineSegmentPolicy.directionEnable가 true인 경우에만 동작
   * @param visible
   */
  setLineSegmentDirectionsVisible = (visible: boolean): boolean => {
    if (this._isLineSegmentDirectionsVisible === visible) {
      return false;
    }
    this._isLineSegmentDirectionsVisible = visible;
    this._lineSegmentDirectionsSet.forEach((lineSegmentDirection) => {
      lineSegmentDirection.setVisible(visible);
    });
    this.invokeLineSegmentDirectionsVisibleChangeStickyEventListener(visible);
    return true;
  };
  isLineSegmentDirectionsVisible = () => {
    return this._isLineSegmentDirectionsVisible;
  };

  /**
   * ===============================================================================================
   * EventListener
   * ===============================================================================================
   */
  addLineSegmentAddedEventListener = (
    key: string,
    listener: (lineSegment: GeoLineSegment) => void,
  ) => {
    return this._lineSegmentAddedEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeLineSegmentAddedEventListener = (key: string) => {
    return this._lineSegmentAddedEventListenerManager.removeEventListener(key);
  };
  addLineSegmentDeletedEventListener = (
    key: string,
    listener: (lineSegment: GeoLineSegment) => void,
  ) => {
    return this._lineSegmentDeletedEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeLineSegmentDeletedEventListener = (key: string) => {
    return this._lineSegmentDeletedEventListenerManager.removeEventListener(
      key,
    );
  };
  addLineSegmentDividedEventListener = (
    key: string,
    listener: (
      lineSegmentsAdded: GeoLineSegment[],
      lineSegmentDeleted: GeoLineSegment,
    ) => void,
  ) => {
    return this._lineSegmentDivideEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeLineSegmentDividedEventListener = (key: string) => {
    return this._lineSegmentDivideEventListenerManager.removeEventListener(key);
  };
  addLineSegmentReplacedEventListener = (
    key: string,
    listener: (
      lineSegmentAdded: GeoLineSegment,
      lineSegmentDeleted: GeoLineSegment,
    ) => void,
  ) => {
    return this._lineSegmentReplacedEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeLineSegmentReplacedEventListener = (key: string) => {
    return this._lineSegmentReplacedEventListenerManager.removeEventListener(
      key,
    );
  };
  addLineSegmentMergedEventListener = (
    key: string,
    listener: (
      lineSegmentAdded: GeoLineSegment,
      lineSegmentDeleted1: GeoLineSegment,
      lineSegmentDeleted2: GeoLineSegment,
    ) => void,
  ) => {
    return this._lineSegmentMergedEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeLineSegmentMergedEventListener = (key: string) => {
    return this._lineSegmentMergedEventListenerManager.removeEventListener(key);
  };
  addLineSegmentPositionChangedEventListener = (
    key: string,
    listener: (lineSegment: GeoLineSegment) => void,
  ) => {
    return this._lineSegmentPositionChangedEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeLineSegmentPositionChangedEventListener = (key: string) => {
    return this._lineSegmentPositionChangedEventListenerManager.removeEventListener(
      key,
    );
  };
  addLineSegmentClickEventListener = (
    key: string,
    listener: (
      lineSegment: GeoLineSegment,
      event: google.maps.MapMouseEvent,
    ) => void,
  ) => {
    return this._lineSegmentClickEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeLineSegmentClickEventListener = (key: string) => {
    return this._lineSegmentClickEventListenerManager.removeEventListener(key);
  };
  invokeLineSegmentClickEventListener = (
    lineSegment: GeoLineSegment,
    event: google.maps.MapMouseEvent,
  ) => {
    if (EnvUtils.isQaMode() || EnvUtils.isDevMode()) {
      this._lineSegmentClickLogger(lineSegment);
    }
    this._lineSegmentClickEventListenerManager.invokeEventListeners(
      lineSegment,
      event,
    );
  };

  addLineSegmentVisibleChangedEventListener = (
    key: string,
    listener: (lineSegment: GeoLineSegment, visible: boolean) => void,
  ) => {
    return this._lineSegmentVisibleChangedEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeLineSegmentVisibleChangedEventListener = (key: string) => {
    return this._lineSegmentVisibleChangedEventListenerManager.removeEventListener(
      key,
    );
  };
  invokeLineSegmentVisibleChangedEventListener = (
    lineSegment: GeoLineSegment,
    visible: boolean,
  ) => {
    this._lineSegmentVisibleChangedEventListenerManager.invokeEventListeners(
      lineSegment,
      visible,
    );
  };

  addLineSegmentDirectionsVisibleChangeStickyEventListener = (
    key: string,
    listener: (visible: boolean) => void,
  ) => {
    const result =
      this._lineSegmentDirectionsVisibleChangeStickyEventListenerManager.addEventListener(
        key,
        listener,
      );
    listener(this._isLineSegmentDirectionsVisible);
    return result;
  };
  removeLineSegmentDirectionsVisibleChangeStickyEventListener = (
    key: string,
  ) => {
    return this._lineSegmentDirectionsVisibleChangeStickyEventListenerManager.removeEventListener(
      key,
    );
  };
  invokeLineSegmentDirectionsVisibleChangeStickyEventListener = (
    visible: boolean,
  ) => {
    this._lineSegmentDirectionsVisibleChangeStickyEventListenerManager.invokeEventListeners(
      visible,
    );
  };

  addLineSegmentDirectionAddEventListener = (
    key: string,
    listener: (lineSegmentDirection: GeoLineSegmentDirection) => void,
  ) => {
    return this._lineSegmentDirectionAddEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeLineSegmentDirectionAddEventListener = (key: string) => {
    return this._lineSegmentDirectionAddEventListenerManager.removeEventListener(
      key,
    );
  };
  invokeLineSegmentDirectionAddEventListener = (
    lineSegmentDirection: GeoLineSegmentDirection,
  ) => {
    this._lineSegmentDirectionAddEventListenerManager.invokeEventListeners(
      lineSegmentDirection,
    );
  };

  addLineSegmentDirectionDeleteEventListener = (
    key: string,
    listener: (lineSegmentDirection: GeoLineSegmentDirection) => void,
  ) => {
    return this._lineSegmentDirectionDeleteEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeLineSegmentDirectionDeleteEventListener = (key: string) => {
    return this._lineSegmentDirectionDeleteEventListenerManager.removeEventListener(
      key,
    );
  };
  invokeLineSegmentDirectionDeleteEventListener = (
    lineSegmentDirection: GeoLineSegmentDirection,
  ) => {
    this._lineSegmentDirectionDeleteEventListenerManager.invokeEventListeners(
      lineSegmentDirection,
    );
  };

  addLineSegmentDirectionVisibleChangeEventListener = (
    key: string,
    listener: (
      lineSegmentDirection: GeoLineSegmentDirection,
      visible: boolean,
    ) => void,
  ) => {
    return this._lineSegmentDirectionVisibleChangeEventListenerManager.addEventListener(
      key,
      listener,
    );
  };
  removeLineSegmentDirectionVisibleChangeEventListener = (key: string) => {
    return this._lineSegmentDirectionVisibleChangeEventListenerManager.removeEventListener(
      key,
    );
  };
  invokeLineSegmentDirectionVisibleChangeEventListener = (
    lineSegmentDirection: GeoLineSegmentDirection,
    visible: boolean,
  ) => {
    this._lineSegmentDirectionVisibleChangeEventListenerManager.invokeEventListeners(
      lineSegmentDirection,
      visible,
    );
  };

  destroy = () => {
    this._lineSegmentsSet.forEach((lineSegment) => {
      lineSegment.destroy();
    });
    this._lineSegmentsSet.clear();
    this._lineSegmentsMapOfWay.clear();
    this._lineSegmentsMapOfNodeStart.clear();
    this._lineSegmentsMapOfNodeEnd.clear();

    this._lineSegmentAddedEventListenerManager.destroy();
    this._lineSegmentDeletedEventListenerManager.destroy();
    this._lineSegmentDivideEventListenerManager.destroy();
    this._lineSegmentReplacedEventListenerManager.destroy();
    this._lineSegmentMergedEventListenerManager.destroy();
    this._lineSegmentPositionChangedEventListenerManager.destroy();
    this._lineSegmentClickEventListenerManager.destroy();

    this._lineSegmentDirectionsVisibleChangeStickyEventListenerManager.destroy();
    this._lineSegmentDirectionVisibleChangeEventListenerManager.destroy();
    this._lineSegmentDirectionAddEventListenerManager.destroy();
    this._lineSegmentDirectionDeleteEventListenerManager.destroy();
    this._lineSegmentDirectionsSet.forEach((lineSegmentDirection) => {
      lineSegmentDirection.destroy();
    });
    this._lineSegmentDirectionsSet.clear();
    this._lineSegmentDirectionsMapOfWay.clear();
    this._lineSegmentDirectionsMapOfLineSegmentKey.clear();
    this._lineSegmentsMapOfLineSegmentKey.clear();
  };

  private _lineSegmentClickLogger = (lineSegment: GeoLineSegment) => {
    console.log('GoogleMap:: LineSegment Clicked');
    console.table({
      lineSegmentId: lineSegment.getId(),
      lineSegmentNodeIds: lineSegment.getNodes().map((node) => node.getId()),
      lineSegmentWayId: lineSegment.getWay().getId(),
      lineSegmentWayNodeIds: lineSegment
        .getWay()
        .getNodes()
        .map((node) => node.getId()),
    });
  };
}

export default GeoLineSegmentManager;
