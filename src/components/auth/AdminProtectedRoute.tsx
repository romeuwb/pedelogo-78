
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setHasSession(!!data.session);
          console.log('AdminProtectedRoute - hasSession:', !!data.session);
        }
      } catch (e) {
        if (mounted) setHasSession(false);
      }
    };
    checkSession();
    return () => {
      mounted = false;
    };
  }, []);

  console.log('AdminProtectedRoute - User:', user?.id);
  console.log('AdminProtectedRoute - Profile:', profile);
  console.log('AdminProtectedRoute - Loading:', loading);

  // Enquanto verificamos sessão ou hook ainda está carregando
  if (loading || hasSession === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Se o hook ainda não populou o usuário mas há sessão, aguardar
  if (!user && hasSession) {
    console.log('AdminProtectedRoute - Session exists, waiting for user...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Sem usuário e sem sessão -> redirecionar para login
  if (!user && !hasSession) {
    console.log('AdminProtectedRoute - Redirecting to auth (no user and no session)');
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    console.log('AdminProtectedRoute - No profile found, waiting...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (profile.tipo !== 'admin') {
    console.log('AdminProtectedRoute - Redirecting to home (not admin):', profile.tipo);
    return <Navigate to="/" replace />;
  }

  console.log('AdminProtectedRoute - Access granted to admin');
  return <>{children}</>;
};
