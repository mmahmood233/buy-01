export interface User {
  userId: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'SELLER';
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'SELLER';
  avatar?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'CLIENT' | 'SELLER';
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
