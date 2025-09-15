import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { exhaustMap, map, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import * as AuthActions from './auth.actions';
import { AuthActionsUnion } from './auth.actions';
import { authFeature } from '@app/auth/store/auth.reducer';
import { Store } from '@ngrx/store';
import { AuthUser } from '@app/shared/models/auth-user.model';
import { User } from '@app/shared/models/user.model';
import { AuthService } from '@app/auth/auth.service';


@Injectable()
export class AuthEffects {
  private actions$ = inject<Actions<AuthActionsUnion>>(Actions);
  private store = inject(Store);
  private authService = inject(AuthService);


  onSuccess$ = createEffect( () =>
    this.actions$.pipe(
      ofType(AuthActions.VALIDATE_USER_SUCCESS),
      withLatestFrom(this.store.select(authFeature.selectUser)),
      map((v: [{authUser: AuthUser | undefined, type: any}, User]) => ({authUser: v[0].authUser, user: v[1]})),
      exhaustMap(({authUser, user}) => {
        if (user.userId === undefined ) {
          return of(AuthActions.setAllUserFields({authUser}));
        } else {
          return of(AuthActions.setAuthUserOnly({authUser}));
        }
      })
    )
  );

  onError$ = createEffect( () =>
    this.actions$.pipe(
      ofType(AuthActions.VALIDATE_USER_ERROR),
      exhaustMap(() => of(AuthActions.setAllUserFields({authUser: undefined})))
    )
  );

  onSetAllUserFieldsGetScope$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.SET_ALL_USER_FIELDS),
      exhaustMap(({authUser}) => {
          return this.authService.getUserScope(authUser?.userid).pipe(
            map((userScope) =>
                  AuthActions.setUserScope({userScope})));
      }))
  );

  onUserChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.SET_MIMIC_USER_ONLY),
      exhaustMap(({userId, userEmail}) => {
        if (userId === undefined) {
          return of(AuthActions.setUserScope({userScope: undefined}));
        } else {
          return this.authService.getUserScope(userId, true).pipe(
            map((userScope) =>
                  AuthActions.setUserScope({userScope})));
        }
      }))
  );
}
