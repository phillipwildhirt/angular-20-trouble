import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { DashboardViewService } from '@app/dashboard/dashboard-view.service';
import { takeUntil, throttleTime } from 'rxjs/operators';
import { asyncScheduler, Subject } from 'rxjs';
import { ModuleDraggableItem } from '@app/shared/module-drag-and-drop-resize/module-drag-and-drop.model';
import { ModuleDragService } from '@app/shared/module-drag-and-drop-resize/module-drag.service';
import { CREATOR } from '@app/audit/internal-audit.service';
import { Constants } from '@assets/constants/constants';
import { Modules } from '@app/dashboard/models/module-view-adjust-action.enum';

@Component({
  selector: 'dps-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [
    ModuleDragService,
    { provide: CREATOR, useValue: 'DashboardComponent' }
  ],
  standalone: false
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardViewService = inject(DashboardViewService);
  private readonly unsub$ = new Subject<void>();
  public modules: ModuleDraggableItem[][] = [[],[]];

  private windowResize$ = new Subject<any>();

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.windowResize$.next(event);
  }

  ngOnInit(): void {
    this.dashboardViewService.modules$.pipe(takeUntil(this.unsub$)).subscribe((v: Modules) => this.onModulesUpdate(v));
    this.windowResize$.pipe(
      takeUntil(this.unsub$),
      throttleTime(1500, asyncScheduler, { leading: false, trailing: true }))
      .subscribe( (event: any)  => this.dashboardViewService.onWindowResize());
  }

  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
  }


  onModulesUpdate(modules: Modules): void {
    this.modules = modules.modules;
  }

  protected readonly Constants = Constants;
}
