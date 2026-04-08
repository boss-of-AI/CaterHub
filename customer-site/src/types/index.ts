export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}