export interface User {
  _id?: string;
  username: string;
  fullname: string;
  gender: 'male' | 'female';
  email: string;
  password?: string;
  isActive?: boolean;
  role?: 'client' | 'admin';
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  fullname: string;
  gender: 'male' | 'female';
  email: string;
  password: string;
}

export interface AuthResponse {
  userLogged: {
    token: string;
    user: User;
  };
};
