import { Component, Input, inject } from '@angular/core';
import { ModuleDraggableItem } from '@app/shared/module-drag-and-drop-resize/module-drag-and-drop.model';
import { DashboardViewService } from '@app/dashboard/dashboard-view.service';
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
  standalone: false
})
export class NotificationsModComponent {
  dashboardViewService = inject(DashboardViewService);

  // @ts-ignore
  @Input() module: ModuleDraggableItem;

  width = 0;
  height = 0;
  public collapsed = false;
}
