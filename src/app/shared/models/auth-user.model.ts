
export class AuthUser {
  ain: string;
  email: string;
  userid: string;
  token: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  uuid: string | undefined;
  userPrograms: any[] = [];
  categories: any[] = [];
  isAdmin: boolean = false;

  constructor(data: any) {
    this.ain = data.ain;
    this.email = data.email;
    this.userid = data.userid;
    this.token = data.token;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.uuid = data.uuid || '';
    this.userPrograms = data.userPrograms || [];
    this.categories = data.categories || [];
    this.isAdmin = data.isAdmin;
  }

  /*
    ----- Example helper methods -----

    hasRole(role: string): boolean {
      return this.roles.includes(role);
    }

    isAdmin(): boolean {
      return this.hasRole('admin');
    }

    etc...
  */
}
