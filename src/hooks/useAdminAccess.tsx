
import { useAuth } from '@/hooks/useAuth';

export const useAdminAccess = () => {
  const { user, profile, loading } = useAuth();

  const isAdmin = profile?.tipo === 'admin';
  const canBypassProtection = isAdmin;

  return {
    isAdmin,
    canBypassProtection,
    loading,
    user,
    profile
  };
};
