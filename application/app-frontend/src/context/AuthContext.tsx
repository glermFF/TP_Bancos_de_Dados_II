import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '../data/types';
import * as apiService from '../services/api';
import * as storage from '../services/storage';

const TOKEN_KEY = 'cv.token';
const USER_KEY = 'cv.user';

interface AuthContextValue {
  user: User | null;
  /** True while the persisted session is being restored. */
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (input: { name: string; username: string; email: string; password: string }) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = storage.getItem(TOKEN_KEY);
    const cached = storage.getItem(USER_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    apiService.setAuthToken(token);
    if (cached) {
      try {
        setUser(JSON.parse(cached) as User);
      } catch {
        storage.removeItem(USER_KEY);
      }
    }
    // Refresh the profile in the background; drop the session if the token died.
    apiService
      .fetchProfile()
      .then((profile) => {
        setUser(profile);
        storage.setItem(USER_KEY, JSON.stringify(profile));
      })
      .catch((error) => {
        if (apiService.apiErrorMessage(error).includes('token')) clearSession();
      })
      .finally(() => setLoading(false));

    function clearSession() {
      apiService.setAuthToken(null);
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(USER_KEY);
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    function persist(auth: apiService.AuthResponse) {
      apiService.setAuthToken(auth.token);
      storage.setItem(TOKEN_KEY, auth.token);
      storage.setItem(USER_KEY, JSON.stringify(auth.user));
      setUser(auth.user);
    }
    return {
      user,
      loading,
      async signIn(identifier, password) {
        persist(await apiService.login(identifier, password));
      },
      async signUp(input) {
        persist(await apiService.register(input));
      },
      signOut() {
        apiService.setAuthToken(null);
        storage.removeItem(TOKEN_KEY);
        storage.removeItem(USER_KEY);
        setUser(null);
      },
    };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
