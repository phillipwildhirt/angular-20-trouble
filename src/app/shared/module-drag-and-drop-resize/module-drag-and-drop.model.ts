export class ModuleDraggableItem {
  constructor(
    public zones: string[],
    public data: any,
  ) {}
}

export class ModuleDroppableZone {
  constructor(
    public zone: string,
    public data?: any,
  ) {}
}

export interface ModuleDroppableEventObject {
  data: any;
  zone: any;
}
