import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { DashboardComponent } from '@app/dashboard/dashboard.component';
import { MessagesModComponent } from '@app/dashboard/messages-mod/messages-mod.component';
import { SharedModule } from '@app/shared/shared.module';
import { QueryTaskModComponent } from './query-task-mod/query-task-mod.component';
import { NotificationsModComponent } from './notifications-mod/notifications-mod.component';
import { NotesModComponent } from './notes-mod/notes-mod.component';
import { DndModule } from 'ngx-drag-drop';
import { DropRearrangePlaceholderComponent } from './drop-rearrange-placeholder/drop-rearrange-placeholder.component';

import { RouterModule, Routes } from '@angular/router';
import { addBrowserBackBtnGuardToAllRoutes } from '@app/app-routing.module';
import { DpsHideDashboardMessagingSearchBarDirective } from '@app/dashboard/directives/dps-hide-dashboard-messaging-search-bar.directive';
import { NotificationPillComponent } from '@app/shared/notification-pill/notification-pill.component';

import { ButtonIconComponent } from '@app/shared/button-icon/button-icon.component';
import { ModuleDraggableDirective } from '@app/shared/module-drag-and-drop-resize/module-draggable.directive';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';
import { SpinnerWhiteComponent } from '@app/shared/spinner/spinner-white.component';
import { ModuleTabComponent } from '@app/shared/module-tab/module-tab.component';
import { HelpTooltipComponent } from '@app/shared/help-tooltip/help-tooltip.component';
import { ModuleDroppableDirective } from '@app/shared/module-drag-and-drop-resize/module-droppable.directive';
import { ModuleResizeDirective } from '@app/shared/module-drag-and-drop-resize/module-resize.directive';
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
    DropRearrangePlaceholderComponent,
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(addBrowserBackBtnGuardToAllRoutes(dashboardRoutes)),
    DndModule,

    NotificationPillComponent,

    ButtonIconComponent,

    SpinnerComponent,
    SpinnerWhiteComponent,
    ModuleTabComponent,
    HelpTooltipComponent,

    ModuleDraggableDirective,
    ModuleDroppableDirective,
    ModuleResizeDirective,
    DpsHideDashboardMessagingSearchBarDirective,
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
