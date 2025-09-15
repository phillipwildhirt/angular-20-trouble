import { AuthUser } from '@app/shared/models/auth-user.model';

export class User {
  constructor(
    public authUser: AuthUser | undefined,
    public userId: string | undefined,
    public userEmail: string | undefined,
    public firstName: string | undefined,
    public lastName: string | undefined,
    public uuId: string | undefined,
    public isMimic: boolean,
  ) {
    this.isMimic = false;
  }
}
