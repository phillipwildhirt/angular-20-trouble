import { Component, ElementRef, Input, OnInit, Renderer2, TemplateRef, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { PlacementArray } from '@ng-bootstrap/ng-bootstrap/';
import { take, takeUntil } from 'rxjs/operators';
import { interval, Subject } from 'rxjs';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { asyncDelay } from '@app/shared/utilities-and-functions/async-delay';
import { coerceNumberProperty, NumberInput } from '@angular/cdk/coercion';

/** Any number from 0 to 12 */
type SpecialNumberInput = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | null | undefined;

export enum NgbPlacement {
  auto = 'auto',
  top = 'top',
  topStart = 'top-start',
  topLeft = 'top-left',
  topEnd = 'top-end',
  topRight = 'top-right',
  bottom = 'bottom',
  bottomStart = 'bottom-start',
  bottomLeft = 'bottom-left',
  bottomEnd = 'bottom-end',
  bottomRight = 'bottom-right',
  start = 'start',
  left = 'left',
  startTop = 'start-top',
  leftTop = 'left-top',
  startBottom = 'start-bottom',
  leftBottom = 'left-bottom',
  end = 'end',
  right = 'right',
  endTop = 'end-top',
  rightTop = 'right-top',
  endBottom = 'end-bottom',
  rightBottom = 'right-bottom'
}

@Component({
  selector: 'dps-help-tooltip',
  template: `
    <div class="flex-start align-items-center flex-shrink-1 no-select clickable"
         [class]="topLevelClass"
         (click)="onClick()"
         (mouseenter)="onMouseEnter()"
         (mouseleave)="onMouseExit()">
      @if (labelString.length > 0) {
        <div class="pe-1 text-dpsblue-550">{{ labelString }}</div>
      }
      <ng-container *ngTemplateOutlet="labelTemplate"/>
      <div id="helpTooltipWithWidth"
           #tooltip="ngbTooltip"
           [class]="style + ' ' + tooltipToggleLevelClass"
           [ngbTooltip]="value"
           [container]="containerBody ? 'body' : ''"
           tooltipClass="help-tooltip-window"
           [ngClass]="hoverClass"
           [placement]="placement"
           [triggers]="'manual'">
        @if (!tooltip.isOpen() && size > 0) {
          <i class="bi" [class]="icon"></i>
        }
        @if (tooltip.isOpen() && size > 0) {
          <i class="bi" [class]="activeColor + ' ' + iconToggled"></i>
        }
      </div>
      @if (followingString.length > 0 || followingTemplate) {
        <div class="ps-1" [class]="tooltip.isOpen() ? activeColor : hoverClass">
          @if (followingString.length > 0) {
            <div>{{ followingString }}</div>
          }
          <ng-container *ngTemplateOutlet="followingTemplate"/>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .help-tooltip-window > .tooltip-inner {
        text-align: left;
      }
    `
  ],
  imports: [
    NgbTooltip,
    NgClass,
    NgTemplateOutlet
  ],
  encapsulation: ViewEncapsulation.None
})
export class HelpTooltipComponent implements OnInit {
  private renderer = inject(Renderer2);
  private elementRef = inject(ElementRef);

  /**
   * @desc hoveredColor is the bootstrap color for the circle ? when the mouse is over it or it is clicked
   * @param string
   */
  @Input() public activeColor: string = 'dpsblue';

  /**
   * @desc defaultColor is the bootstrap color for the circle ? when the mouse is not over it
   * @param string
   */
  @Input() public defaultColor: string = 'dpsblue-light';

  /**
   * @desc size is a scale from 0 to 12 with 1 being the smallest (values > 0 match spacer sizes, 0 is no icon)
   * @param string
   */
  @Input()
  get size(): number { return this._size; }
  set size(value: SpecialNumberInput) {
    this._size = coerceNumberProperty(value) as number;
  }
  private _size: number = 4;

  /**
   * @desc max pixel size of the desired tooltip
   * @param string
   */
  @Input() public tipMaxWidth: number | undefined = undefined;

  /**
   * @desc can be any valid bootstrap placement (see enum)
   * @param NgbPlacement
   */
  @Input() public placement: PlacementArray = NgbPlacement.auto;

  /**
   * @desc value is the text or HTML displayed as a label for the icon that shows the Tooltip (optional)
   * @param string | TemplateRef<any>
   */
  @Input() public label: string | TemplateRef<any> | undefined = undefined;

  /**
   * @desc value is the text or HTML displayed following the icon that shows the Tooltip (optional)
   * @param string | TemplateRef<any>
   */
  @Input() public followingClickableText: string | TemplateRef<any> | undefined = undefined;

  /**
   * @desc space seperated string of classes for the div around the label and icon (optional)
   * @param string
   */
  @Input() public topLevelClass: string = '';

  /**
   * @desc space seperated string of classes for the div that toggles the tooltip (optional)
   * @param string
   */
  @Input() public tooltipToggleLevelClass: string = '';

  /**
   * @desc value is the text or HTML displayed in the Tooltip
   * @param string | TemplateRef<any>
   */
  @Input({required: true}) public value: string | TemplateRef<any> = 'Add your Tooltip text.';

  /**
   * @desc icon string for normal state (Optional)
   * @param string
   */
  @Input() public icon: string = 'bi-question-circle';

  /**
   * @desc icon string for toggled state (Optional)
   * @param string
   */
  @Input() public iconToggled: string = 'bi-question-circle-fill';

  /**
   * @desc The opening delay in ms. Works only for “non-manual” opening triggers. (Optional - autoShow must be true to have any effect.)
   * @param number
   */
  @Input()
  get openDelay(): number { return this._openDelay; }
  set openDelay(value: NumberInput) {
    this._openDelay = coerceNumberProperty(value);
  }
  private _openDelay: number = 0;

  /**
   * @desc If true, the tip will show after OpenDelay ms. (Optional)
   * @param boolean
   */
  @Input() public autoShow = false;
  /**
   * Add container to body.
   * @type {boolean}
   */
  @Input() public containerBody: boolean = false;

  public style = '';
  public hoverClass = '';
  public labelTemplate: TemplateRef<any> | null = null;
  public labelString: string = '';
  public followingTemplate: TemplateRef<any> | null = null;
  public followingString: string = '';
  public mouseAction$ = new Subject<string>();
  public stopTooltipShow$ = new Subject<void>();
  public lastMouseAction = '';
  @ViewChild('tooltip') tip: NgbTooltip | undefined;

  ngOnInit(): void {
    this.defaultColor = this.getValidColor(this.defaultColor);
    this.activeColor = this.getValidColor(this.activeColor);
    this.hoverClass = this.defaultColor;

    if (this.size > 0 && this.size < 13)
      this.style += 'icon-' + this.size;

    if (this.label instanceof TemplateRef)
      this.labelTemplate = this.label;
    else if (this.label && this.label.length > 0)
      this.labelString = this.label;

    if (this.followingClickableText instanceof TemplateRef)
      this.followingTemplate = this.followingClickableText;
    else if (this.followingClickableText && this.followingClickableText.length > 0)
      this.followingString = this.followingClickableText;


    this.mouseAction$.subscribe((state: string) => {
      if (state === 'ENTER' && this.lastMouseAction !== 'ENTER' && this.lastMouseAction !== 'CLICK') {
        interval(this.openDelay).pipe(take(1)).pipe(takeUntil(this.stopTooltipShow$)).subscribe(() => this.tip?.open());
      }
      if (state === 'EXIT' && this.lastMouseAction !== 'CLICK') {
        this.stopTooltipShow$.next(undefined);
        this.tip?.close();
      }
      if (state === 'CLICK') {
        this.stopTooltipShow$.next(undefined);
        this.toggle();
      }

      //  skip the enter generated by the mouse click finishing
      if (!(this.lastMouseAction === 'CLICK' && state === 'ENTER'))
        this.lastMouseAction = state;
    });
  }

  setWidth() {
    asyncDelay(1,
      () => {
        if (this.tipMaxWidth) {
          if (!this.containerBody && this.elementRef.nativeElement?.querySelector('.help-tooltip-window')?.querySelector('.tooltip-inner'))
            this.renderer.setStyle(this.elementRef.nativeElement.querySelector('.help-tooltip-window').querySelector('.tooltip-inner'), 'max-width', this.tipMaxWidth + 'px');
          else if (this.containerBody && document.body.querySelectorAll('.help-tooltip-window').length)
            document.body.querySelectorAll('.help-tooltip-window').forEach(el => this.renderer.setStyle(el.querySelector('.tooltip-inner'), 'max-width', this.tipMaxWidth + 'px'));
        }
    });
  }

  getValidColor(color: string): string {
    switch (color) {
      case 'primary':
        return 'text-primary';
      case 'secondary':
        return 'text-secondary';
      case 'danger':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      case 'dark':
        return 'text-dark';
      case 'darknlight':
        return 'text-darknlight';
      case 'dpsgreen':
        return 'text-dpsgreen';
      case 'dpsblue':
        return 'text-dpsblue';
      case 'dpsblue-light':
        return 'text-dpsblue-light';
      case 'dpsblue-400':
        return 'text-dpsblue-400';
      case 'ebizteal':
        return 'text-ebizteal';
      case 'gray-500':
        return 'text-gray-500';
      default:
        return 'text-ebizteal';
    }
  }

  toggle(): void {
    if (this.tip !== undefined)
      if (this.tip.isOpen())
        this.tip.close();
      else
        this.tip.open();
  }

  onMouseEnter(): void {
    this.hoverClass = this.activeColor;
    if (this.autoShow)
      this.mouseAction$.next('ENTER');
  }

  onMouseExit(): void {
    this.hoverClass = this.defaultColor;
    if (this.autoShow)
      this.mouseAction$.next('EXIT');
  }

  onClick(): void {
    this.setWidth();
    this.mouseAction$.next('CLICK');
  }
}
