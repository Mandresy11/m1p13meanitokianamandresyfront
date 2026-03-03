export interface User {
  _id?: string;
  username: string;
  fullname: string;
  gender: 'male' | 'female' | 'other';  // ← ajout de 'other' pour les comptes Google
  email: string;
  password?: string;
  googleId?: string;                     // ← nouveau : pour les comptes Google
  isActive?: boolean;
  role?: 'client' | 'admin' | 'shop';
  shop?: string;   // ← ajout de 'shop' qui existe dans le backend
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  fullname: string;
  gender: 'male' | 'female' | 'other';  // ← ajout de 'other'
  email: string;
  password: string;
}

export interface AuthResponse {
  userLogged: {
    token: string;
    user: User;
  };
}

export interface UserResponse {
  userCreated: {
    token: string;
    user: User;
  };
}
