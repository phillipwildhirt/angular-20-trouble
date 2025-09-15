import { ModuleDraggableItem } from '@app/shared/module-drag-and-drop-resize/module-drag-and-drop.model';

export enum ModuleViewAdjustAction {
  rearrange = 'rearrange',
  resize = 'resize',
  unknown = 'unknown'
}

export class ModulesAndActionType {
  constructor (public type: ModuleViewAdjustAction,
               public modules: ModuleDraggableItem[][]
               ) {}
}
