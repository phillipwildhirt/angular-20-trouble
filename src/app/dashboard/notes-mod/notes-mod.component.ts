import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { transition, trigger, useAnimation } from '@angular/animations';
import { hideAnimation, showAnimation } from '@app/shared/animations/show-hide.animation';
import { BehaviorSubject, Subject } from 'rxjs';
import { ModuleDraggableItem } from '@app/shared/module-drag-and-drop-resize/module-drag-and-drop.model';
import { DashboardViewService } from '@app/dashboard/dashboard-view.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'dps-notes-mod',
  templateUrl: './notes-mod.component.html',
  styleUrls: ['./notes-mod.component.scss'],
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
export class NotesModComponent implements OnInit, OnDestroy {
  dashboardViewService = inject(DashboardViewService);

  private readonly unsub$ = new Subject<void>();

  // @ts-ignore
  @Input() module: ModuleDraggableItem;

  width = 0;
  height = 0;
  collapsed = false;
  expanded = false;
  viewAdjust$ = new BehaviorSubject<boolean>(false);

  ngOnInit(): void {
    this.dashboardViewService.notesDraggable.data.collapsed$.pipe(takeUntil(this.unsub$)).subscribe( (v: boolean) => this.collapsed = v);
    this.dashboardViewService.notesDraggable.data.expanded$.pipe(takeUntil(this.unsub$)).subscribe((v: boolean) => this.expanded = v);
    this.dashboardViewService.viewAdjust$.pipe(takeUntil(this.unsub$)).subscribe(v => this.onViewAdjust(v));
  }

  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
  }

  onExpandCollapse(): void {
    if (this.expanded) {
      this.dashboardViewService.onCollapse(this.module.data.name);
    } else {
      this.dashboardViewService.onExpand(this.module.data.name);
    }
  }
  onCollapse(): void {
    if (this.collapsed) {
      this.dashboardViewService.onCollapse(this.module.data.name);
    }
  }

  onViewAdjust(v: boolean): void {
    this.viewAdjust$.next(v);
  }
}
