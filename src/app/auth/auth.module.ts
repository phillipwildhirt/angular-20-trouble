import { NgModule } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { authFeature } from './store/auth.reducer';
import { EffectsModule } from '@ngrx/effects';
import { AuthEffects } from '@app/auth/store/auth.effects';

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forFeature(authFeature),
    EffectsModule.forFeature([AuthEffects])
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class AuthModule {
}
