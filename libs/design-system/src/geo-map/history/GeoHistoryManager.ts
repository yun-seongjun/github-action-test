import Command from './Command';
import EventListenerManager from '@design-system/geo-map/event/EventListenerManager';
import { GeoMapOptionType } from '@design-system/geo-map';

class GeoHistoryManager {
  private _undoStack: Command[] = [];
  private _redoStack: Command[] = [];
  private _isUndoEnable = false;
  private _isRedoEnable = false;
  private _map: google.maps.Map;

  private _isUndoEnabledChangedEventListenerManager: EventListenerManager<
    string,
    (isUndoEnabled: boolean) => void
  > = new EventListenerManager();
  private _isRedoEnabledChangedEventListenerManager: EventListenerManager<
    string,
    (isRedoEnabled: boolean) => void
  > = new EventListenerManager();
  private static readonly MAX_STACK_SIZE = 10;

  constructor(googleMap: google.maps.Map) {
    this._map = googleMap;
  }

  private setCenter(center: GeoMapOptionType['center']) {
    try {
      this._map.setCenter(center);
      return true;
    } catch (error) {
      console.log('ERR:: GeoMap:: setCenter::', error);
      return false;
    }
  }

  register(command: Command) {
    this._undoStack.push(command);

    if (this._undoStack.length > GeoHistoryManager.MAX_STACK_SIZE) {
      const removedCommand = this._undoStack.shift();
      removedCommand?.destroy();
    }

    this._redoStack = [];
    this._syncStackStatus();
  }

  undo() {
    if (this.isUndoEnable()) {
      const command = this._undoStack.pop();
      if (command) {
        command.undo();
        const currentCenter = command.getCurrentCenter();
        if (currentCenter) {
          this.setCenter(currentCenter);
        }
        this._redoStack.push(command);
      }
      this._syncStackStatus();
    }
  }

  redo() {
    if (this.isRedoEnable()) {
      const command = this._redoStack.pop();
      if (command) {
        command.do();
        const currentCenter = command.getCurrentCenter();
        if (currentCenter) {
          this.setCenter(currentCenter);
        }
        this._undoStack.push(command);
      }
      this._syncStackStatus();
    }
  }

  private _syncStackStatus() {
    this.setUndoEnable(this._undoStack.length > 0);
    this.setRedoEnable(this._redoStack.length > 0);
    console.log('@@ this._redoStack.length', this._redoStack.length);
    console.log('@@ this._undoStack.length', this._undoStack.length);
  }

  isUndoEnable() {
    return this._isUndoEnable;
  }
  setUndoEnable(enable: boolean) {
    if (this._isUndoEnable === enable) return;
    this._isUndoEnable = enable;
    this._isUndoEnabledChangedEventListenerManager.invokeEventListeners(
      this._isUndoEnable,
    );
  }

  isRedoEnable() {
    return this._isRedoEnable;
  }
  setRedoEnable(enable: boolean) {
    if (this._isRedoEnable === enable) return;
    this._isRedoEnable = enable;
    this._isRedoEnabledChangedEventListenerManager.invokeEventListeners(
      this._isRedoEnable,
    );
  }

  addUndoEnableEventListener =
    this._isUndoEnabledChangedEventListenerManager.addEventListener;
  removeUndoEnableEventListener =
    this._isUndoEnabledChangedEventListenerManager.removeEventListener;

  addRedoEnableEventListener =
    this._isRedoEnabledChangedEventListenerManager.addEventListener;
  removeRedoEnableEventListener =
    this._isRedoEnabledChangedEventListenerManager.removeEventListener;

  clear() {
    this._redoStack.forEach((command) => {
      command.destroy();
    });
    this._undoStack.forEach((command) => {
      command.destroy();
    });
    this._undoStack = [];
    this._redoStack = [];
    this._syncStackStatus();
  }

  destroy() {
    this._redoStack.forEach((command) => {
      command.destroy();
    });
    this._undoStack.forEach((command) => {
      command.destroy();
    });
    this._undoStack = [];
    this._redoStack = [];
    this._isUndoEnabledChangedEventListenerManager.destroy();
    this._isRedoEnabledChangedEventListenerManager.destroy();
  }
}

export default GeoHistoryManager;
