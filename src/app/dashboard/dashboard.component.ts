import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { DashboardViewService } from '@app/dashboard/dashboard-view.service';
import { takeUntil, throttleTime } from 'rxjs/operators';
import { asyncScheduler, BehaviorSubject, Subject } from 'rxjs';
import { ModuleDraggableItem, ModuleDroppableZone } from '@app/shared/module-drag-and-drop-resize/module-drag-and-drop.model';
import { ModuleData } from '@app/shared/models/module-data.model';
import { ModuleResizeEvent } from '@app/shared/module-drag-and-drop-resize/module-resize-event.model';
import { ModulesAndActionType, ModuleViewAdjustAction } from '@app/dashboard/models/module-view-adjust-action.enum';
import { ModuleDragService } from '@app/shared/module-drag-and-drop-resize/module-drag.service';
import { CREATOR } from '@app/audit/internal-audit.service';

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

  private droppableZones: any[] = [];
  public modules: ModuleDraggableItem[][] = [[],[]];
  public availableModules: ModuleData[] = [];
  public viewAdjust = false;
  public viewAdjust$ = new BehaviorSubject<boolean>(false);
  public isDragging = false;


  private windowResize$ = new Subject<any>();

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.windowResize$.next(event);
  }

  ngOnInit(): void {
    this.droppableZones = this.dashboardViewService.droppableZones;
    this.dashboardViewService.viewAdjust$.pipe(takeUntil(this.unsub$)).subscribe((v: boolean) => this.onViewAdjust(v));
    this.dashboardViewService.modules$.pipe(takeUntil(this.unsub$)).subscribe((v: ModulesAndActionType) => this.onModulesUpdate(v));
    this.dashboardViewService.availableModules$.pipe(takeUntil(this.unsub$)).subscribe( (v: ModuleData[]) => this.onAvailableModulesUpdate(v));
    this.windowResize$.pipe(
      takeUntil(this.unsub$),
      throttleTime(1500, asyncScheduler, { leading: false, trailing: true }))
      .subscribe( (event: any)  => this.dashboardViewService.onWindowResize());
    this.dashboardViewService.isDragging$.pipe(takeUntil(this.unsub$)).subscribe((v: boolean) => this.isDragging = v);
  }

  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
  }

  getDroppableZone(module: ModuleDraggableItem): ModuleDroppableZone {
    let i = 0;
    for (const zone of this.droppableZones) {
      if (zone.data.rowColumn === module.data.rowColumn) {
        return this.droppableZones[i];
      }
      i++;
    }
    return this.droppableZones[i];
  }

  getExtraColumnDropZone(rowColumn: number): ModuleDroppableZone {
    rowColumn += rowColumn % 2 ? 1 : -1;
    let i = 0;
    for (const zone of this.droppableZones) {
      if (zone.data.rowColumn === rowColumn) {
        return this.droppableZones[i];
      }
      i++;
    }
    return this.droppableZones[i];
  }

  getExtraRowDropZone(rowColumn: number): ModuleDroppableZone {
    rowColumn += Math.floor(rowColumn / 10) % 2 ? 10 : -10;
    let i = 0;
    for (const zone of this.droppableZones) {
      if (zone.data.rowColumn === rowColumn) {
        return this.droppableZones[i];
      }
      i++;
    }
    return this.droppableZones[i];
  }

  onModulesUpdate(modules: ModulesAndActionType): void {
    if (modules.type === ModuleViewAdjustAction.resize) {
      this.modules.forEach((row, index) => {
        row.splice(0, 2);
        modules.modules[index].forEach(module => row.push(module));
      });
    } else {
      this.modules = modules.modules;
    }

  }

  onAvailableModulesUpdate(modules: ModuleData[]): void {
    this.availableModules = modules;
  }

  onViewAdjust(v: boolean): void {
    this.viewAdjust = v;
    this.viewAdjust$.next(v);
  }

  onZoneDrop(event: any): void {
    if (this.viewAdjust) {
      if (event.data.rowColumn !== event.zone.data.rowColumn) {
        this.dashboardViewService.checkAndStoreModulesBeforeChanges();
      }
    }
  }

  onResize(event: ModuleResizeEvent): void {
    this.dashboardViewService.checkAndStoreModulesBeforeChanges();
  }
}
