export class ScrollXY {
  constructor(
    /** @desc horizontal scroll position.  */
    public readonly x: number,

    /** @desc vertical scroll position.  */
    public readonly y: number,

    /** @desc width of container.  */
    public readonly w: number,

    /** @desc height of container.  */
    public readonly h: number,

    /** @desc total width of container's scrollable area.  */
    public readonly scrollW: number,

    /** @desc total height of container's scrollable area.  */
    public readonly scrollH: number,
  ) {}
}
