import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Sends signed-out visitors to sign in, then back here afterwards.
export default function RequireAuth({ children }) {
  const { user } = useAuthStore();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname + location.search }} />;
  }
  return children;
}
