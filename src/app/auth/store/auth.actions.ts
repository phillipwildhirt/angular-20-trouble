import { createAction, props, union } from '@ngrx/store';
import { AuthUser } from '@app/shared/models/auth-user.model';
import { UserScope } from '@app/auth/models/user-scope.model';

export const VALIDATE_USER_SUCCESS = '[Auth] Validate User Success';
export const VALIDATE_USER_ERROR = '[Auth] Validate User Error';
export const SET_AUTH_USER_ONLY = '[Auth] Set Auth User Only';
export const SET_ALL_USER_FIELDS = '[Auth] Set All User Fields';
export const SET_MIMIC_USER_ONLY = '[Auth] Set Mimic User Only';
export const SET_USER_SCOPE = '[Auth] Set User Scope Only';


export const validateUserSuccess = createAction(VALIDATE_USER_SUCCESS, props<{authUser: AuthUser | undefined}>());
export const validateUserError = createAction(VALIDATE_USER_ERROR, props<{authUser: undefined}>());
export const setAuthUserOnly = createAction(SET_AUTH_USER_ONLY, props<{authUser: AuthUser | undefined}>());
export const setAllUserFields = createAction(SET_ALL_USER_FIELDS, props<{authUser: AuthUser | undefined}>());
export const setMimicUserOnly = createAction(SET_MIMIC_USER_ONLY, props<{userId: string | undefined, userEmail: string | undefined}>());
export const setUserScope = createAction(SET_USER_SCOPE, props<{userScope: UserScope | undefined}>());

const all = union({
  validateUserSuccess, validateUserError, setAuthUserOnly, setAllUserFields, setMimicUserOnly, setUserScope
});
export type AuthActionsUnion = typeof all;
