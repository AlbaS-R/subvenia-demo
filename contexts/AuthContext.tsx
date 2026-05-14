
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../supabase-client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | any | null;
  session: Session | null;
  loading: boolean;
  isMockUser: boolean;
  signOut: () => Promise<void>;
  mockLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMockUser, setIsMockUser] = useState(false);

  useEffect(() => {
    // Check for mock session first
    const savedMock = localStorage.getItem('subvenia_mock_user');
    if (savedMock) {
        setUser(JSON.parse(savedMock));
        setIsMockUser(true);
        setLoading(false);
        return;
    }
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // 1. Captura el Hash
        const hash = window.location.hash;
        
        // Verificamos si parece un token de Supabase
        if (hash && hash.includes('access_token')) {
          console.log("Hash token detected, attempting manual session set...");
          
          // 2. Extracción manual ("parseo")
          // Eliminamos el '#' inicial y usamos URLSearchParams
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            // 3. Establecimiento de Sesión
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error("Error setting session from hash:", error);
              // Si falla, dejamos caer al flujo normal de getSession
            } else if (data.session) {
              if (mounted) {
                setSession(data.session);
                setUser(data.session.user);
              }
              
              // 4. Limpieza ("Flash & Burn")
              // Borramos el token de la URL para que no se vea
              window.history.replaceState(null, '', window.location.pathname);
              
              if (mounted) setLoading(false);
              return; // Terminamos aquí, sesión establecida exitosamente
            }
          }
        }

        // Flujo normal: Si no hay hash o falló el establecimiento manual
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Escuchar cambios subsiguientes (logout, refresh automático, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        // En cualquier cambio de estado confirmado, quitamos el loading
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (isMockUser) {
        localStorage.removeItem('subvenia_mock_user');
        setUser(null);
        setIsMockUser(false);
    } else {
        await supabase.auth.signOut();
    }
  };

  const mockLogin = () => {
    const mockUser = {
        id: 'mock-demo-user-id',
        email: 'demo@subvenia.es',
        user_metadata: { full_name: 'Usuario Demo' }
    };
    setUser(mockUser);
    setIsMockUser(true);
    localStorage.setItem('subvenia_mock_user', JSON.stringify(mockUser));
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isMockUser, signOut, mockLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
