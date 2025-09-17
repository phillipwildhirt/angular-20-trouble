import { Component, Input, inject } from '@angular/core';
import { ModuleDraggableItem } from '@app/shared/module-drag-and-drop-resize/module-drag-and-drop.model';
import { DashboardViewService } from '@app/dashboard/dashboard-view.service';

@Component({
  selector: 'dps-notes-mod',
  templateUrl: './notes-mod.component.html',
  styleUrls: ['./notes-mod.component.scss'],
  standalone: false
})
export class NotesModComponent {
  dashboardViewService = inject(DashboardViewService);

  // @ts-ignore
  @Input() module: ModuleDraggableItem;

  width = 0;
  height = 0;
  collapsed = false;
  expanded = false;

}
