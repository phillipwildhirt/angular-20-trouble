import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from '@app/auth/auth.module';
import { SharedModule } from '@app/shared/shared.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { buildSpecificModules } from '../build-specifics';
import { IconFillAnimateDirective } from '@app/shared/directives/icon-fill-animate.directive';
import { CREATOR } from '@app/audit/internal-audit.service';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { AsyncPipe } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,

    StoreModule.forRoot({}),
    // ReduxDevTools skipped on prod
    ...buildSpecificModules,
    EffectsModule.forRoot([]),

    StoreRouterConnectingModule.forRoot(),

    SharedModule,
    AuthModule,
    IconFillAnimateDirective,
    AsyncPipe
  ],
  providers: [
    {provide: CREATOR, useValue: 'AppModule'},
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule {}
