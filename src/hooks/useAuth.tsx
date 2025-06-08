
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
    // Remove todas as chaves relacionadas ao Supabase do localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove também do sessionStorage se estiver sendo usado
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

// Função para redirecionar baseado no tipo de usuário
const redirectBasedOnUserType = (profile: Profile) => {
  console.log('Redirecionando usuário para dashboard apropriado:', profile.tipo);
  
  // Verificar se já está na rota correta
  const currentPath = window.location.pathname;
  
  switch (profile.tipo) {
    case 'cliente':
      if (currentPath !== '/client-dashboard') {
        window.location.href = '/client-dashboard';
      }
      break;
    case 'restaurante':
      if (currentPath !== '/dashboard') {
        window.location.href = '/dashboard';
      }
      break;
    case 'entregador':
      if (currentPath !== '/delivery-dashboard') {
        window.location.href = '/delivery-dashboard';
      }
      break;
    case 'admin':
      if (currentPath !== '/admin') {
        window.location.href = '/admin';
      }
      break;
    default:
      if (currentPath !== '/') {
        window.location.href = '/';
      }
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    // Configurar listener de mudanças de autenticação PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          console.log('Usuario deslogado');
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Usuario logado:', session.user.id);
          setUser(session.user);
          // Buscar perfil após um pequeno delay para evitar conflitos
          setTimeout(() => {
            if (mounted) {
              fetchProfile(session.user.id);
            }
          }, 100);
        }
      }
    );

    // Verificar sessão existente DEPOIS
    const initializeAuth = async () => {
      try {
        console.log('Inicializando autenticação...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao buscar sessão:', error);
          cleanupAuthState();
          setLoading(false);
          return;
        }

        if (session?.user && mounted) {
          console.log('Sessão encontrada:', session.user.id);
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          console.log('Nenhuma sessão encontrada');
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
        cleanupAuthState();
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
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
        
        // Se o perfil não existe, criar um básico
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
              setProfile(createdProfile);
              // Redirecionar após criar perfil
              setTimeout(() => {
                redirectBasedOnUserType(createdProfile);
              }, 500);
            }
          }
        }
        
        throw error;
      }
      
      console.log('Perfil carregado:', data);
      setProfile(data);
      
      // Redirecionar automaticamente se estiver na página inicial ou numa rota incorreta
      const currentPath = window.location.pathname;
      if (currentPath === '/' || 
          (data.tipo === 'cliente' && currentPath !== '/client-dashboard') ||
          (data.tipo === 'restaurante' && currentPath !== '/dashboard') ||
          (data.tipo === 'entregador' && currentPath !== '/delivery-dashboard') ||
          (data.tipo === 'admin' && currentPath !== '/admin')) {
        setTimeout(() => {
          redirectBasedOnUserType(data);
        }, 500);
      }
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Erro ao carregar perfil",
        description: "Tente fazer login novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      // Limpar estado antes de cadastrar
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
      
      // Limpar estado antes de fazer login
      cleanupAuthState();
      
      // Fazer logout global primeiro para garantir estado limpo
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log('Logout preventivo concluído');
      } catch (err) {
        // Ignorar erros de logout se não houver sessão
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
      
      // Limpar estado local primeiro
      setUser(null);
      setProfile(null);
      
      // Limpar localStorage
      cleanupAuthState();
      
      // Fazer logout no Supabase
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

      // Redirecionar para home apenas se bem-sucedido
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
      
      // Mesmo com erro, tentar redirecionar
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  // Armazenar perfil no localStorage para acesso rápido
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
    redirectBasedOnUserType, // Exportar para uso manual quando necessário
  };
};
