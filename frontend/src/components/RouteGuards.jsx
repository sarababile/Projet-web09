import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Pages privées : redirige vers /login si personne n'est connecté. */
export function PrivateRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

/** Pages invités (connexion, inscription) : redirige vers l'accueil si déjà connecté. */
export function GuestRoute() {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : <Outlet />;
}