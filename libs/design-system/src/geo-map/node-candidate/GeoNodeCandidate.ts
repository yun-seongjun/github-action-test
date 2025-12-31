import GeoNode from '@design-system/geo-map/feature/GeoNode';
import {
  GeoNodeDragEndEventType,
  GeoNodeDragEventType,
} from '@design-system/geo-map/feature/GeoNodeEventManager';
import { GeoLatLngType, MarkerEnum } from '@design-system/types/geoMap.type';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';
import NodeContentsFuncFactory from '@design-system/components/geo-map/NodeContentsFuncFactory';

class GeoNodeCandidate {
  private readonly _map: google.maps.Map;
  private readonly _node: GeoNode;
  private _nodeCandidate: GeoNode;
  private _polyLine: google.maps.Polyline;
  private _centerLine: google.maps.Polyline;

  constructor(
    id: number,
    map: google.maps.Map,
    node: GeoNode,
    latLng: GeoLatLngType,
  ) {
    this._map = map;
    this._node = node;
    this._nodeCandidate = new GeoNode({
      position: latLng,
      id: id,
      options: {
        ...NodeContentsFuncFactory[MarkerEnum.EDIT_NODE](id),
        visible: true,
        draggable: true,
        opacity: 0,
      },
      googleMap: map,
    });
    this._polyLine = new google.maps.Polyline({
      draggable: false,
      clickable: false,
    });
    this._centerLine = new google.maps.Polyline({
      draggable: false,
      clickable: false,
    });
  }

  getId = () => {
    return this._nodeCandidate.getId();
  };

  reset = () => {
    this._nodeCandidate.setPosition(this._node.getPosition());
    this._nodeCandidate.setOpacity(0);
    this.hidePolyLine();
    this.hideCenterLine();
    this.updatePath();
  };

  addDragStartEventListener = (
    listener: (event: google.maps.MapMouseEvent) => void,
  ) => {
    this._nodeCandidate.addDragStartEventListener(listener);
  };

  addDragEventListener = (listener: (event: GeoNodeDragEventType) => void) => {
    this._nodeCandidate.addDragEventListener(listener);
  };

  addDragEndEventListener = (
    listener: (event: GeoNodeDragEndEventType) => void,
  ) => {
    this._nodeCandidate.addDragEndEventListener(listener);
  };

  updatePath = () => {
    const pathNew = GeoMapUtils.getPath([this._node, this._nodeCandidate]);
    this._polyLine.setPath(pathNew);
    this._centerLine.setPath(pathNew);
  };

  setOpacity = (opacity: number) => {
    this._nodeCandidate.setOpacity(opacity);
  };
  getOpacity = () => {
    return this._nodeCandidate.getOpacity();
  };

  setNodeInnerContentStyle = (style: {
    bgColor?: string;
    borderColor?: string;
    strokeWidth?: number;
    d?: string;
  }) => {
    this._nodeCandidate.setNodeInnerContentStyle(style);
  };

  setPosition = (position: GeoLatLngType) => {
    this._nodeCandidate.setPosition(position);
    this.updatePath();
  };
  getPosition = () => {
    return this._nodeCandidate.getPosition();
  };

  setInnerVisible = (visible: boolean) => {
    this._nodeCandidate.setInnerVisible(visible);
  };
  getInnerVisible = () => {
    return this._nodeCandidate.isInnerVisible();
  };

  setClickable = (clickable: boolean) => {
    this._nodeCandidate.setClickable(clickable);
  };
  getClickable = () => {
    return this._nodeCandidate.isClickable();
  };

  setDraggable = (draggable: boolean) => {
    this._nodeCandidate.setDraggable(draggable);
  };
  getDraggable = () => {
    return this._nodeCandidate.isDraggable();
  };

  showPolyLine = () => {
    this._polyLine.setMap(this._map);
    this.updatePath();
  };
  hidePolyLine = () => {
    this._polyLine.setMap(null);
  };
  setPolyLineStyle = (options: google.maps.PolylineOptions) => {
    this._polyLine.setOptions(options);
  };

  showCenterLine = () => {
    this._centerLine.setMap(this._map);
  };
  hideCenterLine = () => {
    this._centerLine.setMap(null);
  };
  setCenterLineStyle = (options: google.maps.PolylineOptions) => {
    this._centerLine.setOptions(options);
  };

  getNodeTargeted = () => {
    return this._node;
  };
  getNodeCandidate = () => {
    return this._nodeCandidate;
  };

  destroy = () => {
    this._polyLine.setMap(null);
    this._centerLine.setMap(null);
    this._nodeCandidate.destroy();
  };
}

export default GeoNodeCandidate;
