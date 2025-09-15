
export class UserScope {
  userId: string;
  userEmail: string;
  uuId: string;
  firstName: string;
  lastName: string;

  constructor(data: any) {
    this.userId = data.userId;
    this.userEmail = data.userEmail;
    this.uuId = data.uuId;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
  }
}
