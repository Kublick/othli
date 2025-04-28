import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { authClient, signIn, signOut } from "@/lib/auth-client";

type User = {
  id: string;
  email: string;
  name?: string;
  image?: string;
};

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
};

type AuthActions = {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
};

export const useAuthStore = create<
  AuthState & AuthActions,
  [
    ["zustand/persist", { user: User | null; isAuthenticated: boolean }],
    ["zustand/devtools", never],
  ]
>(
  persist(
    devtools(
      (set) => ({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,

        setUser: (user) =>
          set({ user, isAuthenticated: !!user }, undefined, "setUser"),
        setError: (error) => set({ error }, undefined, "setError"),
        setLoading: (isLoading) => set({ isLoading }, undefined, "setLoading"),

        login: async (email, password) => {
          set({ isLoading: true, error: null }, undefined, "login");
          try {
            await authClient.signIn.email(
              { email, password },
              {
                onSuccess: (session) => {
                  if (session.data.user) {
                    set(
                      {
                        user: {
                          id: session.data.user.id,
                          email: session.data.user.email,
                          name: session.data.user.name,
                          image: session.data.user.image,
                        },
                        isAuthenticated: true,
                        isLoading: false,
                      },
                      undefined,
                      "login-success"
                    );
                  }
                },
                onError: (ctx) => {
                  set(
                    {
                      error: ctx.error.message || "Authentication failed",
                      isLoading: false,
                    },
                    undefined,
                    "login-failed"
                  );
                },
              }
            );
          } catch (error) {
            set(
              {
                error:
                  error instanceof Error
                    ? error.message
                    : "Authentication failed",
                isLoading: false,
              },
              undefined,
              "Auth-failed"
            );
            throw error;
          }
        },

        loginWithGoogle: async () => {
          set({ isLoading: true, error: null }, undefined, "loginWithGoogle");
          try {
            const url = `${import.meta.env.VITE_PUBLIC_URL}/dashboard`;
            console.log(url);
            await signIn.social(
              {
                provider: "google",
                callbackURL: url,
              },
              {
                onSuccess: (session) => {
                  if (session.data.user) {
                    set(
                      {
                        user: {
                          id: session.data.user.id,
                          email: session.data.user.email,
                          name: session.data.user.name,
                          image: session.data.user.image,
                        },
                        isAuthenticated: true,
                        isLoading: false,
                      },
                      undefined,
                      "loginWithGoogleSucesss"
                    );
                  }
                },
                onError: (ctx) => {
                  set(
                    {
                      error: ctx.error.messsage || "Google Auth Failed",
                      isLoading: false,
                    },
                    undefined,
                    "loginWithGoogleFailed"
                  );
                },
              }
            );
          } catch (error) {
            set(
              {
                error:
                  error instanceof Error
                    ? error.message
                    : "Google authentication failed",
                isLoading: false,
              },
              undefined,
              "loginWithGoogle-failed"
            );
            throw error;
          }
        },

        logout: async () => {
          set({ isLoading: true, error: null }, undefined, "logout");
          try {
            await signOut();
            set(
              { user: null, isAuthenticated: false, isLoading: false },
              undefined,
              "logout-success"
            );
          } catch (error) {
            set(
              {
                error: error instanceof Error ? error.message : "Logout failed",
                isLoading: false,
              },
              undefined,
              "logout-failed"
            );
            throw error;
          }
        },

        checkAuth: async () => {
          set({ isLoading: true }, undefined, "checkAuth-loading");
          try {
            const session = await authClient.getSession();
            if (session && session.data?.user) {
              set(
                {
                  user: {
                    id: session.data.user.id,
                    email: session.data.user.email,
                    name: session.data.user.name,
                    image: session.data.user.image || undefined,
                  },
                  isAuthenticated: true,
                  isLoading: false,
                },
                undefined,
                "checkAuth-authenticated"
              );
            } else {
              set(
                { user: null, isAuthenticated: false, isLoading: false },
                undefined,
                "checkAuth-unauthenticated"
              );
            }
          } catch (error) {
            set(
              {
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to verify authentication",
              },
              undefined,
              "checkAuth"
            );
          }
        },
      }),
      {
        name: "auth-storage",
      }
    ),
    { name: "auth-store" }
  )
);
