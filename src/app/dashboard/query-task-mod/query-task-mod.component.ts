import { Component, Input, inject } from '@angular/core';
import { DashboardViewService } from '@app/dashboard/dashboard-view.service';
import { ModuleDraggableItem } from '@app/shared/module-drag-and-drop-resize/module-drag-and-drop.model';
import { CREATOR } from '@app/audit/internal-audit.service';

@Component({
  selector: 'dps-query-task-mod',
  templateUrl: './query-task-mod.component.html',
  styleUrls: ['./query-task-mod.component.scss'],
  providers: [{ provide: CREATOR, useValue: 'QueryTaskModComponent' }],
  standalone: false
})
export class QueryTaskModComponent {
  dashboardViewService = inject(DashboardViewService);

  @Input() public module!: ModuleDraggableItem;

  public height = 0;
  public width = 0;
  public expanded = false;
  public collapsed = false;

  protected readonly Array = Array;
}
