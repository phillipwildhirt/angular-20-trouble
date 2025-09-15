import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '@app/auth/auth.service';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';

/**
 * Checks to see if there is a valid user session present. If not, then
 * the user is routed back to the {@link environment#ssoUrl} to re-authenticate.
 *
 **/

export const authGuard = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  return authService.validate().pipe(
    map(user => {
      return {validated: user !== undefined, user};
    }),
    map(({validated, user}) => {
      if (validated || (route?.data?.['private'] !== undefined && !route?.data?.['private'])) {
        return true;
      }
      return false;
    }),
  );
};
