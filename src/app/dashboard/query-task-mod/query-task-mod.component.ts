import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { DashboardViewService } from '@app/dashboard/dashboard-view.service';
import { debounceTime, delay, distinctUntilChanged, filter, skip, takeUntil, tap, throttleTime } from 'rxjs/operators';
import { asyncScheduler, BehaviorSubject, interval, merge,  Subject } from 'rxjs';
import { ModuleDraggableItem } from '@app/shared/module-drag-and-drop-resize/module-drag-and-drop.model';
import { transition, trigger, useAnimation } from '@angular/animations';
import { hideAnimation, showAnimation } from '@app/shared/animations/show-hide.animation';
import { QueryTaskModService } from '@app/dashboard/query-task-mod/query-task-mod.service';

import { ActivatedRoute, Router } from '@angular/router';
import { elementRefRetry } from '@app/shared/utilities-and-functions/element-ref-retry.function';
import { CREATOR } from '@app/audit/internal-audit.service';

@Component({
  selector: 'dps-query-task-mod',
  templateUrl: './query-task-mod.component.html',
  styleUrls: ['./query-task-mod.component.scss'],
  providers: [QueryTaskModService, { provide: CREATOR, useValue: 'QueryTaskModComponent' }],
  animations: [
    trigger('showHide', [
      transition(':enter', [
        useAnimation(showAnimation, { params: { time: 150 } })
      ]),
      transition(':leave', [
        useAnimation(hideAnimation, { params: { time: 150 } })
      ]),
    ])
  ],
  standalone: false
})
export class QueryTaskModComponent implements OnInit, AfterViewInit, OnDestroy {
  dashboardViewService = inject(DashboardViewService);
  queryTaskModService = inject(QueryTaskModService);
  private cdr = inject(ChangeDetectorRef);

  private readonly unsub$ = new Subject<void>();

  @Input() public module!: ModuleDraggableItem;

  public height = 0;
  public width = 0;
  public expanded = false;
  public collapsed = false;
  public viewAdjust$ = new BehaviorSubject<boolean>(false);
  public dragging$ = new BehaviorSubject<boolean>(false);
  private resetTabPositioning$ = new Subject<void>();
  public dragging = false;
  public userid: string | undefined = undefined;
  windowResize$ = new Subject<void>();

  public activeTabIndex: number = 0;
  public showRightArrow = false;
  public showLeftArrow = false;
  public tabScrollValue = 0;
  windowSize: number = 1000;
  private scrollTabsKeyUp$ = new Subject<void>();
  @ViewChild('scrollableArea') private scrollWindowElementRef: ElementRef = new ElementRef<any>(null);
  @ViewChild('tabRowElementRef') private tabRowElementRef: ElementRef = new ElementRef<any>(null);
  getActiveTab = () => {
    return this.tabRowElementRef?.nativeElement?.children[this.activeTabIndex];
  };

  @HostListener('window:resize', ['$event'])
  checkRowIndexMap(): void {
    this.windowResize$.next();
  }

  ngOnInit(): void {
    this.dashboardViewService.queryTaskDraggable.data.collapsed$.pipe(takeUntil(this.unsub$)).subscribe((v: boolean) => this.collapsed = v);
    this.dashboardViewService.viewAdjust$.pipe(
      takeUntil(this.unsub$),
      distinctUntilChanged(),
      tap( v => {
        this.onViewAdjust(v);
        if (!v) {
          this.windowResize$.next();
        }
      }),
      delay(10),
      filter(v => !v)
    ).subscribe( v => this.cdr.reattach());


    this.windowResize$.pipe(
      throttleTime(300, asyncScheduler, {leading: false, trailing: true}),
      takeUntil(this.unsub$)
    ).subscribe(() => {
      this.windowSize = window.innerWidth;
      this.resetTabPositioning$.next();
    });
  }

  ngAfterViewInit(): void {
    this.resetTabPositioning$.pipe(takeUntil(this.unsub$), debounceTime(299)).subscribe(() => this.checkTabScroll());
    this.windowResize$.next();
  }

  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
  }


  public onExpandCollapse(): void {
    if (this.expanded) {
      this.dashboardViewService.onCollapse(this.module.data.name);
    } else {
      this.dashboardViewService.onExpand(this.module.data.name);
    }
  }

  public onCollapse(): void {
    if (this.collapsed) {
      this.dashboardViewService.onCollapse(this.module.data.name);
    }
  }


  private onViewAdjust(v: boolean): void {
    this.viewAdjust$.next(v);
  }

  public onDragStart(event: DragEvent) {
    this.setDragging(true);
  }

  public onDragEnd(event: DragEvent) {
    this.setDragging(false);
  }

  public onDragCanceled(event: DragEvent) {
    this.setDragging(false);
  }


  setDragging(dragging: boolean) {
    this.dragging = dragging;
    this.dragging$.next(dragging);
    if (!dragging) {
      this.resetTabPositioning$.next();
    }
  }

  checkTabScroll(): void {
    if (this.isActiveTabClipped())
      this.centerActiveTabWhenPossible();
    this.setScrollArrowsWhenPossible();
  }

  isActiveTabClipped(): boolean {
    let viewWindow = this.scrollWindowElementRef?.nativeElement?.getBoundingClientRect();
    let activeTab = this.getActiveTab()?.getBoundingClientRect();
      // 24 = button width, 36 = fade width, (-/+) num so the fade is strong enough to see over the tab and we aren't centering 'visible' tabs
    let leftArrowWidth = this.showLeftArrow ? 36 + 24 - 13 : 0;
    let rightArrowWidth = this.showRightArrow ? 36 + 24 - 22 : 0;
    if (viewWindow && activeTab) {
      return activeTab.x < viewWindow.x + leftArrowWidth ||
        activeTab.x + activeTab.width > viewWindow.x + viewWindow.width - rightArrowWidth;
    }
    return false;
  }

  centerActiveTabWhenPossible(): void {
    elementRefRetry(this.getActiveTab, 20, 750).subscribe(() => this.centerActiveTab());
  }

  centerActiveTab(): void {
    let viewWindow = this.scrollWindowElementRef?.nativeElement?.getBoundingClientRect();
    let activeTab = this.getActiveTab()?.getBoundingClientRect();
    // viewWindow.x - activeTab.x moves the start of the tab to the start of the view window.  Adding 1/2 the viewWindow.width moves the start of the tab to the middle.
    // subtracting off 1/2 the activeTab.width moves the center of the tab to the center of the viewWindow.
    if (viewWindow && activeTab) {
      this.tabScrollValue += viewWindow.x - activeTab.x + viewWindow.width / 2 - activeTab.width / 2;
    }
    //make sure the center isn't out of bounds
    this.moveRight(0);
    this.moveLeft(0);
  }
  private pixelsToMove(c: number): number {
    return 18 + 18 * ((c - 2) / 4);
  }

  rightDown(): void {
    if (this.dragging) {
      this.moveRight(10);
      interval(10000).pipe(takeUntil(this.scrollTabsKeyUp$), skip(2)).subscribe(() => this.moveRight(10));
    } else {
      this.moveRight(32);
      interval(100).pipe(takeUntil(this.scrollTabsKeyUp$), skip(2)).subscribe((c) => this.moveRight(this.pixelsToMove(c)));
    }
  }

  leftDown(): void {
    if (this.dragging) {
      this.moveLeft(10);
      interval(10000).pipe(takeUntil(this.scrollTabsKeyUp$), skip(2)).subscribe(() => this.moveLeft(10));
    } else {
      this.moveLeft(32);
      interval(100).pipe(takeUntil(this.scrollTabsKeyUp$), skip(2)).subscribe((c) => this.moveLeft(this.pixelsToMove(c)));
    }
  }

  mouseWheel(event: WheelEvent): void {
    const y = event.deltaY;
    const x = event.deltaX;
    if ((y < 0 || x < 0) && this.showLeftArrow) {
      event.preventDefault();
      this.moveLeft(-y - x);
    }
    if ((y > 0 || x > 0) && this.showRightArrow) {
      event.preventDefault();
      this.moveRight(y + x);
    }
  }

  mouseUp(): void {
    this.scrollTabsKeyUp$.next();
  }

  moveLeft(pixels: number): void {
    this.tabScrollValue += pixels;
    if (this.tabScrollValue > 0) {
      this.tabScrollValue = 0;
      this.mouseUp();
    }
    this.setScrollArrows();
  }

  moveRight(pixels: number): void {
    let scrollWindowWidth = this.scrollWindowElementRef?.nativeElement?.clientWidth - 17;
    let tabsWidth = this.tabRowElementRef?.nativeElement?.clientWidth;
    let minScrollValue = -(tabsWidth - scrollWindowWidth);
    this.tabScrollValue -= pixels;
    if (this.tabScrollValue < minScrollValue) {
      this.tabScrollValue = minScrollValue;
      this.mouseUp();
    }
    this.setScrollArrows();
  }

  setScrollArrowsWhenPossible(): void {
    elementRefRetry(this.getActiveTab, 20, 750).subscribe(() => this.setScrollArrows());
  }

  setScrollArrows(): void {
    this.showLeftArrow = false;
    this.showRightArrow = false;
    let scrollWindowWidth = this.scrollWindowElementRef?.nativeElement?.getBoundingClientRect().width;
    let tabsWidth = this.tabRowElementRef?.nativeElement?.getBoundingClientRect().width;
    if (tabsWidth && scrollWindowWidth)
      if (tabsWidth > scrollWindowWidth) {
        if (tabsWidth > scrollWindowWidth + Math.abs(this.tabScrollValue) && Math.abs(this.tabScrollValue) < Math.floor(tabsWidth - scrollWindowWidth))  // end not fully visible
          this.showRightArrow = true;
        if (this.tabScrollValue < 0) // beginning not fully visible
          this.showLeftArrow = true;
      }
  }

  protected readonly Array = Array;
}
