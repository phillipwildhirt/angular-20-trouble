import { Injectable, inject } from '@angular/core';
import { AuthUser } from '@app/shared/models/auth-user.model';
import { BehaviorSubject, merge, Observable, of, pipe, Subject } from 'rxjs';
import { catchError, filter, map, scan, takeUntil, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as AuthActions from './store/auth.actions';
import { ToastService } from '@app/shared/toast/toast.service';
import { UserScope } from '@app/auth/models/user-scope.model';
import { authFeature } from '@app/auth/store/auth.reducer';
import { InternalAuditService } from '@app/audit/internal-audit.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService extends InternalAuditService {
  private readonly store = inject(Store);
  private toastService = inject(ToastService);

  validating$ = new BehaviorSubject<boolean>(false);

  constructor() {
    super('AuthService');
  }

  validate(): Observable<AuthUser | undefined> {
    this.validating$.next(true);
    return of<AuthUser>(new AuthUser({
      'userid': 'MYUSERNAME',
      'ain': '123456789',
      'token': 'blahblahblahblah',
      'email': 'my-email-address@domain.com',
      'roles': [
        'DPS_Admin',
      ]
    })).pipe(tap(() => this.validating$.next(false)), this.mapAndEmit);
  }

  private mapAndEmit = pipe(
    catchError(() => {
      this.store.dispatch(AuthActions.validateUserError({ authUser: undefined }));
      return of(undefined);
    }),
    map((data: any) => {
      let authUser;
      if (data) {
        authUser = data;
      }
      if (authUser) {
          authUser.isAdmin = true;
          this.store.dispatch(AuthActions.validateUserSuccess({authUser: authUser}));
      }
      return authUser;
    })
  );

  getUserScope(userid: any, includeRoles?: boolean): Observable<UserScope> {
    return of({
      userid: 'MYUSERNAME',
      email: 'my-email-address@domain.com',
      firstName: 'First',
      lastName: 'LastName',
      uuid: 'abcdef9876-1234-1234-8888-abcdef9876',
    }).pipe(
      map((scope) => {
        if (includeRoles) {
          return new UserScope({
            userId: scope.userid,
            userEmail: scope.email,
            uuId: scope.uuid,
            firstName: scope.firstName,
            lastName: scope.lastName,
          });
        } else {
          return new UserScope({
            userId: scope.userid,
            userEmail: scope.email,
            uuId: scope.uuid,
            firstName: scope.firstName,
            lastName: scope.lastName,
          });
        }
      }),
      catchError(() => {
        this.toastService.danger('Unable to retrieve User Scope');
        return of(new UserScope({
                                  userid: '',
                                  email: '',
                                  uuid: '',
                                  firstName: '',
                                  lastName: '',
        }));
      })
    );
  }

  selectAuthUserIdAndFilterForUserIdChanges(unsubscribe$: Subject<void>[]): Observable<string> {
    return this.store.select(authFeature.selectUser).pipe(
      takeUntil(merge(...unsubscribe$)),
      filter(user => user !== undefined),
      filter(user => user.userId !== undefined),
      map(user => user.userId as string),
      scan((previous, current) => {
        return { previous: previous.current, current: current };
      }, { previous: '', current: '' }),
      filter(({ previous, current }) => previous !== current),
      map(({ previous, current }) => current));
  }

}
