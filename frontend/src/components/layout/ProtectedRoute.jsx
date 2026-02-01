import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, requireOrganization = false }) => {
  const { isAuthenticated, isOrganization, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireOrganization && !isOrganization) {
    return <Navigate to="/employee/profile" replace />;
  }

  return children;
};

export default ProtectedRoute;