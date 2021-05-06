import api from '../services/api';
import { toast } from 'react-toastify';
import { createContext, useEffect, useState, ReactNode } from 'react';

interface AuthContextData {
  signed: boolean;
  user: object | null;
  signIn({ email, password }: any): Promise<boolean>;
  signOut(): void;
}

type AuthContextProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<object | null>(null);
  const [, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function loadStorageData() {
      const storagedUser = localStorage.getItem('@pebashop-user');
      const storagedToken = localStorage.getItem('@pebashop-token');

      if (storagedUser && storagedToken) {
        api.defaults.headers.Authorization = `Bearer ${JSON.parse(
          storagedToken
        )}`;
        setUser(JSON.parse(storagedUser));
        setToken(JSON.parse(storagedToken));
      }
    }
    loadStorageData();
  }, [])

  async function signIn({ email, password }: any) {
    const { data } = await api.post('/auth', { email, password });

    if(data.error) {
      toast.warn(data.error);
      return false;
    } else {
      toast.success('Login efetuado com sucesso!');
      setUser(data.user);
      setToken(data.token);

      api.defaults.headers.Authorization = `Bearer ${data.token}`
      localStorage.setItem('@pebashop-user', JSON.stringify(data.user));
      localStorage.setItem('@pebashop-token', JSON.stringify(data.token));
      return true;
    }
  }

  async function signOut() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('@pebashop-user');
    localStorage.removeItem('@pebashop-token');
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user: {}, signIn, signOut }}>
      { children }
    </AuthContext.Provider>
  );
};
