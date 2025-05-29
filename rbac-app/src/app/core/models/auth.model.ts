export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}