
import React from 'react';
import LoginModal from '@/components/auth/LoginModal';

const Auth = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        <LoginModal 
          isOpen={true} 
          onClose={() => window.location.href = '/'} 
        />
      </div>
    </div>
  );
};

export default Auth;
