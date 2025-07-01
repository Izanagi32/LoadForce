export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'driver';
  company?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
} 