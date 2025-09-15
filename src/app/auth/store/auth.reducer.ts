import * as AuthActions from '@app/auth/store/auth.actions';
import { createFeature, createReducer, on } from '@ngrx/store';
import { User } from '@app/shared/models/user.model';
import { cloneDeep } from 'lodash-es';
import { AuthUser } from '@app/shared/models/auth-user.model';

const authFeatureKey = 'auth';

interface State {
  user: User;
}

const initialState: State = {
  user: {
    authUser: undefined,
    userId: undefined,
    userEmail: undefined,
    firstName: undefined,
    lastName: undefined,
    uuId: undefined,
    isMimic: false
  }
};

const authReducer = createReducer(
  initialState,
  on(AuthActions.setAuthUserOnly, (state, { authUser }) => {
    if (authUser !== undefined) {
      // If incoming authUser data exists update ONLY the authUser fields
      return {...state, user: {...state.user, authUser: {...state.user.authUser, ...authUser}}};
    } else {
      // else authUser will be set to undefined here.
      return {...state, user: {...state.user, authUser: authUser}};
    }
  }),
  on(AuthActions.setAllUserFields, (state, { authUser }) => {
    if (authUser !== undefined) {
      const authUserCopy: AuthUser = cloneDeep(authUser);
      // If incoming authUser data exists set it to authUser and as User
      return {
        ...state,
        user: {
          authUser: {...authUserCopy},
          userId: authUserCopy.userid,
          userEmail: authUserCopy.email,
          firstName: authUserCopy.firstName,
          lastName: authUserCopy.lastName,
          uuId: authUserCopy.uuid,
          isMimic: false
        }};
    } else {
      // else set all to undefined
      return {
        ...state,
        user: {
          authUser: undefined,
          userId: undefined,
          userEmail: undefined,
          firstName: undefined,
          lastName: undefined,
          uuId: undefined,
          isMimic: false
        }};
    }
  }),
  on(AuthActions.setUserScope, (state, {userScope}) => {
    if (userScope !== undefined) {
      // userScope exists, so we're either updating it or mimicking
      if (state.user.authUser) if (!state.user.authUser.uuid) {
        // if uuId isn't set add the userScope fields to the authUser
        return {
          ...state,
          user: {
            ...state.user,
            authUser: {
              ...state.user.authUser,
              firstName: userScope.firstName,
              lastName: userScope.lastName,
              uuid: userScope.uuId,
            },
            ...userScope,
          }
        };
      } else {
        // else we are mimicking, and update the userScope
        return {
          ...state,
          user: {
            ...state.user,
            ...userScope,
            // just to be sure
            isMimic: state.user.authUser.userid !== userScope.userId
          }
        };
      } else {
        return state;
      }
    } else {
      // else userScope will be undefined when mimic ends so replace the user with the authUser data.
      return {
        ...state,
        user: {
          ...state.user,
          userId: state.user.authUser?.userid,
          userEmail: state.user.authUser?.email,
          firstName: state.user.authUser?.firstName,
          lastName: state.user.authUser?.lastName,
          uuId: state.user.authUser?.uuid,
          isMimic: false
        }
      };
    }
  }),
);

export const authFeature = createFeature({
  name: authFeatureKey,
  reducer: authReducer,
});

