import { Injectable } from '@angular/core';
import { ModuleViewService } from '@app/shared/module-drag-and-drop-resize/module-view.service';

@Injectable()
export class ModuleDragService {
  private zoneIDs: string[] = [];
  private availableZones: any = {};

  constructor() {}
  /**
   * @desc responsible for storing the draggable elements
   zone target.
   * @note Use union type for any other Service classes that could be used here to next isDragging$
   * @param {string[]} zoneIDs - the zoneIDs
   * @param moduleViewService
   */
  public startDrag(zoneIDs: string[], moduleViewService: ModuleViewService) {
    this.zoneIDs = zoneIDs;
    this.highLightAvailableZones();
    moduleViewService.isDragging$.next(true);
  }

  public endDrag(moduleViewService: ModuleViewService): void {
    this.removeHighLightedAvailableZones();
    this.zoneIDs = [];
    moduleViewService.isDragging$.next(false);
  }

  /**
   * @desc responsible for matching the droppable element
     with a draggable element
   * @param {string} zoneID - the zone ID to search for
   */
  public accepts(zoneID: string): boolean {
    if (this.zoneIDs.length > 0) {
      return (this.zoneIDs.indexOf(zoneID) > -1);
    }
    return false;
  }

  /**
   * @desc responsible for removing highlighted available zones
     that a draggable element can be added too.
   */
  public removeHighLightedAvailableZones(): void {
    this.zoneIDs.forEach((zone: string) => {
      this.availableZones[zone].end();
    });
  }

  /**
   * @desc responsible for adding an available zone
   * @param {{ begin: CallableFunction, end: CallableFunction }} zoneID - zone key from DroppableZone
   * @param {string} obj - reference to a start and stop object
   */
  public addAvailableZone(zoneID: string, obj: { begin: Function, end: Function }): void {
    this.availableZones[zoneID] = obj;
  }

  /**
   * @desc responsible for removing an available zone
   * @param {string} zoneID - the zone ID to search for
   */
  public removeAvailableZone(zoneID: string): void {
    delete this.availableZones[zoneID];
  }

  /**
   * @desc responsible for highlighting available zones
   * that a draggable element can be added too.
   */
  private highLightAvailableZones(): void {
    this.zoneIDs.forEach((zone: string) => {
      this.availableZones[zone].begin();
    });
  }
}
