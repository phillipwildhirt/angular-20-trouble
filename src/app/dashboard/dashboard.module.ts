import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { DashboardComponent } from '@app/dashboard/dashboard.component';
import { MessagesModComponent } from '@app/dashboard/messages-mod/messages-mod.component';
import { SharedModule } from '@app/shared/shared.module';
import { QueryTaskModComponent } from './query-task-mod/query-task-mod.component';
import { NotificationsModComponent } from './notifications-mod/notifications-mod.component';
import { NotesModComponent } from './notes-mod/notes-mod.component';

import { RouterModule, Routes } from '@angular/router';

import { CREATOR } from '@app/audit/internal-audit.service';
import { DashboardViewService } from '@app/dashboard/dashboard-view.service';
import { MODULE_VIEW_SERVICE } from '@app/shared/module-drag-and-drop-resize/module-view.service';

export const dashboardRoutes: Routes = [
  {path: '', component: DashboardComponent, data: { title: 'Dashboard' }},
];

@NgModule({
  declarations: [
    DashboardComponent,
    QueryTaskModComponent,
    MessagesModComponent,
    NotificationsModComponent,
    NotesModComponent,
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(dashboardRoutes),
  ],
  exports: [
    RouterModule,
    DashboardComponent,
  ],
  providers: [
    {provide: MODULE_VIEW_SERVICE, useClass: DashboardViewService },
    {provide: CREATOR, useValue: 'DashboardModule'}
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardModule {
}
