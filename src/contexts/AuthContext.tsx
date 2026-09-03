import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { User } from '@supabase/supabase-js';

import {
  supabase,
  isSupabaseConfigured,
} from '../services/supabase';

import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    pass: string
  ) => Promise<{ error?: string }>;
  register: (
    email: string,
    pass: string,
    name: string
  ) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (
    email: string
  ) => Promise<{ error?: string }>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

const mapSupabaseUser = (user: User): UserProfile => ({
  id: user.id,
  email: user.email || '',
  full_name:
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'Usuário',
});

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] =
    useState<UserProfile | null>(null);

  // Começa como true para evitar que a aplicação conclua
  // "não autenticado" antes de o Supabase restaurar a sessão.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      console.error(
        'Auth: cliente Supabase não está configurado.'
      );
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const carregarSessao = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error(
          'Auth: erro ao recuperar sessão:',
          error.message
        );
        setUser(null);
        setIsLoading(false);
        return;
      }

      const sessionUser = session?.user ?? null;

      console.log(
        'Auth sessão encontrada:',
        Boolean(sessionUser)
      );

      if (sessionUser) {
        console.log(
          'Auth User ID:',
          sessionUser.id
        );

        setUser(mapSupabaseUser(sessionUser));
      } else {
        setUser(null);
      }

      setIsLoading(false);
    };

    carregarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const sessionUser = session?.user ?? null;

        console.log(
          'Auth evento:',
          event
        );

        console.log(
          'Auth usuário autenticado:',
          Boolean(sessionUser)
        );

        if (sessionUser) {
          console.log(
            'Auth User ID:',
            sessionUser.id
          );

          setUser(mapSupabaseUser(sessionUser));
        } else {
          setUser(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    pass: string
  ) => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        error:
          'Supabase não está configurado. Configure a conexão antes de entrar.',
      };
    }

    setIsLoading(true);

    try {
      const {
        data,
        error,
      } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        return { error: error.message };
      }

      if (!data.user || !data.session) {
        return {
          error:
            'O Supabase não retornou uma sessão válida.',
        };
      }

      console.log(
        'Login Supabase realizado: true'
      );

      console.log(
        'Login User ID:',
        data.user.id
      );

      setUser(mapSupabaseUser(data.user));

      return {};
    } catch (error) {
      console.error(
        'Auth: falha inesperada durante login:',
        error
      );

      return {
        error:
          'Não foi possível concluir o login. Tente novamente.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    pass: string,
    name: string
  ) => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        error:
          'Supabase não está configurado. Configure a conexão antes de cadastrar um usuário.',
      };
    }

    setIsLoading(true);

    try {
      const {
        error,
      } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error(
        'Auth: falha inesperada durante cadastro:',
        error
      );

      return {
        error:
          'Não foi possível concluir o cadastro. Tente novamente.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setUser(null);
      return;
    }

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        'Auth: erro ao sair:',
        error.message
      );
      return;
    }

    setUser(null);
  };

  const resetPassword = async (
    email: string
  ) => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        error:
          'Supabase não está configurado.',
      };
    }

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email
      );

    if (error) {
      return { error: error.message };
    }

    return {};
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth deve ser usado dentro de AuthProvider'
    );
  }

  return context;
};
