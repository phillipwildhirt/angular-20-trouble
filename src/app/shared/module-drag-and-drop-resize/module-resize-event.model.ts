export class ModuleResizeEvent {
  constructor(
    public axis: string,
    public initialSizePercent: number,
    public finalDeltaPixels: number,
    public row: number,
  ) {}
}
