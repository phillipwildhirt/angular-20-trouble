import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { ReportsComponent } from '@app/reports/reports.component';
import { RouterModule, Routes } from '@angular/router';
import { addBrowserBackBtnGuardToAllRoutes } from '@app/app-routing.module';

export const reportsRoutes: Routes = [
  {path: '', component: ReportsComponent, data: { title: 'Reports' } },
];

@NgModule({
  declarations: [
    ReportsComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(addBrowserBackBtnGuardToAllRoutes(reportsRoutes))
  ],
  exports: [
    RouterModule
  ]
})
export class ReportsModule { }
