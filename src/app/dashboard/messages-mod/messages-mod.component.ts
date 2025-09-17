import { Component, Input, inject, InjectionToken } from '@angular/core';
import { DashboardViewService } from '@app/dashboard/dashboard-view.service';
import { Subject } from 'rxjs';
import { ModuleDraggableItem } from '@app/shared/module-drag-and-drop-resize/module-drag-and-drop.model';
import { MessagesModService } from '@app/dashboard/messages-mod/messages-mod.service';
import { CREATOR } from '@app/audit/internal-audit.service';

export const MOD_SERVICE = new InjectionToken<string>('MOD_SERVICE');

@Component({
  selector: 'dps-messages-mod',
  templateUrl: './messages-mod.component.html',
  styleUrls: ['./messages-mod.component.scss'],
  providers: [
    { provide: MOD_SERVICE, useClass: MessagesModService },
    { provide: CREATOR, useValue: 'MessagesModComponent' }
  ],
  standalone: false
})
export class MessagesModComponent {
  dashboardViewService = inject(DashboardViewService);
  messagesModService = inject<MessagesModService>(MOD_SERVICE);

  // @ts-ignore
  @Input() module: ModuleDraggableItem;

  width = 0;
  height = 0;
  public collapsed = false;
}
