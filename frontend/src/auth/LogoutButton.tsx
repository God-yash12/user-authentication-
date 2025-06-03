import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthMutations } from '../hooks/useAuthMutations';
import { Button } from '../components/ui/Button';

interface LogoutButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  className = '',
  variant = 'secondary' 
}) => {
  const navigate = useNavigate();
  const { logout } = useAuthMutations();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect to login even if API call fails
      navigate('/login', { replace: true });
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      isLoading={logout.isPending}
      disabled={logout.isPending}
      className={className}
    >
      {logout.isPending ? 'Logging out...' : 'Logout'}
    </Button>
  );
};