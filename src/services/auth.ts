import { auth } from "./firebase";
import {
  signInWithPopup,
  signOut,
  AuthError,
  AuthProvider,
} from "firebase/auth";

/**
 * Serviço de autenticação que contém todas as funções relacionadas à autenticação
 * Separando a lógica de autenticação do hook useAuth
 */
export const authService = {
  /**
   * Realiza login com provedor social (Google, GitHub, etc)
   * @param provider Provedor de autenticação
   * @returns Promise que resolve quando o login é bem-sucedido
   * @throws AuthError quando ocorre um erro durante o login
   */
  loginWithSocialProvider: async (provider: AuthProvider): Promise<void> => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      throw error as AuthError;
    }
  },

  /**
   * Realiza logout do usuário atual
   * @returns Promise que resolve quando o logout é bem-sucedido
   * @throws Error quando ocorre um erro durante o logout
   */
  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error("Erro ao fazer logout");
    }
  },

  /**
   * Obtém o erro formatado com base no código de erro do Firebase
   * @param error Erro retornado pelo Firebase
   * @returns Mensagem de erro formatada
   */
  getFormattedError: (error: AuthError): string => {
    let errorMessage = "Ocorreu um erro durante o login.";

    switch (error.code) {
      case "auth/popup-closed-by-user":
        errorMessage = "Login cancelado. Por favor, tente novamente.";
        break;
      case "auth/account-exists-with-different-credential":
        errorMessage = "Esta conta já existe com um provedor diferente.";
        break;
      case "auth/cancelled-popup-request":
        errorMessage = "Apenas uma janela de login pode estar aberta por vez.";
        break;
      case "auth/popup-blocked":
        errorMessage =
          "O popup de login foi bloqueado. Por favor, permita popups para este site.";
        break;
      default:
        errorMessage = `Erro: ${error.message || "Erro desconhecido"}`;
    }

    return errorMessage;
  },
};
