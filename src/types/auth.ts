import { ReactNode } from "react";
import {
  User as FirebaseUser,
  AuthProvider as FirebaseAuthProvider,
} from "firebase/auth";

export type User = FirebaseUser;
export type AuthProvider = FirebaseAuthProvider;
export type AuthProviderType = AuthProvider;

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
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
}

export interface AuthContextType {
  user: User | null;
  error: string;
  loading: boolean;
  initialized: boolean;
  handleSocialLogin: (provider: AuthProvider) => Promise<void>;
  handleLogout: () => Promise<void>;
  providers: {
    google: AuthProvider;
    github: AuthProvider;
  };
}

export interface AuthProviderProps {
  children: ReactNode;
}
