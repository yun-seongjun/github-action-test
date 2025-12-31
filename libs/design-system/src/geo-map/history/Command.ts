import { GeoLatLngType } from '@design-system/types';

abstract class Command {
  abstract do(): void;
  abstract undo(): void;
  abstract destroy(): void;
  abstract getCurrentCenter(): GeoLatLngType | null;
}

export default Command;
