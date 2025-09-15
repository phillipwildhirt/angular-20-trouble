import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from '@app/auth/auth.module';
import { SharedModule } from '@app/shared/shared.module';
import { DPSSideNavComponent } from './dps-side-nav/dps-side-nav.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ModalCloseOnBrowserBackBtnGuard } from '@app/shared/guards/modal-close-on-browser-back-btn.guard';
import { buildSpecificModules } from '../build-specifics';
import { IconFillAnimateDirective } from '@app/shared/directives/icon-fill-animate.directive';
import { NotificationPillComponent } from '@app/shared/notification-pill/notification-pill.component';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';
import { ToastComponent } from '@app/shared/toast/toast.component';
import { AppNotPrintComponent } from '@app/app-not-print.component';
import { CREATOR } from '@app/audit/internal-audit.service';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { AsyncPipe } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    AppNotPrintComponent,
    DPSSideNavComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,

    StoreModule.forRoot({}),
    // ReduxDevTools skipped on prod
    ...buildSpecificModules,
    EffectsModule.forRoot([]),

    StoreRouterConnectingModule.forRoot(),

    SharedModule,
    AuthModule,
    IconFillAnimateDirective,
    NotificationPillComponent,
    SpinnerComponent,
    ToastComponent,
    AsyncPipe
  ],
  providers: [
    ModalCloseOnBrowserBackBtnGuard,
    {provide: CREATOR, useValue: 'AppModule'},
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule {}
