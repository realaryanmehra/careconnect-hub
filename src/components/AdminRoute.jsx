import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the admin section.",
        variant: "destructive",
      });
    }
  }, [loading, isAdmin, toast]);

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

export default AdminRoute;

 