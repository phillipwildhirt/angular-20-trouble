import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { authGuard } from '@app/auth/guards/auth.guard';
import { modalCloseOnBrowserBackBtnGuard } from '@app/shared/guards/modal-close-on-browser-back-btn.guard';
import { AppNotPrintComponent } from '@app/app-not-print.component';

const routes: Routes = [
  {path: '', component: AppNotPrintComponent, children: [
    {path: 'dashboard', canActivate: [authGuard], loadChildren: () => import('@app/dashboard/dashboard.module').then(m => m.DashboardModule)},
    {path: 'reports', loadChildren: () => import('@app/reports/reports.module').then(m => m.ReportsModule)},
    {path: '', pathMatch: 'prefix', redirectTo: 'dashboard' },
  ]},
  {path: '**', component: NotFoundComponent, data: { title: 'Not Found' }}
];

const options: ExtraOptions = {
  anchorScrolling: 'enabled',
  canceledNavigationResolution: 'computed',
  scrollPositionRestoration: 'enabled',
};

export const addBrowserBackBtnGuardToAllRoutes = (routes: Routes): Routes => {
  return routes.map( r => {
    if( r.component !== undefined) {
      if (r.canDeactivate && r.canDeactivate.indexOf(modalCloseOnBrowserBackBtnGuard) < 0)
        r.canDeactivate.push(modalCloseOnBrowserBackBtnGuard);
      else
        r.canDeactivate = [modalCloseOnBrowserBackBtnGuard];
    }
    return r;
  });
};

@NgModule({
  imports: [RouterModule.forRoot(addBrowserBackBtnGuardToAllRoutes(routes), options)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
