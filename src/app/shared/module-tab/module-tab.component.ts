import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { NotificationPill, NotificationPillComponent } from '@app/shared/notification-pill/notification-pill.component';
import { PlacementArray } from '@ng-bootstrap/ng-bootstrap/';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NgClass } from '@angular/common';
import { isEmpty } from 'lodash-es';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { TabState } from '@app/shared/module-tab/models/tab-state.type';
import { CdkObserveContent } from '@angular/cdk/observers';
import { ComponentStateDirective } from '@app/shared/directives/component-state.directive';
import { asyncDelay } from '@app/shared/utilities-and-functions/async-delay';
import { SaveState } from '@app/shared/models/save-state.enum';
import { Observable, Subject } from 'rxjs';
import { SimpleChangeTyped } from '@app/shared/models/simple-changes-typed.model';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'dps-module-tab',
  templateUrl: './module-tab.component.html',
  styleUrls: ['./module-tab.component.scss', '../stylesheets/btn-pill-close-x.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    NgbTooltip,
    NgClass,
    NotificationPillComponent,
    CdkObserveContent,
    ComponentStateDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModuleTabComponent implements OnInit, OnChanges, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly unsub$ = new Subject<void>();

  /**
   * @desc key is the unique identifier for this tab.
   * @param string
   */
  @Input() key = '';

  /**
   * @desc title is the text displayed in the tab.
   * @param string
   */
  @Input({required: true}) title = '';

  /**
   * @desc state is for the currently active tab.
   * @param string
   */
  @Input() state: TabState = '';

  /**
   * (optional) notifications are used if the tab needs to display a round notification pill.
   * see notification-pill for details on
   <br>    styleTag: string,
   <br>     size: string, and
   <br>     value: string
   <br>  Inputs.
   * @param NotificationPill[]<styleTag:string,size:string,value:string>
   */
  @Input() notifications: NotificationPill[] = [];

  /**
   * @desc (optional) used to display a badge.
   * @param string
   */
  @Input() badge = '';

  /**
   * @desc (optional) icon is the bootstrap icon class if the tab needs an icon.
   * @param string
   */
  @Input() icon = '';

  /**
   * @desc (optional) subText is another styling input for making the tab title small.
   * @default false
   * @param boolean
   */
  @Input() subText = false;

  /**
   * @desc (optional) dismissible hides the close 'x' on the tab.
   * @default true
   * @param boolean
   */
  @Input() get dismissible() { return this._dismissible; }
  set dismissible(value: BooleanInput) { this._dismissible = coerceBooleanProperty(value); }
  private _dismissible = true;

  /**
   * (optional) Any State other than SaveState.none will display a saving state icon.
   * @type {Observable<SaveState> | undefined}
   */
  @Input() saveState$: Observable<SaveState> | undefined;
  @Input() get hasSavedState() { return this._hasSavedState; }
  set hasSavedState(value: BooleanInput) { this._hasSavedState = coerceBooleanProperty(value); }
  private _hasSavedState: boolean = false;

  @Input() get loading() { return this._loading; }
  set loading(value: BooleanInput) { this._loading = coerceBooleanProperty(value); }
  private _loading: boolean = false;

  /**
   * @desc (optional) stops the click when the close 'x' on the tab is clicked, but allows the close event.
   * @default false
   * @param boolean
   */
  @Input() ignoreClosingMouseClick = false;

  /**
   * (optional) add a class to the tooltip window.
   * @type {string}
   */
  @Input() tooltipWindowClass: string = '';

  /**
   * @default 'auto'
   * @type {PlacementArray}
   */
  @Input() tooltipPlacementOptions: PlacementArray = 'auto';

  /**
   * (optional) You may disable background changes from the tab component, and control them yourself.
   * @default false
   * @returns {boolean}
   */
  @Input() get applyBackground() { return this._applyBackground; }
  set applyBackground(value: BooleanInput) { this._applyBackground = coerceBooleanProperty(value); }
  private _applyBackground: boolean = true;
  /**
   * @desc (optional) Event emits when the close 'x' on the tab is clicked.
   * @param EventEmitter<void>
   */

  /**
   * You may optionally turn off the shadow styling around the active tab if this is used inside of a white module rather than outside
   * @default true
   * @type {boolean}
   */
  @Input() includeShadow: boolean = true;

  /**
   * Notifies of a close tab click event.
   * @type {EventEmitter<void>}
   */
  @Output() closeTabEvent = new EventEmitter<void>();

  lastSize = new Map<string, number>();

  protected readonly isEmpty = isEmpty;
  protected readonly SaveState = SaveState;

  constructor() { }

  ngOnInit(): void {
    if (this.saveState$)
      this.saveState$.pipe(takeUntil(this.unsub$), distinctUntilChanged()).subscribe(() => this.cdr.markForCheck());
  }

  ngOnChanges(changes: SimpleChanges): void {
    const changePill: SimpleChangeTyped<typeof this.notifications> = changes['notificationPill'];
    if (changePill
      && (
        changePill.firstChange
        || changePill.currentValue.length !== changePill.previousValue.length
        || changePill.currentValue.some((pill, i) =>
          pill.value !== changePill.previousValue[i].value
          || pill.size !== changePill.previousValue[i].size
          || pill.styleTag !== changePill.previousValue[i].styleTag
          || pill.tooltip !== changePill.previousValue[i].tooltip)
      )
    ) {
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
  }

  public titleStyle(): string {
    let style = this.state === 'active' ? 'text-dpsblue' : 'text-dpsblue-550';
    style += this.subText ?
             this.state === 'active' ? ' smaller' : ' smaller fw-bold' :
             this.state === 'active' ? ' h6-bold' : ' h6';
    return style;
  }

  public onClose(e: MouseEvent): void {
    if (this.ignoreClosingMouseClick)
      e.stopImmediatePropagation();
    this.closeTabEvent.next();
  }

  trackByFn = (index: number, n: NotificationPill): string => {
    return index + ':' + n.size + n.value + n.styleTag;
  };

  closeTooltipFast(t: NgbTooltip): void {
    const previousAnimationSetting = t.animation;
    t.animation = false;
    t.close();
    asyncDelay(300, () => t.animation = previousAnimationSetting);
  }

  observed(title: string, $event: MutationRecord[]): void {
    this.lastSize.set(title, ($event.pop()?.target as Element).clientWidth);
  }
}
