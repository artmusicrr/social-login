import {
  User as FirebaseUser,
  AuthProvider as FirebaseAuthProvider,
} from "firebase/auth";

export type User = FirebaseUser;
export type AuthProvider = FirebaseAuthProvider;

export interface AuthState {
  user: User | null;
  error: string;
  loading: boolean;
}

export interface AuthProviders {
  google: AuthProvider;
  github: AuthProvider;
}

export interface UseAuthReturn extends AuthState {
  handleSocialLogin: (provider: AuthProvider) => Promise<void>;
  handleLogout: () => Promise<void>;
  providers: AuthProviders;
  initialized: boolean;
}

export interface AuthUser {
  email: string | null;
}
