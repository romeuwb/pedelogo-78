
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  tipo: 'cliente' | 'restaurante' | 'entregador' | 'admin';
  telefone?: string;
  ativo: boolean;
}

// Função para limpeza completa do estado de autenticação
const cleanupAuthState = () => {
  console.log('Limpando estado de autenticação...');
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    console.error('Erro ao limpar estado:', error);
  }
};

// Cache global para evitar múltiplas instâncias
let globalAuthState = {
  user: null as User | null,
  profile: null as Profile | null,
  loading: true,
  initialized: false
};

let globalSubscription: any = null;
let profileFetchPromise: Promise<any> | null = null;

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(globalAuthState.user);
  const [profile, setProfile] = useState<Profile | null>(globalAuthState.profile);
  const [loading, setLoading] = useState(globalAuthState.loading);
  const { toast } = useToast();

  useEffect(() => {
    // Se já foi inicializado, use o estado global
    if (globalAuthState.initialized) {
      setUser(globalAuthState.user);
      setProfile(globalAuthState.profile);
      setLoading(globalAuthState.loading);
      return;
    }

    const initializeAuth = async () => {
      try {
        console.log('Inicializando autenticação (única vez)...');
        
        // Configurar listener apenas uma vez
        if (!globalSubscription) {
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log('Auth state change:', event, session?.user?.id);
              
              if (event === 'SIGNED_OUT' || !session) {
                console.log('Usuario deslogado');
                globalAuthState.user = null;
                globalAuthState.profile = null;
                globalAuthState.loading = false;
                setUser(null);
                setProfile(null);
                setLoading(false);
                return;
              }

              if (session?.user) {
                console.log('Usuario logado:', session.user.id);
                globalAuthState.user = session.user;
                setUser(session.user);
                
                // Buscar perfil apenas se não estiver sendo buscado
                if (!profileFetchPromise) {
                  profileFetchPromise = fetchProfile(session.user.id);
                  await profileFetchPromise;
                  profileFetchPromise = null;
                }
              }
            }
          );
          globalSubscription = subscription;
        }

        // Verificar sessão existente
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao buscar sessão:', error);
          globalAuthState.loading = false;
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('Sessão encontrada:', session.user.id);
          globalAuthState.user = session.user;
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          console.log('Nenhuma sessão encontrada');
          globalAuthState.loading = false;
          setLoading(false);
        }
        
        globalAuthState.initialized = true;
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
        globalAuthState.loading = false;
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      // Cleanup apenas quando o último componente for desmontado
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Buscando perfil para usuario:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        
        if (error.code === 'PGRST116') {
          console.log('Perfil não encontrado, criando perfil básico...');
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            const newProfile = {
              user_id: userData.user.id,
              nome: userData.user.email?.split('@')[0] || 'Usuário',
              email: userData.user.email || '',
              tipo: 'cliente' as const,
              ativo: true
            };
            
            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .insert(newProfile)
              .select()
              .single();
              
            if (createError) {
              console.error('Erro ao criar perfil:', createError);
            } else {
              console.log('Perfil criado:', createdProfile);
              globalAuthState.profile = createdProfile;
              setProfile(createdProfile);
            }
          }
        }
        throw error;
      }
      
      console.log('Perfil carregado:', data);
      globalAuthState.profile = data;
      setProfile(data);
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Erro ao carregar perfil",
        description: "Tente fazer login novamente.",
        variant: "destructive",
      });
    } finally {
      globalAuthState.loading = false;
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;

      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar a conta.",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      console.log('Tentando fazer login...');
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Logout preventivo ignorado');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no login:', error);
        throw error;
      }

      console.log('Login bem-sucedido:', data.user?.id);

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Erro no login:', error);
      setLoading(false);
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Iniciando logout...');
      setLoading(true);
      
      // Limpar estado global
      globalAuthState.user = null;
      globalAuthState.profile = null;
      globalAuthState.loading = false;
      
      setUser(null);
      setProfile(null);
      
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Erro no logout:', error);
        throw error;
      }

      console.log('Logout realizado com sucesso');

      toast({
        title: "Logout realizado com sucesso!",
        description: "Até logo!",
      });

      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (error: any) {
      console.error('Erro no logout:', error);
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
      
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar com estado global
  useEffect(() => {
    if (profile) {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('userProfile');
    }
  }, [profile]);

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user && !!profile,
  };
};
