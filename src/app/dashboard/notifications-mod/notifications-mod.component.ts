import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ModuleDraggableItem } from '@app/shared/module-drag-and-drop-resize/module-drag-and-drop.model';
import { DashboardViewService } from '@app/dashboard/dashboard-view.service';
import { delay, distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import { animate, style, transition, trigger, useAnimation } from '@angular/animations';
import { hideAnimation, showAnimation } from '@app/shared/animations/show-hide.animation';
import { CREATOR } from '@app/audit/internal-audit.service';
import { MOD_SERVICE } from '@app/dashboard/messages-mod/messages-mod.component';
import { NotificationsModService } from '@app/dashboard/notifications-mod/notifications-mod.service';

@Component({
  selector: 'dps-notifications-mod',
  templateUrl: './notifications-mod.component.html',
  styleUrls: ['./notifications-mod.component.scss'],
  providers: [
    { provide: MOD_SERVICE, useClass: NotificationsModService },
    { provide: CREATOR, useValue: 'NotificationsModComponent' }
  ],
  animations: [
    trigger('showHide', [
      transition(':enter', [
        useAnimation(showAnimation, { params: { time: 150 } })
      ]),
      transition(':leave', [
        useAnimation(hideAnimation, { params: { time: 150 } })
      ]),
    ]),
    trigger('animateOnRemove', [
      transition('true => void', [
        animate('300ms ease-in', style({ transform: 'translateX(-100%)' }))
      ])
    ])
  ],
  standalone: false
})
export class NotificationsModComponent implements OnInit, OnDestroy {
  dashboardViewService = inject(DashboardViewService);
  private cdr = inject(ChangeDetectorRef);

  private readonly unsub$ = new Subject<void>();

  // @ts-ignore
  @Input() module: ModuleDraggableItem;

  width = 0;
  height = 0;
  public collapsed = false;
  public viewAdjust$ = new BehaviorSubject<boolean>(false);
  public dataLoading$ = new BehaviorSubject<boolean>(true);
  public unreadCount: string = '';


  ngOnInit(): void {
    this.dashboardViewService.notificationsDraggable.data.collapsed$.pipe(distinctUntilChanged(), takeUntil(this.unsub$)).subscribe( (v: boolean) => {
      this.collapsed = v;
    });
    this.dashboardViewService.viewAdjust$.pipe(
      takeUntil(this.unsub$),
      distinctUntilChanged(),
      tap( v => {
        this.onViewAdjust(v);
      }),
      delay(10)
    ).subscribe( v => v ? this.cdr.detach() : this.cdr.reattach());
      this.dataLoading$.next( false);
  }

  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
  }

  public onExpandCollapse(): void {
    if (this.collapsed) {
      this.dashboardViewService.onExpand(this.module.data.name);
    }
  }

  private onViewAdjust(v: boolean): void {
    this.viewAdjust$.next(v);
  }
}
