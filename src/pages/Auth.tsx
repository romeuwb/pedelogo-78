
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from '@/components/auth/LoginModal';
import UserTypeModal from '@/components/UserTypeModal';

const Auth = () => {
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<string>('');
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Redirecionar usuários autenticados para seus dashboards
  useEffect(() => {
    if (user && profile) {
      switch (profile.tipo) {
        case 'cliente':
          navigate('/cliente/dashboard');
          break;
        case 'restaurante':
          navigate('/restaurante/dashboard');
          break;
        case 'entregador':
          navigate('/entregador/dashboard');
          break;
        case 'admin':
          navigate('/painel-admin/dashboard');
          break;
        default:
          navigate('/cliente/dashboard');
      }
    }
  }, [user, profile, navigate]);

  const handleUserTypeSelect = (type: string) => {
    setSelectedUserType(type);
    setShowUserTypeModal(false);
    setShowLoginModal(true);
  };

  const handleCloseModals = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center mb-8">
          <span className="text-4xl">🍕</span>
          <h1 className="text-3xl font-bold text-orange-600 mt-2">PedeLogo</h1>
          <p className="text-gray-600 mt-2">Faça login ou cadastre-se para continuar</p>
        </div>

        <UserTypeModal
          isOpen={showUserTypeModal}
          onClose={handleCloseModals}
          onSelectUserType={handleUserTypeSelect}
        />

        <LoginModal
          isOpen={showLoginModal}
          onClose={handleCloseModals}
          userType={selectedUserType}
        />

        <div className="text-center mt-4">
          <button
            onClick={() => setShowUserTypeModal(true)}
            className="text-orange-600 hover:text-orange-700 underline"
          >
            Novo usuário? Cadastre-se aqui
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
