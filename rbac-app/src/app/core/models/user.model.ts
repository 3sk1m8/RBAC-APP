export interface User {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  token?: string;
}

export enum Role {
  User = 'User',
  Admin = 'Admin'
}