import {
  GeoMapBoundsType,
  GeoLatLngType,
} from '@design-system/types/geoMap.type';
import { GeoMapUtils } from '@design-system/utils/geo-map/GeoMapUtils';
import { GenIdType } from '@design-system/utils/geo-map/IdGenerator';

export interface GeoRectangleConstructType {
  id: GenIdType;
  googleMap: google.maps.Map;
  bounds: GeoMapBoundsType;
  options?: GeoRectangleOptionType;
}
export interface GeoRectangleOptionType extends Omit<
  google.maps.RectangleOptions,
  | 'clickable'
  | 'draggable'
  | 'editable'
  | 'strokePosition'
  | 'visible'
  | 'map'
  | 'bounds'
> {}

class GeoRectangle {
  static DefaultRectangleOptions: google.maps.RectangleOptions = {
    clickable: false,
    draggable: false,
    editable: false,
  };

  private _id: GenIdType;
  // 구글맵의 marker
  private _rectangle: google.maps.Rectangle;
  /**
   * Node의 isVisible은 marker의 content가 NONE 컴포넌트이면 false 입니다.
   * visible로 바꾸면 마커가 원래 가지고 있는 content로 스왑하는 것으로 보이거나 안보이게 하거나 합니다.
   */
  private readonly _googleMap: google.maps.Map | null;
  constructor({ id, googleMap, bounds, options }: GeoRectangleConstructType) {
    this._id = id;
    this._googleMap = googleMap;
    this._rectangle = new google.maps.Rectangle({
      ...GeoRectangle.DefaultRectangleOptions,
      bounds,
      map: this._googleMap,
      ...options,
    });
  }
  getId = () => this._id;
  getMapRectangle = () => this._rectangle;
  getBounds = (): GeoMapBoundsType | undefined => {
    const bounds = this._rectangle.getBounds();
    if (!bounds) {
      return undefined;
    }
    return GeoMapUtils.toGeoBoundsFromGoogleBounds(bounds);
  };

  updatePosition = (
    startPosition: GeoLatLngType,
    endPosition: GeoLatLngType,
  ) => {
    const bounds = GeoMapUtils.makeBoundsFromPositions(
      startPosition,
      endPosition,
    );
    this._rectangle.setBounds(bounds);
  };

  destroy = () => {
    this._rectangle.setMap(null);
  };
}

export default GeoRectangle;
