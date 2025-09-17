import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { authGuard } from '@app/auth/guards/auth.guard';

const routes: Routes = [
  {path: 'dashboard', canActivate: [authGuard], loadChildren: () => import('@app/dashboard/dashboard.module').then(m => m.DashboardModule)},
  {path: '', pathMatch: 'prefix', redirectTo: 'dashboard' },
];

const options: ExtraOptions = {
  anchorScrolling: 'enabled',
  canceledNavigationResolution: 'computed',
  scrollPositionRestoration: 'enabled',
};

@NgModule({
  imports: [RouterModule.forRoot(routes, options)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
