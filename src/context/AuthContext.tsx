'use client'
import { supabase } from '@/lib/supabase';
import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string | null;
  nome: string | null;
  company_id: string;
  company_name: string;
}

interface Company {
  name: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  company_id: string;
  companies: Company;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome: string, empresaId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>({
  user: null,
  loading: true,
  signIn: () => Promise.resolve(),
  signUp: () => Promise.resolve(),
  signOut: () => Promise.resolve()
});

if (!AuthContext) {
  throw new Error('AuthContext was not created');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchUserData(session.user.id);
      }
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserData(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    const { data: userData, error } = await supabase
    .from('app_users')
    .select(`
      name,
      email,
      company_id,
      companies (name)
    `)
    .eq('id', userId)
    .single() as { data: UserData | null, error: any };

    if (error || !userData) throw error;
    setUser({
      id: userId,
      email: userData.email,
      nome: userData.name,
      company_id: userData.company_id,
      company_name: userData.companies.name
    });
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string, companyId: string) => {
    const { error: authError, data: { user } } = await supabase.auth.signUp({
      email,
      password  
    });

    if (authError) throw authError;

    const { error: profileError } = await supabase.from('app_users').insert([
      {
        id: user!.id,
        company_id: companyId,
        name,
        email
      },
    ]);

    if (profileError) throw profileError;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
